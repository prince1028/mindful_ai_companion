"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  onSendMessage: (message: string) => void
  isLoading: boolean
  rateLimitInfo: {
    remaining: number
    resetTime: number
    retryAfter?: number
  } | null
}

export function ChatInput({ input, setInput, onSendMessage, isLoading, rateLimitInfo }: ChatInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2 sm:gap-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={rateLimitInfo?.remaining === 0 ? "Taking a mindful pause..." : "Share your thoughts gently..."}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onSendMessage(input)
            }
          }}
          disabled={isLoading || rateLimitInfo?.remaining === 0}
          maxLength={1000}
          className="bg-background/50 border-stone/30 focus:border-sage/50 focus:ring-sage/20 rounded-xl text-sm"
        />
        <Button
          onClick={() => onSendMessage(input)}
          disabled={isLoading || !input.trim() || rateLimitInfo?.remaining === 0}
          className="bg-gradient-to-r from-sage to-moss hover:from-sage/80 hover:to-moss/80 text-white shadow-soft rounded-xl px-4 sm:px-6 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span className="hidden sm:inline">Speak from the heart</span>
        <span className="sm:hidden">💭</span>
        <span>{input.length}/1000</span>
      </div>
    </div>
  )
}
