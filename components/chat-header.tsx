"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bot, AlertTriangle, RefreshCw, Sparkles, Heart, Lightbulb, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatHeaderProps {
  domain: string
  onQuickAction: (prompt: string, type: string) => void
  isLoading: boolean
  lastError: string | null
  onRetry: () => void
  rateLimitInfo: {
    remaining: number
    resetTime: number
    retryAfter?: number
  } | null
}

export function ChatHeader({ domain, onQuickAction, isLoading, lastError, onRetry, rateLimitInfo }: ChatHeaderProps) {
  // Mindful quick actions with earthy styling
  const quickActions = [
    {
      type: "guidance",
      label: "Daily Wisdom",
      prompt: "Share some gentle wisdom for my day",
      icon: <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />,
      color: "bg-sage/20 text-moss hover:bg-sage/30 border-sage/20",
    },
    {
      type: "interpretation",
      label: "Understanding",
      prompt: "Help me understand and find clarity",
      icon: <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4" />,
      color: "bg-terracotta/20 text-clay hover:bg-terracotta/30 border-terracotta/20",
    },
    {
      type: "conversation",
      label: "Gentle Chat",
      prompt: "Let's have a peaceful conversation",
      icon: <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />,
      color: "bg-stone/20 text-foreground hover:bg-stone/30 border-stone/20",
    },
    {
      type: "therapeutic",
      label: "Comfort",
      prompt: "I need some gentle support and comfort",
      icon: <Heart className="w-3 h-3 sm:w-4 sm:h-4" />,
      color: "bg-moss/20 text-moss hover:bg-moss/30 border-moss/20",
    },
  ]

  const handleQuickAction = (action: (typeof quickActions)[0]) => {
    onQuickAction(action.prompt, action.type)
  }

  const formatTimeRemaining = (resetTime: number) => {
    const remaining = Math.max(0, resetTime - Date.now())
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  return (
    <Card className="bg-gradient-to-br from-card/50 to-sage/5 border-sage/30 shadow-soft backdrop-blur-sm">
      <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-moss text-sm sm:text-base">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">
              {domain.charAt(0).toUpperCase() + domain.slice(1).replace("-", " ")} Guide
            </span>
            <span className="sm:hidden">Guide</span>
          </CardTitle>
          {rateLimitInfo && (
            <Badge variant="outline" className="text-xs bg-sage/10 border-sage/30">
              {rateLimitInfo.remaining}/5
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
        {/* Rate Limit Info */}
        {rateLimitInfo && (
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-sage/10 p-2 sm:p-3 rounded-lg border border-sage/20">
            <span>Mindful pacing: {rateLimitInfo.remaining}/5</span>
            <span className="hidden sm:inline">Resets in: {formatTimeRemaining(rateLimitInfo.resetTime)}</span>
            <span className="sm:hidden">{formatTimeRemaining(rateLimitInfo.resetTime)}</span>
          </div>
        )}

        {/* Error Alert */}
        {lastError && (
          <Alert className="border-terracotta/30 bg-terracotta/10">
            <AlertTriangle className="h-4 w-4 text-clay" />
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-clay gap-2">
              <span className="text-xs sm:text-sm">{lastError}</span>
              {lastError.includes("high demand") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  disabled={isLoading}
                  className="bg-transparent text-xs h-7"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Try Again
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Mindful Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.type}
              variant="ghost"
              size="sm"
              onClick={() => handleQuickAction(action)}
              disabled={isLoading || rateLimitInfo?.remaining === 0}
              className={cn(
                "h-auto p-2 sm:p-3 flex flex-col items-center gap-1 sm:gap-2 transition-all duration-300 border",
                action.color,
              )}
            >
              {action.icon}
              <span className="text-xs font-medium leading-tight text-center">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
