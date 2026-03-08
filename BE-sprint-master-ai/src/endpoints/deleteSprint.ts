import type { Endpoint } from 'payload'
import { APIError } from 'payload'

function extractIdFromUrl(url?: string): string | null {
  if (!url) return null
  const pathname = new URL(url, 'http://localhost').pathname
  const parts = pathname.split('/').filter(Boolean)
  const last = parts[parts.length - 1]
  return last || null
}

export const deleteSprintEndpoint: Endpoint = {
  path: '/delete-sprint/:id',
  method: 'delete',
  handler: async (req) => {
    if (!req.user) {
      throw new APIError('Unauthorized', 401)
    }

    const routeId = (req.routeParams as { id?: string } | undefined)?.id
    const sprintId = routeId || extractIdFromUrl(req.url)
    if (!sprintId) {
      throw new APIError('Sprint id is required', 400)
    }

    await req.payload.findByID({
      collection: 'sprints',
      id: sprintId,
      req,
      overrideAccess: false,
      depth: 0,
    })

    await req.payload.delete({
      collection: 'tasks',
      where: {
        sprint: {
          equals: sprintId,
        },
      },
      req,
      overrideAccess: false,
    })

    await req.payload.delete({
      collection: 'sprints',
      id: sprintId,
      req,
      overrideAccess: false,
    })

    return new Response(null, { status: 204 })
  },
}

