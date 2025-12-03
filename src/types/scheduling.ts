export type ScheduleStatus = 'pending' | 'published' | 'failed' | 'cancelled'

export interface ScheduledPost {
  id: string
  user_id: string
  content_id: string
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'threads'
  scheduled_for: string
  status: ScheduleStatus
  published_at?: string | null
  error_message?: string | null
  created_at: string
  updated_at: string
}

export interface ScheduleRequest {
  content_id: string
  platform: string
  scheduled_for: string
}

export interface ScheduleWithContent extends ScheduledPost {
  content: {
    id: string
    generated_text: string
    platform: string
    tone: string
  }
}
