import { type NextRequest, NextResponse } from "next/server"
import { getClientIdentifier } from "@/lib/services/rate-limiter"

export async function rateLimitMiddleware(
  request: NextRequest,
  rateLimiter: any,
  options: {
    skipSuccessfulRequests?: boolean
    skipFailedRequests?: boolean
    message?: string
  } = {},
) {
  const identifier = getClientIdentifier(request)
  const result = await rateLimiter.checkLimit(identifier)

  if (!result.allowed) {
    return NextResponse.json(
      {
        error: options.message || "Too many requests. Please try again later.",
        retryAfter: result.retryAfter,
        resetTime: result.resetTime,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimiter.config.maxRequests.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.resetTime.toString(),
          "Retry-After": result.retryAfter?.toString() || "60",
        },
      },
    )
  }

  return null // Allow request to proceed
}

export function addRateLimitHeaders(response: NextResponse, rateLimiter: any, identifier: string) {
  const stats = rateLimiter.getStats(identifier)

  response.headers.set("X-RateLimit-Limit", rateLimiter.config.maxRequests.toString())
  response.headers.set("X-RateLimit-Remaining", stats.remaining.toString())
  response.headers.set("X-RateLimit-Reset", stats.resetTime.toString())

  return response
}
