import type { CollectionConfig, FieldAccess } from 'payload'
import { usersAccess } from '../access/usersAccess'

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:8080'
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
        const name = (user as { firstName?: string }).firstName || 'there'
        return `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
            <h2 style="color:#7c3aed;">Welcome to SprintMaster, ${name}! 👋</h2>
            <p>Click the button below to verify your email address and activate your account.</p>
            <a href="${verifyUrl}"
               style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
              Verify Email Address
            </a>
            <p style="color:#666;font-size:13px;">Or copy this link into your browser:<br/>
              <code style="word-break:break-all;">${verifyUrl}</code>
            </p>
            <p style="color:#999;font-size:12px;">If you did not create an account, you can safely ignore this email.</p>
          </div>
        `
      },
      generateEmailSubject: () => 'Verify your SprintMaster account',
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
