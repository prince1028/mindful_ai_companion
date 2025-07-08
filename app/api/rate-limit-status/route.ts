import { type NextRequest, NextResponse } from "next/server"
import { RATE_LIMITS, getClientIdentifier, costTracker } from "@/lib/services/rate-limiter"

export async function GET(request: NextRequest) {
  const identifier = getClientIdentifier(request)

  try {
    const status = {
      ip: identifier,
      limits: {
        general: RATE_LIMITS.IP_STRICT.getStats(identifier),
        llm: RATE_LIMITS.LLM_REQUESTS.getStats(identifier),
        speech: RATE_LIMITS.SPEECH_REQUESTS.getStats(identifier),
      },
      costs: costTracker.getDailyCost(identifier),
      timestamp: Date.now(),
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Rate limit status error:", error)
    return NextResponse.json({ error: "Failed to get rate limit status" }, { status: 500 })
  }
}
