import type { Access } from 'payload'

/** Only allow if user is logged in. */
export const authenticated: Access = ({ req: { user } }) => Boolean(user)
