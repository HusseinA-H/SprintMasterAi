type StartupEnv = {
  nodeEnv: 'development' | 'test' | 'production'
  isProduction: boolean
  isNextProductionBuild: boolean
  payloadSecret: string
  mongoUrl: string
  mongoEnvSource: 'DATABASE_URL' | 'DATABASE_URI' | 'MONGODB_URI' | 'NONE'
  frontendOrigins: string[]
  smtp: {
    enabled: boolean
    host: string
    port: number
    secure: boolean
    user: string
    pass: string
    fromEmail: string
    fromName: string
    tlsRejectUnauthorized: boolean
    connectionTimeout: number
    greetingTimeout: number
    socketTimeout: number
  }
  auth: {
    enableFirstAdminBootstrap: boolean
    firstAdminBootstrapToken: string | null
  }
}

const DEFAULT_FRONTEND_ORIGIN = 'http://localhost:8080'

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (!value) return defaultValue
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
}

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const parseOrigins = (value: string | undefined): string[] =>
  value
    ? value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : []

const isNextProductionBuild = (): boolean =>
  process.env.NEXT_PHASE?.trim() === 'phase-production-build'

const getPayloadSecret = (isProduction: boolean, isBuildPhase: boolean): string => {
  const secret = process.env.PAYLOAD_SECRET?.trim()
  if (secret) return secret

  if (isProduction && !isBuildPhase) {
    throw new Error('[Startup] PAYLOAD_SECRET is required in production runtime.')
  }

  if (isBuildPhase) {
    console.warn('[Startup] PAYLOAD_SECRET missing during build. Using build-only placeholder.')
    return '__BUILD_ONLY_PAYLOAD_SECRET_PLACEHOLDER__'
  }

  console.warn('[Startup] PAYLOAD_SECRET is missing in non-production. Using a dev-only fallback.')
  return 'dev-only-payload-secret-change-me'
}

const getMongoConfig = (
  isBuildPhase: boolean,
): Pick<StartupEnv, 'mongoUrl' | 'mongoEnvSource'> => {
  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (databaseUrl) return { mongoUrl: databaseUrl, mongoEnvSource: 'DATABASE_URL' }

  const databaseUri = process.env.DATABASE_URI?.trim()
  if (databaseUri) return { mongoUrl: databaseUri, mongoEnvSource: 'DATABASE_URI' }

  const mongodbUri = process.env.MONGODB_URI?.trim()
  if (mongodbUri) return { mongoUrl: mongodbUri, mongoEnvSource: 'MONGODB_URI' }

  if (isBuildPhase) {
    console.warn('[Startup] MongoDB URL missing during build. Using build-only placeholder.')
    return {
      mongoUrl: 'mongodb://127.0.0.1:27017/build-placeholder',
      mongoEnvSource: 'NONE',
    }
  }

  throw new Error(
    '[Startup] Missing MongoDB URL. Set one of DATABASE_URL, DATABASE_URI, or MONGODB_URI.',
  )
}

const getSmtpConfig = (isBuildPhase: boolean): StartupEnv['smtp'] => {
  const host = process.env.SMTP_HOST?.trim() || 'smtp-relay.brevo.com'
  const port = parseNumber(process.env.SMTP_PORT?.trim(), 587)
  const secure = parseBoolean(process.env.SMTP_SECURE?.trim(), false)
  const user = process.env.SMTP_USER?.trim() || ''
  const pass = process.env.SMTP_PASS?.trim() || ''
  const fromEmail = process.env.FROM_EMAIL?.trim() || ''
  const fromName = process.env.FROM_NAME?.trim() || 'SprintMaster AI'

  const hasAnyEmailSetting = Boolean(
    process.env.SMTP_HOST || process.env.SMTP_PORT || user || pass || fromEmail,
  )
  const enabled = Boolean(user && pass && fromEmail)

  if (!enabled && hasAnyEmailSetting) {
    if (isBuildPhase) {
      console.warn(
        '[Startup] Incomplete SMTP config during build. Email adapter disabled for build phase.',
      )
      return {
        enabled: false,
        host,
        port,
        secure,
        user: '',
        pass: '',
        fromEmail: '',
        fromName,
        tlsRejectUnauthorized: true,
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
      }
    }

    throw new Error(
      '[Startup] Incomplete SMTP config. SMTP_USER, SMTP_PASS, and FROM_EMAIL are required together.',
    )
  }

  return {
    enabled,
    host,
    port,
    secure,
    user,
    pass,
    fromEmail,
    fromName,
    tlsRejectUnauthorized: parseBoolean(process.env.SMTP_TLS_REJECT_UNAUTHORIZED?.trim(), true),
    connectionTimeout: parseNumber(process.env.SMTP_CONNECTION_TIMEOUT?.trim(), 15000),
    greetingTimeout: parseNumber(process.env.SMTP_GREETING_TIMEOUT?.trim(), 10000),
    socketTimeout: parseNumber(process.env.SMTP_SOCKET_TIMEOUT?.trim(), 20000),
  }
}

const buildEnv = (): StartupEnv => {
  const nodeEnv = (process.env.NODE_ENV?.trim() || 'development') as StartupEnv['nodeEnv']
  const isProduction = nodeEnv === 'production'
  const buildPhase = isNextProductionBuild()
  const payloadSecret = getPayloadSecret(isProduction, buildPhase)
  const { mongoUrl, mongoEnvSource } = getMongoConfig(buildPhase)
  const frontendOrigins = Array.from(
    new Set([
      'https://sprintmasterai.vercel.app',
      ...parseOrigins(process.env.FRONTEND_ORIGIN),
      DEFAULT_FRONTEND_ORIGIN,
      'http://localhost:5173',
    ]),
  )

  const env: StartupEnv = {
    nodeEnv,
    isProduction,
    isNextProductionBuild: buildPhase,
    payloadSecret,
    mongoUrl,
    mongoEnvSource,
    frontendOrigins,
    smtp: getSmtpConfig(buildPhase),
    auth: {
      enableFirstAdminBootstrap: parseBoolean(
        process.env.ENABLE_FIRST_ADMIN_BOOTSTRAP?.trim(),
        false,
      ),
      firstAdminBootstrapToken: process.env.FIRST_ADMIN_BOOTSTRAP_TOKEN?.trim() || null,
    },
  }

  console.info(`[Startup] Build phase: ${env.isNextProductionBuild ? 'production-build' : 'runtime'}.`)
  console.info(`[Startup] MongoDB URL configured: ${env.mongoEnvSource === 'NONE' ? 'no' : 'yes'}.`)
  console.info(`[Startup] SMTP configured: ${env.smtp.enabled ? 'yes' : 'no'}.`)
  console.info(
    `[Startup] First-admin bootstrap enabled: ${env.auth.enableFirstAdminBootstrap ? 'yes' : 'no'}.`,
  )
  console.info(
    `[Startup] First-admin bootstrap token required: ${env.auth.firstAdminBootstrapToken ? 'yes' : 'no'}.`,
  )

  return env
}

export const startupEnv = buildEnv()
