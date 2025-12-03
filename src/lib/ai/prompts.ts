import type { GenerationRequest } from '@/types/ai'

export class PlatformPrompts {
  /**
   * Generate a prompt for LinkedIn content
   * Requirements: 1300-3000 characters, professional tone
   */
  static linkedin(request: GenerationRequest): string {
    const toneGuidance = this.getToneGuidance(request.tone)
    
    return `Create a LinkedIn post about this AI news article.

Article Title: ${request.articleTitle}
Article Description: ${request.articleDescription}
${request.articleContent ? `Article Content: ${request.articleContent.slice(0, 500)}...` : ''}

Requirements:
- Length: Between 1300 and 3000 characters
- Tone: ${toneGuidance}
- Style: Professional and engaging
- Include: Key insights, implications for the industry, and a call-to-action
- Format: Use line breaks for readability, but no markdown formatting
- Hashtags: Include 3-5 relevant hashtags at the end

Generate the LinkedIn post now:`
  }

  /**
   * Generate a prompt for Twitter/X content
   * Requirements: 280 characters or thread format (up to 10 tweets)
   */
  static twitter(request: GenerationRequest): string {
    const toneGuidance = this.getToneGuidance(request.tone)
    const isThread = request.contentType === 'thread'
    
    if (isThread) {
      return `Create a Twitter thread about this AI news article.

Article Title: ${request.articleTitle}
Article Description: ${request.articleDescription}

Requirements:
- Format: A thread of 3-10 tweets
- Each tweet: Maximum 280 characters
- Tone: ${toneGuidance}
- Style: Concise and engaging
- First tweet: Hook that grabs attention
- Middle tweets: Key points and insights
- Last tweet: Conclusion or call-to-action
- Number each tweet with "1/", "2/", etc.

Generate the Twitter thread now:`
    }

    return `Create a single Twitter post about this AI news article.

Article Title: ${request.articleTitle}
Article Description: ${request.articleDescription}

Requirements:
- Length: Maximum 280 characters (strict limit)
- Tone: ${toneGuidance}
- Style: Punchy and attention-grabbing
- Include: 1-2 relevant hashtags

Generate the tweet now:`
  }

  /**
   * Generate a prompt for Instagram content
   * Requirements: Up to 2200 characters, 10-15 hashtags
   */
  static instagram(request: GenerationRequest): string {
    const toneGuidance = this.getToneGuidance(request.tone)
    
    return `Create an Instagram caption about this AI news article.

Article Title: ${request.articleTitle}
Article Description: ${request.articleDescription}

Requirements:
- Length: Up to 2200 characters
- Tone: ${toneGuidance}
- Style: Visual and engaging, suitable for Instagram audience
- Include: Story-driven narrative with emojis where appropriate
- Hashtags: Include exactly 10-15 relevant hashtags at the end
- Format: Use line breaks for readability

Generate the Instagram caption now:`
  }

  /**
   * Generate a prompt for Facebook content
   * Requirements: 1-3 paragraphs, conversational tone
   */
  static facebook(request: GenerationRequest): string {
    const toneGuidance = this.getToneGuidance(request.tone)
    
    return `Create a Facebook post about this AI news article.

Article Title: ${request.articleTitle}
Article Description: ${request.articleDescription}

Requirements:
- Length: 1-3 paragraphs
- Tone: ${toneGuidance} and conversational
- Style: Engaging and discussion-friendly
- Include: Question or call-to-action to encourage comments
- Format: Clear paragraph breaks

Generate the Facebook post now:`
  }

  /**
   * Generate a prompt for Threads content
   * Requirements: Casual professional, multi-thread support
   */
  static threads(request: GenerationRequest): string {
    const toneGuidance = this.getToneGuidance(request.tone)
    
    return `Create a Threads post about this AI news article.

Article Title: ${request.articleTitle}
Article Description: ${request.articleDescription}

Requirements:
- Length: 500 characters per thread (can create multiple threads)
- Tone: ${toneGuidance} with casual professional style
- Style: Conversational and authentic
- Format: If multiple threads, separate with "---THREAD---"
- Include: Personal take or insight

Generate the Threads post now:`
  }

  /**
   * Get tone-specific guidance for content generation
   */
  private static getToneGuidance(tone: string): string {
    switch (tone) {
      case 'professional':
        return 'Professional and authoritative, suitable for business contexts'
      case 'friendly':
        return 'Friendly and approachable, warm and welcoming'
      case 'witty':
        return 'Witty and clever, with subtle humor and wordplay'
      case 'formal':
        return 'Formal and academic, precise and scholarly'
      default:
        return 'Professional'
    }
  }

  /**
   * Generate prompt based on platform
   */
  static generate(request: GenerationRequest): string {
    switch (request.platform) {
      case 'linkedin':
        return this.linkedin(request)
      case 'twitter':
        return this.twitter(request)
      case 'instagram':
        return this.instagram(request)
      case 'facebook':
        return this.facebook(request)
      case 'threads':
        return this.threads(request)
      default:
        throw new Error(`Unsupported platform: ${request.platform}`)
    }
  }
}
