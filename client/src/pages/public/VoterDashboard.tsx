import { useLocation, Link } from "wouter";
import { useElectionStore, ElectionType } from "@/store/useElectionStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, Users, ArrowRight, CheckCircle2, Lock } from "lucide-react";

export function VoterDashboard() {
  const [, setLocation] = useLocation();
  const session = useElectionStore(state => state.session);
  const elections = useElectionStore(state => state.elections);
  const hasVotedCategories = useElectionStore(state => state.hasVotedCategories);

  // Eligibility logic: Students can see 'college', Employees 'company', Society Members 'society'
  const isEligible = (type: ElectionType) => {
    if (session.role === 'Student' && type === 'college') return true;
    if (session.role === 'Employee' && type === 'company') return true;
    if (session.role === 'Society Member' && type === 'society') return true;
    return false;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Student': return <GraduationCap className="w-4 h-4" />;
      case 'Employee': return <Briefcase className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="flex items-center gap-1.5 py-1">
              {getRoleIcon(session.role || "")} {session.role}
            </Badge>
            <Badge variant="secondary" className="font-mono">{session.identifier}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Voter Dashboard</h1>
          <p className="text-muted-foreground">Welcome back. View active elections and cast your vote.</p>
        </div>
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Identity Status</div>
            <div className="text-sm font-bold text-primary">Verified Account</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elections.map((election) => {
          const eligible = isEligible(election.type);
          const votedCount = hasVotedCategories[election.id]?.length || 0;
          const totalCategories = election.categories.length;

          return (
            <Card key={election.id} className={`glass overflow-hidden flex flex-col transition-all duration-300 ${!eligible ? 'opacity-60 grayscale' : 'hover:shadow-xl'}`}>
              <CardHeader className="relative">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={eligible ? "default" : "outline"} className="capitalize">
                    {election.type}
                  </Badge>
                  {votedCount === totalCategories ? (
                    <Badge variant="success" className="bg-success/10 text-success border-success/20">Completed</Badge>
                  ) : votedCount > 0 ? (
                    <Badge variant="warning">In Progress</Badge>
                  ) : (
                    <Badge variant="secondary">Not Started</Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{election.title}</CardTitle>
                <CardDescription>{election.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Voting Progress</span>
                    <span>{votedCount}/{totalCategories} Categories</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${(votedCount / totalCategories) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/40">
                {!eligible ? (
                  <Button disabled className="w-full">
                    <Lock className="w-4 h-4 mr-2" /> Ineligible Role
                  </Button>
                ) : (
                  <Button onClick={() => setLocation(`/election/${election.id}`)} className="w-full">
                    Enter Election <ArrowRight className="w-4 h-4 ml-2" />
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
