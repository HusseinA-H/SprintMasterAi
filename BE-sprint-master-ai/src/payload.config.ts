import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Sprints } from './collections/Sprints'
import { Tasks } from './collections/Tasks'
import { generateSprintEndpoint } from './endpoints/generateSprint'
import { mySprintsEndpoint } from './endpoints/mySprints'
import { regenerateSprintEndpoint } from './endpoints/regenerateSprint'
import { deleteSprintEndpoint } from './endpoints/deleteSprint'
import { resendAdapter } from './lib/email/resendAdapter'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const hasResend = Boolean(process.env.RESEND_API_KEY?.trim())

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Sprints, Tasks],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',

  // When Resend is not configured, Payload falls back to logging emails in development.
  ...(hasResend
    ? {
        email: resendAdapter(),
      }
    : {}),

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URL || '',
  }),
  sharp,
  plugins: [],
  endpoints: [generateSprintEndpoint, mySprintsEndpoint, regenerateSprintEndpoint, deleteSprintEndpoint],
})
