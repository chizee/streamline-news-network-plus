import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ScheduledPostsList } from '@/components/schedule'

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <div className="container mx-auto p-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Scheduled Posts</h1>
            <p className="text-gray-400 mt-2">
              Manage your scheduled social media posts
            </p>
          </div>
        </div>

        <ScheduledPostsList />
      </div>
    </div>
  )
}

