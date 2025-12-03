import type { AIProvider, GenerationConfig } from '@/types/ai'
import { AIProviderError, AITimeoutError } from '@/types/ai'

export class AnthropicProvider implements AIProvider {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.anthropic.com/v1'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || ''
  }

  getName(): string {
    return 'Anthropic Claude'
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async generate(prompt: string, config: GenerationConfig): Promise<string> {
    if (!this.isAvailable()) {
      throw new AIProviderError('Anthropic API key not configured', 'Anthropic')
    }

    const controller = new AbortController()
    const timeout = config.timeout || 30000
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const startTime = Date.now()

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: config.model || 'claude-3-opus-20240229',
          max_tokens: config.maxTokens,
          temperature: config.temperature,
          system: 'You are an expert social media content creator specializing in AI and technology topics.',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.status === 429) {
        throw new AIProviderError('Rate limit exceeded', 'Anthropic', 429)
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new AIProviderError(
          error.error?.message || `Anthropic API error: ${response.statusText}`,
          'Anthropic',
          response.status
        )
      }

      const data = await response.json()
      
      if (!data.content || data.content.length === 0) {
        throw new AIProviderError('No content generated', 'Anthropic')
      }

      const generatedContent = data.content[0].text

      console.log(`Anthropic generation completed in ${Date.now() - startTime}ms`)

      return generatedContent
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof AIProviderError) {
        throw error
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new AITimeoutError('Anthropic', timeout)
      }

      throw new AIProviderError(
        `Anthropic generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Anthropic'
      )
    }
  }
}
