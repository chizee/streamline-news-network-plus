'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileForm } from './ProfileForm'
import { PreferencesForm } from './PreferencesForm'
import { SocialConnectionsManager } from '@/components/social/SocialConnectionsManager'
import type { Tables } from '@/types/database'

interface SettingsTabsProps {
  profile: Tables<'profiles'> | null
  preferences: Tables<'user_preferences'> | null
  userId: string
}

export function SettingsTabs({ profile, preferences, userId }: SettingsTabsProps) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="bg-[#1a1f3a] border-gray-800">
        <TabsTrigger value="profile" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-gray-400">Profile</TabsTrigger>
        <TabsTrigger value="preferences" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-gray-400">Preferences</TabsTrigger>
        <TabsTrigger value="social" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 text-gray-400">Social Accounts</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-6">
        <ProfileForm profile={profile} userId={userId} />
      </TabsContent>
      <TabsContent value="preferences" className="mt-6">
        <PreferencesForm preferences={preferences} userId={userId} />
      </TabsContent>
      <TabsContent value="social" className="mt-6">
        <SocialConnectionsManager />
      </TabsContent>
    </Tabs>
  )
}
