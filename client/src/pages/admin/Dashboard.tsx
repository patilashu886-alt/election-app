import { useState } from "react";
import { useElectionStore, ElectionType, Category } from "@/store/useElectionStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash, Settings2, BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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
  const elections = useElectionStore(state => state.elections);
  const toggleElection = useElectionStore(state => state.toggleElection);
  const createElection = useElectionStore(state => state.createElection);
  const [showWizard, setShowWizard] = useState(false);

  // Wizard state
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<ElectionType>("college");
  const [newCategories, setNewCategories] = useState<CategoryDraft[]>([]);

  const addCategory = () => {
    setNewCategories((prev) => [...prev, { name: "", description: "", candidates: [{ name: "", party: "", description: "" }] }]);
  };

  const removeCategory = (categoryIndex: number) => {
    setNewCategories((prev) => prev.filter((_, idx) => idx !== categoryIndex));
  };

  const updateCategoryField = (categoryIndex: number, field: keyof Omit<CategoryDraft, 'candidates'>, value: string) => {
    setNewCategories((prev) =>
      prev.map((category, idx) => (idx === categoryIndex ? { ...category, [field]: value } : category))
    );
  };

  const addCandidate = (categoryIndex: number) => {
    setNewCategories((prev) =>
      prev.map((category, idx) =>
        idx === categoryIndex
          ? { ...category, candidates: [...category.candidates, { name: "", party: "", description: "" }] }
          : category
      )
    );
  };

  const removeCandidate = (categoryIndex: number, candidateIndex: number) => {
    setNewCategories((prev) =>
      prev.map((category, idx) =>
        idx === categoryIndex
          ? { ...category, candidates: category.candidates.filter((_, cIdx) => cIdx !== candidateIndex) }
          : category
      )
    );
  };

  const updateCandidateField = (categoryIndex: number, candidateIndex: number, field: keyof CandidateDraft, value: string) => {
    setNewCategories((prev) =>
      prev.map((category, idx) => {
        if (idx !== categoryIndex) return category;
        return {
          ...category,
          candidates: category.candidates.map((candidate, cIdx) =>
            cIdx === candidateIndex ? { ...candidate, [field]: value } : candidate
          )
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

  const handleCreate = () => {
    if (!canCreateElection) return;

    createElection({
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
          party: candidate.party || 'Independent',
          description: candidate.description || `Candidate for ${category.name}`,
          manifesto: `${candidate.name}'s priorities for ${category.name}.`,
          advantages: ['Eligible and approved candidate'],
          disadvantages: ['No additional notes'],
          votes: 0,
          imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(candidate.name)}`
        }))
      }))
    });
    setNewTitle("");
    setNewType("college");
    setNewCategories([]);
    setShowWizard(false);
  };

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground mt-1">Global election management and lifecycle control.</p>
        </div>
        <Button onClick={() => setShowWizard(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Election Wizard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elections.map(election => (
          <Card key={election.id} className="glass border-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge className="capitalize">{election.type}</Badge>
                <div className={`flex items-center gap-1.5 text-xs font-bold ${election.isActive ? 'text-success' : 'text-muted-foreground'}`}>
                  <span className={`w-2 h-2 rounded-full ${election.isActive ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                  {election.isActive ? 'LIVE' : 'OFFLINE'}
                </div>
              </div>
              <CardTitle className="mt-2">{election.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Categories</span><span>{election.categories.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ends</span><span className="font-mono text-[10px] uppercase">{new Date(election.endTime).toLocaleDateString()}</span></div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 border-t border-border/40 pt-4">
              <Button 
                variant={election.isActive ? "destructive" : "default"}
                size="sm" 
                className="flex-1"
                onClick={() => toggleElection(election.id, !election.isActive)}
              >
                {election.isActive ? "Stop Election" : "Start Election"}
              </Button>
              <Button variant="outline" size="sm"><Settings2 className="w-4 h-4" /></Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-10 space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight">Real-Time Results by Category</h2>
        </div>

        {elections.length === 0 ? (
          <Card className="glass border-dashed">
            <CardHeader>
              <CardTitle>No Results Yet</CardTitle>
              <CardDescription>Create an election to start monitoring vote counts.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          elections.map((election) => (
            <Card key={`results-${election.id}`} className="glass">
              <CardHeader>
                <CardTitle>{election.title}</CardTitle>
                <CardDescription className="capitalize">{election.type} election • {election.isActive ? 'Live' : 'Stopped'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {election.categories.map((category) => {
                  const chartData = category.candidates.map((candidate) => ({
                    candidate: candidate.name,
                    votes: candidate.votes
                  }));

                  const chartConfig = {
                    votes: {
                      label: 'Votes',
                      color: 'hsl(var(--primary))'
                    }
                  };

                  return (
                    <div key={category.id} className="rounded-lg border border-border/50 p-4">
                      <div className="mb-3">
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>

                      {chartData.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No candidates configured.</p>
                      ) : (
                        <ChartContainer config={chartConfig} className="h-[220px] w-full">
                          <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="candidate" tickLine={false} axisLine={false} interval={0} angle={-20} height={50} textAnchor="end" />
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
          <Card className="w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Election Creation Wizard</CardTitle>
              <CardDescription>Configure election rules, categories, and eligibility.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Election Title</Label>
                  <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g., Annual Board Review" />
                </div>
                <div className="space-y-2">
                  <Label>Election Type</Label>
                  <Select value={newType} onValueChange={(v: ElectionType) => setNewType(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="college">College/University</SelectItem>
                      <SelectItem value="company">Corporate/Company</SelectItem>
                      <SelectItem value="society">Society/Community</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Voting Categories & Candidates</Label>
                  <Button size="sm" onClick={addCategory}><Plus className="w-3 h-3 mr-1" /> Add Category</Button>
                </div>

                {newCategories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-3 bg-muted/30 p-3 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-center">
                      <Input
                        value={category.name}
                        onChange={(e) => updateCategoryField(categoryIndex, 'name', e.target.value)}
                        placeholder="Category Name"
                        className="h-8"
                      />
                      <Input
                        value={category.description}
                        onChange={(e) => updateCategoryField(categoryIndex, 'description', e.target.value)}
                        placeholder="Category Description"
                        className="h-8"
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeCategory(categoryIndex)}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs">Candidates</Label>
                        <Button size="sm" variant="outline" onClick={() => addCandidate(categoryIndex)}>
                          <Plus className="w-3 h-3 mr-1" /> Add Candidate
                        </Button>
                      </div>

                      {category.candidates.map((candidate, candidateIndex) => (
                        <div key={candidateIndex} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                          <Input
                            value={candidate.name}
                            onChange={(e) => updateCandidateField(categoryIndex, candidateIndex, 'name', e.target.value)}
                            placeholder="Candidate Name"
                            className="h-8"
                          />
                          <Input
                            value={candidate.party}
                            onChange={(e) => updateCandidateField(categoryIndex, candidateIndex, 'party', e.target.value)}
                            placeholder="Party"
                            className="h-8"
                          />
                          <Input
                            value={candidate.description}
                            onChange={(e) => updateCandidateField(categoryIndex, candidateIndex, 'description', e.target.value)}
                            placeholder="Short Description"
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
              <Button variant="outline" onClick={() => setShowWizard(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!canCreateElection}>Deploy Election</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${className}`}>{children}</span>;
}
