'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Tables } from '@/types/database'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const preferencesSchema = z.object({
  notificationEmail: z.boolean(),
  notificationPush: z.boolean(),
  notificationWeeklyDigest: z.boolean(),
  notificationBreakingNews: z.boolean(),
  contentTone: z.enum(['professional', 'friendly', 'witty', 'formal']),
  preferredPlatforms: z.array(z.string()),
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type PreferencesFormData = z.infer<typeof preferencesSchema>

interface PreferencesFormProps {
  preferences: Tables<'user_preferences'> | null
  userId: string
}

export function PreferencesForm({ preferences, userId }: PreferencesFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [notificationEmail, setNotificationEmail] = useState(preferences?.notification_email ?? true)
  const [notificationPush, setNotificationPush] = useState(preferences?.notification_push ?? true)
  const [notificationWeeklyDigest, setNotificationWeeklyDigest] = useState(
    preferences?.notification_weekly_digest ?? true
  )
  const [notificationBreakingNews, setNotificationBreakingNews] = useState(
    preferences?.notification_breaking_news ?? true
  )
  const [contentTone, setContentTone] = useState<string>(preferences?.content_tone || 'professional')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    preferences?.preferred_platforms || ['linkedin', 'twitter']
  )

  const platforms = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'threads', label: 'Threads' },
  ]

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    )
  }

  const handleSave = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('user_preferences')
        .update({
          notification_email: notificationEmail,
          notification_push: notificationPush,
          notification_weekly_digest: notificationWeeklyDigest,
          notification_breaking_news: notificationBreakingNews,
          content_tone: contentTone,
          preferred_platforms: selectedPlatforms,
        })
        .eq('user_id', userId)

      if (error) {
        setMessage({ type: 'error', text: error.message })
        return
      }

      setMessage({ type: 'success', text: 'Preferences updated successfully!' })
      router.refresh()
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a1f3a] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Notifications</CardTitle>
          <CardDescription className="text-gray-400">Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-gray-300">Email Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              id="email-notifications"
              checked={notificationEmail}
              onCheckedChange={setNotificationEmail}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications" className="text-gray-300">Push Notifications</Label>
              <p className="text-sm text-gray-500">Receive push notifications</p>
            </div>
            <Switch
              id="push-notifications"
              checked={notificationPush}
              onCheckedChange={setNotificationPush}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weekly-digest" className="text-gray-300">Weekly Digest</Label>
              <p className="text-sm text-gray-500">Get a weekly summary of top news</p>
            </div>
            <Switch
              id="weekly-digest"
              checked={notificationWeeklyDigest}
              onCheckedChange={setNotificationWeeklyDigest}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="breaking-news" className="text-gray-300">Breaking News Alerts</Label>
              <p className="text-sm text-gray-500">Get notified about breaking AI news</p>
            </div>
            <Switch
              id="breaking-news"
              checked={notificationBreakingNews}
              onCheckedChange={setNotificationBreakingNews}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a1f3a] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Content Preferences</CardTitle>
          <CardDescription className="text-gray-400">Customize your content generation settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="content-tone" className="text-gray-300">Default Content Tone</Label>
            <Select value={contentTone} onValueChange={setContentTone}>
              <SelectTrigger id="content-tone" className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f3a] border-gray-700">
                <SelectItem value="professional" className="text-white focus:bg-purple-500/20">Professional</SelectItem>
                <SelectItem value="friendly" className="text-white focus:bg-purple-500/20">Friendly</SelectItem>
                <SelectItem value="witty" className="text-white focus:bg-purple-500/20">Witty</SelectItem>
                <SelectItem value="formal" className="text-white focus:bg-purple-500/20">Formal</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              This tone will be used by default when generating content
            </p>
          </div>

          <div className="grid gap-2">
            <Label className="text-gray-300">Preferred Platforms</Label>
            <div className="space-y-2">
              {platforms.map((platform) => (
                <div key={platform.value} className="flex items-center space-x-2">
                  <Switch
                    id={platform.value}
                    checked={selectedPlatforms.includes(platform.value)}
                    onCheckedChange={() => togglePlatform(platform.value)}
                  />
                  <Label htmlFor={platform.value} className="font-normal text-gray-300">
                    {platform.label}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Select platforms you want to generate content for
            </p>
          </div>
        </CardContent>
      </Card>

      {message && (
        <div
          className={`rounded-md p-3 ${
            message.type === 'success' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
          }`}
        >
          <p
            className={`text-sm ${
              message.type === 'success' ? 'text-green-300' : 'text-red-300'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      <Button onClick={handleSave} disabled={isLoading} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90">
        {isLoading ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  )
}
