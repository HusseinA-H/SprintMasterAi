import type { Endpoint } from 'payload'
import { APIError } from 'payload'

interface TaskDoc {
  id: string
  title?: string | null
  description?: string | null
  duration?: string | null
  completed?: boolean | null
  priority?: 'low' | 'medium' | 'high' | null
  dependsOn?: unknown
}

interface SprintDoc {
  id: string
  title: string
  description?: string | null
  goal: string
  status: 'draft' | 'generated' | 'in-progress' | 'done'
  estimatedHours?: number | null
  createdAt?: string | null
  acceptanceCriteria?: unknown
  risks?: unknown
  subtasks?: {
    docs?: (string | TaskDoc)[]
    hasNextPage?: boolean
    totalDocs?: number
  } | null
}

interface UserUsageDoc {
  subscription?: 'free' | 'pro'
  generationAttempts?: number | null
  sprintCount?: number | null
}

function getGenerationAttempts(user: UserUsageDoc): number {
  if (typeof user.generationAttempts === 'number') return user.generationAttempts
  if (typeof user.sprintCount === 'number') return user.sprintCount
  return 0
}

/** GET /api/my-sprints — returns all sprints belonging to the authenticated user.
 *
 * Query params (all optional):
 *   page   — page number, default 1
 *   limit  — results per page, default 20
 */
export const mySprintsEndpoint: Endpoint = {
  path: '/my-sprints',
  method: 'get',
  handler: async (req) => {
    if (!req.user) {
      throw new APIError('Unauthorized', 401)
    }

    const url = new URL(req.url ?? '', 'http://localhost')
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20', 10)))

    const result = await req.payload.find({
      collection: 'sprints',
      where: {
        createdBy: { equals: req.user.id },
      },
      sort: '-createdAt',
      page,
      limit,
      depth: 1,
      req,
      overrideAccess: false,
    })

    const userDoc = (await req.payload.findByID({
      collection: 'users',
      id: req.user.id,
      depth: 0,
      req,
      overrideAccess: false,
    })) as unknown as UserUsageDoc

    const attemptsUsed = getGenerationAttempts(userDoc)
    const isPro = userDoc.subscription === 'pro'

    // Flatten each sprint's subtask join into a simple array
    const sprints = (result.docs as unknown as SprintDoc[]).map((sprint) => {
      const rawDocs = Array.isArray(sprint.subtasks?.docs) ? sprint.subtasks!.docs : []
      const subtasks = rawDocs
        .filter((t): t is TaskDoc => typeof t === 'object' && t !== null)
        .map((t) => ({
          id: t.id,
          title: t.title ?? '',
          description: t.description ?? '',
          duration: t.duration ?? '1h',
          completed: t.completed ?? false,
          priority: t.priority ?? 'medium',
        }))

      return {
        id: sprint.id,
        title: sprint.title,
        description: sprint.description ?? '',
        goal: sprint.goal,
        status: sprint.status,
        estimatedHours: sprint.estimatedHours ?? 0,
        createdAt: sprint.createdAt ?? new Date().toISOString(),
        acceptanceCriteria: Array.isArray(sprint.acceptanceCriteria)
          ? sprint.acceptanceCriteria
          : [],
        risks: Array.isArray(sprint.risks) ? sprint.risks : [],
        subtasks,
      }
    })

    return Response.json({
      sprints,
      usage: {
        attemptsUsed,
        limit: 3,
        isPro,
      },
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      hasNextPage: result.hasNextPage,
    })
  },
}
