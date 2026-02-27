import { useRoute, useLocation, Link } from "wouter";
import { useElectionStore, getRoleElectionType } from "@/store/useElectionStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CheckCircle, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export function CategorySelection() {
  const [, params] = useRoute("/election/:id");
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const elections = useElectionStore(state => state.elections);
  const hasVotedCategories = useElectionStore(state => state.hasVotedCategories);
  const session = useElectionStore(state => state.session);
  
  const election = elections.find(e => e.id === params?.id);
  if (!election) return <div>{t("categorySelection.notFound")}</div>;

  const allowedType = getRoleElectionType(session.role);
  if (!election.isActive || !allowedType || election.type !== allowedType) {
    return (
      <div className="page-shell">
        <div className="page-container max-w-4xl">
        <Card className="section-card">
          <CardHeader>
            <CardTitle>{t("categorySelection.unavailableTitle")}</CardTitle>
            <CardDescription>{t("categorySelection.unavailableDesc")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation('/dashboard')}>{t("categorySelection.backDashboard")}</Button>
          </CardFooter>
        </Card>
        </div>
      </div>
    );
  }

  const votedCategories = hasVotedCategories[election.id] || [];

  return (
    <div className="page-shell">
      <div className="page-container max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-1" /> {t("categorySelection.backDashboard")}
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{election.title}</h1>
        <p className="text-muted-foreground mt-1">{t("categorySelection.selectCategory")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {election.categories.map((category) => {
          const isVoted = votedCategories.includes(category.id);
          
          return (
            <Card key={category.id} className={`section-card border-2 transition-all duration-300 ${isVoted ? 'border-success/30 bg-success/5' : 'hover:border-primary/50 cursor-pointer'}`}
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
                  <span className="text-sm font-medium text-success">{t("categorySelection.ballotCast")}</span>
                ) : (
                  <Button variant="outline" className="w-full">
                    {t("categorySelection.viewCandidates")} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
      </div>
    </div>
  );
}
