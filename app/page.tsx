"use client"

import { useState } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { SpeechInterface } from "@/components/speech-interface"
import { ContentSelector } from "@/components/content-selector"
import { RateLimitMonitor } from "@/components/rate-limit-monitor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Mic, Settings, BarChart3, Leaf, Heart, Brain } from "lucide-react"

export default function Home() {
  const [selectedDomain, setSelectedDomain] = useState("self-help")

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand/30 via-background to-sage/20 p-2 sm:p-4">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-24 h-24 sm:w-32 sm:h-32 bg-sage/10 rounded-full blur-3xl animate-gentle-fade" />
        <div
          className="absolute top-40 right-20 w-16 h-16 sm:w-24 sm:h-24 bg-terracotta/10 rounded-full blur-2xl animate-gentle-fade"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-32 left-1/3 w-32 h-32 sm:w-40 sm:h-40 bg-moss/10 rounded-full blur-3xl animate-gentle-fade"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="text-center mb-6 sm:mb-12 px-2">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-sage/20 rounded-full">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-moss" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-foreground tracking-tight">
              <span className="hidden sm:inline">Mindful AI Companion</span>
              <span className="sm:hidden">Mindful AI</span>
            </h1>
            <div className="p-2 sm:p-3 bg-terracotta/20 rounded-full">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-clay" />
            </div>
          </div>
          <p className="text-base sm:text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
            <span className="hidden sm:inline">
              A serene space for AI-powered guidance and wisdom, designed to calm your mind and nurture your spirit
            </span>
            <span className="sm:hidden">AI-powered guidance for inner peace</span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
            <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-sage" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              <span className="hidden sm:inline">Thoughtfully crafted for inner peace</span>
              <span className="sm:hidden">Crafted for peace</span>
            </span>
            <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-sage" />
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-8">
          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6">
            <ContentSelector selectedDomain={selectedDomain} onDomainChange={setSelectedDomain} />
            {/* Remove the RateLimitMonitor from here since it should only show in the Insights tab */}
          </div>

          {/* Main Interface */}
          <div className="xl:col-span-4">
            <Card className="shadow-warm border-stone/30 bg-card/80 backdrop-blur-sm">
              <Tabs defaultValue="chat" className="w-full">
                <div className="p-3 sm:p-6 pb-0">
                  <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl h-auto">
                    <TabsTrigger
                      value="chat"
                      className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-sage/30 data-[state=active]:text-moss data-[state=active]:shadow-soft rounded-lg transition-all duration-300 py-2 sm:py-1"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">
                        <span className="hidden sm:inline">Mindful Chat</span>
                        <span className="sm:hidden">Chat</span>
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="speech"
                      className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-terracotta/30 data-[state=active]:text-clay data-[state=active]:shadow-soft rounded-lg transition-all duration-300 py-2 sm:py-1"
                    >
                      <Mic className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">
                        <span className="hidden sm:inline">Voice Wisdom</span>
                        <span className="sm:hidden">Voice</span>
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="monitor"
                      className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-moss/30 data-[state=active]:text-moss data-[state=active]:shadow-soft rounded-lg transition-all duration-300 py-2 sm:py-1"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">
                        <span className="hidden sm:inline">Insights</span>
                        <span className="sm:hidden">Stats</span>
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 data-[state=active]:bg-stone/30 data-[state=active]:text-foreground data-[state=active]:shadow-soft rounded-lg transition-all duration-300 py-2 sm:py-1"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-xs sm:text-sm">
                        <span className="hidden sm:inline">Harmony</span>
                        <span className="sm:hidden">Settings</span>
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="chat" className="mt-0 p-3 sm:p-6 pt-4">
                  <ChatInterface domain={selectedDomain} />
                </TabsContent>

                <TabsContent value="speech" className="mt-0 p-3 sm:p-6 pt-4">
                  <SpeechInterface domain={selectedDomain} />
                </TabsContent>

                <TabsContent value="monitor" className="mt-0 p-3 sm:p-6 pt-4">
                  <div className="xl:hidden mb-6">
                    <RateLimitMonitor />
                  </div>
                  <Card className="bg-gradient-to-br from-sage/10 to-moss/10 border-sage/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-moss text-sm sm:text-base">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                        Usage Insights
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Monitor your mindful AI interactions and maintain balance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="xl:block hidden">
                        <RateLimitMonitor />
                      </div>
                      <div className="xl:hidden">
                        <p className="text-muted-foreground text-center py-6 sm:py-8 text-sm">
                          Detailed usage analytics help you maintain a healthy relationship with AI assistance.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-0 p-3 sm:p-6 pt-4">
                  <Card className="bg-gradient-to-br from-stone/10 to-sand/20 border-stone/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                        <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-stone" />
                        Harmony Settings
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Configure your peaceful AI experience
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6 sm:space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-sage rounded-full" />
                              <label className="text-xs sm:text-sm font-medium">AI Provider</label>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground pl-4">
                              Google Gemini with mindful multi-model approach
                            </p>
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-terracotta rounded-full" />
                              <label className="text-xs sm:text-sm font-medium">Active Domain</label>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground pl-4 capitalize">
                              {selectedDomain.replace("-", " ")} wisdom
                            </p>
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-moss rounded-full" />
                              <label className="text-xs sm:text-sm font-medium">Interaction Limits</label>
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground pl-4 space-y-1">
                              <p>• Mindful pacing: 5 AI requests per minute</p>
                              <p>• Voice sessions: 10 per minute</p>
                              <p>• Daily reflection limit: $1.00</p>
                              <p>• Thoughtful messages: 1000 characters</p>
                            </div>
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-clay rounded-full" />
                              <label className="text-xs sm:text-sm font-medium">Voice Features</label>
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground pl-4 space-y-1">
                              <p>✨ Natural speech recognition</p>
                              <p>🎵 Soothing voice synthesis</p>
                              <p>🎛 Customizable voice controls</p>
                              <p>🔄 Mindful rate limiting</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 sm:pt-6 border-t border-stone/20">
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <Leaf className="w-3 h-3 sm:w-4 sm:h-4 text-sage" />
                            <span className="text-xs sm:text-sm font-medium">Mindful Design Philosophy</span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            This interface is thoughtfully designed with earthy tones and gentle animations to promote
                            calmness and mindful interaction. Every element is crafted to support your mental well-being
                            while providing powerful AI assistance.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 sm:mt-16 text-center px-2">
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs sm:text-sm">
            <Leaf className="w-3 h-3" />
            <span className="hidden sm:inline">Crafted with mindfulness for inner peace and wisdom</span>
            <span className="sm:hidden">Crafted with mindfulness</span>
            <Leaf className="w-3 h-3" />
          </div>
        </footer>
      </div>
    </div>
  )
}