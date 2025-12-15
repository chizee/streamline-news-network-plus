'use client'

import { createContext, useContext, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@supabase/supabase-js'

const AuthContext = createContext<{ user: User | null }>({ user: null })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setPreferences, setLoading } = useAuthStore()
  const supabase = createClient()

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile) {
        setProfile(profile)
      }

      // Fetch preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (preferences) {
        setPreferences(preferences)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }, [supabase, setProfile, setPreferences])

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)
          await fetchUserData(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
          setPreferences(null)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await fetchUserData(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setPreferences(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchUserData, supabase.auth, setUser, setProfile, setPreferences, setLoading])

  return <AuthContext.Provider value={{ user: useAuthStore.getState().user }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
