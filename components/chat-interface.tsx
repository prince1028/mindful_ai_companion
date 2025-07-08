"use client"

import { useState, useEffect } from "react"
import { ChatHeader } from "@/components/chat-header"
import { ChatMessages } from "@/components/chat-messages"
import { ChatInput } from "@/components/chat-input"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "guidance" | "interpretation" | "conversation" | "therapeutic"
  error?: boolean
  metadata?: {
    processingTime: number
    estimatedCost: string
    dailyUsage: {
      cost: string
      requests: number
    }
  }
}

interface ChatInterfaceProps {
  domain: string
}

export function ChatInterface({ domain }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: number
    resetTime: number
    retryAfter?: number
  } | null>(null)

  useEffect(() => {
    // Gentle welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `🌿 Welcome to your peaceful space. I'm here to offer gentle guidance from the ${domain.replace("-", " ")} tradition. What's on your mind?`,
      timestamp: new Date(),
      type: "conversation",
    }
    setMessages([welcomeMessage])
    setLastError(null)
    setRetryCount(0)
    setRateLimitInfo(null)
  }, [domain])

  const handleSendMessage = async (messageContent: string, type?: string, isRetry = false) => {
    if (!messageContent.trim()) return

    if (messageContent.length > 1000) {
      setLastError("Please keep your message under 1000 characters for mindful communication.")
      return
    }

    if (!isRetry) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: messageContent,
        timestamp: new Date(),
        type: type as any,
      }
      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setRetryCount(0)
    }

    setIsLoading(true)
    setLastError(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageContent,
          domain,
          type,
          history: messages.slice(-5),
        }),
      })

      const remaining = response.headers.get("X-RateLimit-Remaining")
      const resetTime = response.headers.get("X-RateLimit-Reset")
      const retryAfter = response.headers.get("Retry-After")

      if (remaining && resetTime) {
        setRateLimitInfo({
          remaining: Number.parseInt(remaining),
          resetTime: Number.parseInt(resetTime),
          retryAfter: retryAfter ? Number.parseInt(retryAfter) : undefined,
        })
      }

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setLastError(
            `Please take a mindful pause. ${data.retryAfter ? `Try again in ${data.retryAfter} seconds.` : "Wait a moment before continuing."}`,
          )
          setRateLimitInfo({
            remaining: 0,
            resetTime: data.resetTime || Date.now() + 60000,
            retryAfter: data.retryAfter,
          })
        } else {
          throw new Error(data.error || `HTTP ${response.status}`)
        }
        return
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        type: type as any,
        metadata: data.metadata,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setRetryCount(0)
    } catch (error) {
      console.error("Error sending message:", error)

      let errorMessage = "I apologize for the interruption. Please try again when you're ready."
      let canRetry = true

      if (error instanceof Error) {
        if (
          error.message.includes("high demand") ||
          error.message.includes("overloaded") ||
          error.message.includes("503")
        ) {
          errorMessage = "The AI service is experiencing high demand. Taking a mindful approach with different models."
          canRetry = true
        } else if (error.message.includes("Rate limit") || error.message.includes("429")) {
          errorMessage = "Please take a peaceful pause before continuing our conversation."
          canRetry = false
        } else if (error.message.includes("safety filters") || error.message.includes("blocked")) {
          errorMessage = "Your message was filtered for safety. Please rephrase with kindness."
          canRetry = false
        } else if (error.message.includes("too long")) {
          errorMessage = "Please share your thoughts more concisely for better understanding."
          canRetry = false
        }
      }

      setLastError(errorMessage)

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorMessage,
        timestamp: new Date(),
        error: true,
      }
      setMessages((prev) => [...prev, errorMsg])

      if (
        canRetry &&
        retryCount < 2 &&
        error instanceof Error &&
        (error.message.includes("503") || error.message.includes("overloaded"))
      ) {
        setRetryCount((prev) => prev + 1)
        setTimeout(
          () => {
            handleSendMessage(messageContent, type, true)
          },
          3000 + retryCount * 2000,
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (prompt: string, type: string) => {
    handleSendMessage(prompt, type)
  }

  const handleRetry = () => {
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content, lastUserMessage.type, true)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 h-full">
      {/* Mindful Header */}
      <div className="text-center space-y-1 sm:space-y-2 px-2">
        <h2 className="text-xl sm:text-2xl font-serif text-foreground">Mindful Conversation</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Engage in thoughtful dialogue with {domain.replace("-", " ")} wisdom
        </p>
      </div>

      {/* Chat Header with Controls - In Box */}
      <ChatHeader
        domain={domain}
        onQuickAction={handleQuickAction}
        isLoading={isLoading}
        lastError={lastError}
        onRetry={handleRetry}
        rateLimitInfo={rateLimitInfo}
      />

      {/* Chat Messages - Not in Box */}
      <ChatMessages messages={messages} isLoading={isLoading} retryCount={retryCount} />

      {/* Chat Input - Not in Box */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        rateLimitInfo={rateLimitInfo}
      />
    </div>
  )
}
