'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Story } from '@/types/launch'

interface StoriesDashboardClientProps {
  initialData: {
    stories: Story[]
  }
}

export default function StoriesDashboardClient({ initialData }: StoriesDashboardClientProps) {
  const router = useRouter()
  const [stories, setStories] = useState(initialData.stories)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'featured'>('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const filteredStories = filter === 'all'
    ? stories
    : filter === 'pending'
    ? stories.filter(s => !s.is_approved)
    : filter === 'approved'
    ? stories.filter(s => s.is_approved && !s.is_featured)
    : stories.filter(s => s.is_featured)

  const handleApprove = async (storyId: string) => {
    try {
      const response = await fetch(`/api/admin/stories/${storyId}/approve`, {
        method: 'POST',
      })
      const result = await response.json()
      if (result.success) {
        setMessage({ type: 'success', text: 'Story approved!' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to approve story' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
    }
  }

  const handleFeature = async (storyId: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/admin/stories/${storyId}/feature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: featured }),
      })
      const result = await response.json()
      if (result.success) {
        setMessage({ type: 'success', text: featured ? 'Story featured!' : 'Story unfeatured!' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update story' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
    }
  }

  const handlePublish = async (storyId: string, publish: boolean) => {
    try {
      const response = await fetch(`/api/admin/stories/${storyId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: publish }),
      })
      const result = await response.json()
      if (result.success) {
        setMessage({ type: 'success', text: publish ? 'Story published!' : 'Story unpublished!' })
        router.refresh()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update story' })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' })
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'featured'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === f
                ? 'bg-[#1a5f3f] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? stories.length : filteredStories.length})
          </button>
        ))}
      </div>

      {/* Stories List */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-[#1a5f3f] mb-4 pb-2 border-b border-[#FFBC00]">
          Stories
        </h2>
        {filteredStories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No stories found.</p>
        ) : (
          <div className="space-y-4">
            {filteredStories.map((story) => (
              <div key={story.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#1a5f3f] mb-2">{story.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      By {story.author_name}
                      {story.author_region && ` • ${story.author_region}`}
                      {story.author_role && ` • ${story.author_role}`}
                    </p>
                    <p className="text-gray-700 line-clamp-3 mb-2">{story.story_text}</p>
                    <div className="flex gap-2 mt-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                        story.category === 'testimony' ? 'bg-blue-100 text-blue-800' :
                        story.category === 'impact' ? 'bg-green-100 text-green-800' :
                        story.category === 'farmer' ? 'bg-yellow-100 text-yellow-800' :
                        story.category === 'chef' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {story.category}
                      </span>
                      {story.is_featured && (
                        <span className="px-2 py-1 bg-[#FFBC00] text-[#1a5f3f] rounded-full text-xs font-semibold">
                          Featured
                        </span>
                      )}
                      {story.is_approved && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Approved
                        </span>
                      )}
                      {story.is_public && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {!story.is_approved && (
                    <button
                      onClick={() => handleApprove(story.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                  )}
                  {story.is_approved && (
                    <>
                      <button
                        onClick={() => handleFeature(story.id, !story.is_featured)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                          story.is_featured
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-[#FFBC00] text-[#1a5f3f] hover:bg-gold-dark'
                        }`}
                      >
                        {story.is_featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        onClick={() => handlePublish(story.id, !story.is_public)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                          story.is_public
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {story.is_public ? 'Unpublish' : 'Publish'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
