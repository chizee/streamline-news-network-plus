'use client'

import React, { useState } from 'react'
import { Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface ScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contentId: string
  platform: string
  onScheduled?: () => void
}

export function ScheduleDialog({
  open,
  onOpenChange,
  contentId,
  platform,
  onScheduled,
}: ScheduleDialogProps) {
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState('09:00')
  const [isLoading, setIsLoading] = useState(false)

  const handleSchedule = async () => {
    if (!date) {
      toast.error('Please select a date')
      return
    }

    // Combine date and time
    const [hours, minutes] = time.split(':')
    const scheduledDate = new Date(date)
    scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    // Check if date is in the future
    if (scheduledDate <= new Date()) {
      toast.error('Please select a future date and time')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: contentId,
          platform,
          scheduled_for: scheduledDate.toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to schedule post')
      }

      toast.success('Post scheduled successfully!')
      onOpenChange(false)
      onScheduled?.()
      
      // Reset form
      setDate(undefined)
      setTime('09:00')
    } catch (error) {
      console.error('Error scheduling post:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to schedule post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] bg-gradient-to-br from-[#1a1f3a]/95 to-[#0f1229]/95 backdrop-blur-xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20 flex flex-col">
        <DialogHeader className="space-y-2 flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-white">Schedule Post</DialogTitle>
          <DialogDescription className="text-gray-300 text-sm">
            Choose when you want this post to be published to {platform}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4 overflow-y-auto flex-1 pr-2">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label className="text-white font-semibold text-sm">Date</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                captionLayout="dropdown"
                fromYear={new Date().getFullYear()}
                toYear={new Date().getFullYear() + 5}
                className="rounded-lg border-2 border-purple-500/30 bg-[#0a0e27]/80 backdrop-blur-sm shadow-lg shadow-purple-500/10 scale-95"
              />
            </div>
          </div>

          {/* Time Picker */}
          <div className="space-y-2">
            <Label htmlFor="time" className="text-white font-semibold text-sm">Time</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400 flex-shrink-0" />
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger id="time" className="h-10 bg-[#0a0e27]/80 backdrop-blur-sm border-2 border-purple-500/30 text-white hover:border-purple-400 transition-colors text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1f3a] border-2 border-purple-500/30 backdrop-blur-xl max-h-[250px]">
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                    <React.Fragment key={hour}>
                      <SelectItem 
                        value={`${hour.toString().padStart(2, '0')}:00`}
                        className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20 py-2"
                      >
                        {`${hour.toString().padStart(2, '0')}:00`}
                      </SelectItem>
                      <SelectItem 
                        value={`${hour.toString().padStart(2, '0')}:30`}
                        className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20 py-2"
                      >
                        {`${hour.toString().padStart(2, '0')}:30`}
                      </SelectItem>
                    </React.Fragment>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          {date && (
            <div className="rounded-lg bg-purple-500/10 backdrop-blur-sm border-2 border-purple-500/30 p-4 shadow-lg shadow-purple-500/10">
              <p className="text-xs text-purple-300 mb-1 font-medium">Scheduled for:</p>
              <p className="font-semibold text-white text-base">
                {format(date, 'EEEE, MMMM d, yyyy')} at {time}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 flex-shrink-0 pt-3 border-t border-purple-500/20">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isLoading}
            className="h-10 px-4 bg-[#0a0e27]/80 backdrop-blur-sm border-2 border-purple-500/30 text-white hover:bg-purple-500/20 hover:border-purple-400 transition-all text-sm"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSchedule} 
            disabled={!date || isLoading}
            className="h-10 px-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border-2 border-purple-400 shadow-lg shadow-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/60 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? 'Scheduling...' : 'Schedule Post'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

