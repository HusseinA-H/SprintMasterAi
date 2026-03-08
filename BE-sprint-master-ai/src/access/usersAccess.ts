import type { Access } from 'payload'

type UserWithRole = { id: string; role?: string }

const isAdmin = (user: unknown): boolean => (user as UserWithRole)?.role === 'admin'

/**
 * Users access control:
 *  - Admins have full, unrestricted access to all operations.
 *  - Regular users can only create (signup), read, update, or delete their own document.
 */
export const usersAccess: Record<'create' | 'read' | 'update' | 'delete', Access> = {
  // Anyone can register; admins can also create users from the admin panel
  create: () => true,

  read: ({ req: { user } }) => {
    if (!user) return false
    if (isAdmin(user)) return true // admin sees all users
    return { id: { equals: user.id } } // regular user sees only themselves
  },

  update: ({ req: { user } }) => {
    if (!user) return false
    if (isAdmin(user)) return true
    return { id: { equals: user.id } }
  },

  delete: ({ req: { user } }) => {
    if (!user) return false
    if (isAdmin(user)) return true
    return { id: { equals: user.id } }
  },
}
