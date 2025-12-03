import type { AIProvider, GenerationConfig } from '@/types/ai'
import { AIProviderError, AITimeoutError } from '@/types/ai'

export class GeminiProvider implements AIProvider {
  private readonly apiKey: string
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_AI_API_KEY || ''
  }

  getName(): string {
    return 'Google Gemini'
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async generate(prompt: string, config: GenerationConfig): Promise<string> {
    if (!this.isAvailable()) {
      throw new AIProviderError('Google AI API key not configured', 'Gemini')
    }

    // Use Gemini 2.5 Flash-Lite - highest rate limits, best for high volume
    const models = ['gemini-2.5-flash-lite']
    
    for (let i = 0; i < models.length; i++) {
      const model = config.model || models[i]
      
      try {
        return await this.generateWithModel(model, prompt, config)
      } catch (error) {
        // If rate limited and we have more models to try, continue
        if (error instanceof AIProviderError && error.statusCode === 429 && i < models.length - 1) {
          console.log(`[Gemini] ${model} rate limited, trying fallback model...`)
          continue
        }
        // Otherwise, throw the error
        throw error
      }
    }
    
    throw new AIProviderError('All Gemini models rate limited', 'Gemini', 429)
  }

  private async generateWithModel(model: string, prompt: string, config: GenerationConfig): Promise<string> {
    const controller = new AbortController()
    const timeout = config.timeout || 30000
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const startTime = Date.now()
      console.log(`[Gemini] Starting generation with model: ${model}`)

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `You are an expert social media content creator specializing in AI and technology topics.\n\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: config.temperature || 0.7,
          maxOutputTokens: config.maxTokens || 1000,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE',
          },
        ],
      }

      const response = await fetch(
        `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      )

      clearTimeout(timeoutId)

      if (response.status === 429) {
        console.error('[Gemini] Rate limit exceeded')
        throw new AIProviderError('Rate limit exceeded. Please try again in a moment.', 'Gemini', 429)
      }

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[Gemini] API error (${response.status}):`, errorText)
        
        let errorMessage = `Gemini API error: ${response.statusText}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error?.message || errorMessage
        } catch {
          // Use default error message
        }
        
        throw new AIProviderError(errorMessage, 'Gemini', response.status)
      }

      const data = await response.json()
      
      console.log('[Gemini] Response received:', JSON.stringify(data, null, 2))
      
      if (!data.candidates || data.candidates.length === 0) {
        console.error('[Gemini] No candidates in response')
        throw new AIProviderError('No content generated. The content may have been blocked by safety filters.', 'Gemini')
      }

      const candidate = data.candidates[0]
      
      // Check for content filtering
      if (candidate.finishReason === 'SAFETY') {
        console.error('[Gemini] Content blocked by safety filters')
        throw new AIProviderError('Content generation blocked by safety filters. Try rephrasing your request.', 'Gemini')
      }

      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        console.error('[Gemini] No content parts in response')
        throw new AIProviderError('No content generated', 'Gemini')
      }

      const generatedContent = candidate.content.parts[0].text

      if (!generatedContent || generatedContent.trim().length === 0) {
        console.error('[Gemini] Empty content generated')
        throw new AIProviderError('Empty content generated', 'Gemini')
      }

      const duration = Date.now() - startTime
      console.log(`[Gemini] Generation completed successfully in ${duration}ms`)

      return generatedContent
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof AIProviderError) {
        throw error
      }

      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`[Gemini] Request timed out after ${timeout}ms`)
        throw new AITimeoutError('Gemini', timeout)
      }

      console.error('[Gemini] Unexpected error:', error)
      throw new AIProviderError(
        `Gemini generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Gemini'
      )
    }
  }
}
