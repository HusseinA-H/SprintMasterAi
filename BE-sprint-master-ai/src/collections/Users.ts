import { APIError, type Access, type CollectionConfig, type FieldAccess, type PayloadRequest } from 'payload'
import { startupEnv } from '../config/env'

type UserShape = {
  id?: number | string
  role?: string
  _verified?: boolean
  isManualActivated?: boolean
}

const getFrontendOrigin = (): string => startupEnv.frontendOrigins[0] || 'http://localhost:8080'

const isAdmin = (user: UserShape | null | undefined): boolean => user?.role === 'admin'

const ownerOrAdminAccess: Access = ({ id, req: { user } }) => {
  const currentUser = user as UserShape | null
  if (!currentUser) return false
  if (isAdmin(currentUser)) return true

  if (id != null) {
    return String(id) === String(currentUser.id)
  }

  return {
    id: {
      equals: currentUser.id,
    },
  }
}

const readAccess: Access = ({ req: { user } }) => {
  const currentUser = user as UserShape | null
  if (!currentUser) return false
  if (isAdmin(currentUser)) return true

  return {
    id: {
      equals: currentUser.id,
    },
  }
}

const adminOnlyUpdate: FieldAccess = ({ req }) =>
  (req.user as { role?: string } | null)?.role === 'admin'

const FRONTEND_ORIGIN = getFrontendOrigin()

const shouldBootstrapFirstAdmin = async (req: PayloadRequest) => {
  const usersCount = await req.payload.count({
    collection: 'users',
    req,
    overrideAccess: true,
    where: {},
  })

  return usersCount.totalDocs === 0
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'subscription', 'sprintCount'],
  },
  auth: {
    verify: {
      generateEmailHTML: ({ token, user }) => {
        const verifyUrl = `${FRONTEND_ORIGIN}/verify-email?token=${token}`
        const name = (user as { firstName?: string }).firstName || 'there'

        return `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
            <h2 style="color:#0f766e;">Welcome to SprintMaster, ${name}!</h2>
            <p>Please verify your email address to activate your account.</p>
            <a href="${verifyUrl}" style="display:inline-block;background:#0f766e;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">
              Verify Email Address
            </a>
            <p style="color:#666;font-size:13px;">If the button does not work, use this link:</p>
            <code style="word-break:break-all;">${verifyUrl}</code>
          </div>
        `
      },
      generateEmailSubject: () => 'Verify your SprintMaster account',
    },
  },
  access: {
    admin: ({ req: { user } }) => isAdmin(user as UserShape | null),
    create: () => true,
    read: readAccess,
    update: ownerOrAdminAccess,
    delete: ownerOrAdminAccess,
  },
  hooks: {
    beforeLogin: [
      ({ user }) => {
        const typedUser = user as UserShape
        if (!typedUser._verified && !typedUser.isManualActivated) {
          throw new APIError('Please verify your email or wait for admin activation.', 403)
        }
        return user
      },
    ],
    beforeChange: [
      async ({ data, req, operation }) => {
        const typedData = data as UserShape
        const currentUser = req.user as UserShape | null

        if (currentUser && !isAdmin(currentUser)) {
          delete typedData.role
          delete typedData.isManualActivated
        }

        if (operation !== 'create') {
          if (typedData.isManualActivated && isAdmin(currentUser)) {
            typedData._verified = true
          }

          return typedData
        }

        if (!currentUser) {
          typedData.role = 'user'
          typedData.isManualActivated = false

          const isFirstUser = await shouldBootstrapFirstAdmin(req)
          if (isFirstUser) {
            // First-admin bootstrap is opt-in to avoid unauthenticated privilege escalation.
            if (!startupEnv.auth.enableFirstAdminBootstrap) {
              throw new APIError(
                'First admin bootstrap is disabled. Set ENABLE_FIRST_ADMIN_BOOTSTRAP=true for one-time setup.',
                403,
              )
            }

            typedData.role = 'admin'
            typedData._verified = true
            typedData.isManualActivated = true
          }
        }

        if (typedData.isManualActivated && isAdmin(currentUser)) {
          typedData._verified = true
        }

        return typedData
      },
    ],
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
                create: adminOnlyUpdate,
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
              access: {
                create: adminOnlyUpdate,
                update: adminOnlyUpdate,
              },
            },
            {
              name: 'isManualActivated',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Admin override: if enabled, this user can log in even if email verification was not completed.',
              },
              access: {
                create: adminOnlyUpdate,
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
              admin: { readOnly: true },
              access: { update: adminOnlyUpdate },
            },
            {
              name: 'monthlySprintUsageMonth',
              type: 'text',
              admin: { readOnly: true },
              access: { update: adminOnlyUpdate },
            },
            {
              name: 'monthlySprintUsageCount',
              type: 'number',
              defaultValue: 0,
              admin: { readOnly: true },
              access: { update: adminOnlyUpdate },
            },
            {
              name: 'sprints',
              type: 'join',
              collection: 'sprints',
              on: 'createdBy',
            },
          ],
        },
      ],
    },
  ],
}
