"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, MessageSquare, Mic, AlertTriangle, Leaf, BarChart3 } from "lucide-react"

interface RateLimitStatus {
  ip: string
  limits: {
    general: { count: number; remaining: number; resetTime: number }
    llm: { count: number; remaining: number; resetTime: number }
    speech: { count: number; remaining: number; resetTime: number }
  }
  costs: { totalCost: number; requestCount: number }
  timestamp: number
}

export function RateLimitMonitor() {
  const [status, setStatus] = useState<RateLimitStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/rate-limit-status")
      if (!response.ok) {
        throw new Error("Failed to fetch status")
      }
      const data = await response.json()
      setStatus(data)
      setError(null)
    } catch (err) {
      setError("Unable to load mindful usage status")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatTimeRemaining = (resetTime: number) => {
    const remaining = Math.max(0, resetTime - Date.now())
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const getLimitStatus = (count: number, max: number) => {
    const percentage = (count / max) * 100
    if (percentage >= 90) return { color: "destructive", status: "Pause", bgColor: "bg-terracotta/20" }
    if (percentage >= 70) return { color: "warning", status: "Mindful", bgColor: "bg-clay/20" }
    return { color: "default", status: "Peaceful", bgColor: "bg-sage/20" }
  }

  if (loading) {
    return (
      <Card className="shadow-soft border-stone/30 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-moss">
            <BarChart3 className="w-5 h-5" />
            Mindful Usage
          </CardTitle>
          <CardDescription>Loading your peaceful metrics...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error || !status) {
    return (
      <Card className="shadow-soft border-stone/30 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-moss">
            <BarChart3 className="w-5 h-5" />
            Mindful Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-terracotta/30 bg-terracotta/10">
            <AlertTriangle className="h-4 w-4 text-clay" />
            <AlertDescription className="text-clay">{error || "Unknown error"}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const limits = [
    {
      name: "Gentle Requests",
      icon: <MessageSquare className="w-4 h-4" />,
      current: status.limits.general.count,
      max: 10,
      remaining: status.limits.general.remaining,
      resetTime: status.limits.general.resetTime,
      description: "General interactions per minute",
    },
    {
      name: "AI Conversations",
      icon: <MessageSquare className="w-4 h-4" />,
      current: status.limits.llm.count,
      max: 5,
      remaining: status.limits.llm.remaining,
      resetTime: status.limits.llm.resetTime,
      description: "Mindful AI chats per minute",
    },
    {
      name: "Voice Sessions",
      icon: <Mic className="w-4 h-4" />,
      current: status.limits.speech.count,
      max: 10,
      remaining: status.limits.speech.remaining,
      resetTime: status.limits.speech.resetTime,
      description: "Voice interactions per minute",
    },
  ]

  return (
    <Card className="shadow-soft border-stone/30 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-moss">
          <BarChart3 className="w-5 h-5" />
          Mindful Usage
        </CardTitle>
        <CardDescription>Your peaceful interaction balance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Reflection */}
        <div className="p-4 bg-gradient-to-br from-sage/10 to-moss/10 rounded-xl border border-sage/20">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-moss" />
            <span className="font-medium text-moss">Daily Reflection</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Mindful Cost:</span>
              <p className="font-mono font-medium text-moss">${status.costs.totalCost.toFixed(4)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Sessions:</span>
              <p className="font-medium text-moss">{status.costs.requestCount}</p>
            </div>
          </div>
          {status.costs.totalCost > 0.5 && (
            <Alert className="mt-3 border-terracotta/30 bg-terracotta/10">
              <Leaf className="h-4 w-4 text-clay" />
              <AlertDescription className="text-clay">
                Approaching daily reflection limit. Consider taking a peaceful break.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Mindful Limits */}
        <div className="space-y-4">
          {limits.map((limit) => {
            const limitStatus = getLimitStatus(limit.current, limit.max)
            const percentage = (limit.current / limit.max) * 100

            return (
              <div key={limit.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-moss">{limit.icon}</div>
                    <span className="font-medium text-sm">{limit.name}</span>
                    <Badge variant="outline" className={`text-xs ${limitStatus.bgColor} border-current`}>
                      {limitStatus.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {limit.current}/{limit.max}
                  </span>
                </div>

                <div className="space-y-1">
                  <Progress value={percentage} className="h-2 bg-stone/20" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{limit.description}</span>
                    <span>Resets in {formatTimeRemaining(limit.resetTime)}</span>
                  </div>
                </div>

                {limit.remaining === 0 && (
                  <Alert className="border-terracotta/30 bg-terracotta/10">
                    <Leaf className="h-4 w-4 text-clay" />
                    <AlertDescription className="text-clay">
                      Time for a mindful pause. Resets in {formatTimeRemaining(limit.resetTime)}.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )
          })}
        </div>

        {/* Peaceful Footer */}
        <div className="pt-4 border-t border-stone/20 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Leaf className="w-3 h-3 text-sage" />
              <span>Mindful pacing</span>
            </div>
            <span>Updated: {new Date(status.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
