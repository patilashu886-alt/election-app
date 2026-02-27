import { useEffect, useMemo, useState } from "react";
import { useElectionStore } from "@/store/useElectionStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Clock3, UserRoundCheck, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export function CandidateDashboard() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const session = useElectionStore((state) => state.session);
  const elections = useElectionStore((state) => state.elections);
  const applications = useElectionStore((state) => state.candidateApplications);
  const initializeCandidateApplications = useElectionStore((state) => state.initializeCandidateApplications);
  const cleanupCandidateApplications = useElectionStore((state) => state.cleanupCandidateApplications);
  const applyForElection = useElectionStore((state) => state.applyForElection);

  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [party, setParty] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    initializeCandidateApplications();
    return () => cleanupCandidateApplications();
  }, [initializeCandidateApplications, cleanupCandidateApplications]);

  const activeElections = useMemo(
    () => elections.filter((election) => election.isActive),
    [elections]
  );

  const selectedElection = useMemo(
    () => activeElections.find((election) => election.id === selectedElectionId),
    [activeElections, selectedElectionId]
  );

  const myApplications = useMemo(
    () => applications.filter((application) => application.email === session.email),
    [applications, session.email]
  );

  const handleElectionChange = (value: string) => {
    setSelectedElectionId(value);
    setSelectedCategoryId("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedElectionId || !selectedCategoryId || !candidateName.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await applyForElection({
        electionId: selectedElectionId,
        categoryId: selectedCategoryId,
        candidateName,
        party,
        description,
      });

      toast({
        title: t("candidateDashboard.toasts.submittedTitle"),
        description: t("candidateDashboard.toasts.submittedDesc"),
      });

      setSelectedCategoryId("");
      setCandidateName("");
      setParty("");
      setDescription("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("candidateDashboard.toasts.failedTitle"),
        description: error?.message || t("candidateDashboard.toasts.failedDesc"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusBadge = (status: "pending" | "approved" | "rejected") => {
    if (status === "approved") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success">
          <CheckCircle2 className="h-3 w-3" /> {t("common.status.approved")}
        </span>
      );
    }

    if (status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive">
          <XCircle className="h-3 w-3" /> {t("common.status.rejected")}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-2 py-1 text-xs font-semibold text-warning-foreground">
        <Clock3 className="h-3 w-3" /> {t("common.status.pending")}
      </span>
    );
  };

  return (
    <div className="page-shell">
      <div className="page-container max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("candidateDashboard.title")}</h1>
          <p className="text-muted-foreground">{t("candidateDashboard.description")}</p>
        </div>

        <Card className="section-card">
          <CardHeader>
            <CardTitle>{t("candidateDashboard.applyTitle")}</CardTitle>
            <CardDescription>
              {t("candidateDashboard.applyDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("candidateDashboard.election")}</Label>
                  <Select value={selectedElectionId} onValueChange={handleElectionChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("candidateDashboard.selectActiveElection")} />
                    </SelectTrigger>
                    <SelectContent>
                      {activeElections.map((election) => (
                        <SelectItem key={election.id} value={election.id}>
                          {election.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("candidateDashboard.category")}</Label>
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("candidateDashboard.selectCategory")} />
                    </SelectTrigger>
                    <SelectContent>
                      {(selectedElection?.categories || []).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("candidateDashboard.candidateName")}</Label>
                  <Input
                    value={candidateName}
                    onChange={(event) => setCandidateName(event.target.value)}
                    placeholder={t("candidateDashboard.candidateNamePlaceholder")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("candidateDashboard.partyOptional")}</Label>
                  <Input
                    value={party}
                    onChange={(event) => setParty(event.target.value)}
                    placeholder={t("candidateDashboard.partyPlaceholder")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("candidateDashboard.candidateStatement")}</Label>
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={t("candidateDashboard.statementPlaceholder")}
                  rows={4}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !selectedElectionId ||
                  !selectedCategoryId ||
                  !candidateName.trim() ||
                  !description.trim()
                }
              >
                {isSubmitting ? t("common.status.submitting") : t("candidateDashboard.submitApplication")}
              </Button>
            </form>
          </CardContent>
          {activeElections.length === 0 && (
            <CardFooter>
              <p className="text-sm text-muted-foreground">{t("candidateDashboard.noActiveElections")}</p>
            </CardFooter>
          )}
        </Card>

        <Card className="section-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRoundCheck className="h-5 w-5 text-primary" /> {t("candidateDashboard.myApplications")}
            </CardTitle>
            <CardDescription>{t("candidateDashboard.myApplicationsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {myApplications.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("candidateDashboard.noApplications")}</p>
            ) : (
              myApplications.map((application) => (
                <div key={application.id} className="rounded-lg border border-border/50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="font-semibold">{application.electionTitle}</h3>
                    {statusBadge(application.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("candidateDashboard.categoryAndCandidate", { category: application.categoryName, candidate: application.candidateName })}
                  </p>
                  <p className="mt-2 text-sm">{application.description}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
