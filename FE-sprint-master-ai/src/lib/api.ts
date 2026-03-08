const API_BASE_URL =
  import.meta.env.VITE_API_URL && typeof import.meta.env.VITE_API_URL === "string"
    ? import.meta.env.VITE_API_URL
    : "http://localhost:3000";

const TOKEN_STORAGE_KEY = "sprintmaster_token";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  subscription?: "free" | "pro";
};

export type Subtask = {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
};

export type Sprint = {
  id: string;
  title: string;
  description: string;
  goal: string;
  status: "draft" | "generated" | "in-progress" | "done";
  estimatedHours: number;
  createdAt: string;
  acceptanceCriteria: string[];
  risks: string[];
  subtasks: Subtask[];
};

export type UsageSummary = {
  month: string;
  monthlyCreated: number;
  limit: number;
  isPro: boolean;
};

type LoginResponse = {
  token: string;
  user: AuthUser;
};

type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type MySprintsResponse = {
  sprints: Sprint[];
  usage: UsageSummary;
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
};

// ── Token helpers ─────────────────────────────────────────────────────────────

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (options.auth) {
    const token = getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = (await res.json()) as { message?: string; error?: string; errors?: Array<{ message: string }> };
      message = data.message || data.error || (data.errors?.[0]?.message) || message;
    } catch {
      // ignore parse errors
    }
    const err = new Error(message) as Error & { status: number };
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const api = {
  getBaseUrl() {
    return API_BASE_URL;
  },

  getToken() {
    return getStoredToken();
  },

  setToken(token: string | null) {
    storeToken(token);
  },

  // ── Auth ──────────────────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await request<LoginResponse>("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    storeToken(data.token);
    return data;
  },

  async register(input: RegisterInput): Promise<void> {
    // Payload returns 201 with the new user doc (not a token) when verify is enabled.
    // We do NOT auto-login — the user must verify their email first.
    await request<unknown>("/api/users", {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName,
        subscription: "free",
      }),
    });
  },

  async me(): Promise<AuthUser | null> {
    const token = getStoredToken();
    if (!token) return null;

    try {
      const data = await request<{ user?: AuthUser }>("/api/users/me", {
        method: "GET",
        auth: true,
      });
      return data.user ?? null;
    } catch {
      storeToken(null);
      return null;
    }
  },

  async logout(): Promise<void> {
    const token = getStoredToken();
    if (token) {
      try {
        await request<void>("/api/users/logout", {
          method: "POST",
          auth: true,
        });
      } catch {
        // ignore
      }
    }
    storeToken(null);
  },

  // ── Sprints ───────────────────────────────────────────────────────────────

  async getSprints(page = 1, limit = 20): Promise<MySprintsResponse> {
    return request<MySprintsResponse>(
      `/api/my-sprints?page=${page}&limit=${limit}`,
      { auth: true },
    );
  },

  async getSprint(id: string): Promise<Sprint> {
    // Payload's built-in /api/sprints/:id with depth:1 via query param
    const data = await request<Record<string, unknown>>(
      `/api/sprints/${id}?depth=1`,
      { auth: true },
    );
    // Normalise the subtasks join to flat array
    const rawDocs = (data.subtasks as { docs?: unknown[] } | undefined)?.docs ?? [];
    const subtasks = (rawDocs as Record<string, unknown>[])
      .filter((t) => t && typeof t === "object")
      .map((t) => ({
        id: t.id as string,
        title: (t.title as string) ?? "",
        description: (t.description as string) ?? "",
        duration: (t.duration as string) ?? "1h",
        completed: (t.completed as boolean) ?? false,
        priority: ((t.priority as string) ?? "medium") as Subtask["priority"],
      }));
    return {
      id: data.id as string,
      title: data.title as string,
      description: (data.description as string) ?? "",
      goal: data.goal as string,
      status: data.status as Sprint["status"],
      estimatedHours: (data.estimatedHours as number) ?? 0,
      createdAt: (data.createdAt as string) ?? new Date().toISOString(),
      acceptanceCriteria: Array.isArray(data.acceptanceCriteria) ? data.acceptanceCriteria as string[] : [],
      risks: Array.isArray(data.risks) ? data.risks as string[] : [],
      subtasks,
    };
  },

  async generateSprint(goal: string): Promise<Sprint> {
    return request<Sprint>("/api/generate-sprint", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ goal }),
    });
  },

  async regenerateSprint(sprintId: string): Promise<Sprint> {
    return request<Sprint>("/api/regenerate-sprint", {
      method: "POST",
      auth: true,
      body: JSON.stringify({ sprintId }),
    });
  },

  async deleteSprint(id: string): Promise<void> {
    await request<void>(`/api/delete-sprint/${id}`, {
      method: "DELETE",
      auth: true,
    });
  },

  async updateSprint(
    id: string,
    data: Partial<Pick<Sprint, "title" | "description" | "status" | "goal">>,
  ): Promise<void> {
    await request<unknown>(`/api/sprints/${id}`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(data),
    });
  },

  async updateTask(
    id: string,
    data: Partial<Pick<Subtask, "title" | "description" | "completed" | "duration" | "priority">>,
  ): Promise<void> {
    await request<unknown>(`/api/tasks/${id}`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(data),
    });
  },
};
