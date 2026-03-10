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
const BOOTSTRAP_DISABLED_ERROR = 'First-admin bootstrap is disabled in this environment.'
const BOOTSTRAP_TOKEN_ERROR = 'First-admin bootstrap token is missing or invalid.'

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

const getRequestHeader = (req: PayloadRequest, key: string): string | undefined => {
  const nodeHeaders = (req as unknown as { headers?: Record<string, string | string[] | undefined> })
    .headers

  if (!nodeHeaders) return undefined
  const raw = nodeHeaders[key] ?? nodeHeaders[key.toLowerCase()]
  if (Array.isArray(raw)) return raw[0]
  return raw
}

const findAnyUser = async (req: PayloadRequest): Promise<UserShape | null> => {
  const result = await req.payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
  })

  return (result.docs[0] as UserShape | undefined) ?? null
}

const ensureFirstAdminBootstrapAllowed = async (req: PayloadRequest) => {
  if (!startupEnv.auth.enableFirstAdminBootstrap) {
    throw new APIError(
      BOOTSTRAP_DISABLED_ERROR,
      403,
      {
        code: 'FIRST_ADMIN_BOOTSTRAP_DISABLED',
        hint: 'Set ENABLE_FIRST_ADMIN_BOOTSTRAP=true for one-time first-admin creation.',
      },
      true,
    )
  }

  const requiredToken = startupEnv.auth.firstAdminBootstrapToken
  if (!requiredToken) return

  const providedToken = getRequestHeader(req, 'x-first-admin-bootstrap-token')
  if (!providedToken || providedToken !== requiredToken) {
    throw new APIError(
      BOOTSTRAP_TOKEN_ERROR,
      403,
      {
        code: 'FIRST_ADMIN_BOOTSTRAP_TOKEN_REQUIRED',
        hint: 'Provide x-first-admin-bootstrap-token for first-admin creation.',
      },
      true,
    )
  }
}

const isBootstrapAllowedForRequest = (req: PayloadRequest): boolean => {
  if (!startupEnv.auth.enableFirstAdminBootstrap) return false

  const requiredToken = startupEnv.auth.firstAdminBootstrapToken
  if (!requiredToken) return true

  const providedToken = getRequestHeader(req, 'x-first-admin-bootstrap-token')
  return Boolean(providedToken && providedToken === requiredToken)
}

const adminOnlyUpdate: FieldAccess = async ({ req }) => {
  const currentUser = req.user as UserShape | null
  if (isAdmin(currentUser)) return true
  if (currentUser) return false

  const firstUser = await findAnyUser(req)
  if (firstUser) return false

  return isBootstrapAllowedForRequest(req)
}

const FRONTEND_ORIGIN = getFrontendOrigin()

const shouldBootstrapFirstAdmin = async (req: PayloadRequest) => !(await findAnyUser(req))
const showWhenAuthenticated = (_data: unknown, _sibling: unknown, { user }: { user: unknown }) =>
  Boolean(user)

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'subscription', 'sprintCount'],
    components: {
      edit: {
        beforeDocumentControls: [
          {
            path: 'src/admin/users/UsersBeforeDocumentControls.tsx',
            exportName: 'UsersBeforeDocumentControls',
          },
        ],
      },
    },
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
    // Keep public registration enabled. First-admin security is enforced in beforeChange.
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
            await ensureFirstAdminBootstrapAllowed(req)

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
      type: 'collapsible',
      label: 'Account',
      admin: {
        className: 'sm-users-section',
        description: 'Email, Change Password, and Force Unlock are available in this document view.',
        condition: showWhenAuthenticated,
        initCollapsed: false,
      },
      fields: [
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
            description:
              'Admin override: if enabled, this user can log in even if email verification was not completed.',
          },
          access: {
            create: adminOnlyUpdate,
            update: adminOnlyUpdate,
          },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Profile',
      admin: {
        className: 'sm-users-section',
        condition: showWhenAuthenticated,
        initCollapsed: false,
      },
      fields: [
        {
          name: 'firstName',
          type: 'text',
          required: false,
        },
        {
          name: 'lastName',
          type: 'text',
          required: false,
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Plan',
      admin: {
        className: 'sm-users-section',
        condition: showWhenAuthenticated,
        initCollapsed: false,
      },
      fields: [
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
      ],
    },
    {
      type: 'collapsible',
      label: 'Relations',
      admin: {
        className: 'sm-users-section',
        condition: showWhenAuthenticated,
        initCollapsed: false,
      },
      fields: [
        {
          name: 'sprints',
          type: 'join',
          collection: 'sprints',
          on: 'createdBy',
        },
      ],
    },
  ],
}
