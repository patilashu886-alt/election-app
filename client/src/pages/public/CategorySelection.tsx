import { useRoute, useLocation, Link } from "wouter";
import { useElectionStore } from "@/store/useElectionStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle, ArrowRight } from "lucide-react";

export function CategorySelection() {
  const [, params] = useRoute("/election/:id");
  const [, setLocation] = useLocation();
  const elections = useElectionStore(state => state.elections);
  const hasVotedCategories = useElectionStore(state => state.hasVotedCategories);
  
  const election = elections.find(e => e.id === params?.id);
  if (!election) return <div>Election not found</div>;

  const votedCategories = hasVotedCategories[election.id] || [];

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{election.title}</h1>
        <p className="text-muted-foreground mt-1">Please select a category to cast your vote.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {election.categories.map((category) => {
          const isVoted = votedCategories.includes(category.id);
          
          return (
            <Card key={category.id} className={`glass border-2 transition-all duration-300 ${isVoted ? 'border-success/30 bg-success/5' : 'hover:border-primary/50 cursor-pointer'}`}
              onClick={() => !isVoted && setLocation(`/election/${election.id}/category/${category.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                  {isVoted && <CheckCircle className="w-5 h-5 text-success" />}
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                {isVoted ? (
                  <span className="text-sm font-medium text-success">Ballot Cast Successfully</span>
                ) : (
                  <Button variant="outline" className="w-full">
                    View Candidates <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
