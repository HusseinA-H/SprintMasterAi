import { create } from 'zustand';
import { api, type Sprint, type Subtask, type UsageSummary } from './api';

// Re-export types so existing imports keep working
export type { Sprint, Subtask };

// ── Store ──────────────────────────────────────────────────────────────────────

interface SprintStore {
  sprints: Sprint[];
  isLoading: boolean;
  totalDocs: number;
  usage: UsageSummary;
  // Load sprints from the API (replaces the in-memory list)
  loadSprints: (page?: number) => Promise<void>;
  // Add a newly created sprint to the top of the list
  addSprint: (sprint: Sprint) => void;
  // Update sprint locally + persist to API
  updateSprint: (id: string, updates: Partial<Sprint>) => Promise<void>;
  // Update a subtask locally + persist to API
  updateSubtask: (sprintId: string, subtaskId: string, updates: Partial<Subtask>) => Promise<void>;
  // Remove sprint from local list + backend
  deleteSprint: (id: string) => Promise<void>;
  // Regenerate as a new sprint alternative (Pro only)
  regenerateSprint: (id: string) => Promise<Sprint>;
  // Replace entire list (used after loadSprints)
  setSprints: (sprints: Sprint[], total?: number, usage?: UsageSummary) => void;
}

export const useSprintStore = create<SprintStore>((set, get) => ({
  sprints: [],
  isLoading: false,
  totalDocs: 0,
  usage: {
    month: "",
    monthlyCreated: 0,
    limit: 3,
    isPro: false,
  },

  setSprints: (sprints, total, usage) =>
    set((state) => ({
      sprints,
      totalDocs: total ?? sprints.length,
      usage: usage ?? state.usage,
    })),

  loadSprints: async (page = 1) => {
    set({ isLoading: true });
    try {
      const res = await api.getSprints(page, 50);
      set({
        sprints: res.sprints,
        totalDocs: res.totalDocs,
        usage: res.usage,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  addSprint: (sprint) =>
    set((state) => ({
      sprints: [sprint, ...state.sprints],
      totalDocs: state.totalDocs + 1,
      usage: state.usage.isPro
        ? state.usage
        : {
            ...state.usage,
            monthlyCreated: state.usage.monthlyCreated + 1,
          },
    })),

  updateSprint: async (id, updates) => {
    // Optimistic update
    const prev = get().sprints;
    set((state) => ({
      sprints: state.sprints.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
    try {
      await api.updateSprint(id, updates as Parameters<typeof api.updateSprint>[1]);
    } catch (err) {
      // Rollback on failure
      set({ sprints: prev });
      throw err;
    }
  },

  updateSubtask: async (sprintId, subtaskId, updates) => {
    // Optimistic update
    const prev = get().sprints;
    set((state) => ({
      sprints: state.sprints.map((s) =>
        s.id === sprintId
          ? {
              ...s,
              subtasks: s.subtasks.map((t) =>
                t.id === subtaskId ? { ...t, ...updates } : t,
              ),
            }
          : s,
      ),
    }));
    try {
      await api.updateTask(subtaskId, updates as Parameters<typeof api.updateTask>[1]);
    } catch (err) {
      // Rollback on failure
      set({ sprints: prev });
      throw err;
    }
  },

  deleteSprint: async (id) => {
    const prev = get().sprints;
    set((state) => ({
      sprints: state.sprints.filter((s) => s.id !== id),
      totalDocs: Math.max(0, state.totalDocs - 1),
    }));
    try {
      await api.deleteSprint(id);
    } catch (err) {
      set((state) => ({
        sprints: prev,
        totalDocs: Math.max(state.totalDocs, prev.length),
      }));
      throw err;
    }
  },

  regenerateSprint: async (id) => {
    const sprint = await api.regenerateSprint(id);
    set((state) => ({
      sprints: [sprint, ...state.sprints],
      totalDocs: state.totalDocs + 1,
      usage: state.usage.isPro
        ? state.usage
        : {
            ...state.usage,
            monthlyCreated: state.usage.monthlyCreated + 1,
          },
    }));
    return sprint;
  },
}));
