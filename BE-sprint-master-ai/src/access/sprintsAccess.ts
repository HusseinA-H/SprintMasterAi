import type { Access } from 'payload'

/** Sprints: create when authenticated; read/update/delete only own (createdBy) or future admin. */
export const sprintsAccess: Record<'create' | 'read' | 'update' | 'delete', Access> = {
  create: ({ req: { user } }) => Boolean(user),
  read: ({ req: { user } }) => {
    if (!user) return false
    return { createdBy: { equals: user.id } }
  },
  update: ({ req: { user } }) => {
    if (!user) return false
    return { createdBy: { equals: user.id } }
  },
  delete: ({ req: { user } }) => {
    if (!user) return false
    return { createdBy: { equals: user.id } }
  },
}
