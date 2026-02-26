import { useState } from "react";
import { ShieldCheck, Lock, CheckCircle } from "lucide-react";
import { useElectionStore, Candidate } from "@/store/useElectionStore";
import { useVoteSubmission } from "@/hooks/useFirebaseMock";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

export function Voting() {
  const candidates = useElectionStore(state => state.candidates);
  const hasVotedStore = useElectionStore(state => state.hasVoted);
  const election = useElectionStore(state => state.election);
  
  const { submitVote, isSubmitting, error, hasVoted } = useVoteSubmission();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSelect = (c: Candidate) => {
    if (hasVotedStore) return;
    setSelectedCandidate(c);
    setConfirmOpen(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedCandidate) return;
    const success = await submitVote(selectedCandidate.id);
    if (success) {
      setConfirmOpen(false);
    }
  };

  if (hasVotedStore) {
    return (
      <div className="container max-w-3xl py-20 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mb-8">
          <CheckCircle className="w-12 h-12 text-success" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Vote Successfully Cast</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your ballot has been securely encrypted and recorded in the immutable ledger.
        </p>
        <Card className="w-full glass bg-card/50">
          <CardContent className="flex items-center justify-center gap-3 p-6 text-sm font-mono text-muted-foreground">
            <Lock className="w-4 h-4" />
            Receipt ID: {Math.random().toString(36).substring(2, 15).toUpperCase()}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center mb-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="w-3 h-3 mr-1" /> End-to-End Verified
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{election.title}</h1>
          <p className="text-muted-foreground mt-1">Select one candidate. This action cannot be undone.</p>
        </div>
        <div className="text-sm font-mono text-muted-foreground bg-muted p-2 rounded border border-border/50">
          Session ID: {Math.random().toString(16).slice(2, 10)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate) => (
          <Card 
            key={candidate.id} 
            className="glass hover-lift overflow-hidden flex flex-col cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-primary/50"
            onClick={() => handleSelect(candidate)}
          >
            <div className="h-48 bg-muted relative">
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
              <img src={candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover" />
              <Badge className="absolute top-4 right-4 z-20" variant="secondary">{candidate.party}</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">{candidate.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {candidate.description}
              </p>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/40">
              <Button className="w-full" variant="outline">Select Candidate</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-warning" /> Secure Vote Confirmation
            </DialogTitle>
            <DialogDescription>
              You are about to cast your official vote. This action is cryptographically signed and <strong>cannot be reversed or changed</strong>.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCandidate && (
            <div className="py-6 flex items-center gap-4">
              <img src={selectedCandidate.imageUrl} alt="candidate" className="w-16 h-16 rounded-full border border-border" />
              <div>
                <h4 className="font-bold text-lg">{selectedCandidate.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedCandidate.party}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>
              Cancel & Review
            </Button>
            <Button onClick={handleConfirmVote} disabled={isSubmitting} className="w-full sm:w-auto relative overflow-hidden">
              {isSubmitting ? (
                <>
                  <div className="absolute inset-0 bg-primary-foreground/20 animate-pulse" />
                  Encrypting Vote...
                </>
              ) : (
                "Cast Ballot"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}