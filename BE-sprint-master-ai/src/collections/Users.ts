import type { CollectionConfig, FieldAccess } from 'payload'

const adminOnlyUpdate: FieldAccess = ({ req }) =>
  (req.user as { role?: string } | null)?.role === 'admin'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'subscription', 'sprintCount'],
  },
  auth: true,
  access: {
    create: () => true,
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profile',
          fields: [
            {
              name: 'firstName',
              type: 'text',
              required: true,
            },
            {
              name: 'lastName',
              type: 'text',
              required: true,
            },
            {
              name: 'subscription',
              type: 'select',
              options: [
                { label: 'Free', value: 'free' },
                { label: 'Pro', value: 'pro' },
              ],
              defaultValue: 'free',
              required: true,
              access: {
                update: adminOnlyUpdate,
              },
            },
            {
              name: 'role',
              type: 'select',
              options: [
                { label: 'User', value: 'user' },
                { label: 'Admin', value: 'admin' },
              ],
              defaultValue: 'user',
              required: true,
              admin: {
                description: 'Admins have full access to all collections.',
              },
              access: {
                update: adminOnlyUpdate,
              },
            },
          ],
        },
        {
          label: 'Usage',
          fields: [
            {
              name: 'sprintCount',
              type: 'number',
              defaultValue: 0,
              admin: {
                readOnly: true,
                description: 'Total sprints created by this user (maintained automatically).',
              },
              access: {
                update: adminOnlyUpdate,
              },
            },
            {
              name: 'monthlySprintUsageMonth',
              type: 'text',
              admin: {
                readOnly: true,
                description: 'Current month key for free-plan usage tracking (YYYY-MM).',
              },
              access: {
                update: adminOnlyUpdate,
              },
            },
            {
              name: 'monthlySprintUsageCount',
              type: 'number',
              defaultValue: 0,
              admin: {
                readOnly: true,
                description:
                  'Number of generated sprints in the tracked month. Not reduced by deletions.',
              },
              access: {
                update: adminOnlyUpdate,
              },
            },
            {
              name: 'sprints',
              type: 'join',
              collection: 'sprints',
              on: 'createdBy',
              admin: {
                description: 'Sprints created by this user (two-way join with sprint.createdBy).',
              },
            },
          ],
        },
      ],
    },
  ],
}
