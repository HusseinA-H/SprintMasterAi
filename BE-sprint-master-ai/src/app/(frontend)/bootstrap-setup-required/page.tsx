import Link from 'next/link'

type Props = {
  searchParams?: Promise<{
    reason?: string
  }>
}

export default async function BootstrapSetupRequiredPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined
  const reason = params?.reason

  return (
    <main
      style={{
        maxWidth: 760,
        margin: '64px auto',
        padding: '0 24px',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
      }}
    >
      <h1 style={{ marginBottom: 16 }}>First Admin Setup Is Not Available</h1>
      {reason === 'token-required' ? (
        <p style={{ lineHeight: 1.6 }}>
          First-admin bootstrap requires a server-side bootstrap token in this environment. The
          default admin setup page cannot submit that token. Use your secured operational setup flow
          or disable token requirement temporarily for one-time setup.
        </p>
      ) : (
        <p style={{ lineHeight: 1.6 }}>
          First-admin bootstrap is disabled in this environment. Set
          <code> ENABLE_FIRST_ADMIN_BOOTSTRAP=true </code>
          for one-time initialization, create the first admin, then disable it again.
        </p>
      )}
      <p style={{ marginTop: 24, lineHeight: 1.6 }}>
        Secrets are never shown in this page. If your environment requires
        <code> FIRST_ADMIN_BOOTSTRAP_TOKEN </code>, provide it through your deployment platform
        secret manager.
      </p>
      <p style={{ marginTop: 24 }}>
        <Link href="/admin">Back to Admin</Link>
      </p>
    </main>
  )
}
