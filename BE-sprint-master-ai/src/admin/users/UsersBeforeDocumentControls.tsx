import type { BeforeDocumentControlsServerProps } from 'payload'

const formatDate = (value?: string | null): string => {
  if (!value) return 'N/A'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export const UsersBeforeDocumentControls = async ({
  id,
  payload,
}: BeforeDocumentControlsServerProps) => {
  if (!id) return null

  const user = await payload.findByID({
    collection: 'users',
    id,
    depth: 0,
    overrideAccess: true,
  })

  return (
    <div className="sm-users-admin-meta">
      <p>
        <strong>Created:</strong> {formatDate(user.createdAt)}
      </p>
      <p>
        <strong>Last Modified:</strong> {formatDate(user.updatedAt)}
      </p>
    </div>
  )
}
