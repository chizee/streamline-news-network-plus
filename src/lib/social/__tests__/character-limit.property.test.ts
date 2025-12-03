/**
 * Property-Based Tests for Character Limit Validation
 * 
 * Feature: social-publishing, Property 6: Character Limit Validation
 * Validates: Requirements 6.4, 7.1, 7.2, 7.3, 7.4
 */

import { describe, it, expect, beforeEach } from 'vitest'
import fc from 'fast-check'
import { TwitterClient } from '../twitter-client'
import { FacebookClient } from '../facebook-client'
import { InstagramClient } from '../instagram-client'
import { ThreadsClient } from '../threads-client'

describe('Property 6: Character Limit Validation', () => {
  beforeEach(() => {
    // Mock environment variables
    process.env.TWITTER_CLIENT_ID = 'test-twitter-id'
    process.env.TWITTER_CLIENT_SECRET = 'test-twitter-secret'
    process.env.TWITTER_CALLBACK_URL = 'http://localhost:3000/callback'
    
    process.env.FACEBOOK_APP_ID = 'test-facebook-id'
    process.env.FACEBOOK_APP_SECRET = 'test-facebook-secret'
    process.env.FACEBOOK_CALLBACK_URL = 'http://localhost:3000/callback'
    
    process.env.INSTAGRAM_APP_ID = 'test-instagram-id'
    process.env.INSTAGRAM_APP_SECRET = 'test-instagram-secret'
    process.env.INSTAGRAM_CALLBACK_URL = 'http://localhost:3000/callback'
    
    process.env.THREADS_APP_ID = 'test-threads-id'
    process.env.THREADS_APP_SECRET = 'test-threads-secret'
    process.env.THREADS_CALLBACK_URL = 'http://localhost:3000/callback'
  })

  it('Twitter should reject content exceeding 280 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 281, maxLength: 500 }),
        (content) => {
          const client = new TwitterClient()
          const isValid = client.validateContent(content)
          
          expect(isValid).toBe(false)
          expect(content.length).toBeGreaterThan(280)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Twitter should accept content within 280 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 280 }),
        (content) => {
          const client = new TwitterClient()
          const isValid = client.validateContent(content)
          
          expect(isValid).toBe(true)
          expect(content.length).toBeLessThanOrEqual(280)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Facebook should accept content within 63,206 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 1000 }), // Testing smaller range for performance
        (content) => {
          const client = new FacebookClient()
          const isValid = client.validateContent(content)
          
          expect(isValid).toBe(true)
          expect(content.length).toBeLessThanOrEqual(63206)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Instagram should reject content exceeding 2,200 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 2201, maxLength: 3000 }),
        (content) => {
          const client = new InstagramClient()
          const isValid = client.validateContent(content)
          
          expect(isValid).toBe(false)
          expect(content.length).toBeGreaterThan(2200)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Instagram should accept content within 2,200 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 2200 }),
        (content) => {
          const client = new InstagramClient()
          const isValid = client.validateContent(content)
          
          expect(isValid).toBe(true)
          expect(content.length).toBeLessThanOrEqual(2200)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Threads should reject content exceeding 500 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 501, maxLength: 1000 }),
        (content) => {
          const client = new ThreadsClient()
          const isValid = client.validateContent(content)
          
          expect(isValid).toBe(false)
          expect(content.length).toBeGreaterThan(500)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('Threads should accept content within 500 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }),
        (content) => {
          const client = new ThreadsClient()
          const isValid = client.validateContent(content)
          
          expect(isValid).toBe(true)
          expect(content.length).toBeLessThanOrEqual(500)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('empty content should be rejected by all platforms', () => {
    const clients = [
      new TwitterClient(),
      new FacebookClient(),
      new InstagramClient(),
      new ThreadsClient(),
    ]

    clients.forEach((client) => {
      expect(client.validateContent('')).toBe(false)
    })
  })

  it('content at exact character limit should be accepted', () => {
    const testCases = [
      { client: new TwitterClient(), limit: 280 },
      { client: new FacebookClient(), limit: 63206 },
      { client: new InstagramClient(), limit: 2200 },
      { client: new ThreadsClient(), limit: 500 },
    ]

    testCases.forEach(({ client, limit }) => {
      const content = 'a'.repeat(limit)
      expect(client.validateContent(content)).toBe(true)
      expect(content.length).toBe(limit)
    })
  })

  it('content one character over limit should be rejected', () => {
    const testCases = [
      { client: new TwitterClient(), limit: 280 },
      { client: new InstagramClient(), limit: 2200 },
      { client: new ThreadsClient(), limit: 500 },
    ]

    testCases.forEach(({ client, limit }) => {
      const content = 'a'.repeat(limit + 1)
      expect(client.validateContent(content)).toBe(false)
      expect(content.length).toBe(limit + 1)
    })
  })

  it('character limit should be consistent across multiple validations', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 1000 }),
        (content) => {
          const client = new TwitterClient()
          
          // Validate multiple times
          const result1 = client.validateContent(content)
          const result2 = client.validateContent(content)
          const result3 = client.validateContent(content)
          
          // Results should be consistent
          expect(result1).toBe(result2)
          expect(result2).toBe(result3)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('getCharacterLimit should return correct limits for each platform', () => {
    const expectedLimits = {
      twitter: 280,
      facebook: 63206,
      instagram: 2200,
      threads: 500,
    }

    expect(new TwitterClient().getCharacterLimit()).toBe(expectedLimits.twitter)
    expect(new FacebookClient().getCharacterLimit()).toBe(expectedLimits.facebook)
    expect(new InstagramClient().getCharacterLimit()).toBe(expectedLimits.instagram)
    expect(new ThreadsClient().getCharacterLimit()).toBe(expectedLimits.threads)
  })
})
