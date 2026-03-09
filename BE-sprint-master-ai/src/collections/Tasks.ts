import type { CollectionConfig } from 'payload'
import { tasksAccess } from '../access/tasksAccess'
import { normalizeTaskInput } from '../utils/normalizeTaskInput'

export const Tasks: CollectionConfig = {
  slug: 'tasks',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'duration', 'completed', 'sprint', 'createdAt'],
    description: 'Subtasks belonging to a sprint. Linked via two-way join with Sprints.',
  },
  access: tasksAccess,
  timestamps: true,
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'duration',
      type: 'text',
      admin: {
        description: 'e.g. "2h", "1.5h"',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Short technical description of the task.',
      },
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
      defaultValue: 'medium',
    },
    {
      name: 'dependsOn',
      type: 'json',
      admin: {
        description: 'Titles of tasks this task depends on (string[]).',
      },
    },
    {
      name: 'completed',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'estimated',
      type: 'number',
      admin: {
        description: 'Estimated order / weight within the sprint (optional).',
      },
    },
    {
      name: 'sprint',
      type: 'relationship',
      relationTo: 'sprints',
      required: true,
      admin: {
        description: 'Sprint this task belongs to. Sprints show related tasks via join.',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Set from sprint owner for access control.',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data }) => {
        return normalizeTaskInput(data)
      },
    ],
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && req.user) {
          if (data.sprint && typeof data.sprint === 'string') {
            const sprint = await req.payload.findByID({
              collection: 'sprints',
              id: data.sprint,
              depth: 0,
              overrideAccess: false,
              req,
            })
            if (!sprint) throw new Error('Sprint not found or access denied.')
            data.createdBy =
              typeof sprint.createdBy === 'object' ? sprint.createdBy?.id : sprint.createdBy
          } else {
            data.createdBy = data.createdBy || req.user.id
          }
        }
        return data
      },
    ],
  },
}
