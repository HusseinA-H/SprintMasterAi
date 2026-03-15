import type { CollectionConfig, FieldAccess } from 'payload'
import { usersAccess } from '../access/usersAccess'
import { getVerificationEmailHtml, getVerificationEmailSubject } from '@/lib/email/sendVerificationEmail'

const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean)[0] ||
  'http://localhost:8080'
const adminOnlyUpdate: FieldAccess = ({ req }) =>
  (req.user as { role?: string } | null)?.role === 'admin'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'subscription', 'generationAttempts', 'sprintCount'],
  },
  auth: {
    // Require email verification before login is allowed
    verify: {
      generateEmailHTML: ({ token, user }) => {
        const verifyUrl = `${FRONTEND_ORIGIN}/verify-email?token=${token}`
        return getVerificationEmailHtml({
          name: (user as { firstName?: string | null }).firstName,
          verifyUrl,
        })
      },
      generateEmailSubject: () => getVerificationEmailSubject(),
    },
  },
  access: usersAccess,
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
              name: 'generationAttempts',
              type: 'number',
              defaultValue: 0,
              admin: {
                readOnly: true,
                description: 'Total successful sprint generation attempts used for free-plan limits.',
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
                description: 'Legacy monthly usage field (kept for compatibility).',
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
                description: 'Legacy monthly usage count field (kept for compatibility).',
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
