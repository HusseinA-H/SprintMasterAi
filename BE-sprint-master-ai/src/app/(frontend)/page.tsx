import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'

import config from '@/payload.config'
import './styles.css'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let adminRoute = '/admin'
  let userEmail: string | null = null
  let authUnavailable = false

  try {
    const payloadConfig = await config
    adminRoute = payloadConfig.routes?.admin || '/admin'
    const headers = await getHeaders()
    const payload = await getPayload({ config: payloadConfig })
    const { user } = await payload.auth({ headers })
    userEmail = user?.email ?? null
  } catch (error) {
    authUnavailable = true
    console.error('Failed to initialize payload auth on homepage:', error)
  }

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <div className="home">
      <div className="content">
        <picture>
          <source srcSet="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg" />
          <Image
            alt="Payload Logo"
            height={65}
            src="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg"
            width={65}
          />
        </picture>
        {!userEmail && <h1>Welcome to your new project.</h1>}
        {userEmail && <h1>Welcome back, {userEmail}</h1>}
        {authUnavailable && (
          <p style={{ marginTop: 12 }}>
            Auth is temporarily unavailable. Check `DATABASE_URL`/`PAYLOAD_SECRET` and database
            connectivity.
          </p>
        )}
        <div className="links">
          <a
            className="admin"
            href={adminRoute}
            rel="noopener noreferrer"
            target="_blank"
          >
            Go to admin panel
          </a>
          <a
            className="docs"
            href="https://payloadcms.com/docs"
            rel="noopener noreferrer"
            target="_blank"
          >
            Documentation
          </a>
        </div>
      </div>
      <div className="footer">
        <p>Update this page by editing</p>
        <a className="codeLink" href={fileURL}>
          <code>app/(frontend)/page.tsx</code>
        </a>
      </div>
    </div>
  )
}
