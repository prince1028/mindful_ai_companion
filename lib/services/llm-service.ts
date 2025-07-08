interface GenerateResponseParams {
  message: string
  context: string
  systemPrompt: string
  history: Array<{ role: string; content: string }>
}

export class LLMService {
  private apiKey: string
  private availableModels = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.0-pro"]

  constructor() {
    this.apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""

    if (!this.apiKey) {
      throw new Error("GOOGLE_GENERATIVE_AI_API_KEY environment variable is required")
    }
  }

  async generateResponse(params: GenerateResponseParams): Promise<string> {
    // Try multiple models with retry logic
    for (const modelName of this.availableModels) {
      try {
        console.log(`Trying model: ${modelName}`)
        return await this.generateWithRetry(params, modelName)
      } catch (error) {
        console.warn(`Model ${modelName} failed:`, error)
        // Continue to next model
      }
    }

    // If all models fail, throw the last error
    throw new Error("All Gemini models are currently unavailable. Please try again later.")
  }

  private async generateWithRetry(params: GenerateResponseParams, modelName: string, maxRetries = 3): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Add exponential backoff delay
        if (attempt > 1) {
          const delay = Math.pow(2, attempt - 1) * 1000 // 2s, 4s, 8s
          console.log(`Retrying in ${delay}ms...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }

        return await this.generateWithDirectAPI(params, modelName)
      } catch (error: any) {
        console.log(`Attempt ${attempt} failed for ${modelName}:`, error.message)

        // Don't retry on certain errors
        if (error.message.includes("400") || error.message.includes("401") || error.message.includes("403")) {
          throw error
        }

        // If it's the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error
        }
      }
    }

    throw new Error(`Failed after ${maxRetries} attempts`)
  }

  private async generateWithDirectAPI(
    { message, context, systemPrompt, history }: GenerateResponseParams,
    modelName: string,
  ): Promise<string> {
    // Construct the full prompt
    const fullPrompt = `${systemPrompt}\n\nAdditional Context:\n${context}\n\nConversation History:\n${history
      .slice(-3)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join(
        "\n",
      )}\n\nUser: ${message}\n\nPlease provide a concise, helpful response in 2-3 sentences. Be warm but brief.\n\nAssistant:`

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: fullPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200, // Reduced from 500 to 200 for shorter responses
        topP: 0.8,
        topK: 40,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: { message: errorText } }
      }

      // Handle specific error codes
      if (response.status === 503) {
        throw new Error(`Model ${modelName} is overloaded (503). Trying next model...`)
      } else if (response.status === 429) {
        throw new Error(`Rate limit exceeded for ${modelName} (429). Trying next model...`)
      } else if (response.status === 400) {
        throw new Error(`Bad request for ${modelName}: ${errorData.error?.message || errorText}`)
      } else {
        throw new Error(`API error ${response.status} for ${modelName}: ${errorData.error?.message || errorText}`)
      }
    }

    const data = await response.json()

    // Handle blocked content
    if (data.candidates && data.candidates[0] && data.candidates[0].finishReason === "SAFETY") {
      throw new Error("Content was blocked by safety filters. Please rephrase your message.")
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error(`Invalid response from ${modelName}: ${JSON.stringify(data)}`)
    }

    return data.candidates[0].content.parts[0].text
  }

  // Method to check model availability
  async checkModelAvailability(modelName: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}?key=${this.apiKey}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      return response.ok
    } catch {
      return false
    }
  }

  // Get available models
  async getAvailableModels(): Promise<string[]> {
    const available = []
    for (const model of this.availableModels) {
      if (await this.checkModelAvailability(model)) {
        available.push(model)
      }
    }
    return available
  }
}
