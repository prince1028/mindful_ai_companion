"use client"

import { useState, useRef, useEffect } from "react"
import  {SpeechHeader } from "@/components/speech-header"
import { SpeechMessages } from "@/components/speech-messages"
// import type { SpeechRecognition } from "types/speech-recognition"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "guidance" | "interpretation" | "conversation" | "therapeutic"
  error?: boolean
}

interface SpeechInterfaceProps {
  domain: string
}

export function SpeechInterface({ domain }: SpeechInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [speechSupported, setSpeechSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [speechRate, setSpeechRate] = useState([1])
  const [speechPitch, setSpeechPitch] = useState([1])
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [lastError, setLastError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthesisRef = useRef<SpeechSynthesis | null>(null)

  // Initialize speech APIs
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()

      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript + interimTranscript)

        if (finalTranscript) {
          handleSpeechInput(finalTranscript.trim())
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setLastError(`Speech recognition error: ${event.error}`)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      setSpeechSupported(true)
    }

    if ("speechSynthesis" in window) {
      synthesisRef.current = window.speechSynthesis

      const loadVoices = () => {
        const availableVoices = synthesisRef.current?.getVoices() || []
        setVoices(availableVoices)

        const englishVoice =
          availableVoices.find((voice) => voice.lang.startsWith("en") && voice.name.includes("Google")) ||
          availableVoices.find((voice) => voice.lang.startsWith("en"))

        if (englishVoice) {
          setSelectedVoice(englishVoice.name)
        }
      }

      loadVoices()
      synthesisRef.current.onvoiceschanged = loadVoices
    }

    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `🎤 Welcome to the speech interface! I'm here to provide guidance based on ${domain} wisdom. You can speak to me or use the microphone button.`,
      timestamp: new Date(),
      type: "conversation",
    }
    setMessages([welcomeMessage])

    if (autoSpeak) {
      setTimeout(() => speakText(welcomeMessage.content), 1000)
    }
  }, [domain])

  const startListening = () => {
    if (recognitionRef.current && speechSupported) {
      setTranscript("")
      setLastError(null)
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speakText = (text: string) => {
    if (synthesisRef.current && text) {
      synthesisRef.current.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      const voice = voices.find((v) => v.name === selectedVoice)
      if (voice) {
        utterance.voice = voice
      }

      utterance.rate = speechRate[0]
      utterance.pitch = speechPitch[0]

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event.error)
        setIsSpeaking(false)
      }

      synthesisRef.current.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const handleSpeechInput = async (spokenText: string) => {
    if (!spokenText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: spokenText,
      timestamp: new Date(),
      type: "conversation",
    }

    setMessages((prev) => [...prev, userMessage])
    setTranscript("")
    setIsLoading(true)
    setLastError(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: spokenText,
          domain,
          type: "conversation",
          history: messages.slice(-5),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        type: "conversation",
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (autoSpeak) {
        setTimeout(() => speakText(data.response), 500)
      }
    } catch (error) {
      console.error("Error processing speech:", error)

      let errorMessage = "I'm sorry, I couldn't process your request. Please try again."
      if (error instanceof Error) {
        if (error.message.includes("high demand") || error.message.includes("503")) {
          errorMessage = "The AI service is busy right now. Please try again in a moment."
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

      if (autoSpeak) {
        setTimeout(() => speakText(errorMessage), 500)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 h-full">
      <div className="text-center space-y-1 sm:space-y-2 px-2">
        <h2 className="text-xl sm:text-2xl font-serif text-foreground">Voice Wisdom</h2>
        <p className="text-muted-foreground text-xs sm:text-sm">
          Speak with {domain.replace("-", " ")} guidance through voice
        </p>
      </div>

      <SpeechHeader
        domain={domain}
        isListening={isListening}
        isSpeaking={isSpeaking}
        isLoading={isLoading}
        speechSupported={speechSupported}
        voices={voices}
        selectedVoice={selectedVoice}
        speechRate={speechRate}
        speechPitch={speechPitch}
        autoSpeak={autoSpeak}
        lastError={lastError}
        transcript={transcript}
        onStartListening={startListening}
        onStopListening={stopListening}
        onStopSpeaking={stopSpeaking}
        onVoiceChange={setSelectedVoice}
        onRateChange={setSpeechRate}
        onPitchChange={setSpeechPitch}
        onAutoSpeakChange={setAutoSpeak}
      />

      <SpeechMessages
        messages={messages}
        isLoading={isLoading}
        isSpeaking={isSpeaking}
        onSpeakText={speakText}
      />
    </div>
  )
}
