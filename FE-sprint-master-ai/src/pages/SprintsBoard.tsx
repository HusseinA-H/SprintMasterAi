import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Clock, CheckCircle2, Plus, LayoutGrid, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSprintStore, type Sprint } from "@/lib/sprint-store";
import { useAuth } from "@/auth/AuthContext";

const COLUMNS: { status: Sprint["status"]; label: string; color: string }[] = [
  { status: "draft", label: "Draft", color: "border-muted-foreground/30" },
  { status: "generated", label: "Generated", color: "border-primary/40" },
  { status: "in-progress", label: "In Progress", color: "border-warning/40" },
  { status: "done", label: "Done", color: "border-success/40" },
];

function SprintCard({ sprint, onDelete }: { sprint: Sprint; onDelete: (id: string) => Promise<void> }) {
  const navigate = useNavigate();
  const completedCount = sprint.subtasks.filter((t) => t.completed).length;
  const progress = sprint.subtasks.length ? (completedCount / sprint.subtasks.length) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bento-card p-4 cursor-pointer hover:glow-border transition-all duration-300"
      onClick={() => navigate(`/sprint/${sprint.id}`)}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm leading-tight line-clamp-2">{sprint.title}</h4>
        <button
          onClick={async (e) => {
            e.stopPropagation();
            await onDelete(sprint.id);
          }}
          className="text-muted-foreground hover:text-destructive"
          title="Delete sprint"
          aria-label="Delete sprint"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{sprint.estimatedHours}h</span>
        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />{completedCount}/{sprint.subtasks.length}</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
      </div>
    </motion.div>
  );
}

const SprintsBoard = () => {
  const navigate = useNavigate();
  const { sprints, isLoading, loadSprints, deleteSprint } = useSprintStore();
  const { logout, loading: authLoading } = useAuth();

  // Load sprints if store is empty (handles direct navigation to /sprints)
  useEffect(() => {
    if (sprints.length === 0) {
      void loadSprints();
    }
  }, [loadSprints, sprints.length]);

  return (
    <div className="min-h-screen bg-transparent">
      <header className="border-b border-border/50 bento-card rounded-none border-x-0 border-t-0">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-primary" />
              <span className="font-bold">Sprint Board</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/dashboard")} className="gradient-button border-0 h-9 text-sm gap-2">
              <Plus className="w-4 h-4" /> New Sprint
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => { await logout(); navigate("/", { replace: true }); }}
              disabled={authLoading}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading sprints…</span>
          </div>
        ) : sprints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No sprints yet</h2>
            <p className="text-muted-foreground mb-6 text-sm">Generate your first sprint to see it here.</p>
            <Button onClick={() => navigate("/dashboard")} className="gradient-button border-0 gap-2">
              <Plus className="w-4 h-4" /> Create First Sprint
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COLUMNS.map((col) => {
              const colSprints = sprints.filter((s) => s.status === col.status);
              return (
                <div key={col.status}>
                  <div className={`flex items-center gap-2 mb-6 pb-2 border-b border-white/10`}>
    <div className={`w-2 h-2 rounded-full shadow-lg ${col.status === 'draft' ? 'bg-muted-foreground shadow-muted/50' : col.status === 'generated' ? 'bg-accent shadow-accent/50' : col.status === 'in-progress' ? 'bg-warning shadow-warning/50' : 'bg-success shadow-success/50'}`} />
                    <h3 className="text-sm font-semibold">{col.label}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{colSprints.length}</span>
                  </div>
                  <div className="space-y-3 min-h-[200px]">
                    {colSprints.map((sprint) => (
                      <SprintCard key={sprint.id} sprint={sprint} onDelete={deleteSprint} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default SprintsBoard;
