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
import { startupEnv } from './config/env'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const allowedOrigins = startupEnv.frontendOrigins

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  cors: allowedOrigins,
  csrf: allowedOrigins,

  collections: [Users, Media, Sprints, Tasks],
  editor: lexicalEditor(),
  secret: startupEnv.payloadSecret,

  ...(startupEnv.smtp.enabled
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: startupEnv.smtp.fromEmail,
          defaultFromName: startupEnv.smtp.fromName,
          transportOptions: {
            host: startupEnv.smtp.host,
            port: startupEnv.smtp.port,
            secure: startupEnv.smtp.secure,
            connectionTimeout: startupEnv.smtp.connectionTimeout,
            greetingTimeout: startupEnv.smtp.greetingTimeout,
            socketTimeout: startupEnv.smtp.socketTimeout,
            auth: {
              user: startupEnv.smtp.user,
              pass: startupEnv.smtp.pass,
            },
            tls: {
              rejectUnauthorized: startupEnv.smtp.tlsRejectUnauthorized,
            },
          },
        }),
      }
    : {}),

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: startupEnv.mongoUrl,
    connectOptions: {
      connectTimeoutMS: 15000,
      family: 4,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    },
  }),
  sharp,
  plugins: [],
  endpoints: [generateSprintEndpoint, mySprintsEndpoint, regenerateSprintEndpoint, deleteSprintEndpoint],
})
