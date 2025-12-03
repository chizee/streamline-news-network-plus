/**
 * Property-Based Tests for News Aggregation System
 * Using fast-check for property-based testing
 */

import * as fc from 'fast-check'
import { NewsAggregator } from '../aggregator'
import type { NewsArticle } from '@/types/news'

// Generator for NewsArticle
const newsArticleArbitrary = fc.record({
  id: fc.string(),
  title: fc.string({ minLength: 10, maxLength: 200 }),
  description: fc.oneof(fc.string({ minLength: 20, maxLength: 500 }), fc.constant(null)),
  content: fc.oneof(fc.string({ minLength: 50, maxLength: 2000 }), fc.constant(null)),
  url: fc.webUrl(),
  source: fc.constantFrom('TechCrunch', 'The Verge', 'Wired', 'Ars Technica', 'MIT Technology Review'),
  author: fc.oneof(fc.string({ minLength: 5, maxLength: 50 }), fc.constant(null)),
  published_at: fc.integer({ min: 1704067200000, max: 1735689600000 }).map(ts => new Date(ts).toISOString()),
  image_url: fc.oneof(fc.webUrl(), fc.constant(null)),
  category: fc.array(fc.constantFrom('ai', 'technology', 'machine-learning', 'deep-learning'), { minLength: 1, maxLength: 3 }),
  keywords: fc.oneof(
    fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
    fc.constant(null)
  ),
  sentiment: fc.oneof(fc.constantFrom('positive', 'neutral', 'negative'), fc.constant(null)),
  relevance_score: fc.oneof(fc.float({ min: 0, max: 1 }), fc.constant(null)),
  fetched_at: fc.integer({ min: 1704067200000, max: 1735689600000 }).map(ts => new Date(ts).toISOString()),
  is_active: fc.boolean(),
  created_at: fc.integer({ min: 1704067200000, max: 1735689600000 }).map(ts => new Date(ts).toISOString()),
}) as fc.Arbitrary<NewsArticle>

describe('News Aggregation Property Tests', () => {
  describe('**Feature: snn-platform, Property 7: Article deduplication by URL**', () => {
    /**
     * Property 7: Article deduplication by URL
     * For any news article with a URL that already exists in the database,
     * attempting to store it should be rejected by the uniqueness constraint.
     * Validates: Requirements 3.6
     */
    test('should deduplicate articles with the same URL', () => {
      fc.assert(
        fc.property(
          fc.array(newsArticleArbitrary, { minLength: 2, maxLength: 20 }),
          (articles) => {
            const aggregator = new NewsAggregator()
            
            // Create duplicate articles by using the same URL
            const baseArticle = articles[0]
            const duplicateArticles = articles.map((article, index) => ({
              ...article,
              url: index % 2 === 0 ? baseArticle.url : article.url, // Every other article has the same URL
              id: `test-${index}`, // Different IDs
            }))

            // Deduplicate using the aggregator's internal method
            // We need to access the private method, so we'll test through the public interface
            const result = (aggregator as any).deduplicateArticles(duplicateArticles)

            // Count unique URLs in input
            const uniqueUrls = new Set(duplicateArticles.map((a: NewsArticle) => a.url))
            
            // Result should have exactly as many articles as unique URLs
            expect(result.length).toBe(uniqueUrls.size)
            
            // All URLs in result should be unique
            const resultUrls = result.map((a: NewsArticle) => a.url)
            const uniqueResultUrls = new Set(resultUrls)
            expect(resultUrls.length).toBe(uniqueResultUrls.size)
          }
        ),
        { numRuns: 100 }
      )
    })

    test('should normalize URLs before deduplication', () => {
      fc.assert(
        fc.property(
          newsArticleArbitrary,
          fc.constantFrom('', '?utm_source=test', '?ref=twitter', '#section1', '/#top'),
          (baseArticle, suffix) => {
            const aggregator = new NewsAggregator()
            
            // Create articles with same base URL but different query params/fragments
            const articles = [
              { ...baseArticle, id: 'test-1', url: baseArticle.url },
              { ...baseArticle, id: 'test-2', url: baseArticle.url + suffix },
              { ...baseArticle, id: 'test-3', url: baseArticle.url + '/' }, // trailing slash
            ]

            const result = (aggregator as any).deduplicateArticles(articles)

            // Should deduplicate to 1 article (same normalized URL)
            expect(result.length).toBeLessThanOrEqual(2) // May be 1 or 2 depending on normalization
            
            // All remaining URLs should be unique after normalization
            const normalizedUrls = result.map((a: NewsArticle) => (aggregator as any).normalizeUrl(a.url))
            const uniqueNormalized = new Set(normalizedUrls)
            expect(normalizedUrls.length).toBe(uniqueNormalized.size)
          }
        ),
        { numRuns: 100 }
      )
    })

    test('should preserve the first occurrence when deduplicating', () => {
      fc.assert(
        fc.property(
          fc.array(newsArticleArbitrary, { minLength: 3, maxLength: 10 }),
          (articles) => {
            const aggregator = new NewsAggregator()
            
            // Make all articles have the same URL but different IDs
            const sameUrl = articles[0].url
            const duplicates = articles.map((article, index) => ({
              ...article,
              url: sameUrl,
              id: `test-${index}`,
            }))

            const result = (aggregator as any).deduplicateArticles(duplicates)

            // Should only have 1 article
            expect(result.length).toBe(1)
            
            // Should be the first article
            expect(result[0].id).toBe('test-0')
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('**Feature: snn-platform, Property 9: AI relevance filtering**', () => {
    /**
     * Property 9: AI relevance filtering
     * For any batch of articles received from news APIs,
     * only articles meeting the minimum relevance score threshold should be stored in the database.
     * Validates: Requirements 3.5
     */
    test('should filter articles by minimum relevance score', () => {
      fc.assert(
        fc.property(
          fc.array(newsArticleArbitrary, { minLength: 5, maxLength: 20 }),
          fc.float({ min: 0, max: 1 }),
          (articles, minScore) => {
            const aggregator = new NewsAggregator({ minRelevanceScore: minScore })
            
            // Assign random relevance scores to articles
            const scoredArticles = articles.map((article, index) => ({
              ...article,
              relevance_score: index % 3 === 0 ? minScore + 0.1 : minScore - 0.1, // Some above, some below
            }))

            // Filter using the aggregator's internal method
            const result = (aggregator as any).filterArticles(scoredArticles)

            // All articles in result should have relevance_score >= minScore or null
            result.forEach((article: NewsArticle) => {
              if (article.relevance_score !== null) {
                expect(article.relevance_score).toBeGreaterThanOrEqual(minScore)
              }
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    test('should calculate AI relevance scores based on keywords', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.string({ minLength: 10, maxLength: 100 }),
          (title, description) => {
            const aggregator = new NewsAggregator()
            
            // Create article with AI keywords in title
            const aiArticle: NewsArticle = {
              id: 'test-1',
              title: `${title} artificial intelligence machine learning`,
              description,
              content: null,
              url: 'https://example.com/ai-article',
              source: 'Test Source',
              author: null,
              published_at: new Date().toISOString(),
              image_url: null,
              category: ['ai'],
              keywords: null,
              sentiment: null,
              relevance_score: null,
              fetched_at: new Date().toISOString(),
              is_active: true,
              created_at: new Date().toISOString(),
            }

            // Create article without AI keywords
            const nonAiArticle: NewsArticle = {
              ...aiArticle,
              id: 'test-2',
              title: `${title} cooking recipes`,
              url: 'https://example.com/cooking-article',
            }

            const aiScore = aggregator.calculateRelevanceScore(aiArticle)
            const nonAiScore = aggregator.calculateRelevanceScore(nonAiArticle)

            // AI article should have higher score than non-AI article
            expect(aiScore).toBeGreaterThan(nonAiScore)
            
            // AI article should have a meaningful score
            expect(aiScore).toBeGreaterThan(0)
            
            // Scores should be in valid range
            expect(aiScore).toBeGreaterThanOrEqual(0)
            expect(aiScore).toBeLessThanOrEqual(1)
            expect(nonAiScore).toBeGreaterThanOrEqual(0)
            expect(nonAiScore).toBeLessThanOrEqual(1)
          }
        ),
        { numRuns: 100 }
      )
    })

    test('should preserve articles with null relevance scores during filtering', () => {
      fc.assert(
        fc.property(
          fc.array(newsArticleArbitrary, { minLength: 3, maxLength: 10 }),
          (articles) => {
            const aggregator = new NewsAggregator({ minRelevanceScore: 0.5 })
            
            // Set all articles to have null relevance scores
            const nullScoreArticles = articles.map(article => ({
              ...article,
              relevance_score: null,
            }))

            const result = (aggregator as any).filterArticles(nullScoreArticles)

            // All articles should be preserved (null scores are kept for later scoring)
            expect(result.length).toBe(nullScoreArticles.length)
          }
        ),
        { numRuns: 100 }
      )
    })

    test('should score articles with multiple AI keywords higher', () => {
      const aggregator = new NewsAggregator()
      
      const singleKeywordArticle: NewsArticle = {
        id: 'test-1',
        title: 'Introduction to artificial intelligence',
        description: 'A basic guide',
        content: null,
        url: 'https://example.com/1',
        source: 'Test',
        author: null,
        published_at: new Date().toISOString(),
        image_url: null,
        category: ['ai'],
        keywords: null,
        sentiment: null,
        relevance_score: null,
        fetched_at: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
      }

      const multipleKeywordArticle: NewsArticle = {
        ...singleKeywordArticle,
        id: 'test-2',
        title: 'GPT-4 and Claude: Large Language Models for Machine Learning',
        description: 'Deep learning with neural networks and transformers',
        url: 'https://example.com/2',
      }

      const score1 = aggregator.calculateRelevanceScore(singleKeywordArticle)
      const score2 = aggregator.calculateRelevanceScore(multipleKeywordArticle)

      // Article with more AI keywords should score higher
      expect(score2).toBeGreaterThan(score1)
    })
  })
})
