"use client"

import { useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Bot, User, Loader2, AlertTriangle, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "guidance" | "interpretation" | "conversation" | "therapeutic"
  error?: boolean
}

interface SpeechMessagesProps {
  messages: Message[]
  isLoading: boolean
  isSpeaking: boolean
  onSpeakText: (text: string) => void
}

export function SpeechMessages({ messages, isLoading, isSpeaking, onSpeakText }: SpeechMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div className={cn("flex gap-2 max-w-[80%]", message.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shadow-soft",
                    message.role === "user"
                      ? "bg-gradient-to-br from-sage to-moss text-white"
                      : message.error
                        ? "bg-gradient-to-br from-terracotta to-clay text-white"
                        : "bg-gradient-to-br from-stone to-sand text-foreground",
                  )}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : message.error ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2 shadow-soft",
                    message.role === "user"
                      ? "bg-gradient-to-br from-sage/20 to-moss/20 text-foreground border border-sage/30"
                      : message.error
                        ? "bg-gradient-to-br from-terracotta/10 to-clay/10 text-clay border border-terracotta/30"
                        : "bg-gradient-to-br from-card to-stone/10 text-foreground border border-stone/30",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm flex-1 break-words">{message.content}</p>
                    {message.role === "assistant" && !message.error && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSpeakText(message.content)}
                        disabled={isSpeaking}
                        className="h-6 w-6 p-0 hover:bg-sage/20"
                      >
                        <Volume2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                    {message.type && ` • ${message.type}`}
                    {message.error && " • Error"}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone to-sand text-foreground flex items-center justify-center shadow-soft">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gradient-to-br from-card to-stone/10 rounded-2xl px-4 py-2 shadow-soft border border-stone/30">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-sage" />
                    <span className="text-sm text-muted-foreground">Processing your speech...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground text-center mt-4 p-2 bg-sage/5 rounded-lg">
        Click "Start Listening" and speak your question. The AI will respond with both text and speech.
      </div>
    </div>
  )
}
