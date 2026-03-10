import type { Endpoint } from 'payload'
import { APIError } from 'payload'
import OpenAI from 'openai'
import { createSprintFromPlan, generatePlan, type PlanMode } from './sprintGeneration'

type UserDoc = {
  id: string
  subscription?: 'free' | 'pro'
  generationAttempts?: number | null
  sprintCount?: number | null
}

const FREE_GENERATION_LIMIT = 3

function getGenerationAttempts(user: UserDoc): number {
  if (typeof user.generationAttempts === 'number') return user.generationAttempts
  if (typeof user.sprintCount === 'number') return user.sprintCount
  return 0
}

export const generateSprintEndpoint: Endpoint = {
  path: '/generate-sprint',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      throw new APIError('Unauthorized', 401)
    }

    if (!process.env.GROQ_API_KEY) {
      throw new APIError('Groq is not configured (GROQ_API_KEY missing from .env)', 503)
    }

    let body: { goal?: string }
    try {
      body = typeof req.json === 'function' ? await req.json() : {}
    } catch {
      throw new APIError('Invalid JSON body', 400)
    }

    if (typeof body !== 'object' || body === null) body = {}
    const goal = typeof body.goal === 'string' ? body.goal.trim() : ''
    if (!goal) {
      throw new APIError('Body must include { "goal": "string" }', 400)
    }

    const user = (await req.payload.findByID({
      collection: 'users',
      id: req.user.id,
      depth: 0,
      req,
      overrideAccess: false,
    })) as unknown as UserDoc

    const mode: PlanMode = user.subscription === 'pro' ? 'pro' : 'free'
    const attemptsUsed = getGenerationAttempts(user)

    if (mode === 'free' && attemptsUsed >= FREE_GENERATION_LIMIT) {
      throw new APIError('Sprint limit reached. Upgrade to Pro for unlimited sprints.', 403)
    }

    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    })

    const plan = await generatePlan({
      client,
      mode,
      goal,
    })

    const sprintResponse = await createSprintFromPlan(req, plan)

    await req.payload.update({
      collection: 'users',
      id: req.user.id,
      data: {
        generationAttempts: attemptsUsed + 1,
      },
      req,
      overrideAccess: true,
    })

    return Response.json(sprintResponse)
  },
}
