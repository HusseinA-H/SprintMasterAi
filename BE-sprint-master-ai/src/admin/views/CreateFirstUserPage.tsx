import Link from 'next/link'
import { CreateFirstUserView } from '@payloadcms/next/views'
import type { AdminViewServerProps } from 'payload'

import { startupEnv } from '../../config/env'

export const CreateFirstUserPage = async (props: AdminViewServerProps) => {
  const { initPageResult } = props
  const { req } = initPageResult
  const userSlug = req.payload.config.admin.user as 'users'

  const existingUsers = await req.payload.find({
    collection: userSlug,
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
  })

  if (existingUsers.docs.length > 0) {
    return (
      <main className="sm-first-user-page sm-first-user-page--message">
        <section className="sm-first-user-card">
          <h1>Welcome</h1>
          <p className="sm-first-user-subtitle">The first user has already been created.</p>
          <p className="sm-first-user-message">
            Continue to the admin login page and sign in with your existing account.
          </p>
          <Link href="/admin/login" className="sm-first-user-cta-link">
            Go to Login
          </Link>
        </section>
      </main>
    )
  }

  if (!startupEnv.auth.enableFirstAdminBootstrap) {
    return (
      <main className="sm-first-user-page sm-first-user-page--message">
        <section className="sm-first-user-card">
          <h1>Welcome</h1>
          <p className="sm-first-user-subtitle">To begin, create your first user.</p>
          <p className="sm-first-user-message">
            First-user bootstrap is disabled in this environment. Set
            <code> ENABLE_FIRST_ADMIN_BOOTSTRAP=true </code>
            for initial setup, then disable it again.
          </p>
        </section>
      </main>
    )
  }

  if (startupEnv.auth.firstAdminBootstrapToken) {
    return (
      <main className="sm-first-user-page sm-first-user-page--message">
        <section className="sm-first-user-card">
          <h1>Welcome</h1>
          <p className="sm-first-user-subtitle">To begin, create your first user.</p>
          <p className="sm-first-user-message">
            This environment requires a bootstrap token for first-user creation. The default
            browser flow cannot send that secret header.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="sm-first-user-page">
      <section className="sm-first-user-card">
        <CreateFirstUserView {...props} />
      </section>
    </main>
  )
}
