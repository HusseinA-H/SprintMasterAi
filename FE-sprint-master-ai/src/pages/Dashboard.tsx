import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSprintStore, type Sprint } from "@/lib/sprint-store";
import { useAuth } from "@/auth/AuthContext";
import { api } from "@/lib/api";
import {
  ThinAlertIcon,
  ThinArrowLeftIcon,
  ThinBoltIcon,
  ThinCheckIcon,
  ThinClockIcon,
  ThinCrownIcon,
  ThinLockIcon,
  ThinSparkIcon,
  ThinTrashIcon,
} from "@/components/ThinIcons";

// ── Sub-components ────────────────────────────────────────────────────────────

function PlanBanner({ user, attemptsUsed, limit }: { user: { subscription?: string } | null; attemptsUsed: number; limit: number }) {
  const isPro = user?.subscription === "pro";
  const remaining = Math.max(0, limit - attemptsUsed);
  const atLimit = !isPro && attemptsUsed >= limit;

  if (isPro) {
    return (
      <div className="flex items-center gap-2 text-xs text-accent bg-accent/10 px-3 py-1.5 rounded-full">
        <ThinCrownIcon size={14} />
        Pro plan — unlimited sprints
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full ${atLimit ? "text-red-400 bg-red-500/10" : "text-muted-foreground bg-muted/60"}`}>
      {atLimit ? <ThinLockIcon size={14} /> : <ThinBoltIcon size={14} />}
      {atLimit ? "Limit reached — upgrade to Pro" : `Free plan — ${remaining}/${limit} generation attempts left`}
    </div>
  );
}

function GoalInput({
  onGenerate,
  disabled,
}: {
  onGenerate: (goal: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitError, setLimitError] = useState(false);

  const handleSubmit = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setError(null);
    setLimitError(false);
    try {
      await onGenerate(goal);
      setGoal("");
    } catch (err) {
      const e = err as Error & { status?: number };
      if (e.status === 403) {
        setLimitError(true);
        setError("Sprint limit reached. Upgrade to Pro for unlimited sprints.");
      } else {
        setError(e.message ?? "Failed to generate sprint. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 190, damping: 20 }}
      className="bento-card p-8 glow-border"
    >
      <div className="flex items-center gap-2 mb-4">
        <ThinSparkIcon size={18} className="text-primary" />
        <h2 className="text-lg font-semibold">Generate a Sprint Plan</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Describe your goal. The AI will structure it into an actionable one-day sprint plan (1-24h).
      </p>
      <textarea
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="e.g. Plan a marketing campaign, organize onboarding, improve operations, or create a product feature..."
        className="w-full h-36 bg-muted/40 border border-border/60 rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50 transition-all"
      />
      {error && (
        <div className={`mt-3 flex items-center gap-2 text-sm ${limitError ? "text-amber-400" : "text-red-400"}`}>
          {limitError ? <ThinLockIcon size={14} className="flex-shrink-0" /> : <ThinAlertIcon size={14} className="flex-shrink-0" />}
          {limitError ? (
            <span>
              Sprint limit reached.{" "}
              <Link to="/#pricing" className="underline underline-offset-2 text-accent hover:text-accent/80 transition-colors">
                Upgrade to Pro
              </Link>{" "}
              for unlimited sprints.
            </span>
          ) : (
            <span>{error}</span>
          )}
          {limitError && (
            <span className="text-xs text-muted-foreground">(One-day planner, 3 free attempts)</span>
          )}
        </div>
      )}
      <div className="flex justify-end mt-4">
        <Button
          onClick={handleSubmit}
          disabled={!goal.trim() || loading || !!disabled}
          className="gradient-button border-0 h-10 px-6 gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <ThinSparkIcon size={14} /> Generate Sprint Plan
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

function SprintPreview({ sprint, onDelete }: { sprint: Sprint; onDelete: (id: string) => Promise<void> }) {
  const navigate = useNavigate();
  const completedCount = sprint.subtasks.filter((t) => t.completed).length;
  const [deleting, setDeleting] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="bento-card p-6 hover:glow-border transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/sprint/${sprint.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-base leading-tight pr-4">{sprint.title}</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full shadow-lg ${
      sprint.status === 'draft' ? 'bg-muted-foreground shadow-muted/50' :
      sprint.status === 'generated' ? 'bg-accent shadow-accent/50' :
      sprint.status === 'in-progress' ? 'bg-warning shadow-warning/50' :
      'bg-success shadow-success/50'
    }`} />
    <span className="text-xs text-muted-foreground uppercase tracking-widest">{sprint.status.replace('-', ' ')}</span>
  </div>
          <button
            className="text-muted-foreground hover:text-destructive"
            onClick={async (e) => {
              e.stopPropagation();
              if (deleting) return;
              setDeleting(true);
              try {
                await onDelete(sprint.id);
              } finally {
                setDeleting(false);
              }
            }}
            aria-label="Delete sprint"
            title="Delete sprint"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThinTrashIcon size={14} />}
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{sprint.description}</p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <ThinClockIcon size={13} /> {sprint.estimatedHours}h
        </span>
        <span className="flex items-center gap-1">
          <ThinCheckIcon size={13} /> {completedCount}/{sprint.subtasks.length}
        </span>
      </div>
      <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${sprint.subtasks.length ? (completedCount / sprint.subtasks.length) * 100 : 0}%` }}
        />
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const { sprints, isLoading, loadSprints, addSprint, deleteSprint, totalDocs, usage } = useSprintStore();
  const { user, logout, loading: authLoading } = useAuth();

  useEffect(() => {
    void loadSprints();
  }, [loadSprints]);

  const handleGenerate = async (goal: string) => {
    const sprint = await api.generateSprint(goal);
    addSprint(sprint);
  };

  return (
    <div className="min-h-screen bg-transparent">
      <header className="border-b border-border/50 bento-card rounded-none border-x-0 border-t-0">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
              <ThinArrowLeftIcon size={18} />
            </Button>
            <div className="flex items-center gap-2">
              <ThinBoltIcon size={18} className="text-primary" />
              <span className="font-bold">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PlanBanner user={user} attemptsUsed={usage.attemptsUsed} limit={usage.limit} />
            <Button
              onClick={() => navigate("/sprints")}
              variant="outline"
              className="gap-2 border-border/60 bg-muted/40 hover:bg-muted/60 h-9 text-sm"
            >
              View All Sprints
            </Button>
            <Button
              onClick={() => navigate("/profile/settings")}
              variant="outline"
              className="gap-2 border-border/60 bg-muted/40 hover:bg-muted/60 h-9 text-sm"
            >
              Profile Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await logout();
                navigate("/", { replace: true });
              }}
              disabled={authLoading}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10 max-w-4xl">
        <GoalInput onGenerate={handleGenerate} />

        {isLoading && (
          <div className="mt-12 flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading your sprints…</span>
          </div>
        )}

        {!isLoading && sprints.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Recent Sprints</h2>
              {totalDocs > 5 && (
                <button
                  onClick={() => navigate("/sprints")}
                  className="text-sm text-accent hover:text-accent/80 transition-colors hover:underline underline-offset-2"
                >
                  View all {totalDocs} →
                </button>
              )}
            </div>
            <div className="grid gap-4">
              <AnimatePresence>
                {sprints.slice(0, 5).map((s) => (
                  <SprintPreview key={s.id} sprint={s} onDelete={deleteSprint} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {!isLoading && sprints.length === 0 && (
          <div className="mt-20 flex flex-col items-center text-center text-muted-foreground">
            <ThinBoltIcon size={40} className="text-primary/40 mb-4" />
            <p className="text-sm">No sprints yet. Generate your first one above!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
