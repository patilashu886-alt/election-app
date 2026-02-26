import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

interface UserSession {
  email: string | null;
  role: Role;
  identifier: string | null; // Student ID, Employee ID, etc.
}

interface ElectionStore {
  // Session State
  session: UserSession;
  
  // Voter Progress
  hasVotedCategories: Record<string, string[]>; // electionId -> categoryIds[] for current session
  votesByUser: Record<string, Record<string, string[]>>; // sessionKey -> electionId -> categoryIds[]
  verificationStep: VerificationStep;
  isVerified: boolean;
  identityPhotoUrl: string | null;
  
  // Elections Data
  elections: Election[];
  
  // Actions
  login: (email: string, role: Role, identifier?: string) => void;
  logout: () => void;
  setVerificationStep: (step: VerificationStep) => void;
  setIdentityPhoto: (url: string) => void;
  submitVote: (electionId: string, categoryId: string, candidateId: string) => void;
  
  // Admin Actions
  createElection: (election: Omit<Election, 'id'>) => void;
  toggleElection: (id: string, isActive: boolean) => void;
  deleteElection: (id: string) => void;
}

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    name: 'Sarah Chen',
    party: 'Innovation Party',
    description: 'Leading with technology and transparency.',
    manifesto: 'I believe in a digital-first approach to governance where every citizen has a voice through secure platforms.',
    advantages: ['Tech background', 'Youthful energy', 'Strong communicator'],
    disadvantages: ['Limited political experience'],
    votes: 45,
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  {
    id: 'c2',
    name: 'James Wilson',
    party: 'Heritage Group',
    description: 'Stability and proven leadership.',
    manifesto: 'Experience matters. I will ensure our traditions are preserved while making sensible improvements.',
    advantages: ['20 years experience', 'Proven track record'],
    disadvantages: ['Slow to adapt to new tech'],
    votes: 38,
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James'
  }
];

const INITIAL_ELECTIONS: Election[] = [
  {
    id: 'e1',
    title: 'University Student Council 2026',
    description: 'Annual election for student representatives.',
    type: 'college',
    isActive: true,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 86400000).toISOString(),
    categories: [
      { id: 'cat1', name: 'President', description: 'Head of the student body', candidates: MOCK_CANDIDATES },
      { id: 'cat2', name: 'Treasurer', description: 'Financial oversight', candidates: MOCK_CANDIDATES }
    ]
  },
  {
    id: 'e2',
    title: 'Corporate Board Election',
    description: 'Selection of employee representatives for the board.',
    type: 'company',
    isActive: true,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 86400000).toISOString(),
    categories: [
      { id: 'cat3', name: 'Technical Rep', description: 'Represents engineering', candidates: MOCK_CANDIDATES }
    ]
  }
];

export const useElectionStore = create<ElectionStore>()(
  persist(
    (set) => ({
      session: { email: null, role: null, identifier: null },
      hasVotedCategories: {},
      votesByUser: {},
      verificationStep: 'idle',
      isVerified: false,
      identityPhotoUrl: null,
      elections: INITIAL_ELECTIONS,

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

      setVerificationStep: (step) => set((state) => ({
        verificationStep: step,
        isVerified: step === 'camera_verified'
      })),

      setIdentityPhoto: (url) => set({ identityPhotoUrl: url }),

      submitVote: (electionId, categoryId, candidateId) => set((state) => {
        if (!state.session.email || state.session.role === 'admin' || !state.isVerified) {
          return state;
        }

        const allowedType = getRoleElectionType(state.session.role);
        const targetElection = state.elections.find(e => e.id === electionId);
        if (!targetElection || !targetElection.isActive || !allowedType || targetElection.type !== allowedType) {
          return state;
        }

        const voted = state.hasVotedCategories[electionId] || [];
        if (voted.includes(categoryId)) return state;

        const categoryExists = targetElection.categories.some(cat => cat.id === categoryId && cat.candidates.some(cand => cand.id === candidateId));
        if (!categoryExists) return state;

        const updatedElections = state.elections.map(e => {
          if (e.id !== electionId) return e;
          return {
            ...e,
            categories: e.categories.map(cat => {
              if (cat.id !== categoryId) return cat;
              return {
                ...cat,
                candidates: cat.candidates.map(cand => 
                  cand.id === candidateId ? { ...cand, votes: cand.votes + 1 } : cand
                )
              };
            })
          };
        });

        const sessionKey = getSessionKey(state.session.email, state.session.identifier);
        const updatedHasVotedCategories = {
          ...state.hasVotedCategories,
          [electionId]: [...voted, categoryId]
        };

        const updatedVotesByUser = sessionKey
          ? {
              ...state.votesByUser,
              [sessionKey]: updatedHasVotedCategories
            }
          : state.votesByUser;

        return {
          elections: updatedElections,
          hasVotedCategories: updatedHasVotedCategories,
          votesByUser: updatedVotesByUser
        };
      }),

      createElection: (election) => set((state) => ({
        elections: [...state.elections, { ...election, id: `e-${Date.now()}` }]
      })),

      toggleElection: (id, isActive) => set((state) => ({
        elections: state.elections.map(e => e.id === id ? { ...e, isActive } : e)
      })),

      deleteElection: (id) => set((state) => ({
        elections: state.elections.filter(e => e.id !== id)
      }))
    }),
    { name: 'secure-vote-v2' }
  )
);
