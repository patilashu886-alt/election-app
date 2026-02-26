// FIREBASE MOCK HOOKS
// These hooks serve as placeholders for a real Firebase implementation
// They wrap our local Zustand store to simulate async operations and latency.

import { useState } from 'react';
import { useElectionStore } from '@/store/useElectionStore';

// Mock latency to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Placeholder for: useAuthState(auth)
 */
export function useFirebaseAuth() {
  const session = useElectionStore(state => state.session);
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
    user: session.email ? { email: session.email, role: session.role, emailVerified: isVerified } : null,
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
  
  const sendEmailLink = async (email: string, role: any = 'voter') => {
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
export function useFirestoreElection(electionId?: string) {
  const elections = useElectionStore(state => state.elections);
  const toggleElection = useElectionStore(state => state.toggleElection);
  
  const election = elections.find(e => e.id === electionId);
  const [loading, setLoading] = useState(false);

  const updateElectionStatus = async (isActive: boolean) => {
    if (!electionId) return;
    setLoading(true);
    await delay(800);
    toggleElection(electionId, isActive);
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
  const hasVotedCategories = useElectionStore(state => state.hasVotedCategories);

  const submitVote = async (electionId: string, categoryId: string, candidateId: string) => {
    const voted = hasVotedCategories[electionId] || [];
    if (voted.includes(categoryId)) {
      setError('You have already cast your vote in this category.');
      return false;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await delay(1500); // Simulate secure transaction latency
      submitVoteAction(electionId, categoryId, candidateId);
      return true;
    } catch (err: any) {
      setError('Transaction failed. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitVote, isSubmitting, error };
}

/**
 * Placeholder for: useCollection(collection(db, 'candidates'))
 */
export function useRealtimeVotes(electionId?: string) {
  const elections = useElectionStore(state => state.elections);
  const election = elections.find(e => e.id === electionId);
  
  const candidates = election?.categories.flatMap(c => c.candidates) || [];
  
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
