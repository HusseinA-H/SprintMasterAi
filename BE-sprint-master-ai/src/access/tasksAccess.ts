import type { Access } from 'payload'

/** Tasks: create when authenticated; read/update/delete only when the task's sprint is owned by the user (createdBy on task). */
export const tasksAccess: Record<'create' | 'read' | 'update' | 'delete', Access> = {
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
