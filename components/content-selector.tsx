"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Lightbulb, Plus, Leaf, Mountain, Sun } from "lucide-react"

interface ContentDomain {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: "active" | "available" | "planned"
  color: string
  bgColor: string
}

interface ContentSelectorProps {
  selectedDomain: string
  onDomainChange: (domain: string) => void
}

export function ContentSelector({ selectedDomain, onDomainChange }: ContentSelectorProps) {
  const domains: ContentDomain[] = [
    {
      id: "self-help",
      name: "Self-Growth",
      description: "Nurturing wisdom for personal development and inner peace",
      icon: <Lightbulb className="w-5 h-5" />,
      status: "active",
      color: "text-sage",
      bgColor: "bg-sage/10 hover:bg-sage/20 border-sage/30",
    },
    {
      id: "biblical",
      name: "Sacred Texts",
      description: "Timeless spiritual guidance and divine wisdom",
      icon: <BookOpen className="w-5 h-5" />,
      status: "available",
      color: "text-moss",
      bgColor: "bg-moss/10 hover:bg-moss/20 border-moss/30",
    },
    {
      id: "buddhist",
      name: "Mindful Path",
      description: "Buddhist teachings for compassion and enlightenment",
      icon: <Mountain className="w-5 h-5" />,
      status: "available",
      color: "text-terracotta",
      bgColor: "bg-terracotta/10 hover:bg-terracotta/20 border-terracotta/30",
    },
    {
      id: "custom",
      name: "Your Journey",
      description: "Create your own wisdom domain",
      icon: <Plus className="w-5 h-5" />,
      status: "planned",
      color: "text-stone",
      bgColor: "bg-stone/10 hover:bg-stone/20 border-stone/30",
    },
  ]

  return (
    <Card className="shadow-soft border-stone/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-moss">
          <Sun className="w-5 h-5" />
          Wisdom Domains
        </CardTitle>
        <CardDescription>Choose your path to inner guidance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {domains.map((domain) => (
          <div
            key={domain.id}
            className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
              selectedDomain === domain.id
                ? `${domain.bgColor} ring-2 ring-offset-2 ring-offset-background`
                : `${domain.bgColor} opacity-70`
            } ${domain.status === "planned" ? "opacity-40 cursor-not-allowed" : ""}`}
            onClick={() => {
              if (domain.status !== "planned") {
                onDomainChange(domain.id)
              }
            }}
          >
            <div className="flex items-start gap-3">
              <div className={`${domain.color} mt-1`}>{domain.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-sm text-foreground">{domain.name}</h3>
                  <Badge
                    variant={
                      domain.status === "active" ? "default" : domain.status === "available" ? "secondary" : "outline"
                    }
                    className="text-xs"
                  >
                    {domain.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{domain.description}</p>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-stone/20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Leaf className="w-3 h-3 text-sage" />
            <span>Domains are thoughtfully crafted and easily interchangeable</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
