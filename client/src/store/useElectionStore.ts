import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type Role = 'Student' | 'Employee' | 'Society' | 'admin' | null;
export type ElectionType = 'college' | 'company' | 'society';
export type VerificationStep = 'idle' | 'email_sent' | 'email_verified' | 'camera_pending' | 'camera_verified';

export const getRoleElectionType = (role: Role): ElectionType | null => {
  if (role === 'Student') return 'college';
  if (role === 'Employee') return 'company';
  if (role === 'Society') return 'society';
  return null;
};

const normalizeRole = (role: Role | string): Role => {
  if (role === 'Society Member') return 'Society';
  if (role === 'Student' || role === 'Employee' || role === 'Society' || role === 'admin') return role;
  return null;
};

const getSessionKey = (email: string | null, identifier: string | null) => {
  if (!email && !identifier) return null;
  return `${email || 'anonymous'}::${identifier || 'no-id'}`;
};

export interface Category {
  id: string;
  name: string;
  description: string;
  candidates: Candidate[];
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  description: string;
  manifesto: string;
  advantages: string[];
  disadvantages: string[];
  votes: number;
  imageUrl: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  type: ElectionType;
  isActive: boolean;
  categories: Category[];
  startTime: string;
  endTime: string;
  // optional – added by firestore
  createdAt?: string;
}

interface UserSession {
  email: string | null;
  role: Role;
  identifier: string | null;
}

interface ElectionStore {
  // Session State
  session: UserSession;

  // Voter Progress (local only for now)
  hasVotedCategories: Record<string, string[]>;
  votesByUser: Record<string, Record<string, string[]>>;
  verificationStep: VerificationStep;
  isVerified: boolean;
  identityPhotoUrl: string | null;

  // Elections – now real-time from Firestore
  elections: Election[];
  unsubscribe: Unsubscribe | null;

  // Actions
  initializeElections: () => void;
  cleanupElections: () => void;

  login: (email: string, role: Role, identifier?: string) => void;
  logout: () => void;
  setVerificationStep: (step: VerificationStep) => void;
  setIdentityPhoto: (url: string) => void;
  submitVote: (electionId: string, categoryId: string, candidateId: string) => void;

  // Admin Actions → Firestore
  createElection: (election: Omit<Election, 'id'>) => Promise<void>;
  toggleElection: (id: string, isActive: boolean) => Promise<void>;
  deleteElection: (id: string) => Promise<void>;
}

export const useElectionStore = create<ElectionStore>()(
  persist(
    (set, get) => ({
      session: { email: null, role: null, identifier: null },
      hasVotedCategories: {},
      votesByUser: {},
      verificationStep: 'idle',
      isVerified: false,
      identityPhotoUrl: null,
      elections: [],
      unsubscribe: null,

      // ── Firestore real-time ────────────────────────────────────────
      initializeElections: () => {
        const { unsubscribe } = get();
        if (unsubscribe) return;

        const q = query(collection(db, 'elections'), orderBy('startTime', 'desc'));

        const unsub = onSnapshot(q, (snapshot) => {
          const list = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Election[];
          set({ elections: list });
        }, (err) => {
          console.error('Elections listener error:', err);
        });

        set({ unsubscribe: unsub });
      },

      cleanupElections: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
          unsubscribe();
          set({ unsubscribe: null });
        }
      },

      // ── Auth / Session ─────────────────────────────────────────────
      login: (email, role, identifier) => set((state) => {
        const normalizedRole = normalizeRole(role);
        const sessionIdentifier = identifier || null;
        const sessionKey = getSessionKey(email, sessionIdentifier);
        const previousVotes = sessionKey ? state.votesByUser[sessionKey] || {} : {};

        return {
          session: { email, role: normalizedRole, identifier: sessionIdentifier },
          hasVotedCategories: previousVotes,
          verificationStep: normalizedRole !== 'admin' ? 'email_sent' : 'idle',
          isVerified: normalizedRole === 'admin',
          identityPhotoUrl: null
        };
      }),

      logout: () => set({
        session: { email: null, role: null, identifier: null },
        hasVotedCategories: {},
        verificationStep: 'idle',
        isVerified: false,
        identityPhotoUrl: null
      }),

      setVerificationStep: (step) => set({
        verificationStep: step,
        isVerified: step === 'camera_verified'
      }),

      setIdentityPhoto: (url) => set({ identityPhotoUrl: url }),

      // ── Voting (now persisted to Firestore) ───────────────────────────
      submitVote: async (electionId, categoryId, candidateId) => {
        const state = get();

        if (!state.session.email || state.session.role === 'admin' || !state.isVerified) {
          throw new Error('User not eligible to vote');
        }

        const allowedType = getRoleElectionType(state.session.role);
        const targetElection = state.elections.find(e => e.id === electionId);
        
        if (!targetElection || !targetElection.isActive || !allowedType || targetElection.type !== allowedType) {
          throw new Error('Election not active or invalid role');
        }

        const voted = state.hasVotedCategories[electionId] || [];
        if (voted.includes(categoryId)) {
          throw new Error('Already voted in this category');
        }

        const category = targetElection.categories.find(cat => cat.id === categoryId);
        const candidate = category?.candidates.find(cand => cand.id === candidateId);
        
        if (!category || !candidate) {
          throw new Error('Category or candidate not found');
        }

        try {
          // Update vote count in Firestore
          const electionRef = doc(db, 'elections', electionId);
          
          // Increment the candidate's vote count
          const updatedCategories = targetElection.categories.map(cat => {
            if (cat.id !== categoryId) return cat;
            return {
              ...cat,
              candidates: cat.candidates.map(cand =>
                cand.id === candidateId ? { ...cand, votes: cand.votes + 1 } : cand
              )
            };
          });

          await updateDoc(electionRef, {
            categories: updatedCategories
          });

          // Update local state
          set((state) => {
            const sessionKey = getSessionKey(state.session.email, state.session.identifier);
            const updatedHasVoted = {
              ...state.hasVotedCategories,
              [electionId]: [...voted, categoryId]
            };

            const updatedVotesByUser = sessionKey
              ? { ...state.votesByUser, [sessionKey]: updatedHasVoted }
              : state.votesByUser;

            return {
              hasVotedCategories: updatedHasVoted,
              votesByUser: updatedVotesByUser
            };
          });
        } catch (err) {
          console.error('Vote submission failed:', err);
          throw err;
        }
      },

      // ── Admin actions → Firestore ──────────────────────────────────
      createElection: async (election) => {
        try {
          await addDoc(collection(db, 'elections'), {
            ...election,
            createdAt: new Date().toISOString()
          });
          // listener will update elections automatically
        } catch (err) {
          console.error('Create election failed:', err);
          throw err;
        }
      },

      toggleElection: async (id, isActive) => {
        try {
          const ref = doc(db, 'elections', id);
          await updateDoc(ref, { isActive });
          // listener updates UI
        } catch (err) {
          console.error('Toggle failed:', err);
          throw err;
        }
      },

      deleteElection: async (id) => {
        // Note: delete not implemented in your UI yet
        // If you add delete button later, implement here with deleteDoc()
        console.warn('Delete not implemented yet');
      }
    }),
    {
      name: 'secure-vote-v2',
      // only persist non-Firestore parts
      partialize: (state) => ({
        session: state.session,
        hasVotedCategories: state.hasVotedCategories,
        votesByUser: state.votesByUser,
        verificationStep: state.verificationStep,
        isVerified: state.isVerified,
        identityPhotoUrl: state.identityPhotoUrl
      })
    }
  )
);