import type { AIProvider, GenerationConfig } from '@/types/ai'
import { AIProviderError, AITimeoutError } from '@/types/ai'

export class OpenAIProvider implements AIProvider {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.openai.com/v1'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || ''
  }

  getName(): string {
    return 'OpenAI GPT-4'
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async generate(prompt: string, config: GenerationConfig): Promise<string> {
    if (!this.isAvailable()) {
      throw new AIProviderError('OpenAI API key not configured', 'OpenAI')
    }

    const controller = new AbortController()
    const timeout = config.timeout || 30000
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const startTime = Date.now()

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert social media content creator specializing in AI and technology topics.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: config.maxTokens,
          temperature: config.temperature,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.status === 429) {
        throw new AIProviderError('Rate limit exceeded', 'OpenAI', 429)
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new AIProviderError(
          error.error?.message || `OpenAI API error: ${response.statusText}`,
          'OpenAI',
          response.status
        )
      }

      const data = await response.json()
      
      if (!data.choices || data.choices.length === 0) {
        throw new AIProviderError('No content generated', 'OpenAI')
      }

      const generatedContent = data.choices[0].message.content

      console.log(`OpenAI generation completed in ${Date.now() - startTime}ms`)

      return generatedContent
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof AIProviderError) {
        throw error
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new AITimeoutError('OpenAI', timeout)
      }

      throw new AIProviderError(
        `OpenAI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'OpenAI'
      )
    }
  }
}
