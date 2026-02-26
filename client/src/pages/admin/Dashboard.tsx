import { useState } from "react";
import { useElectionStore, ElectionType, Category } from "@/store/useElectionStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash, Save, LayoutDashboard, Settings2, Clock } from "lucide-react";

export function AdminDashboard() {
  const elections = useElectionStore(state => state.elections);
  const toggleElection = useElectionStore(state => state.toggleElection);
  const createElection = useElectionStore(state => state.createElection);
  const [showWizard, setShowWizard] = useState(false);

  // Wizard state
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<ElectionType>("college");
  const [newCategories, setNewCategories] = useState<Omit<Category, 'id'>[]>([]);

  const handleCreate = () => {
    createElection({
      title: newTitle,
      description: `Official ${newType} election`,
      type: newType,
      isActive: false,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 604800000).toISOString(),
      categories: newCategories.map(c => ({ ...c, id: `cat-${Math.random()}` }))
    });
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
                {election.isActive ? "Emergency Stop" : "Go Live"}
              </Button>
              <Button variant="outline" size="sm"><Settings2 className="w-4 h-4" /></Button>
            </CardFooter>
          </Card>
        ))}
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
                <div className="flex justify-between items-center"><Label>Voting Categories</Label><Button size="xs" onClick={() => setNewCategories([...newCategories, { name: "", description: "", candidates: [] }])}><Plus className="w-3 h-3 mr-1" /> Add</Button></div>
                {newCategories.map((cat, idx) => (
                  <div key={idx} className="flex gap-2 items-start bg-muted/30 p-2 rounded-lg border">
                    <Input value={cat.name} onChange={e => {
                      const updated = [...newCategories];
                      updated[idx].name = e.target.value;
                      setNewCategories(updated);
                    }} placeholder="Category Name" className="h-8" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setNewCategories(newCategories.filter((_, i) => i !== idx))}><Trash className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setShowWizard(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={!newTitle || newCategories.length === 0}>Deploy Election</Button>
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
