interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

interface RequestRecord {
  count: number
  resetTime: number
  requests: number[]
}

export class RateLimiter {
  private store = new Map<string, RequestRecord>()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config

    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    let record = this.store.get(identifier)

    if (!record || now >= record.resetTime) {
      // Create new window
      record = {
        count: 0,
        resetTime: now + this.config.windowMs,
        requests: [],
      }
    }

    // Remove old requests outside the window
    record.requests = record.requests.filter((timestamp) => timestamp > windowStart)
    record.count = record.requests.length

    const allowed = record.count < this.config.maxRequests

    if (allowed) {
      record.requests.push(now)
      record.count++
    }

    this.store.set(identifier, record)

    const remaining = Math.max(0, this.config.maxRequests - record.count)
    const retryAfter = allowed ? undefined : Math.ceil((record.resetTime - now) / 1000)

    return {
      allowed,
      remaining,
      resetTime: record.resetTime,
      retryAfter,
    }
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, record] of this.store.entries()) {
      if (now >= record.resetTime && record.requests.length === 0) {
        this.store.delete(key)
      }
    }
  }

  reset(identifier: string) {
    this.store.delete(identifier)
  }

  getStats(identifier: string) {
    const record = this.store.get(identifier)
    if (!record) {
      return {
        count: 0,
        remaining: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMs,
      }
    }

    return {
      count: record.count,
      remaining: Math.max(0, this.config.maxRequests - record.count),
      resetTime: record.resetTime,
    }
  }
}

// Rate limiting tiers
export const RATE_LIMITS = {
  // Per IP address limits
  IP_GENERAL: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
  }),

  IP_STRICT: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
  }),

  // Per session limits (for authenticated users)
  SESSION_GENERAL: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 200, // 200 requests per hour
  }),

  // LLM specific limits (more restrictive)
  LLM_REQUESTS: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 LLM requests per minute
  }),

  // Speech interface limits
  SPEECH_REQUESTS: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 speech requests per minute
  }),
}

// Utility function to get client identifier
export function getClientIdentifier(request: Request): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const cfConnectingIp = request.headers.get("cf-connecting-ip")

  const ip = forwarded?.split(",")[0] || realIp || cfConnectingIp || "unknown"

  // You could also use session ID or user ID here for authenticated users
  return ip
}

// Cost tracking for LLM requests
export class CostTracker {
  private costs = new Map<string, { totalCost: number; requestCount: number; lastReset: number }>()

  // Estimated costs per model (in USD per 1K tokens)
  private readonly MODEL_COSTS = {
    "gemini-1.5-flash": { input: 0.00015, output: 0.0006 },
    "gemini-1.5-flash-8b": { input: 0.0001, output: 0.0004 },
    "gemini-1.0-pro": { input: 0.0005, output: 0.0015 },
  }

  trackRequest(identifier: string, model: string, inputTokens: number, outputTokens: number) {
    const costs = this.MODEL_COSTS[model as keyof typeof this.MODEL_COSTS] || this.MODEL_COSTS["gemini-1.5-flash"]
    const requestCost = (inputTokens * costs.input + outputTokens * costs.output) / 1000

    let record = this.costs.get(identifier)
    const now = Date.now()
    const dayStart = now - 24 * 60 * 60 * 1000 // 24 hours ago

    if (!record || record.lastReset < dayStart) {
      record = { totalCost: 0, requestCount: 0, lastReset: now }
    }

    record.totalCost += requestCost
    record.requestCount++

    this.costs.set(identifier, record)

    return {
      requestCost,
      dailyTotal: record.totalCost,
      requestCount: record.requestCount,
    }
  }

  getDailyCost(identifier: string) {
    const record = this.costs.get(identifier)
    if (!record) return { totalCost: 0, requestCount: 0 }

    const now = Date.now()
    const dayStart = now - 24 * 60 * 60 * 1000

    if (record.lastReset < dayStart) {
      return { totalCost: 0, requestCount: 0 }
    }

    return { totalCost: record.totalCost, requestCount: record.requestCount }
  }
}

export const costTracker = new CostTracker()
