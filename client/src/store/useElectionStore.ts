import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'voter' | 'admin' | null;
export type VerificationStep = 'idle' | 'email_sent' | 'email_verified' | 'camera_pending' | 'camera_verified';

export interface Candidate {
  id: string;
  name: string;
  party: string;
  description: string;
  votes: number;
  imageUrl: string;
}

interface ElectionStore {
  // Session State
  userRole: Role;
  userEmail: string | null;
  
  // Voter State
  hasVoted: boolean;
  verificationStep: VerificationStep;
  isVerified: boolean;
  identityPhotoUrl: string | null;
  
  // Election State
  election: {
    isActive: boolean;
    title: string;
    description: string;
    endDate: string | null;
  };
  
  // Candidates Data
  candidates: Candidate[];
  
  // Security State
  securityFlags: {
    suspiciousActivity: boolean;
    multipleTabs: boolean;
    deviceFingerprint: string | null;
  };
  
  // Actions
  login: (email: string, role: Role) => void;
  logout: () => void;
  setVerificationStep: (step: VerificationStep) => void;
  setIdentityPhoto: (url: string) => void;
  submitVote: (candidateId: string) => void;
  
  // Admin Actions
  toggleElection: (isActive: boolean) => void;
  addCandidate: (candidate: Omit<Candidate, 'id' | 'votes'>) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;
  
  // Security Actions
  flagSuspiciousActivity: (flag: boolean) => void;
  setDeviceFingerprint: (fingerprint: string) => void;
}

// Initial Mock Data
const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Eleanor Roosevelt',
    party: 'Progressive Coalition',
    description: 'Focused on digital rights, renewable energy, and infrastructure modernization.',
    votes: 1420,
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eleanor&backgroundColor=b6e3f4'
  },
  {
    id: 'cand-2',
    name: 'Marcus Aurelius',
    party: 'Conservative Union',
    description: 'Advocating for economic stability, reduced regulation, and strong national security.',
    votes: 1250,
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=ffdfbf'
  },
  {
    id: 'cand-3',
    name: 'Ada Lovelace',
    party: 'Tech Forward',
    description: 'Championing STEM education, universal basic income, and AI ethics.',
    votes: 890,
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ada&backgroundColor=c0aede'
  }
];

export const useElectionStore = create<ElectionStore>()(
  persist(
    (set, get) => ({
      userRole: null,
      userEmail: null,
      
      hasVoted: false,
      verificationStep: 'idle',
      isVerified: false,
      identityPhotoUrl: null,
      
      election: {
        isActive: true,
        title: 'National General Election 2026',
        description: 'Select your preferred candidate for the upcoming term.',
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      },
      
      candidates: INITIAL_CANDIDATES,
      
      securityFlags: {
        suspiciousActivity: false,
        multipleTabs: false,
        deviceFingerprint: null,
      },
      
      login: (email, role) => set({ 
        userEmail: email, 
        userRole: role,
        verificationStep: role === 'voter' ? 'email_sent' : 'idle' 
      }),
      
      logout: () => set({ 
        userRole: null, 
        userEmail: null,
        verificationStep: 'idle',
        isVerified: false,
        identityPhotoUrl: null,
        hasVoted: false
      }),
      
      setVerificationStep: (step) => set((state) => {
        if (step === 'camera_verified') {
          return { verificationStep: step, isVerified: true };
        }
        return { verificationStep: step };
      }),
      
      setIdentityPhoto: (url) => set({ identityPhotoUrl: url }),
      
      submitVote: (candidateId) => set((state) => {
        if (state.hasVoted) return state; // Block duplicate
        
        const updatedCandidates = state.candidates.map(c => 
          c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
        );
        
        return {
          hasVoted: true,
          candidates: updatedCandidates
        };
      }),
      
      toggleElection: (isActive) => set((state) => ({
        election: { ...state.election, isActive }
      })),
      
      addCandidate: (candidate) => set((state) => ({
        candidates: [...state.candidates, { 
          ...candidate, 
          id: `cand-${Date.now()}`,
          votes: 0 
        }]
      })),
      
      updateCandidate: (id, updates) => set((state) => ({
        candidates: state.candidates.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
      
      deleteCandidate: (id) => set((state) => ({
        candidates: state.candidates.filter(c => c.id !== id)
      })),
      
      flagSuspiciousActivity: (flag) => set((state) => ({
        securityFlags: { ...state.securityFlags, suspiciousActivity: flag }
      })),
      
      setDeviceFingerprint: (fingerprint) => set((state) => ({
        securityFlags: { ...state.securityFlags, deviceFingerprint: fingerprint }
      }))
    }),
    {
      name: 'secure-vote-storage',
      partialize: (state) => ({ 
        hasVoted: state.hasVoted,
        userRole: state.userRole,
        userEmail: state.userEmail,
        isVerified: state.isVerified,
        election: state.election,
        candidates: state.candidates,
        securityFlags: state.securityFlags
      }),
    }
  )
);
