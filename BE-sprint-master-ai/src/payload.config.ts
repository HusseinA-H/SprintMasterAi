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

// استخراج متغيرات البريد الإلكتروني
const smtpUser = process.env.SMTP_USER?.trim()
const smtpPass = process.env.SMTP_PASS?.trim()
const fromEmail = process.env.FROM_EMAIL?.trim()
const hasSmtp = Boolean(smtpUser && smtpPass && fromEmail)

// توحيد الروابط المسموح بها لمنع مشاكل CORS و CSRF
const allowedOrigins = Array.from(
  new Set([
    'https://sprintmaster-ai.vercel.app', // الدومين الصحيح الخاص بك
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
  
  // تفعيل الروابط لـ CORS و CSRF معاً لضمان قبول طلبات التوثيق والإنشاء
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
          skipVerify: true, // تخطي التحقق المبدئي لتسريع عملية البناء
          transportOptions: {
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false, // يجب أن تكون false لبورت 587 للعمل مع STARTTLS
            connectionTimeout: 20000, // زيادة المهلة لتجنب ETIMEDOUT
            greetingTimeout: 20000,
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
            tls: {
              rejectUnauthorized: false, // تجاوز قيود Handshake في شبكة Railway
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