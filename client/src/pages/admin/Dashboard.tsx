import { useState, useEffect } from "react";
import { useElectionStore, ElectionType, Category } from "@/store/useElectionStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash, Settings2, BarChart3, Check, X } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useTranslation } from "react-i18next";

interface CandidateDraft {
  name: string;
  party: string;
  description: string;
}

interface CategoryDraft {
  name: string;
  description: string;
  candidates: CandidateDraft[];
}

export function AdminDashboard() {
  const { t } = useTranslation();
  const elections = useElectionStore((state) => state.elections);
  const toggleElection = useElectionStore((state) => state.toggleElection);
  const createElection = useElectionStore((state) => state.createElection);
  const initializeElections = useElectionStore((state) => state.initializeElections);
  const cleanupElections = useElectionStore((state) => state.cleanupElections);
  const candidateApplications = useElectionStore((state) => state.candidateApplications);
  const initializeCandidateApplications = useElectionStore((state) => state.initializeCandidateApplications);
  const cleanupCandidateApplications = useElectionStore((state) => state.cleanupCandidateApplications);
  const reviewCandidateApplication = useElectionStore((state) => state.reviewCandidateApplication);

  const [showWizard, setShowWizard] = useState(false);

  // Wizard state
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<ElectionType>("college");
  const [newCategories, setNewCategories] = useState<CategoryDraft[]>([]);

  // Initialize / cleanup Firestore real-time listener
  useEffect(() => {
    initializeElections();
    initializeCandidateApplications();
    return () => {
      cleanupElections();
      cleanupCandidateApplications();
    };
  }, [initializeElections, cleanupElections, initializeCandidateApplications, cleanupCandidateApplications]);

  const pendingApplications = candidateApplications.filter((application) => application.status === "pending");

  const handleReviewApplication = async (applicationId: string, approve: boolean) => {
    try {
      await reviewCandidateApplication(applicationId, approve);
    } catch (error: any) {
      console.error("Failed to review application:", error);
      alert(error?.message || t("adminDashboard.toasts.reviewFailed"));
    }
  };

  const addCategory = () => {
    setNewCategories((prev) => [
      ...prev,
      { name: "", description: "", candidates: [{ name: "", party: "", description: "" }] },
    ]);
  };

  const removeCategory = (categoryIndex: number) => {
    setNewCategories((prev) => prev.filter((_, idx) => idx !== categoryIndex));
  };

  const updateCategoryField = (
    categoryIndex: number,
    field: keyof Omit<CategoryDraft, "candidates">,
    value: string
  ) => {
    setNewCategories((prev) =>
      prev.map((category, idx) =>
        idx === categoryIndex ? { ...category, [field]: value } : category
      )
    );
  };

  const addCandidate = (categoryIndex: number) => {
    setNewCategories((prev) =>
      prev.map((category, idx) =>
        idx === categoryIndex
          ? {
              ...category,
              candidates: [...category.candidates, { name: "", party: "", description: "" }],
            }
          : category
      )
    );
  };

  const removeCandidate = (categoryIndex: number, candidateIndex: number) => {
    setNewCategories((prev) =>
      prev.map((category, idx) =>
        idx === categoryIndex
          ? {
              ...category,
              candidates: category.candidates.filter((_, cIdx) => cIdx !== candidateIndex),
            }
          : category
      )
    );
  };

  const updateCandidateField = (
    categoryIndex: number,
    candidateIndex: number,
    field: keyof CandidateDraft,
    value: string
  ) => {
    setNewCategories((prev) =>
      prev.map((category, idx) => {
        if (idx !== categoryIndex) return category;
        return {
          ...category,
          candidates: category.candidates.map((candidate, cIdx) =>
            cIdx === candidateIndex ? { ...candidate, [field]: value } : candidate
          ),
        };
      })
    );
  };

  const canCreateElection =
    !!newTitle.trim() &&
    newCategories.length > 0 &&
    newCategories.every(
      (category) =>
        !!category.name.trim() &&
        category.candidates.length > 0 &&
        category.candidates.every((candidate) => !!candidate.name.trim())
    );

  const handleCreate = async () => {
    if (!canCreateElection) return;

    try {
      await createElection({
        title: newTitle,
        description: `Official ${newType} election`,
        type: newType,
        isActive: false,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 604800000).toISOString(),
        categories: newCategories.map((category, categoryIndex) => ({
          id: `cat-${Date.now()}-${categoryIndex}`,
          name: category.name,
          description: category.description || `${category.name} category`,
          candidates: category.candidates.map((candidate, candidateIndex) => ({
            id: `cand-${Date.now()}-${categoryIndex}-${candidateIndex}`,
            name: candidate.name,
            party: candidate.party || "Independent",
            description: candidate.description || `Candidate for ${category.name}`,
            manifesto: `${candidate.name}'s priorities for ${category.name}.`,
            advantages: ["Eligible and approved candidate"],
            disadvantages: ["No additional notes"],
            votes: 0,
            imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
              candidate.name
            )}`,
          })),
        })),
      });

      // Reset form on success
      setNewTitle("");
      setNewType("college");
      setNewCategories([]);
      setShowWizard(false);
    } catch (err) {
      console.error("Failed to create election:", err);
      // Optional: show toast/notification here in real app
      alert(t("adminDashboard.toasts.createFailed"));
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t("adminDashboard.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("adminDashboard.description")}</p>
        </div>
        <Button onClick={() => setShowWizard(true)}>
          <Plus className="w-4 h-4 mr-2" /> {t("adminDashboard.newElectionWizard")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elections.map((election) => (
          <Card key={election.id} className="section-card border-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge className="capitalize">{election.type}</Badge>
                <div
                  className={`flex items-center gap-1.5 text-xs font-bold ${
                    election.isActive ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      election.isActive ? "bg-success animate-pulse" : "bg-muted-foreground"
                    }`}
                  />
                  {election.isActive ? t("adminDashboard.live") : t("adminDashboard.offline")}
                </div>
              </div>
              <CardTitle className="mt-2">{election.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("adminDashboard.categories")}</span>
                  <span>{election.categories.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("adminDashboard.ends")}</span>
                  <span className="font-mono text-[10px] uppercase">
                    {new Date(election.endTime).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 border-t border-border/40 pt-4">
              <Button
                variant={election.isActive ? "destructive" : "default"}
                size="sm"
                className="flex-1"
                onClick={() => toggleElection(election.id, !election.isActive)}
              >
                {election.isActive ? t("adminDashboard.stopElection") : t("adminDashboard.startElection")}
              </Button>
              <Button variant="outline" size="sm">
                <Settings2 className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">{t("adminDashboard.candidateApplications")}</h2>
        {pendingApplications.length === 0 ? (
          <Card className="section-card border-dashed">
            <CardHeader>
              <CardTitle>{t("adminDashboard.noPendingTitle")}</CardTitle>
              <CardDescription>{t("adminDashboard.noPendingDesc")}</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingApplications.map((application) => (
              <Card key={application.id} className="section-card">
                <CardHeader>
                  <CardTitle className="text-lg">{application.candidateName}</CardTitle>
                  <CardDescription>
                    {application.electionTitle} • {application.categoryName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">{t("adminDashboard.email")}</span> {application.email}</p>
                  <p><span className="text-muted-foreground">{t("adminDashboard.identifier")}</span> {application.identifier}</p>
                  <p><span className="text-muted-foreground">{t("adminDashboard.party")}</span> {application.party}</p>
                  <p className="text-muted-foreground">{application.description}</p>
                </CardContent>
                <CardFooter className="flex gap-2 border-t border-border/40 pt-4">
                  <Button className="flex-1" size="sm" onClick={() => handleReviewApplication(application.id, true)}>
                    <Check className="w-4 h-4 mr-1" /> {t("adminDashboard.approve")}
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleReviewApplication(application.id, false)}>
                    <X className="w-4 h-4 mr-1" /> {t("adminDashboard.reject")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">{t("adminDashboard.resultsTitle")}</h2>
        </div>

        {elections.length === 0 ? (
          <Card className="section-card border-dashed">
            <CardHeader>
              <CardTitle>{t("adminDashboard.noResultsTitle")}</CardTitle>
              <CardDescription>{t("adminDashboard.noResultsDesc")}</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          elections.map((election) => (
            <Card key={`results-${election.id}`} className="section-card">
              <CardHeader>
                <CardTitle>{election.title}</CardTitle>
                <CardDescription className="capitalize">
                  {t("adminDashboard.liveStopped", { type: election.type, state: election.isActive ? t("adminDashboard.liveState") : t("adminDashboard.stoppedState") })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {election.categories.map((category) => {
                  const chartData = category.candidates.map((candidate) => ({
                    candidate: candidate.name,
                    votes: candidate.votes,
                  }));

                  const chartConfig = {
                    votes: {
                      label: t("adminDashboard.votes"),
                      color: "hsl(var(--primary))",
                    },
                  };

                  return (
                    <div key={category.id} className="rounded-lg border border-border/50 p-4">
                      <div className="mb-3">
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>

                      {chartData.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("adminDashboard.noCandidates")}</p>
                      ) : (
                        <ChartContainer config={chartConfig} className="h-[220px] w-full">
                          <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                              dataKey="candidate"
                              tickLine={false}
                              axisLine={false}
                              interval={0}
                              angle={-20}
                              height={50}
                              textAnchor="end"
                            />
                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="votes" fill="var(--color-votes)" radius={6} />
                          </BarChart>
                        </ChartContainer>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showWizard && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="section-card w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>{t("adminDashboard.wizardTitle")}</CardTitle>
              <CardDescription>{t("adminDashboard.wizardDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("adminDashboard.electionTitle")}</Label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={t("adminDashboard.electionTitlePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("adminDashboard.electionType")}</Label>
                  <Select value={newType} onValueChange={(v: ElectionType) => setNewType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="college">{t("adminDashboard.typeCollege")}</SelectItem>
                      <SelectItem value="company">{t("adminDashboard.typeCompany")}</SelectItem>
                      <SelectItem value="society">{t("adminDashboard.typeSociety")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>{t("adminDashboard.votingCategoriesCandidates")}</Label>
                  <Button size="sm" onClick={addCategory}>
                    <Plus className="w-3 h-3 mr-1" /> {t("adminDashboard.addCategory")}
                  </Button>
                </div>

                {newCategories.map((category, categoryIndex) => (
                  <div
                    key={categoryIndex}
                    className="space-y-3 bg-muted/30 p-3 rounded-lg border"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-center">
                      <Input
                        value={category.name}
                        onChange={(e) => updateCategoryField(categoryIndex, "name", e.target.value)}
                        placeholder={t("adminDashboard.categoryNamePlaceholder")}
                        className="h-8"
                      />
                      <Input
                        value={category.description}
                        onChange={(e) =>
                          updateCategoryField(categoryIndex, "description", e.target.value)
                        }
                        placeholder={t("adminDashboard.categoryDescriptionPlaceholder")}
                        className="h-8"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeCategory(categoryIndex)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs">{t("adminDashboard.candidates")}</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addCandidate(categoryIndex)}
                        >
                          <Plus className="w-3 h-3 mr-1" /> {t("adminDashboard.addCandidate")}
                        </Button>
                      </div>

                      {category.candidates.map((candidate, candidateIndex) => (
                        <div
                          key={candidateIndex}
                          className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center"
                        >
                          <Input
                            value={candidate.name}
                            onChange={(e) =>
                              updateCandidateField(categoryIndex, candidateIndex, "name", e.target.value)
                            }
                            placeholder={t("adminDashboard.candidateNamePlaceholder")}
                            className="h-8"
                          />
                          <Input
                            value={candidate.party}
                            onChange={(e) =>
                              updateCandidateField(categoryIndex, candidateIndex, "party", e.target.value)
                            }
                            placeholder={t("adminDashboard.partyPlaceholder")}
                            className="h-8"
                          />
                          <Input
                            value={candidate.description}
                            onChange={(e) =>
                              updateCandidateField(categoryIndex, candidateIndex, "description", e.target.value)
                            }
                            placeholder={t("adminDashboard.shortDescriptionPlaceholder")}
                            className="h-8"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeCandidate(categoryIndex, candidateIndex)}
                            disabled={category.candidates.length === 1}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setShowWizard(false)}>
                {t("common.actions.cancel")}
              </Button>
              <Button onClick={handleCreate} disabled={!canCreateElection}>
                {t("adminDashboard.deployElection")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${className}`}
    >
      {children}
    </span>
  );
}