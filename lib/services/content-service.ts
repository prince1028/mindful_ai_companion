import { promises as fs } from "fs"
import path from "path"

export class ContentService {
  private contentBasePath = path.join(process.cwd(), "content")

  async getContext(domain: string): Promise<string> {
    try {
      const contextPath = path.join(this.contentBasePath, domain, "context.txt")
      const context = await fs.readFile(contextPath, "utf-8")
      return context
    } catch (error) {
      console.warn(`No context file found for domain: ${domain}`)
      return this.getDefaultContext(domain)
    }
  }

  getSystemPrompt(domain: string, type?: string): string {
    const basePrompts = {
      "self-help":
        "You are a wise and compassionate life coach specializing in self-help and personal development. Provide practical, actionable guidance while being empathetic and supportive.",
      biblical:
        "You are a knowledgeable biblical counselor who provides guidance based on biblical principles and teachings. Be respectful, wise, and grounded in scripture.",
      buddhist:
        "You are a mindful Buddhist teacher who shares wisdom from Buddhist teachings and meditation practices. Be peaceful, insightful, and focused on reducing suffering.",
      default: "You are a helpful and wise assistant providing guidance and support.",
    }

    const typeModifiers = {
      guidance: " Focus on providing daily wisdom and practical guidance.",
      interpretation: " Help interpret and explain concepts clearly and thoughtfully.",
      conversation: " Engage in meaningful, supportive conversation.",
      therapeutic: " Provide emotional support and therapeutic-style guidance.",
    }

    const basePrompt = basePrompts[domain as keyof typeof basePrompts] || basePrompts.default
    const typeModifier = type ? typeModifiers[type as keyof typeof typeModifiers] || "" : ""

    return basePrompt + typeModifier
  }

  private getDefaultContext(domain: string): string {
    const defaultContexts = {
      "self-help": `
Key Principles of Self-Help and Personal Development:
- Growth mindset: Believe in your ability to learn and improve
- Self-awareness: Understand your thoughts, emotions, and behaviors
- Goal setting: Set clear, achievable objectives
- Resilience: Bounce back from setbacks and challenges
- Mindfulness: Stay present and aware in daily life
- Continuous learning: Always seek to expand your knowledge and skills
- Self-compassion: Treat yourself with kindness and understanding
- Action-oriented: Focus on what you can control and take steps forward
      `,
      biblical: `
Core Biblical Principles:
- Love God and love your neighbor as yourself
- Trust in the Lord with all your heart
- Seek wisdom and understanding
- Practice forgiveness and mercy
- Find strength in faith during trials
- Serve others with humility
- Live with integrity and righteousness
      `,
      buddhist: `
Fundamental Buddhist Teachings:
- The Four Noble Truths: Understanding suffering and the path to liberation
- The Eightfold Path: Right understanding, intention, speech, action, livelihood, effort, mindfulness, concentration
- Impermanence: All things are in constant change
- Compassion: Loving-kindness toward all beings
- Mindfulness: Present-moment awareness
- Non-attachment: Freedom from clinging to outcomes
      `,
    }

    return defaultContexts[domain as keyof typeof defaultContexts] || "General wisdom and guidance principles."
  }

  // Plugin architecture method - for future extensibility
  async loadPlugin(pluginName: string): Promise<any> {
    // Placeholder for plugin loading system
    // This would allow loading custom content processors
    console.log(`Loading plugin: ${pluginName}`)
    // Future implementation would dynamically load plugins
    return null
  }

  // Method to validate and process new content domains
  async validateContentDomain(domain: string): Promise<boolean> {
    try {
      const domainPath = path.join(this.contentBasePath, domain)
      const stats = await fs.stat(domainPath)
      return stats.isDirectory()
    } catch {
      return false
    }
  }
}
