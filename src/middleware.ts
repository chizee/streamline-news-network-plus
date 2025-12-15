import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Security configuration constants
const MAX_REQUEST_SIZE = 10 * 1024 * 1024 // 10MB
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMITS = {
  api: 100, // requests per minute per IP
  auth: 10, // requests per minute per IP
  content: 20, // requests per minute per user
  news: 5, // requests per minute per user
}

// In-memory rate limiting store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(request: NextRequest, limit: number): boolean {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const now = Date.now()
  const key = `${ip}:${request.nextUrl.pathname}`
  
  const current = rateLimitStore.get(key)
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (current.count >= limit) {
    return false
  }
  
  current.count++
  return true
}

function validateApiRequest(request: NextRequest): NextResponse | null {
  // Check request size
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
    return new NextResponse('Request entity too large', { 
      status: 413,
      headers: {
        'Content-Type': 'text/plain',
        'X-Security-Error': 'request-too-large'
      }
    })
  }
  
  // Validate Content-Type for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type')
    if (contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
      return new NextResponse('Invalid content type', { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'X-Security-Error': 'invalid-content-type'
        }
      })
    }
  }
  
  // Rate limiting for different endpoint types
  let rateLimit = RATE_LIMITS.api
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    rateLimit = RATE_LIMITS.auth
  } else if (request.nextUrl.pathname.startsWith('/api/content/')) {
    rateLimit = RATE_LIMITS.content
  } else if (request.nextUrl.pathname.startsWith('/api/news/')) {
    rateLimit = RATE_LIMITS.news
  }
  
  if (!checkRateLimit(request, rateLimit)) {
    return new NextResponse('Rate limit exceeded', { 
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': rateLimit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil((Date.now() + RATE_LIMIT_WINDOW) / 1000).toString(),
        'Retry-After': '60'
      }
    })
  }
  
  return null
}

export async function middleware(request: NextRequest) {
  // Security middleware - execute first for all requests
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const securityCheck = validateApiRequest(request)
    if (securityCheck) {
      return securityCheck
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect authenticated users away from auth pages
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup')
  ) {
    if (session) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Add security headers to all responses
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
