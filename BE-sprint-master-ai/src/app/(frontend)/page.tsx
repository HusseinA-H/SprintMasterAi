import React from 'react'

import './styles.css'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="home">
      <div className="content">
        <h1>SprintMaster API is running.</h1>
        <div className="links">
          <a className="admin" href="/admin" rel="noopener noreferrer" target="_blank">
            Go to admin panel
          </a>
          <a
            className="docs"
            href="https://payloadcms.com/docs"
            rel="noopener noreferrer"
            target="_blank"
          >
            Payload documentation
          </a>
        </div>
      </div>
    </div>
  )
}
