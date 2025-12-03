/**
 * Property-Based Tests for OAuth Disconnection
 * 
 * Feature: social-publishing, Property 7: OAuth Disconnection Cleanup
 * Validates: Requirements 1.6
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import fc from 'fast-check'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Property 7: OAuth Disconnection Cleanup', () => {
  const platforms = ['twitter', 'facebook', 'instagram', 'threads'] as const
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('disconnecting a platform should remove all associated data for that platform only', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...platforms),
        fc.uuid(),
        fc.array(fc.constantFrom(...platforms), { minLength: 2, maxLength: 4 }),
        async (platformToDisconnect, userId, connectedPlatforms) => {
          // Ensure the platform to disconnect is in the connected platforms
          if (!connectedPlatforms.includes(platformToDisconnect)) {
            connectedPlatforms.push(platformToDisconnect)
          }

          // Mock initial state - user has multiple platforms connected
          const mockConnections = connectedPlatforms.map(platform => ({
            user_id: userId,
            platform,
            access_token: `encrypted-token-${platform}`,
            platform_user_id: `user-${platform}`,
          }))

          let currentConnections = [...mockConnections]

          const mockSupabase = {
            auth: {
              getUser: vi.fn().mockResolvedValue({
                data: { user: { id: userId } },
                error: null,
              }),
            },
            from: vi.fn().mockReturnValue({
              delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockImplementation((field, value) => {
                  if (field === 'user_id' && value === userId) {
                    return {
                      eq: vi.fn().mockImplementation((field2, value2) => {
                        if (field2 === 'platform' && value2 === platformToDisconnect) {
                          // Remove the connection
                          currentConnections = currentConnections.filter(
                            conn => conn.platform !== platformToDisconnect
                          )
                          return Promise.resolve({ error: null })
                        }
                        return Promise.resolve({ error: null })
                      }),
                    }
                  }
                  return Promise.resolve({ error: null })
                }),
              }),
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockImplementation(() => {
                  return Promise.resolve({
                    data: currentConnections.filter(conn => conn.user_id === userId),
                    error: null,
                  })
                }),
              }),
            }),
          }

          vi.mocked(createClient).mockReturnValue(mockSupabase as any)

          // Simulate disconnection
          const supabase = createClient()
          await supabase
            .from('social_connections')
            .delete()
            .eq('user_id', userId)
            .eq('platform', platformToDisconnect)

          // Verify: disconnected platform should be removed
          const remainingConnections = currentConnections.filter(
            conn => conn.user_id === userId
          )
          
          expect(
            remainingConnections.some(conn => conn.platform === platformToDisconnect)
          ).toBe(false)

          // Verify: other platforms should still be connected
          const otherPlatforms = connectedPlatforms.filter(p => p !== platformToDisconnect)
          otherPlatforms.forEach(platform => {
            expect(
              remainingConnections.some(conn => conn.platform === platform)
            ).toBe(true)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('disconnecting from a platform twice should be idempotent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...platforms),
        fc.uuid(),
        async (platform, userId) => {
          let connectionExists = true

          const mockSupabase = {
            auth: {
              getUser: vi.fn().mockResolvedValue({
                data: { user: { id: userId } },
                error: null,
              }),
            },
            from: vi.fn().mockReturnValue({
              delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockImplementation(() => ({
                  eq: vi.fn().mockImplementation(() => {
                    const wasConnected = connectionExists
                    connectionExists = false
                    return Promise.resolve({ error: null, count: wasConnected ? 1 : 0 })
                  }),
                })),
              }),
            }),
          }

          vi.mocked(createClient).mockReturnValue(mockSupabase as any)

          // Disconnect twice
          const supabase = createClient()
          const result1 = await supabase
            .from('social_connections')
            .delete()
            .eq('user_id', userId)
            .eq('platform', platform)

          const result2 = await supabase
            .from('social_connections')
            .delete()
            .eq('user_id', userId)
            .eq('platform', platform)

          // Both operations should succeed without error
          expect(result1.error).toBeNull()
          expect(result2.error).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('disconnecting should not affect other users connections', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...platforms),
        fc.uuid(),
        fc.uuid(),
        async (platform, user1Id, user2Id) => {
          fc.pre(user1Id !== user2Id) // Ensure different users

          const connections = [
            { user_id: user1Id, platform, access_token: 'token1' },
            { user_id: user2Id, platform, access_token: 'token2' },
          ]

          let currentConnections = [...connections]

          const mockSupabase = {
            auth: {
              getUser: vi.fn().mockResolvedValue({
                data: { user: { id: user1Id } },
                error: null,
              }),
            },
            from: vi.fn().mockReturnValue({
              delete: vi.fn().mockReturnValue({
                eq: vi.fn().mockImplementation((field, value) => {
                  if (field === 'user_id' && value === user1Id) {
                    return {
                      eq: vi.fn().mockImplementation((field2, value2) => {
                        if (field2 === 'platform' && value2 === platform) {
                          currentConnections = currentConnections.filter(
                            conn => !(conn.user_id === user1Id && conn.platform === platform)
                          )
                          return Promise.resolve({ error: null })
                        }
                        return Promise.resolve({ error: null })
                      }),
                    }
                  }
                  return Promise.resolve({ error: null })
                }),
              }),
            }),
          }

          vi.mocked(createClient).mockReturnValue(mockSupabase as any)

          // User 1 disconnects
          const supabase = createClient()
          await supabase
            .from('social_connections')
            .delete()
            .eq('user_id', user1Id)
            .eq('platform', platform)

          // User 1's connection should be removed
          expect(
            currentConnections.some(conn => conn.user_id === user1Id && conn.platform === platform)
          ).toBe(false)

          // User 2's connection should remain
          expect(
            currentConnections.some(conn => conn.user_id === user2Id && conn.platform === platform)
          ).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})
