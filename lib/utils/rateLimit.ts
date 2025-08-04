// Rate limiting utilities for API endpoints
import { NextRequest } from 'next/server'

interface RateLimitInfo {
  count: number
  resetTime: number
}

// In-memory rate limiting (for production, use Redis or external service)
const rateLimitMap = new Map<string, RateLimitInfo>()

export interface RateLimitConfig {
  windowMs: number    // Time window in milliseconds
  maxRequests: number // Max requests per window
}

// Default configurations for different endpoints
export const rateLimitConfigs = {
  ai: { windowMs: 60 * 1000, maxRequests: 10 },      // 10 requests per minute for AI
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 requests per 15 minutes for auth
  quotes: { windowMs: 60 * 1000, maxRequests: 5 },    // 5 quote requests per minute
  general: { windowMs: 60 * 1000, maxRequests: 30 },  // 30 requests per minute general
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = rateLimitConfigs.general
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now()
  const key = identifier
  
  // Clean up expired entries
  if (rateLimitMap.has(key)) {
    const info = rateLimitMap.get(key)!
    if (now > info.resetTime) {
      rateLimitMap.delete(key)
    }
  }
  
  // Get or create rate limit info
  let info = rateLimitMap.get(key)
  if (!info) {
    info = {
      count: 0,
      resetTime: now + config.windowMs
    }
    rateLimitMap.set(key, info)
  }
  
  // Check if limit exceeded
  if (info.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: Math.ceil(info.resetTime / 1000)
    }
  }
  
  // Increment counter
  info.count++
  rateLimitMap.set(key, info)
  
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - info.count,
    reset: Math.ceil(info.resetTime / 1000)
  }
}

// Get client identifier for rate limiting
export function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from session first
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    // If we have auth, use user-based limiting
    const token = authHeader.replace('Bearer ', '')
    return `user:${token.slice(0, 10)}` // Use partial token as identifier
  }
  
  // Fall back to IP-based limiting
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  
  return `ip:${ip}`
}

// Create rate limit response headers
export function createRateLimitHeaders(result: ReturnType<typeof rateLimit>): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }
}

// Clean up expired entries periodically (call this in a background job)
export function cleanupExpiredRateLimits(): void {
  const now = Date.now()
  for (const [key, info] of rateLimitMap.entries()) {
    if (now > info.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

// Setup periodic cleanup (call once when server starts)
export function setupRateLimitCleanup(intervalMs: number = 5 * 60 * 1000): void {
  setInterval(cleanupExpiredRateLimits, intervalMs)
}
