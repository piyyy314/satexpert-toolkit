import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FolderPlus, Pencil } from "lucide-react";

interface LocalProject {
  id: number; name: string; description: string; language: string;
  status: string; priority: string; tags: string; createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  "in-progress": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "planned": "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  "on-hold": "bg-orange-500/15 text-orange-400 border-orange-500/20",
  "completed": "bg-green-500/15 text-green-400 border-green-500/20",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500/15 text-red-400 border-red-500/20",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  low: "bg-muted text-muted-foreground border-border",
};

export default function Projects() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [status, setStatus] = useState("in-progress");
  const [priority, setPriority] = useState("medium");
  const { toast } = useToast();

  const { data: projects, isLoading } = useQuery<LocalProject[]>({
    queryKey: ["/api/projects"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      resetForm();
      toast({ title: "Project added" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest("PATCH", `/api/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      resetForm();
      toast({ title: "Project updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Project removed" });
    },
  });

  function resetForm() {
    setOpen(false);
    setEditId(null);
    setName("");
    setDescription("");
    setLanguage("");
    setStatus("in-progress");
    setPriority("medium");
  }

  function startEdit(p: LocalProject) {
    setEditId(p.id);
    setName(p.name);
    setDescription(p.description || "");
    setLanguage(p.language || "");
    setStatus(p.status);
    setPriority(p.priority);
    setOpen(true);
  }

  function handleSubmit() {
    if (!name.trim()) return;
    const data = { name, description, language, status, priority, tags: "[]" };
    if (editId) {
      updateMutation.mutate({ id: editId, data });
    } else {
      createMutation.mutate(data);
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Local Projects</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Projects not yet on GitHub — track your work before publishing
          </p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); setOpen(o); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs gap-1.5" data-testid="button-add-project">
              <Plus className="w-3.5 h-3.5" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">{editId ? "Edit Project" : "New Local Project"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input
                placeholder="Project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-sm"
                data-testid="input-project-name"
              />
              <Textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-sm min-h-[70px] resize-none"
                data-testid="input-project-description"
              />
              <Input
                placeholder="Language (e.g. Python, TypeScript)"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="h-9 text-sm"
                data-testid="input-project-language"
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-9 text-xs" data-testid="select-project-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] uppercase text-muted-foreground mb-1 block">Priority</label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="h-9 text-xs" data-testid="select-project-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!name.trim() || createMutation.isPending || updateMutation.isPending}
                className="w-full h-9 text-sm"
                data-testid="button-submit-project"
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editId ? "Update" : "Add Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted/30 animate-pulse" />)}</div>
      ) : !projects?.length ? (
        <Card className="border-border/50 border-dashed">
          <CardContent className="p-8 text-center">
            <FolderPlus className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No local projects yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Add projects you're working on that aren't on GitHub</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {projects.map((p) => (
            <Card key={p.id} className="border-border/50" data-testid={`project-card-${p.id}`}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{p.name}</span>
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${STATUS_COLORS[p.status] || ""}`}>
                        {p.status}
                      </Badge>
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${PRIORITY_COLORS[p.priority] || ""}`}>
                        {p.priority}
                      </Badge>
                    </div>
                    {p.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                    )}
                    {p.language && (
                      <span className="text-[10px] text-muted-foreground font-mono mt-1 inline-block">{p.language}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => startEdit(p)}
                      data-testid={`button-edit-${p.id}`}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(p.id)}
                      data-testid={`button-delete-${p.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
