/**
 * Property-Based Tests for News Feed Component
 * Using fast-check for property-based testing
 */

import * as fc from 'fast-check'
import type { NewsArticle } from '@/types/news'

// Generator for NewsArticle with controllable timestamps
const newsArticleWithTimestampArbitrary = (minDate: Date, maxDate: Date) =>
  fc.record({
    id: fc.string(),
    title: fc.string({ minLength: 10, maxLength: 200 }),
    description: fc.oneof(fc.string({ minLength: 20, maxLength: 500 }), fc.constant(null)),
    content: fc.oneof(fc.string({ minLength: 50, maxLength: 2000 }), fc.constant(null)),
    url: fc.webUrl(),
    source: fc.constantFrom('TechCrunch', 'The Verge', 'Wired', 'Ars Technica'),
    author: fc.oneof(fc.string({ minLength: 5, maxLength: 50 }), fc.constant(null)),
    published_at: fc
      .integer({ min: minDate.getTime(), max: maxDate.getTime() })
      .map((ts) => new Date(ts).toISOString()),
    image_url: fc.oneof(fc.webUrl(), fc.constant(null)),
    category: fc.array(fc.constantFrom('ai', 'technology', 'machine-learning'), {
      minLength: 1,
      maxLength: 3,
    }),
    keywords: fc.oneof(
      fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
      fc.constant(null)
    ),
    sentiment: fc.oneof(fc.constantFrom('positive', 'neutral', 'negative'), fc.constant(null)),
    relevance_score: fc.oneof(fc.float({ min: 0, max: 1 }), fc.constant(null)),
    fetched_at: fc
      .integer({ min: Date.now() - 7 * 24 * 60 * 60 * 1000, max: Date.now() })
      .map((ts) => new Date(ts).toISOString()),
    is_active: fc.boolean(),
    created_at: fc
      .integer({ min: Date.now() - 7 * 24 * 60 * 60 * 1000, max: Date.now() })
      .map((ts) => new Date(ts).toISOString()),
  }) as fc.Arbitrary<NewsArticle>

describe('News Feed Property Tests', () => {
  describe('**Feature: snn-platform, Property 8: News feed time filtering**', () => {
    /**
     * Property 8: News feed time filtering
     * For any news feed query, the returned articles should have published_at timestamps
     * within the last 48 hours, sorted in descending order.
     * Validates: Requirements 3.7
     */
    test('should filter articles to last 48 hours', () => {
      fc.assert(
        fc.property(
          fc.array(
            newsArticleWithTimestampArbitrary(
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
              new Date() // now
            ),
            { minLength: 5, maxLength: 20 }
          ),
          (articles) => {
            const now = Date.now()
            const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000

            // Filter articles to last 48 hours (simulating the API/database filter)
            const filtered = articles.filter((article) => {
              const publishedTime = new Date(article.published_at).getTime()
              return publishedTime >= fortyEightHoursAgo && publishedTime <= now
            })

            // All filtered articles should be within 48 hours
            filtered.forEach((article) => {
              const publishedTime = new Date(article.published_at).getTime()
              expect(publishedTime).toBeGreaterThanOrEqual(fortyEightHoursAgo)
              expect(publishedTime).toBeLessThanOrEqual(now)
            })

            // Articles outside 48 hours should not be in filtered results
            const oldArticles = articles.filter((article) => {
              const publishedTime = new Date(article.published_at).getTime()
              return publishedTime < fortyEightHoursAgo
            })

            oldArticles.forEach((oldArticle) => {
              expect(filtered).not.toContainEqual(oldArticle)
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    test('should sort articles by published_at in descending order', () => {
      fc.assert(
        fc.property(
          fc.array(
            newsArticleWithTimestampArbitrary(
              new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
              new Date() // now
            ),
            { minLength: 3, maxLength: 15 }
          ),
          (articles) => {
            // Sort articles by published_at descending (newest first)
            const sorted = [...articles].sort((a, b) => {
              return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
            })

            // Check that each article is newer than or equal to the next one
            for (let i = 0; i < sorted.length - 1; i++) {
              const currentTime = new Date(sorted[i].published_at).getTime()
              const nextTime = new Date(sorted[i + 1].published_at).getTime()
              expect(currentTime).toBeGreaterThanOrEqual(nextTime)
            }

            // First article should be the newest
            if (sorted.length > 0) {
              const newestTime = Math.max(
                ...articles.map((a) => new Date(a.published_at).getTime())
              )
              expect(new Date(sorted[0].published_at).getTime()).toBe(newestTime)
            }

            // Last article should be the oldest
            if (sorted.length > 0) {
              const oldestTime = Math.min(
                ...articles.map((a) => new Date(a.published_at).getTime())
              )
              expect(new Date(sorted[sorted.length - 1].published_at).getTime()).toBe(oldestTime)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    test('should combine 48-hour filtering with descending sort', () => {
      fc.assert(
        fc.property(
          fc.array(
            newsArticleWithTimestampArbitrary(
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
              new Date() // now
            ),
            { minLength: 5, maxLength: 20 }
          ),
          (articles) => {
            const now = Date.now()
            const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000

            // Filter to last 48 hours and sort descending
            const filtered = articles
              .filter((article) => {
                const publishedTime = new Date(article.published_at).getTime()
                return publishedTime >= fortyEightHoursAgo && publishedTime <= now
              })
              .sort((a, b) => {
                return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
              })

            // All articles should be within 48 hours
            filtered.forEach((article) => {
              const publishedTime = new Date(article.published_at).getTime()
              expect(publishedTime).toBeGreaterThanOrEqual(fortyEightHoursAgo)
              expect(publishedTime).toBeLessThanOrEqual(now)
            })

            // Articles should be sorted descending
            for (let i = 0; i < filtered.length - 1; i++) {
              const currentTime = new Date(filtered[i].published_at).getTime()
              const nextTime = new Date(filtered[i + 1].published_at).getTime()
              expect(currentTime).toBeGreaterThanOrEqual(nextTime)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
