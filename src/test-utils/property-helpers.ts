import * as fc from 'fast-check'

/**
 * Property-based testing helpers and custom arbitraries
 */

// Custom arbitraries for common domain types
export const arbitraries = {
  // User-related
  email: () => fc.emailAddress(),
  username: () => fc.stringMatching(/^[a-zA-Z0-9_]{3,20}$/),
  password: () => fc.string({ minLength: 8, maxLength: 128 }),
  
  // Content-related
  articleTitle: () => fc.string({ minLength: 10, maxLength: 200 }),
  articleContent: () => fc.string({ minLength: 100, maxLength: 5000 }),
  url: () => fc.webUrl(),
  
  // Social media platforms
  platform: () => fc.constantFrom('linkedin', 'twitter', 'instagram', 'facebook', 'threads'),
  tone: () => fc.constantFrom('professional', 'friendly', 'witty', 'formal'),
  
  // Dates
  recentDate: () => fc.date({ min: new Date(Date.now() - 48 * 60 * 60 * 1000), max: new Date() }),
  futureDate: () => fc.date({ min: new Date(), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }),
  
  // IDs
  uuid: () => fc.uuid(),
  
  // Content constraints
  linkedInContent: () => fc.string({ minLength: 1300, maxLength: 3000 }),
  twitterContent: () => fc.string({ minLength: 1, maxLength: 280 }),
  instagramHashtags: () => fc.array(fc.stringMatching(/^#[a-zA-Z0-9_]+$/), { minLength: 10, maxLength: 15 }),
  
  // News article
  newsArticle: () => fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 10, maxLength: 200 }),
    content: fc.string({ minLength: 100, maxLength: 5000 }),
    url: fc.webUrl(),
    source: fc.string({ minLength: 3, maxLength: 50 }),
    published_at: fc.date({ min: new Date(Date.now() - 48 * 60 * 60 * 1000), max: new Date() }).map(d => d.toISOString()),
    category: fc.constantFrom('technology', 'business', 'science', 'health', 'entertainment'),
  }),
}

// Helper to run property tests with consistent configuration
export const testProperty = (name: string, property: fc.IProperty<unknown>) => {
  it(name, () => {
    fc.assert(property, { numRuns: 100 })
  })
}
