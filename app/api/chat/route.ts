import { type NextRequest, NextResponse } from "next/server"
import { LLMService } from "@/lib/services/llm-service"
import { ContentService } from "@/lib/services/content-service"
import { RATE_LIMITS, getClientIdentifier, costTracker } from "@/lib/services/rate-limiter"
import { rateLimitMiddleware, addRateLimitHeaders } from "@/lib/middleware/rate-limit-middleware"

export async function POST(request: NextRequest) {
  const identifier = getClientIdentifier(request)

  try {
    // Apply multiple rate limiting layers

    // 1. General IP rate limiting
    const ipLimitResult = await rateLimitMiddleware(request, RATE_LIMITS.IP_STRICT, {
      message: "Too many requests from your IP address. Please wait before trying again.",
    })
    if (ipLimitResult) return ipLimitResult

    // 2. LLM-specific rate limiting
    const llmLimitResult = await rateLimitMiddleware(request, RATE_LIMITS.LLM_REQUESTS, {
      message: "LLM request limit exceeded. Please wait 1 minute before sending another message.",
    })
    if (llmLimitResult) return llmLimitResult

    // Check if API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set")
      return NextResponse.json(
        {
          error: "Google API key is not configured. Please set the GOOGLE_GENERATIVE_AI_API_KEY environment variable.",
        },
        { status: 500 },
      )
    }

    const { message, domain, type, history } = await request.json()

    // Validate required fields
    if (!message || !domain) {
      return NextResponse.json({ error: "Message and domain are required" }, { status: 400 })
    }

    // Validate message length to prevent abuse
    if (message.length > 1000) {
      return NextResponse.json(
        {
          error: "Message too long. Please keep messages under 1000 characters.",
        },
        { status: 400 },
      )
    }

    // Initialize services
    const contentService = new ContentService()
    const llmService = new LLMService()

    // Get domain-specific context
    const context = await contentService.getContext(domain)

    // Get system prompt based on domain and interaction type
    const systemPrompt = contentService.getSystemPrompt(domain, type)

    // Track request start time for performance monitoring
    const startTime = Date.now()

    // Generate response using LLM service with retry logic
    const response = await llmService.generateResponse({
      message,
      context,
      systemPrompt,
      history: history || [],
    })

    // Track performance and costs
    const processingTime = Date.now() - startTime

    // Estimate token usage (rough approximation)
    const inputTokens = Math.ceil((message + context + systemPrompt).length / 4)
    const outputTokens = Math.ceil(response.length / 4)

    // Track costs
    const costInfo = costTracker.trackRequest(identifier, "gemini-1.5-flash", inputTokens, outputTokens)

    // Log request for monitoring
    console.log(
      `LLM Request - IP: ${identifier}, Domain: ${domain}, Processing: ${processingTime}ms, Cost: $${costInfo.requestCost.toFixed(6)}`,
    )

    // Check daily cost limits (optional - implement based on your needs)
    const dailyCost = costTracker.getDailyCost(identifier)
    if (dailyCost.totalCost > 1.0) {
      // $1 daily limit per IP
      return NextResponse.json(
        {
          error: "Daily cost limit exceeded. Please try again tomorrow or contact support for higher limits.",
          dailyCost: dailyCost.totalCost.toFixed(4),
        },
        { status: 429 },
      )
    }

    const jsonResponse = NextResponse.json({
      response,
      metadata: {
        processingTime,
        estimatedCost: costInfo.requestCost.toFixed(6),
        dailyUsage: {
          cost: dailyCost.totalCost.toFixed(4),
          requests: dailyCost.requestCount,
        },
      },
    })

    // Add rate limit headers
    addRateLimitHeaders(jsonResponse, RATE_LIMITS.LLM_REQUESTS, identifier)

    return jsonResponse
  } catch (error) {
    console.error("Chat API error:", error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "Google API key is missing or invalid. Please check your environment variables." },
          { status: 500 },
        )
      }
      if (error.message.includes("overloaded") || error.message.includes("503")) {
        return NextResponse.json(
          {
            error:
              "The AI service is currently experiencing high demand. We've tried multiple models but all are busy. Please try again in a few moments.",
          },
          { status: 503 },
        )
      }
      if (error.message.includes("Rate limit") || error.message.includes("429")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please wait a moment before sending another message." },
          { status: 429 },
        )
      }
      if (error.message.includes("safety filters")) {
        return NextResponse.json(
          { error: "Your message was blocked by content filters. Please rephrase and try again." },
          { status: 400 },
        )
      }
      if (error.message.includes("All Gemini models are currently unavailable")) {
        return NextResponse.json(
          {
            error: "All AI models are currently unavailable due to high demand. Please try again in a few minutes.",
          },
          { status: 503 },
        )
      }
    }

    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 })
  }
}
