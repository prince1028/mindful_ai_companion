"use client"

import { useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User, Loader2, AlertTriangle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  retryCount: number
}

export function ChatMessages({ messages, isLoading, retryCount }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Smooth auto-scroll
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  return (
    <div className="bg-gradient-to-br from-background/50 to-sage/5 rounded-xl border border-sage/20 p-4">
      <ScrollArea className="h-[400px] sm:h-[500px] pr-2 sm:pr-4" ref={scrollAreaRef}>
        <div className="space-y-3 sm:space-y-4 pb-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex gap-2 sm:gap-3 w-full", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] md:max-w-[75%] min-w-0",
                  message.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-soft flex-shrink-0",
                    message.role === "user"
                      ? "bg-gradient-to-br from-sage to-moss text-white"
                      : message.error
                        ? "bg-gradient-to-br from-terracotta to-clay text-white"
                        : "bg-gradient-to-br from-stone to-sand text-foreground",
                  )}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : message.error ? (
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
                <div
                  className={cn(
                    "rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-soft min-w-0 flex-1 overflow-hidden max-w-full",
                    message.role === "user"
                      ? "bg-gradient-to-br from-sage/20 to-moss/20 text-foreground border border-sage/30"
                      : message.error
                        ? "bg-gradient-to-br from-terracotta/10 to-clay/10 text-clay border border-terracotta/30"
                        : "bg-gradient-to-br from-card to-stone/10 text-foreground border border-stone/30",
                  )}
                  style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                >
                  <p className="text-xs sm:text-sm leading-relaxed break-words word-break-break-word overflow-wrap-break-word whitespace-normal max-w-full">
                    {message.content}
                  </p>
                  <div className="flex items-center justify-between mt-1 sm:mt-2 gap-2">
                    <p className="text-xs opacity-70 truncate">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {message.type && <span className="hidden sm:inline"> • {message.type}</span>}
                      {message.error && " • Error"}
                    </p>
                    {message.metadata && (
                      <div className="flex items-center gap-1 sm:gap-2 text-xs opacity-70 flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        <span className="hidden sm:inline">{message.metadata.processingTime}ms</span>
                        <span>${message.metadata.estimatedCost}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 sm:gap-3 justify-start">
              <div className="flex gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-stone to-sand text-foreground flex items-center justify-center shadow-soft">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="bg-gradient-to-br from-card to-stone/10 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-soft border border-stone/30">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-sage" />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {retryCount > 0 ? `Trying again... (${retryCount}/2)` : "Reflecting..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
