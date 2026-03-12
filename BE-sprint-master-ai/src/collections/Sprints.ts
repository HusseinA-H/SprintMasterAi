import type { CollectionConfig, PayloadRequest } from 'payload'
import { sprintsAccess } from '../access/sprintsAccess'

const STATUS_OPTIONS = ['draft', 'generated', 'in-progress', 'done'] as const

function getUserId(createdBy: unknown): string | undefined {
  if (!createdBy) return undefined
  if (typeof createdBy === 'string') return createdBy
  if (typeof createdBy === 'object' && (createdBy as { id?: string }).id) {
    return (createdBy as { id?: string }).id
  }
  return undefined
}

async function syncSprintCountForUser(params: {
  userId: string
  req: PayloadRequest
}): Promise<void> {
  const { userId, req } = params
  const result = await req.payload.find({
    collection: 'sprints',
    where: { createdBy: { equals: userId } },
    limit: 1,
    depth: 0,
    overrideAccess: false,
    req,
  })

  await req.payload.update({
    collection: 'users',
    id: userId,
    data: { sprintCount: result.totalDocs },
    overrideAccess: false,
    req,
  })
}

export const Sprints: CollectionConfig = {
  slug: 'sprints',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'estimatedHours', 'createdAt'],
  },
  access: sprintsAccess,
  timestamps: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'goal',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: STATUS_OPTIONS.map((s) => ({ label: s.replace('-', ' '), value: s })),
      defaultValue: 'generated',
      required: true,
    },
    {
      name: 'estimatedHours',
      type: 'number',
      admin: {
        description: 'Sum of task durations (e.g. 12.5).',
      },
    },
    {
      name: 'acceptanceCriteria',
      type: 'json',
      admin: {
        description: 'Testable criteria that define sprint completion (string[]).',
      },
    },
    {
      name: 'risks',
      type: 'json',
      admin: {
        description: 'Realistic software delivery risks for this sprint (string[]).',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Owner of this sprint.',
      },
    },
    {
      name: 'subtasks',
      type: 'join',
      collection: 'tasks',
      on: 'sprint',
      admin: {
        description: 'Tasks (subtasks) belonging to this sprint (two-way link).',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user && !data.createdBy) {
          data.createdBy = req.user.id
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation === 'create') {
          const userId = getUserId(doc.createdBy)
          if (userId) {
            await syncSprintCountForUser({ userId, req })
          }
        }

        if (operation === 'update' && previousDoc) {
          const newUserId = getUserId(doc.createdBy)
          const prevUserId = getUserId(previousDoc.createdBy)

          if (newUserId !== prevUserId) {
            if (prevUserId) {
              await syncSprintCountForUser({ userId: prevUserId, req })
            }
            if (newUserId) {
              await syncSprintCountForUser({ userId: newUserId, req })
            }
          } else if (newUserId) {
            // Keep counters self-healing even if historical values drifted.
            await syncSprintCountForUser({ userId: newUserId, req })
          }
        }

        return doc
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        const userId = getUserId(doc.createdBy)
        if (userId) {
          await syncSprintCountForUser({ userId, req })
        }
        return doc
      },
    ],
  },
}
