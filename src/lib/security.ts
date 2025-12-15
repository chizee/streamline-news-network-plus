import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Security configuration
const REQUEST_TIMEOUT = 30000 // 30 seconds
const MAX_REQUEST_SIZE = 10 * 1024 * 1024 // 10MB

// Error types for consistent error handling
export enum SecurityErrorType {
  TIMEOUT = 'REQUEST_TIMEOUT',
  INVALID_INPUT = 'INVALID_INPUT',
  RATE_LIMITED = 'RATE_LIMITED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface SecurityError {
  type: SecurityErrorType
  message: string
  statusCode: number
}

// Secure error response that doesn't leak sensitive information
function createSecureErrorResponse(error: SecurityError): NextResponse {
  const response = {
    error: error.message,
    code: error.type,
    timestamp: new Date().toISOString()
  }
  
  return NextResponse.json(response, { 
    status: error.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Security-Error': error.type
    }
  })
}

// Input validation helper
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch {
    throw {
      type: SecurityErrorType.INVALID_INPUT,
      message: 'Invalid request data',
      statusCode: 400
    } as SecurityError
  }
}

// Request timeout wrapper
function withTimeout<T>(promise: Promise<T>, timeoutMs: number = REQUEST_TIMEOUT): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject({
          type: SecurityErrorType.TIMEOUT,
          message: 'Request timeout',
          statusCode: 408
        } as SecurityError)
      }, timeoutMs)
    })
  ])
}

// Secure API handler wrapper
export function secureApiHandler(
  handler: (request: NextRequest, context?: { params?: Promise<Record<string, string>> }) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: { params?: Promise<Record<string, string>> }): Promise<NextResponse> => {
    try {
      // Validate request size
      const contentLength = request.headers.get('content-length')
      if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
        throw {
          type: SecurityErrorType.INVALID_INPUT,
          message: 'Request entity too large',
          statusCode: 413
        } as SecurityError
      }

      // Execute handler with timeout protection
      const result = await withTimeout(handler(request, context))
      
      // Add security headers to successful responses
      result.headers.set('X-Content-Type-Options', 'nosniff')
      result.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      
      return result
      
    } catch (error) {
      // Log error details server-side (never expose to client)
      console.error('API Security Error:', {
        path: request.nextUrl.pathname,
        method: request.method,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent'),
        error: error instanceof Error ? error.message : error,
        timestamp: new Date().toISOString()
      })
      
      // Return secure error response
      if (error && typeof error === 'object' && 'type' in error) {
        return createSecureErrorResponse(error as SecurityError)
      }
      
      // Generic error for unexpected issues
      return createSecureErrorResponse({
        type: SecurityErrorType.INTERNAL_ERROR,
        message: 'Internal server error',
        statusCode: 500
      })
    }
  }
}

// Common validation schemas
export const commonSchemas = {
  // Pagination parameters
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10)
  }),
  
  // ID parameter
  id: z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'Invalid UUID format'),
  
  // Content generation request
  contentGeneration: z.object({
    topic: z.string().min(1).max(200),
    tone: z.enum(['professional', 'casual', 'formal', 'friendly']).optional(),
    length: z.enum(['short', 'medium', 'long']).optional()
  }),
  
  // News fetch request
  newsFetch: z.object({
    category: z.string().optional(),
    limit: z.coerce.number().min(1).max(50).default(10),
    offset: z.coerce.number().min(0).default(0)
  }),
  
  // Publishing request
  publishing: z.object({
    content: z.string().min(1).max(5000),
    platforms: z.array(z.enum(['twitter', 'facebook', 'instagram', 'threads'])),
    scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Invalid datetime format').optional()
  })
}

// Rate limiting helper (for use in API routes)
export class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>()
  
  constructor(
    private windowMs: number = 60000, // 1 minute
    private maxRequests: number = 100
  ) {}
  
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const current = this.store.get(identifier)
    
    if (!current || now > current.resetTime) {
      const resetTime = now + this.windowMs
      this.store.set(identifier, { count: 1, resetTime })
      return { allowed: true, remaining: this.maxRequests - 1, resetTime }
    }
    
    if (current.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: current.resetTime }
    }
    
    current.count++
    return { 
      allowed: true, 
      remaining: this.maxRequests - current.count, 
      resetTime: current.resetTime 
    }
  }
  
  // Clean up expired entries (call periodically)
  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.store.entries()) {
      if (now > value.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

// Security event logger
export function logSecurityEvent(event: {
  type: 'rate_limit' | 'invalid_request' | 'security_scan' | 'auth_failure'
  ip?: string
  userAgent?: string
  path?: string
  details?: Record<string, unknown>
  severity?: 'low' | 'medium' | 'high' | 'critical'
}) {
  const logEntry = {
    ...event,
    timestamp: new Date().toISOString(),
    severity: event.severity || 'medium'
  }
  
  // In production, send to monitoring service
  console.warn('Security Event:', logEntry)
}