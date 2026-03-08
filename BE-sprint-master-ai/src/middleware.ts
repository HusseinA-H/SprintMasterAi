import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DEFAULT_ORIGINS = ['http://localhost:8080', 'http://localhost:5173']

const ALLOWED_ORIGINS = (() => {
  const raw = process.env.FRONTEND_ORIGIN
  if (!raw) return DEFAULT_ORIGINS
  const parsed = raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
  return parsed.length > 0 ? parsed : DEFAULT_ORIGINS
})()

export function middleware(request: NextRequest) {
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
  matcher: '/api/:path*',
}
