// AI Content Generation Types

export interface AIProvider {
  generate(prompt: string, config: GenerationConfig): Promise<string>
  isAvailable(): boolean
  getName(): string
}

export interface GenerationConfig {
  maxTokens: number
  temperature: number
  model?: string
  timeout?: number // milliseconds
}

export interface GenerationRequest {
  articleTitle: string
  articleDescription: string
  articleContent?: string
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'threads'
  tone: 'professional' | 'friendly' | 'witty' | 'formal'
  contentType?: 'post' | 'thread' | 'story' | 'carousel'
}

export interface GenerationResult {
  content: string
  provider: string
  model: string
  generationTimeMs: number
  tokensUsed?: number
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'AIProviderError'
  }
}

export class AITimeoutError extends AIProviderError {
  constructor(provider: string, timeout: number) {
    super(`Request timed out after ${timeout}ms`, provider)
    this.name = 'AITimeoutError'
  }
}
