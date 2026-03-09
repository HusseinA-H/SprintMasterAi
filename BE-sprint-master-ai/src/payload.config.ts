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

// إعدادات البريد الإلكتروني - تحسين استخراج المتغيرات
const smtpHost = process.env.SMTP_HOST?.trim()
const smtpUser = process.env.SMTP_USER?.trim()
const smtpPass = process.env.SMTP_PASS?.trim()
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10)
const hasSmtp = Boolean(smtpHost && smtpUser && smtpPass)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  
  // --- إعدادات الربط والأمان (CORS & CSRF) ---
  cors: [
    process.env.FRONTEND_ORIGIN,
    'https://sprintmasterai.vercel.app', // دومين فيرسيل الأساسي للتأكيد
    'http://localhost:8080',
  ].filter(Boolean) as string[],
  
  csrf: [
    process.env.FRONTEND_ORIGIN,
    'https://sprintmasterai.vercel.app',
    'http://localhost:8080',
  ].filter(Boolean) as string[],
  // ------------------------------------------

  collections: [Users, Media, Sprints, Tasks],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',

  // البريد الإلكتروني المحسن للعمل مع Brevo
  ...(hasSmtp
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: process.env.FROM_EMAIL || smtpUser || '', 
          defaultFromName: 'SprintMaster AI',
          transportOptions: {
            host: smtpHost,
            port: smtpPort,
            // Brevo يستخدم TLS مع بورت 587، لذا secure يجب أن تكون false
            secure: smtpPort === 465, 
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
            // إضافة لتحسين التوافق مع TLS
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