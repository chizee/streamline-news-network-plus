import type { AIProvider, GenerationRequest, GenerationResult, GenerationConfig } from '@/types/ai'
import { AIProviderError } from '@/types/ai'
import { OpenAIProvider } from './openai-provider'
import { AnthropicProvider } from './anthropic-provider'
import { GeminiProvider } from './gemini-provider'
import { PlatformPrompts } from './prompts'

export interface ContentGeneratorConfig {
  timeout?: number
  retryAttempts?: number
  cacheEnabled?: boolean
}

export class ContentGenerator {
  private providers: AIProvider[]
  private config: ContentGeneratorConfig
  private cache: Map<string, { content: string; timestamp: number }>

  constructor(config?: ContentGeneratorConfig) {
    this.config = {
      timeout: config?.timeout || 30000,
      retryAttempts: config?.retryAttempts || 2,
      cacheEnabled: config?.cacheEnabled ?? true,
    }

    // Initialize providers in fallback order: Gemini -> OpenAI -> Anthropic
    this.providers = [
      new GeminiProvider(),
      new OpenAIProvider(),
      new AnthropicProvider(),
    ]

    this.cache = new Map()
  }

  /**
   * Generate content with automatic fallback chain
   */
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    // Check cache first
    if (this.config.cacheEnabled) {
      const cached = this.getFromCache(request)
      if (cached) {
        console.log('Returning cached content')
        return cached
      }
    }

    const errors: string[] = []
    const prompt = PlatformPrompts.generate(request)

    // Get generation config based on platform
    const generationConfig = this.getGenerationConfig(request.platform)

    // Try each provider in order until one succeeds
    for (const provider of this.providers) {
      if (!provider.isAvailable()) {
        errors.push(`${provider.getName()}: Not configured (API key missing)`)
        continue
      }

      try {
        console.log(`Attempting content generation with ${provider.getName()}...`)
        
        const startTime = Date.now()
        const content = await provider.generate(prompt, generationConfig)
        const generationTimeMs = Date.now() - startTime

        // Validate content meets platform constraints
        this.validateContent(content, request.platform, request.contentType)

        const result: GenerationResult = {
          content,
          provider: provider.getName(),
          model: generationConfig.model || 'default',
          generationTimeMs,
        }

        // Cache the result
        if (this.config.cacheEnabled) {
          this.addToCache(request, result)
        }

        console.log(`Successfully generated content with ${provider.getName()} in ${generationTimeMs}ms`)

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`${provider.getName()}: ${errorMessage}`)
        
        console.error(`Error generating with ${provider.getName()}:`, errorMessage)
        
        // Continue to next provider
        continue
      }
    }

    // All providers failed
    throw new AIProviderError(
      `All AI providers failed. Errors: ${errors.join('; ')}`,
      'ContentGenerator'
    )
  }

  /**
   * Validate generated content meets platform-specific constraints
   */
  private validateContent(
    content: string,
    platform: string,
    contentType?: string
  ): void {
    switch (platform) {
      case 'linkedin':
        // LinkedIn allows up to 3000 characters, but we'll be flexible
        if (content.length > 3000) {
          console.warn(`[ContentGenerator] LinkedIn content is ${content.length} characters (recommended max: 3000)`)
        }
        break

      case 'twitter':
        if (contentType === 'thread') {
          // Validate thread format
          const tweets = content.split('\n\n').filter(t => t.trim())
          if (tweets.length > 10) {
            throw new AIProviderError(
              `Twitter thread must have at most 10 tweets (got ${tweets.length})`,
              'ContentGenerator'
            )
          }
          tweets.forEach((tweet, index) => {
            const tweetText = tweet.replace(/^\d+\/\d+\s*/, '').trim()
            if (tweetText.length > 280) {
              throw new AIProviderError(
                `Tweet ${index + 1} exceeds 280 characters (got ${tweetText.length})`,
                'ContentGenerator'
              )
            }
          })
        } else {
          if (content.length > 280) {
            throw new AIProviderError(
              `Twitter post must be at most 280 characters (got ${content.length})`,
              'ContentGenerator'
            )
          }
        }
        break

      case 'instagram':
        if (content.length > 2200) {
          console.warn(`[ContentGenerator] Instagram content is ${content.length} characters (max: 2200)`)
        }
        // Count hashtags - just warn if not in ideal range
        const hashtags = content.match(/#\w+/g) || []
        if (hashtags.length < 5) {
          console.warn(`[ContentGenerator] Instagram has only ${hashtags.length} hashtags (recommended: 10-15)`)
        }
        break

      case 'facebook':
        // Facebook is flexible, just ensure it's not empty
        if (!content.trim()) {
          throw new AIProviderError('Facebook content cannot be empty', 'ContentGenerator')
        }
        break

      case 'threads':
        // Threads validation is more flexible
        // Just ensure it's not empty
        if (!content.trim()) {
          throw new AIProviderError('Threads content cannot be empty', 'ContentGenerator')
        }
        break
    }
  }

  /**
   * Get platform-specific generation configuration
   */
  private getGenerationConfig(platform: string): GenerationConfig {
    const baseConfig: GenerationConfig = {
      temperature: 0.7,
      timeout: this.config.timeout,
      maxTokens: 1000,
    }

    switch (platform) {
      case 'linkedin':
        return { ...baseConfig, maxTokens: 1500 }
      case 'twitter':
        return { ...baseConfig, maxTokens: 500, temperature: 0.8 }
      case 'instagram':
        return { ...baseConfig, maxTokens: 1200, temperature: 0.8 }
      case 'facebook':
        return { ...baseConfig, maxTokens: 800, temperature: 0.7 }
      case 'threads':
        return { ...baseConfig, maxTokens: 600, temperature: 0.8 }
      default:
        return baseConfig
    }
  }

  /**
   * Generate cache key from request
   */
  private getCacheKey(request: GenerationRequest): string {
    return `${request.platform}-${request.tone}-${request.articleTitle.slice(0, 50)}`
  }

  /**
   * Get cached content if available and not expired (1 hour TTL)
   */
  private getFromCache(request: GenerationRequest): GenerationResult | null {
    const key = this.getCacheKey(request)
    const cached = this.cache.get(key)

    if (!cached) return null

    const now = Date.now()
    const age = now - cached.timestamp
    const maxAge = 60 * 60 * 1000 // 1 hour

    if (age > maxAge) {
      this.cache.delete(key)
      return null
    }

    return {
      content: cached.content,
      provider: 'Cache',
      model: 'cached',
      generationTimeMs: 0,
    }
  }

  /**
   * Add content to cache
   */
  private addToCache(request: GenerationRequest, result: GenerationResult): void {
    const key = this.getCacheKey(request)
    this.cache.set(key, {
      content: result.content,
      timestamp: Date.now(),
    })

    // Limit cache size to 100 entries
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}
