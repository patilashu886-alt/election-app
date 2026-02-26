import { useRoute, useLocation } from "wouter";
import { useElectionStore, Candidate } from "@/store/useElectionStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Info, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function CandidateDetail() {
  const [, params] = useRoute("/election/:eid/category/:cid");
  const [, setLocation] = useLocation();
  const elections = useElectionStore(state => state.elections);
  const submitVote = useElectionStore(state => state.submitVote);
  
  const election = elections.find(e => e.id === params?.eid);
  const category = election?.categories.find(c => c.id === params?.cid);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!election || !category) return <div>Not found</div>;

  const handleVote = async () => {
    if (!selectedCandidate) return;
    submitVote(election.id, category.id, selectedCandidate.id);
    setShowConfirm(false);
    setLocation(`/election/${election.id}`);
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => setLocation(`/election/${election.id}`)} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Categories
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline">{election.title}</Badge>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <Badge>{category.name}</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Select Candidate</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.candidates.map((candidate) => (
          <Card key={candidate.id} className="glass flex flex-col hover:border-primary/30 transition-all">
            <div className="h-40 bg-muted relative overflow-hidden">
               <img src={candidate.imageUrl} className="w-full h-full object-cover" alt={candidate.name} />
               <Badge className="absolute top-2 right-2">{candidate.party}</Badge>
            </div>
            <CardHeader>
              <CardTitle>{candidate.name}</CardTitle>
              <CardDescription>{candidate.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="text-sm">
                 <div className="font-bold mb-1 flex items-center gap-1"><Info className="w-3 h-3" /> Manifesto</div>
                 <p className="text-muted-foreground italic">"{candidate.manifesto}"</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <div className="text-[10px] uppercase font-bold text-success mb-1">Advantages</div>
                   <ul className="text-xs list-disc list-inside space-y-0.5">
                     {candidate.advantages.map(a => <li key={a}>{a}</li>)}
                   </ul>
                </div>
                <div>
                   <div className="text-[10px] uppercase font-bold text-destructive mb-1">Disadvantages</div>
                   <ul className="text-xs list-disc list-inside space-y-0.5">
                     {candidate.disadvantages.map(d => <li key={d}>{d}</li>)}
                   </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/40">
              <Button onClick={() => { setSelectedCandidate(candidate); setShowConfirm(true); }} className="w-full">
                Vote for {candidate.name.split(' ')[0]}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-warning" /> Final Confirmation
            </DialogTitle>
            <DialogDescription>
              Confirm your vote for <strong>{selectedCandidate?.name}</strong> as <strong>{category.name}</strong>. This is cryptographically signed and permanent.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
             <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary" />
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={handleVote}>Confirm Secure Vote</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
