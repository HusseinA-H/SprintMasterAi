import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const parseOrigins = (value: string | undefined): string[] =>
  value
    ? value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : []

const ALLOWED_ORIGINS = Array.from(
  new Set([
    'https://sprintmasterai.vercel.app',
    ...parseOrigins(process.env.FRONTEND_ORIGIN),
    'http://localhost:8080',
    'http://localhost:5173',
  ]),
)

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (!value) return defaultValue
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/create-first-user') {
    const bootstrapEnabled = parseBoolean(process.env.ENABLE_FIRST_ADMIN_BOOTSTRAP, false)
    const bootstrapTokenRequired = Boolean(process.env.FIRST_ADMIN_BOOTSTRAP_TOKEN?.trim())

    if (!bootstrapEnabled || bootstrapTokenRequired) {
      const url = request.nextUrl.clone()
      url.pathname = '/bootstrap-setup-required'
      url.searchParams.set('reason', !bootstrapEnabled ? 'disabled' : 'token-required')
      return NextResponse.redirect(url)
    }
  }

  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const origin = request.headers.get('origin')
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]

  const res = NextResponse.next()
  res.headers.set('Access-Control-Allow-Origin', allowedOrigin)
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.headers.set('Access-Control-Allow-Credentials', 'true')

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: res.headers })
  }

  return res
}

export const config = {
  matcher: ['/api/:path*', '/admin/create-first-user'],
}
