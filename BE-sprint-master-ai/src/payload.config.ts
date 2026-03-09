import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const parseFrontendOrigins = (value: string | undefined): string[] =>
  value
    ? value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : []

// Email env extraction
const smtpUser = process.env.SMTP_USER?.trim()
const smtpPass = process.env.SMTP_PASS?.trim()
const fromEmail = process.env.FROM_EMAIL?.trim()
const hasSmtp = Boolean(smtpUser && smtpPass && fromEmail)
const allowedOrigins = Array.from(
  new Set([
    'https://sprintmasterai.vercel.app',
    ...parseFrontendOrigins(process.env.FRONTEND_ORIGIN),
    'http://localhost:8080',
  ]),
)

export default buildConfig({
  admin: {
    user: Users.slug,
    autoLogin: true,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  cookiePrefix: process.env.PAYLOAD_COOKIE_PREFIX || 'sprintmasterai',
  
  cors: allowedOrigins,
  
  csrf: allowedOrigins,

  collections: [Users, Media, Sprints, Tasks],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',

  ...(hasSmtp
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: fromEmail || '',
          defaultFromName: 'SprintMaster AI',
          skipVerify: true,
          transportOptions: {
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,
            connectionTimeout: 10000,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
            tls: {
              rejectUnauthorized: false,
            },
          },
        }),
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
  endpoints: [
    generateSprintEndpoint, 
    mySprintsEndpoint, 
    regenerateSprintEndpoint, 
    deleteSprintEndpoint
  ],
})
