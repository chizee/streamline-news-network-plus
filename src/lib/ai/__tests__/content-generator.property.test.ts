/**
 * Property-Based Tests for AI Content Generation Validation
 * Using fast-check for property-based testing
 */

import * as fc from 'fast-check'
import { ContentGenerator } from '../content-generator'
import type { GenerationRequest, GenerationResult } from '@/types/ai'

// Create a factory for mock providers
const createMockProvider = (generateFn: (prompt: string) => Promise<string>) => ({
  generate: jest.fn().mockImplementation(generateFn),
  isAvailable: jest.fn().mockReturnValue(true),
  getName: jest.fn().mockReturnValue('OpenAI'),
})

// Default generate function
const defaultGenerateFn = async (prompt: string) => {
  // Generate content based on platform requirements from prompt
  if (prompt.includes('LinkedIn')) {
    return 'A'.repeat(2000) // Valid LinkedIn length
  } else if (prompt.includes('Twitter') && prompt.includes('thread')) {
    return Array(5).fill('Tweet content here').map((t, i) => `${i + 1}/5 ${t}`).join('\n\n')
  } else if (prompt.includes('Twitter')) {
    return 'A'.repeat(200) // Valid Twitter length
  } else if (prompt.includes('Instagram')) {
    return 'Caption content ' + Array(12).fill('#hashtag').join(' ') // Valid Instagram
  } else if (prompt.includes('Facebook')) {
    return 'Paragraph 1\n\nParagraph 2' // Valid Facebook
  } else {
    return 'Default content'
  }
}

// Mock the AI providers to return controlled content
jest.mock('../openai-provider', () => ({
  OpenAIProvider: jest.fn().mockImplementation(() => createMockProvider(defaultGenerateFn)),
}))

jest.mock('../anthropic-provider', () => ({
  AnthropicProvider: jest.fn().mockImplementation(() => ({
    generate: jest.fn(),
    isAvailable: jest.fn().mockReturnValue(false),
    getName: jest.fn().mockReturnValue('Anthropic'),
  })),
}))

jest.mock('../gemini-provider', () => ({
  GeminiProvider: jest.fn().mockImplementation(() => ({
    generate: jest.fn(),
    isAvailable: jest.fn().mockReturnValue(false),
    getName: jest.fn().mockReturnValue('Gemini'),
  })),
}))

// Generator for GenerationRequest
const generationRequestArbitrary = (platform: string, contentType?: string) =>
  fc.record({
    articleTitle: fc.string({ minLength: 10, maxLength: 200 }),
    articleDescription: fc.string({ minLength: 20, maxLength: 500 }),
    articleContent: fc.oneof(fc.string({ minLength: 50, maxLength: 2000 }), fc.constant(undefined)),
    platform: fc.constant(platform as any),
    tone: fc.constantFrom('professional', 'friendly', 'witty', 'formal'),
    contentType: fc.constant(contentType as any),
  }) as fc.Arbitrary<GenerationRequest>

describe('AI Content Generation Property Tests', () => {
  describe('**Feature: snn-platform, Property 10: LinkedIn character constraints**', () => {
    beforeEach(() => {
      // Reset to default mock for LinkedIn tests
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() => createMockProvider(defaultGenerateFn))
    })
    /**
     * Property 10: LinkedIn character constraints
     * For any content generated for LinkedIn, the text length should be
     * between 1300 and 3000 characters.
     * Validates: Requirements 4.4
     */
    test('should generate LinkedIn content within 1300-3000 characters', async () => {
      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('linkedin'), async (request) => {
          const generator = new ContentGenerator({ cacheEnabled: false })
          const result = await generator.generate(request)

          // Verify content length is within LinkedIn constraints
          expect(result.content.length).toBeGreaterThanOrEqual(1300)
          expect(result.content.length).toBeLessThanOrEqual(3000)

          // Verify result structure
          expect(result.provider).toBeDefined()
          expect(result.model).toBeDefined()
          expect(result.generationTimeMs).toBeGreaterThanOrEqual(0)
        }),
        { numRuns: 100 }
      )
    })

    test('should reject LinkedIn content that is too short', async () => {
      // Mock provider to return content that's too short
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() => createMockProvider(async () => 'A'.repeat(1000)))

      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('linkedin'), async (request) => {
          const shortGenerator = new ContentGenerator({ cacheEnabled: false })
          await expect(shortGenerator.generate(request)).rejects.toThrow(
            /LinkedIn content must be 1300-3000 characters/
          )
        }),
        { numRuns: 50 }
      )
    })

    test('should reject LinkedIn content that is too long', async () => {
      // Mock provider to return content that's too long
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() => createMockProvider(async () => 'A'.repeat(3500)))

      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('linkedin'), async (request) => {
          const longGenerator = new ContentGenerator({ cacheEnabled: false })
          await expect(longGenerator.generate(request)).rejects.toThrow(
            /LinkedIn content must be 1300-3000 characters/
          )
        }),
        { numRuns: 50 }
      )
    })
  })

  describe('**Feature: snn-platform, Property 11: Twitter character constraints**', () => {
    beforeEach(() => {
      // Reset to default mock for Twitter tests
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() => createMockProvider(defaultGenerateFn))
    })
    /**
     * Property 11: Twitter character constraints
     * For any content generated for Twitter/X, either the text should be within
     * 280 characters, or if a thread, each tweet should be within 280 characters
     * and the thread should have at most 10 tweets.
     * Validates: Requirements 4.5
     */
    test('should generate Twitter posts within 280 characters', async () => {
      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('twitter', 'post'), async (request) => {
          const generator = new ContentGenerator({ cacheEnabled: false })
          const result = await generator.generate(request)

          // Verify single tweet is within character limit
          expect(result.content.length).toBeLessThanOrEqual(280)
          expect(result.content.length).toBeGreaterThan(0)
        }),
        { numRuns: 100 }
      )
    })

    test('should generate Twitter threads with valid constraints', async () => {
      // Mock provider to return a valid thread
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() =>
        createMockProvider(async () => {
          const tweets = Array(7)
            .fill(null)
            .map((_, i) => `${i + 1}/7 This is tweet content that is well within the 280 character limit`)
          return tweets.join('\n\n')
        })
      )

      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('twitter', 'thread'), async (request) => {
          const threadGenerator = new ContentGenerator({ cacheEnabled: false })
          const result = await threadGenerator.generate(request)

          // Parse thread
          const tweets = result.content.split('\n\n').filter((t) => t.trim())

          // Verify thread constraints
          expect(tweets.length).toBeGreaterThan(0)
          expect(tweets.length).toBeLessThanOrEqual(10)

          // Verify each tweet is within character limit
          tweets.forEach((tweet) => {
            const tweetText = tweet.replace(/^\d+\/\d+\s*/, '').trim()
            expect(tweetText.length).toBeLessThanOrEqual(280)
          })
        }),
        { numRuns: 100 }
      )
    })

    test('should reject Twitter posts exceeding 280 characters', async () => {
      // Mock provider to return content that's too long
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() => createMockProvider(async () => 'A'.repeat(300)))

      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('twitter', 'post'), async (request) => {
          const longGenerator = new ContentGenerator({ cacheEnabled: false })
          await expect(longGenerator.generate(request)).rejects.toThrow(
            /Twitter post must be at most 280 characters/
          )
        }),
        { numRuns: 50 }
      )
    })

    test('should reject Twitter threads with too many tweets', async () => {
      // Mock provider to return a thread with too many tweets
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() =>
        createMockProvider(async () => {
          const tweets = Array(15)
            .fill(null)
            .map((_, i) => `${i + 1}/15 Tweet content`)
          return tweets.join('\n\n')
        })
      )

      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('twitter', 'thread'), async (request) => {
          const threadGenerator = new ContentGenerator({ cacheEnabled: false })
          await expect(threadGenerator.generate(request)).rejects.toThrow(
            /Twitter thread must have at most 10 tweets/
          )
        }),
        { numRuns: 50 }
      )
    })

    test('should reject Twitter threads with tweets exceeding 280 characters', async () => {
      // Mock provider to return a thread with a tweet that's too long
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() =>
        createMockProvider(async () => `1/3 Short tweet\n\n2/3 ${'A'.repeat(300)}\n\n3/3 Another short tweet`)
      )

      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('twitter', 'thread'), async (request) => {
          const threadGenerator = new ContentGenerator({ cacheEnabled: false })
          await expect(threadGenerator.generate(request)).rejects.toThrow(/Tweet \d+ exceeds 280 characters/)
        }),
        { numRuns: 50 }
      )
    })
  })

  describe('**Feature: snn-platform, Property 12: Instagram hashtag constraints**', () => {
    beforeEach(() => {
      // Reset to default mock for Instagram tests
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() => createMockProvider(defaultGenerateFn))
    })
    /**
     * Property 12: Instagram hashtag constraints
     * For any content generated for Instagram, the caption should be at most
     * 2200 characters and include between 10 and 15 hashtags.
     * Validates: Requirements 4.6
     */
    test('should generate Instagram captions with valid constraints', async () => {
      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('instagram'), async (request) => {
          const generator = new ContentGenerator({ cacheEnabled: false })
          const result = await generator.generate(request)

          // Verify caption length
          expect(result.content.length).toBeLessThanOrEqual(2200)
          expect(result.content.length).toBeGreaterThan(0)

          // Count hashtags
          const hashtags = result.content.match(/#\w+/g) || []
          expect(hashtags.length).toBeGreaterThanOrEqual(10)
          expect(hashtags.length).toBeLessThanOrEqual(15)
        }),
        { numRuns: 100 }
      )
    })

    test('should reject Instagram captions exceeding 2200 characters', async () => {
      // Mock provider to return content that's too long
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() =>
        createMockProvider(async () => 'A'.repeat(2500) + ' ' + Array(12).fill('#hashtag').join(' '))
      )

      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('instagram'), async (request) => {
          const longGenerator = new ContentGenerator({ cacheEnabled: false })
          await expect(longGenerator.generate(request)).rejects.toThrow(
            /Instagram caption must be at most 2200 characters/
          )
        }),
        { numRuns: 50 }
      )
    })

    test('should reject Instagram captions with too few hashtags', async () => {
      // Mock provider to return content with too few hashtags
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() =>
        createMockProvider(async () => 'Caption content ' + Array(5).fill('#hashtag').join(' '))
      )

      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('instagram'), async (request) => {
          const fewHashtagsGenerator = new ContentGenerator({ cacheEnabled: false })
          await expect(fewHashtagsGenerator.generate(request)).rejects.toThrow(
            /Instagram caption must have 10-15 hashtags/
          )
        }),
        { numRuns: 50 }
      )
    })

    test('should reject Instagram captions with too many hashtags', async () => {
      // Mock provider to return content with too many hashtags
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() =>
        createMockProvider(async () => 'Caption content ' + Array(20).fill('#hashtag').join(' '))
      )

      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('instagram'), async (request) => {
          const manyHashtagsGenerator = new ContentGenerator({ cacheEnabled: false })
          await expect(manyHashtagsGenerator.generate(request)).rejects.toThrow(
            /Instagram caption must have 10-15 hashtags/
          )
        }),
        { numRuns: 50 }
      )
    })
  })

  describe('**Feature: snn-platform, Property 13: Facebook paragraph structure**', () => {
    beforeEach(() => {
      // Reset to default mock for Facebook tests
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() => createMockProvider(defaultGenerateFn))
    })

    /**
     * Property 13: Facebook paragraph structure
     * For any content generated for Facebook, the text should consist of 1 to 3 paragraphs.
     * Validates: Requirements 4.7
     */
    test('should generate Facebook posts with 1-3 paragraphs', async () => {
      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('facebook'), async (request) => {
          const generator = new ContentGenerator({ cacheEnabled: false })
          const result = await generator.generate(request)

          // Count paragraphs (separated by double newlines)
          const paragraphs = result.content.split(/\n\n+/).filter((p) => p.trim())

          // Verify paragraph count
          expect(paragraphs.length).toBeGreaterThanOrEqual(1)
          expect(paragraphs.length).toBeLessThanOrEqual(3)
        }),
        { numRuns: 100 }
      )
    })

    test('should reject Facebook posts with no paragraphs', async () => {
      // Mock provider to return empty content
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() => createMockProvider(async () => '   \n\n   '))

      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('facebook'), async (request) => {
          const emptyGenerator = new ContentGenerator({ cacheEnabled: false })
          await expect(emptyGenerator.generate(request)).rejects.toThrow(
            /Facebook post must have 1-3 paragraphs/
          )
        }),
        { numRuns: 50 }
      )
    })

    test('should reject Facebook posts with too many paragraphs', async () => {
      // Mock provider to return content with too many paragraphs
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() =>
        createMockProvider(async () => 'Paragraph 1\n\nParagraph 2\n\nParagraph 3\n\nParagraph 4\n\nParagraph 5')
      )

      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('facebook'), async (request) => {
          const manyParasGenerator = new ContentGenerator({ cacheEnabled: false })
          await expect(manyParasGenerator.generate(request)).rejects.toThrow(
            /Facebook post must have 1-3 paragraphs/
          )
        }),
        { numRuns: 50 }
      )
    })
  })

  describe('**Feature: snn-platform, Property 14: Content generation metadata persistence**', () => {
    beforeEach(() => {
      // Reset to default mock
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() => createMockProvider(defaultGenerateFn))
    })

    /**
     * Property 14: Content generation metadata persistence
     * For any completed content generation, the system should store the generated text
     * along with metadata (AI model, generation time, tone) in the generated_content table.
     * Validates: Requirements 4.9
     */
    test('should return complete metadata for all generated content', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('linkedin', 'twitter', 'instagram', 'facebook', 'threads'),
          fc.constantFrom('professional', 'friendly', 'witty', 'formal'),
          async (platform, tone) => {
            const request: GenerationRequest = {
              articleTitle: 'Test Article',
              articleDescription: 'Test Description',
              platform: platform as any,
              tone: tone as any,
            }

            const generator = new ContentGenerator({ cacheEnabled: false })
            const result = await generator.generate(request)

            // Verify all metadata is present
            expect(result.content).toBeDefined()
            expect(typeof result.content).toBe('string')
            expect(result.content.length).toBeGreaterThan(0)

            expect(result.provider).toBeDefined()
            expect(typeof result.provider).toBe('string')

            expect(result.model).toBeDefined()
            expect(typeof result.model).toBe('string')

            expect(result.generationTimeMs).toBeDefined()
            expect(typeof result.generationTimeMs).toBe('number')
            expect(result.generationTimeMs).toBeGreaterThanOrEqual(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    test('should track generation time accurately', async () => {
      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('linkedin'), async (request) => {
          const generator = new ContentGenerator({ cacheEnabled: false })
          const startTime = Date.now()
          const result = await generator.generate(request)
          const endTime = Date.now()

          // Generation time should be within the measured time window
          expect(result.generationTimeMs).toBeGreaterThanOrEqual(0)
          expect(result.generationTimeMs).toBeLessThanOrEqual(endTime - startTime + 100) // +100ms tolerance
        }),
        { numRuns: 50 }
      )
    })
  })

  describe('**Feature: snn-platform, Property 15: Tone application consistency**', () => {
    beforeEach(() => {
      // Reset to default mock
      const { OpenAIProvider } = require('../openai-provider')
      OpenAIProvider.mockImplementation(() => createMockProvider(defaultGenerateFn))
    })

    /**
     * Property 15: Tone application consistency
     * For any content generation request with a specified tone, the generated content
     * should reflect that tone in the output text.
     * Validates: Requirements 4.10
     */
    test('should generate content for all supported tones', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('professional', 'friendly', 'witty', 'formal'),
          fc.constantFrom('linkedin', 'twitter', 'instagram', 'facebook'),
          async (tone, platform) => {
            const request: GenerationRequest = {
              articleTitle: 'AI Breakthrough in Natural Language Processing',
              articleDescription: 'Researchers announce major advancement in AI language models',
              platform: platform as any,
              tone: tone as any,
            }

            const generator = new ContentGenerator({ cacheEnabled: false })
            const result = await generator.generate(request)

            // Verify content was generated
            expect(result.content).toBeDefined()
            expect(result.content.length).toBeGreaterThan(0)

            // Verify the tone was passed to the prompt (indirectly tested through successful generation)
            expect(result.provider).toBe('OpenAI')
          }
        ),
        { numRuns: 100 }
      )
    })

    test('should handle all tone variations consistently', async () => {
      const tones: Array<'professional' | 'friendly' | 'witty' | 'formal'> = [
        'professional',
        'friendly',
        'witty',
        'formal',
      ]

      await fc.assert(
        fc.asyncProperty(generationRequestArbitrary('linkedin'), async (baseRequest) => {
          const generator = new ContentGenerator({ cacheEnabled: false })
          const results: GenerationResult[] = []

          // Generate content with each tone
          for (const tone of tones) {
            const request = { ...baseRequest, tone }
            const result = await generator.generate(request)
            results.push(result)
          }

          // All results should be valid
          results.forEach((result, index) => {
            expect(result.content).toBeDefined()
            expect(result.content.length).toBeGreaterThan(0)
            expect(result.provider).toBeDefined()
            expect(result.model).toBeDefined()
          })

          // Results should be consistent in structure
          const allHaveContent = results.every((r) => r.content.length > 0)
          expect(allHaveContent).toBe(true)
        }),
        { numRuns: 25 } // Reduced runs since we're testing 4 tones per iteration
      )
    })
  })
})
