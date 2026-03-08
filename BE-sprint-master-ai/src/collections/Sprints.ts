import type { CollectionConfig } from 'payload'
import { sprintsAccess } from '../access/sprintsAccess'

const STATUS_OPTIONS = ['draft', 'generated', 'in-progress', 'done'] as const

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
        const getUserId = (createdBy: unknown): string | undefined => {
          if (!createdBy) return undefined
          if (typeof createdBy === 'string') return createdBy
          if (typeof createdBy === 'object' && (createdBy as { id?: string }).id) {
            return (createdBy as { id?: string }).id
          }
          return undefined
        }

        const adjustSprintCount = async (userId: string, delta: number) => {
          const user = await req.payload.findByID({
            collection: 'users',
            id: userId,
            depth: 0,
            overrideAccess: false,
            req,
          })

          const current =
            typeof (user as any).sprintCount === 'number' ? (user as any).sprintCount : 0
          const next = delta >= 0 ? current + delta : Math.max(0, current + delta)

          await req.payload.update({
            collection: 'users',
            id: userId,
            data: { sprintCount: next },
            overrideAccess: false,
            req,
          })
        }

        if (operation === 'create') {
          const userId = getUserId(doc.createdBy)
          if (userId) {
            await adjustSprintCount(userId, 1)
          }
        }

        if (operation === 'update' && previousDoc) {
          const newUserId = getUserId(doc.createdBy)
          const prevUserId = getUserId(previousDoc.createdBy)

          if (newUserId !== prevUserId) {
            if (prevUserId) {
              await adjustSprintCount(prevUserId, -1)
            }
            if (newUserId) {
              await adjustSprintCount(newUserId, 1)
            }
          }
        }

        return doc
      },
    ],
  },
}
