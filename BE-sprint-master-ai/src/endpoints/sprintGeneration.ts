import OpenAI from 'openai'
import { APIError, type PayloadRequest } from 'payload'

export type PlanMode = 'free' | 'pro'
type Priority = 'low' | 'medium' | 'high'

interface ParsedSprintResponse {
  title?: string
  description?: string
  goal?: string
  acceptanceCriteria?: unknown
  risks?: unknown
  subtasks?: Array<{
    title?: string
    description?: string
    priority?: string
    duration?: string
    dependsOn?: unknown
  }>
}

export interface PlannedSubtask {
  title: string
  description: string
  priority: Priority
  duration: string
  dependsOn: string[]
}

export interface PlannedSprint {
  title: string
  description: string
  goal: string
  acceptanceCriteria: string[]
  risks: string[]
  subtasks: PlannedSubtask[]
  estimatedHours: number
}

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'

function parseDurationToHours(value?: string): number {
  if (!value) return 1
  const raw = value.trim().toLowerCase()
  const hoursMatch = raw.match(/^(\d+(?:\.\d+)?)\s*h$/)
  if (hoursMatch) return Number(hoursMatch[1])
  const minsMatch = raw.match(/^(\d+)\s*m$/)
  if (minsMatch) return Number(minsMatch[1]) / 60
  return 1
}

function formatHours(hours: number): string {
  const rounded = Math.round(hours * 2) / 2
  if (Number.isInteger(rounded)) return `${rounded}h`
  return `${rounded.toFixed(1)}h`
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizePriority(value?: string): Priority {
  const normalized = value?.trim().toLowerCase()
  if (normalized === 'low' || normalized === 'medium' || normalized === 'high') {
    return normalized
  }
  return 'medium'
}

function normalizeOneDayDurations(subtasks: PlannedSubtask[]): { subtasks: PlannedSubtask[]; total: number } {
  if (subtasks.length === 0) {
    return { subtasks: [], total: 0 }
  }

  const sourceHours = subtasks.map((t) => clamp(parseDurationToHours(t.duration), 0.5, 8))
  const originalTotal = sourceHours.reduce((sum, h) => sum + h, 0)
  const targetTotal = clamp(originalTotal || 1, 1, 24)
  const ratio = targetTotal / (originalTotal || 1)

  const scaled = sourceHours.map((h) => clamp(h * ratio, 0.5, 8))
  const rounded = scaled.map((h) => Math.round(h * 2) / 2)

  let currentTotal = rounded.reduce((sum, h) => sum + h, 0)
  const targetRounded = Math.round(targetTotal * 2) / 2

  while (currentTotal > targetRounded) {
    const idx = rounded.findIndex((h) => h > 0.5)
    if (idx === -1) break
    rounded[idx] -= 0.5
    currentTotal -= 0.5
  }

  while (currentTotal < targetRounded) {
    const idx = rounded.findIndex((h) => h < 8)
    if (idx === -1) break
    rounded[idx] += 0.5
    currentTotal += 0.5
  }

  const normalized = subtasks.map((task, index) => ({
    ...task,
    duration: formatHours(rounded[index]),
  }))

  return {
    subtasks: normalized,
    total: Math.round(currentTotal * 10) / 10,
  }
}

function buildPrompt(mode: PlanMode, goal: string, previousPlanContext?: string): string {
  const sharedInstructions = `You are an expert one-day sprint planner for all domains.

Domain handling rules:
- Support any domain: business, sales, marketing, operations, students, research, software, personal productivity, and general work.
- Do NOT default to software unless the goal clearly needs software work.
- Keep the plan strictly executable in ONE DAY ONLY.

Output rules:
- Return ONLY valid JSON. No markdown, no prose, no code fences.
- Use this exact shape:
{
  "title": "string",
  "description": "string",
  "goal": "string",
  "acceptanceCriteria": ["string"],
  "risks": ["string"],
  "subtasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "low | medium | high",
      "duration": "1h",
      "dependsOn": ["string"]
    }
  ]
}
- Duration must always be in hours format like "1h", "2h", or "1.5h".
- dependsOn can only reference earlier task titles.`

  const freeModeInstructions = `Plan mode: FREE.
- Return a concise practical one-day plan.
- Create 4 to 6 subtasks.
- Keep each subtask short and clear.
- Keep acceptance criteria and risks basic but useful.`

  const proModeInstructions = `Plan mode: PRO.
- Return a high-quality one-day plan with stronger decomposition.
- Create 6 to 8 subtasks.
- Each subtask description should include clear execution detail.
- Make acceptance criteria and risks more specific and actionable.`

  const regenerateInstructions = previousPlanContext
    ? `Regeneration context:
- Produce an alternative version that is meaningfully different from the previous plan.
- Keep same goal intent, but vary task structure/order and execution approach.

Previous plan summary:
${previousPlanContext}`
    : ''

  return `${sharedInstructions}

${mode === 'pro' ? proModeInstructions : freeModeInstructions}
${regenerateInstructions}

User goal:
${goal}`
}

export async function generatePlan(params: {
  client: OpenAI
  mode: PlanMode
  goal: string
  previousPlanContext?: string
}): Promise<PlannedSprint> {
  const { client, mode, goal, previousPlanContext } = params

  const prompt = buildPrompt(mode, goal, previousPlanContext)

  let content = ''
  try {
    const completion = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: mode === 'pro' ? 0.5 : 0.2,
      messages: [
        {
          role: 'system',
          content: 'You are a one-day sprint planning assistant. Return only valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
    })
    content = completion.choices[0]?.message?.content?.trim() || ''
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error calling Groq API'
    throw new APIError(`Groq API error: ${msg}`, 502)
  }

  if (!content) {
    throw new APIError('Groq returned no content', 502)
  }

  let parsed: ParsedSprintResponse
  try {
    parsed = JSON.parse(content) as ParsedSprintResponse
  } catch {
    throw new APIError('Groq response was not valid JSON', 502)
  }

  const rawTasks = Array.isArray(parsed.subtasks) ? parsed.subtasks : []
  const mappedSubtasks = rawTasks
    .filter((t) => t && typeof t.title === 'string' && t.title.trim())
    .map((t) => ({
      title: t.title!.trim(),
      description:
        typeof t.description === 'string' && t.description.trim() ? t.description.trim() : '',
      priority: normalizePriority(t.priority),
      duration: typeof t.duration === 'string' && t.duration.trim() ? t.duration.trim() : '1h',
      dependsOn: sanitizeStringArray(t.dependsOn),
    }))

  if (!mappedSubtasks.length) {
    throw new APIError('Groq returned no valid subtasks', 502)
  }

  const { subtasks, total } = normalizeOneDayDurations(mappedSubtasks)
  if (total < 1 || total > 24) {
    throw new APIError('Generated sprint could not be normalized to a one-day range (1-24h).', 502)
  }

  return {
    title:
      typeof parsed.title === 'string' && parsed.title.trim()
        ? parsed.title.trim()
        : `One-Day Sprint: ${goal.slice(0, 45)}`,
    description:
      typeof parsed.description === 'string' && parsed.description.trim()
        ? parsed.description.trim()
        : `A focused one-day sprint plan for: ${goal}.`,
    goal: typeof parsed.goal === 'string' && parsed.goal.trim() ? parsed.goal.trim() : goal,
    acceptanceCriteria: sanitizeStringArray(parsed.acceptanceCriteria),
    risks: sanitizeStringArray(parsed.risks),
    subtasks,
    estimatedHours: total,
  }
}

interface TaskDoc {
  id: string
  title?: string | null
  description?: string | null
  duration?: string | null
  completed?: boolean | null
  priority?: Priority | null
  dependsOn?: string[] | null
}

interface SprintDoc {
  id: string
  title: string
  description?: string | null
  goal: string
  status: 'draft' | 'generated' | 'in-progress' | 'done'
  estimatedHours?: number | null
  createdAt?: string | null
  acceptanceCriteria?: string[] | null
  risks?: string[] | null
  subtasks?: {
    docs?: (string | TaskDoc)[]
  } | null
}

export async function createSprintFromPlan(
  req: PayloadRequest,
  plan: PlannedSprint,
): Promise<Record<string, unknown>> {
  const sprint = await req.payload.create({
    collection: 'sprints',
    data: {
      title: plan.title,
      description: plan.description,
      goal: plan.goal,
      status: 'generated',
      estimatedHours: plan.estimatedHours,
      acceptanceCriteria: plan.acceptanceCriteria,
      risks: plan.risks,
      createdBy: req.user!.id,
    },
    req,
    overrideAccess: false,
  })

  for (let i = 0; i < plan.subtasks.length; i++) {
    const task = plan.subtasks[i]
    await req.payload.create({
      collection: 'tasks',
      data: {
        title: task.title,
        description: task.description,
        duration: task.duration,
        completed: false,
        priority: task.priority,
        dependsOn: task.dependsOn,
        estimated: i + 1,
        sprint: sprint.id,
        createdBy: req.user!.id,
      },
      req,
      overrideAccess: false,
    })
  }

  const sprintWithTasks = (await req.payload.findByID({
    collection: 'sprints',
    id: sprint.id,
    depth: 1,
    req,
    overrideAccess: false,
    joins: {
      subtasks: { limit: 100 },
    },
  })) as unknown as SprintDoc

  const rawDocs = Array.isArray(sprintWithTasks.subtasks?.docs) ? sprintWithTasks.subtasks.docs : []
  const flatSubtasks = rawDocs
    .filter((t): t is TaskDoc => typeof t === 'object' && t !== null)
    .map((t) => ({
      id: t.id,
      title: t.title ?? '',
      description: t.description ?? '',
      duration: t.duration ?? '1h',
      completed: t.completed ?? false,
      priority: t.priority ?? 'medium',
      dependsOn: Array.isArray(t.dependsOn) ? t.dependsOn : [],
    }))

  return {
    id: sprintWithTasks.id,
    title: sprintWithTasks.title,
    description: sprintWithTasks.description ?? '',
    goal: sprintWithTasks.goal,
    status: sprintWithTasks.status,
    estimatedHours: sprintWithTasks.estimatedHours ?? 0,
    createdAt: sprintWithTasks.createdAt ?? new Date().toISOString(),
    acceptanceCriteria: Array.isArray(sprintWithTasks.acceptanceCriteria)
      ? sprintWithTasks.acceptanceCriteria
      : [],
    risks: Array.isArray(sprintWithTasks.risks) ? sprintWithTasks.risks : [],
    subtasks: flatSubtasks,
  }
}

