import type { Endpoint } from 'payload'
import { APIError } from 'payload'
import OpenAI from 'openai'
import { createSprintFromPlan, generatePlan } from './sprintGeneration'

type UserDoc = {
  id: string
  subscription?: 'free' | 'pro'
}

interface TaskDoc {
  title?: string | null
  description?: string | null
  duration?: string | null
}

interface SprintDoc {
  id: string
  goal: string
  title: string
  description?: string | null
  subtasks?: {
    docs?: (string | TaskDoc)[]
  } | null
}

export const regenerateSprintEndpoint: Endpoint = {
  path: '/regenerate-sprint',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      throw new APIError('Unauthorized', 401)
    }

    if (!process.env.GROQ_API_KEY) {
      throw new APIError('Groq is not configured (GROQ_API_KEY missing from .env)', 503)
    }

    let body: { sprintId?: string }
    try {
      body = typeof req.json === 'function' ? await req.json() : {}
    } catch {
      throw new APIError('Invalid JSON body', 400)
    }

    const sprintId = typeof body.sprintId === 'string' ? body.sprintId.trim() : ''
    if (!sprintId) {
      throw new APIError('Body must include { "sprintId": "string" }', 400)
    }

    const user = (await req.payload.findByID({
      collection: 'users',
      id: req.user.id,
      depth: 0,
      req,
      overrideAccess: false,
    })) as unknown as UserDoc

    if (user.subscription !== 'pro') {
      throw new APIError('Regenerate is available for Pro users only.', 403)
    }

    const original = (await req.payload.findByID({
      collection: 'sprints',
      id: sprintId,
      depth: 1,
      req,
      overrideAccess: false,
      joins: {
        subtasks: { limit: 100 },
      },
    })) as unknown as SprintDoc

    const rawTasks = Array.isArray(original.subtasks?.docs) ? original.subtasks.docs : []
    const taskLines = rawTasks
      .filter((t): t is TaskDoc => typeof t === 'object' && t !== null)
      .map((t, idx) => {
        const title = t.title?.trim() || `Task ${idx + 1}`
        const description = t.description?.trim() || ''
        const duration = t.duration?.trim() || ''
        return `- ${title} | ${duration} | ${description}`
      })

    const context = [
      `Previous sprint title: ${original.title}`,
      `Previous sprint description: ${original.description ?? ''}`,
      'Previous subtasks:',
      ...taskLines,
    ].join('\n')

    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    })

    const plan = await generatePlan({
      client,
      mode: 'pro',
      goal: original.goal,
      previousPlanContext: context,
    })

    const sprintResponse = await createSprintFromPlan(req, plan)
    return Response.json(sprintResponse)
  },
}
