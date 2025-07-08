"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Mic, MicOff, Volume2, VolumeX, AlertTriangle, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpeechHeaderProps {
  domain: string
  isListening: boolean
  isSpeaking: boolean
  isLoading: boolean
  speechSupported: boolean
  voices: SpeechSynthesisVoice[]
  selectedVoice: string
  speechRate: number[]
  speechPitch: number[]
  autoSpeak: boolean
  lastError: string | null
  transcript: string
  onStartListening: () => void
  onStopListening: () => void
  onStopSpeaking: () => void
  onVoiceChange: (voice: string) => void
  onRateChange: (rate: number[]) => void
  onPitchChange: (pitch: number[]) => void
  onAutoSpeakChange: (autoSpeak: boolean) => void
}

export function SpeechHeader({
  domain,
  isListening,
  isSpeaking,
  isLoading,
  speechSupported,
  voices,
  selectedVoice,
  speechRate,
  speechPitch,
  autoSpeak,
  lastError,
  transcript,
  onStartListening,
  onStopListening,
  onStopSpeaking,
  onVoiceChange,
  onRateChange,
  onPitchChange,
  onAutoSpeakChange,
}: SpeechHeaderProps) {
  if (!speechSupported) {
    return (
      <Card className="shadow-soft border-stone/30 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-moss">
            <Mic className="w-5 h-5" />
            Speech Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-terracotta/30 bg-terracotta/10">
            <AlertTriangle className="h-4 w-4 text-clay" />
            <AlertDescription className="text-clay">
              Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari for the best
              experience.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-soft border-stone/30 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-moss">
          <Mic className="w-5 h-5" />
          <span className="hidden sm:inline">
            Speech Interface - {domain.charAt(0).toUpperCase() + domain.slice(1).replace("-", " ")} Domain
          </span>
          <span className="sm:hidden">Speech Interface</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Alert */}
        {lastError && (
          <Alert variant="destructive" className="border-terracotta/30 bg-terracotta/10">
            <AlertTriangle className="h-4 w-4 text-clay" />
            <AlertDescription className="text-clay">{lastError}</AlertDescription>
          </Alert>
        )}

        {/* Speech Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            onClick={isListening ? onStopListening : onStartListening}
            disabled={isLoading}
            variant={isListening ? "destructive" : "default"}
            size="sm"
            className={cn(
              "transition-all duration-300",
              isListening ? "bg-terracotta hover:bg-terracotta/80 text-white" : "bg-sage hover:bg-sage/80 text-white",
            )}
          >
            {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
            {isListening ? "Stop Listening" : "Start Listening"}
          </Button>

          <Button
            onClick={isSpeaking ? onStopSpeaking : () => {}}
            disabled={!isSpeaking}
            variant={isSpeaking ? "destructive" : "outline"}
            size="sm"
            className={cn(
              "transition-all duration-300",
              isSpeaking && "bg-terracotta hover:bg-terracotta/80 text-white",
            )}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
            {isSpeaking ? "Stop Speaking" : "Not Speaking"}
          </Button>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoSpeak"
              checked={autoSpeak}
              onChange={(e) => onAutoSpeakChange(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="autoSpeak" className="text-sm">
              Auto-speak responses
            </label>
          </div>
        </div>

        {/* Live Transcript */}
        {(isListening || transcript) && (
          <div className="p-3 bg-sage/10 rounded-lg border border-sage/20">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-2 h-2 rounded-full", isListening ? "bg-terracotta animate-pulse" : "bg-stone")} />
              <span className="text-sm font-medium">{isListening ? "Listening..." : "Transcript"}</span>
            </div>
            <p className="text-sm text-muted-foreground">{transcript || "Speak now..."}</p>
          </div>
        )}

        {/* Voice Settings */}
        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium hover:text-moss transition-colors">
            <Settings className="w-4 h-4" />
            Voice Settings
          </summary>
          <div className="mt-3 space-y-4 p-4 bg-stone/10 rounded-lg border border-stone/20">
            <div>
              <label className="text-sm font-medium text-moss">Voice</label>
              <Select value={selectedVoice} onValueChange={onVoiceChange}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices
                    .filter((voice) => voice.lang.startsWith("en"))
                    .map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-moss">Speech Rate: {speechRate[0]}</label>
              <Slider value={speechRate} onValueChange={onRateChange} max={2} min={0.5} step={0.1} className="mt-2" />
            </div>

            <div>
              <label className="text-sm font-medium text-moss">Speech Pitch: {speechPitch[0]}</label>
              <Slider value={speechPitch} onValueChange={onPitchChange} max={2} min={0.5} step={0.1} className="mt-2" />
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}
