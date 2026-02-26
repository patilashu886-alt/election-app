// FIREBASE MOCK HOOKS
// These hooks serve as placeholders for a real Firebase implementation
// They wrap our local Zustand store to simulate async operations and latency.

import { useState, useCallback } from 'react';
import { useElectionStore, Candidate } from '@/store/useElectionStore';

// Mock latency to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Placeholder for: useAuthState(auth)
 */
export function useFirebaseAuth() {
  const userRole = useElectionStore(state => state.userRole);
  const userEmail = useElectionStore(state => state.userEmail);
  const isVerified = useElectionStore(state => state.isVerified);
  const logout = useElectionStore(state => state.logout);
  const login = useElectionStore(state => state.login);
  
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    setLoading(true);
    await delay(500);
    logout();
    setLoading(false);
  };

  return {
    user: userEmail ? { email: userEmail, role: userRole, emailVerified: isVerified } : null,
    loading,
    signOut,
    login // exposed for mock testing
  };
}

/**
 * Placeholder for: sendSignInLinkToEmail(auth, email, actionCodeSettings)
 */
export function useEmailLinkAuth() {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useElectionStore(state => state.login);
  
  const sendEmailLink = async (email: string, role: 'voter' | 'admin' = 'voter') => {
    setIsSending(true);
    setError(null);
    try {
      await delay(1200); // simulate network
      login(email, role);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to send link');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { sendEmailLink, isSending, error };
}

/**
 * Placeholder for: useDocument(doc(db, 'elections', electionId))
 */
export function useFirestoreElection() {
  const election = useElectionStore(state => state.election);
  const toggleElection = useElectionStore(state => state.toggleElection);
  
  const [loading, setLoading] = useState(false);

  const updateElectionStatus = async (isActive: boolean) => {
    setLoading(true);
    await delay(800);
    toggleElection(isActive);
    setLoading(false);
  };

  return { election, loading, updateElectionStatus };
}

/**
 * Placeholder for Firebase Transaction or Batch Write: runTransaction(db, async (t) => {...})
 */
export function useVoteSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const submitVoteAction = useElectionStore(state => state.submitVote);
  const hasVoted = useElectionStore(state => state.hasVoted);

  const submitVote = async (candidateId: string) => {
    if (hasVoted) {
      setError('You have already cast your vote.');
      return false;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await delay(1500); // Simulate secure transaction latency
      submitVoteAction(candidateId);
      return true;
    } catch (err: any) {
      setError('Transaction failed. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitVote, isSubmitting, error, hasVoted };
}

/**
 * Placeholder for: useCollection(collection(db, 'candidates'))
 */
export function useRealtimeVotes() {
  const candidates = useElectionStore(state => state.candidates);
  
  return {
    candidates,
    totalVotes: candidates.reduce((acc, c) => acc + c.votes, 0),
    loading: false // Realtime stream is mock-instant
  };
}

/**
 * Custom hook for Identity Verification (Camera)
 */
export function useIdentityVerification() {
  const setVerificationStep = useElectionStore(state => state.setVerificationStep);
  const setIdentityPhoto = useElectionStore(state => state.setIdentityPhoto);
  const [isProcessing, setIsProcessing] = useState(false);

  const verifyIdentity = async (photoDataUrl: string) => {
    setIsProcessing(true);
    try {
      // Simulate AI/ML verification latency
      await delay(2000); 
      setIdentityPhoto(photoDataUrl);
      setVerificationStep('camera_verified');
      return true;
    } catch (e) {
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return { verifyIdentity, isProcessing };
}
