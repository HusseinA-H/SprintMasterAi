import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Clock, CheckCircle2, Circle, Pencil, Check, X, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSprintStore, type Sprint } from "@/lib/sprint-store";
import { api } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";

// ── Editable field ────────────────────────────────────────────────────────────

function EditableField({
  value,
  onSave,
  className = "",
}: {
  value: string;
  onSave: (v: string) => Promise<void> | void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className={`bg-transparent border-b border-white/20 rounded-none border-x-0 border-t-0 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 flex-1 ${className}`}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleSave();
            if (e.key === "Escape") { setDraft(value); setEditing(false); }
          }}
        />
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <button onClick={handleSave} className="text-primary hover:text-primary/80"><Check className="w-4 h-4" /></button>
            <button onClick={() => { setDraft(value); setEditing(false); }} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`group flex items-center gap-2 cursor-pointer ${className}`} onClick={() => setEditing(true)}>
      <span className="flex-1">{value}</span>
      <Pencil className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const SprintDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sprints, updateSprint, updateSubtask, deleteSprint, regenerateSprint } = useSprintStore();
  const { user, logout, loading: authLoading } = useAuth();
  const [regenerating, setRegenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const sprint = sprints.find((s) => s.id === id);

  // If the sprint is not in the store (e.g. user landed via direct URL / refresh), fetch it
  const [fetchedSprint, setFetchedSprint] = useState<Sprint | null>(null);
  const [fetching, setFetching] = useState<boolean>(!sprint);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!sprint && id && !hasFetched.current) {
      hasFetched.current = true;
      setFetching(true);
      api.getSprint(id)
        .then((s) => {
          setFetchedSprint(s);
          setFetching(false);
        })
        .catch(() => {
          setFetchError("Sprint not found or you don't have access.");
          setFetching(false);
        });
    }
  }, [id, sprint]);

  const activeSprint = sprint ?? fetchedSprint;

  if (fetching) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading sprint…</span>
      </div>
    );
  }

  if (!activeSprint || fetchError) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{fetchError ?? "Sprint not found"}</h2>
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="border-border/60 bg-muted/40">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const completedCount = activeSprint.subtasks.filter((t) => t.completed).length;
  const progress = activeSprint.subtasks.length ? (completedCount / activeSprint.subtasks.length) * 100 : 0;
  const statusOptions: Sprint["status"][] = ["draft", "generated", "in-progress", "done"];

  return (
    <div className="min-h-screen bg-transparent">
      <header className="border-b border-border/50 bento-card rounded-none border-x-0 border-t-0">
        <div className="container mx-auto flex items-center justify-between h-16 px-6 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-bold truncate">{activeSprint.title}</span>
          </div>
          <div className="flex items-center gap-2">
            {user?.subscription === "pro" && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setRegenerating(true);
                  try {
                    const regenerated = await regenerateSprint(activeSprint.id);
                    navigate(`/sprint/${regenerated.id}`);
                  } finally {
                    setRegenerating(false);
                  }
                }}
                disabled={regenerating}
                className="text-xs"
              >
                {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                Regenerate
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setDeleting(true);
                try {
                  await deleteSprint(activeSprint.id);
                  navigate("/dashboard", { replace: true });
                } finally {
                  setDeleting(false);
                }
              }}
              disabled={deleting}
              className="text-xs text-destructive border-destructive/40 hover:bg-destructive/10"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
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

      <main className="container mx-auto px-6 py-10 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Sprint Header */}
          <div className="bento-card p-8 mb-8">
            <EditableField
              value={activeSprint.title}
              onSave={(v) => updateSprint(activeSprint.id, { title: v })}
              className="text-2xl font-bold mb-3"
            />
            <EditableField
              value={activeSprint.description}
              onSave={(v) => updateSprint(activeSprint.id, { description: v })}
              className="text-sm text-muted-foreground mb-6"
            />

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" /> {activeSprint.estimatedHours}h estimated
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4" /> {completedCount}/{activeSprint.subtasks.length} tasks
              </div>
              <select
                value={activeSprint.status}
                onChange={(e) => void updateSprint(activeSprint.id, { status: e.target.value as Sprint["status"] })}
                className="text-xs font-medium px-3 py-1 rounded-full bg-muted border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s.replace("-", " ")}</option>
                ))}
              </select>
            </div>

            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
          </div>

          {/* Subtasks */}
          <h3 className="text-lg font-semibold mb-4">Subtasks</h3>
          <div className="space-y-3">
            {activeSprint.subtasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bento-card p-5 flex items-start gap-4 transition-all ${task.completed ? "opacity-60" : ""}`}
              >
                <button
                  onClick={() => void updateSubtask(activeSprint.id, task.id, { completed: !task.completed })}
                  className="mt-0.5 flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <EditableField
                    value={task.title}
                    onSave={(v) => updateSubtask(activeSprint.id, task.id, { title: v })}
                    className={task.completed ? "line-through" : ""}
                  />
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                  )}
                </div>
                <EditableField
                  value={task.duration}
                  onSave={(v) => updateSubtask(activeSprint.id, task.id, { duration: v })}
                  className="text-xs text-muted-foreground font-mono bg-muted/40 px-2 py-0.5 rounded w-14 text-center"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SprintDetail;
