'use client'

import { useState } from 'react'
import { storySubmissionSchema, StorySubmissionInput } from '@/lib/validation'

interface StorySubmissionFormProps {
  onSuccess: () => void
  onError: (error: string) => void
}

export default function StorySubmissionForm({ onSuccess, onError }: StorySubmissionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<StorySubmissionInput>({
    title: '',
    author_name: '',
    author_email: '',
    author_role: '',
    author_region: '',
    story_text: '',
    video_url: '',
    image_url: '',
    category: 'testimony',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate
      const validated = storySubmissionSchema.parse(formData)

      const response = await fetch('/api/stories/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      })

      const result = await response.json()

      if (result.success) {
        onSuccess()
        setFormData({
          title: '',
          author_name: '',
          author_email: '',
          author_role: '',
          author_region: '',
          story_text: '',
          video_url: '',
          image_url: '',
          category: 'testimony',
        })
      } else {
        onError(result.error || 'Failed to submit story')
      }
    } catch (error: any) {
      onError(error.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border-2 border-[#1a5f3f] rounded-lg p-8">
      <h3 className="text-2xl font-semibold text-[#1a5f3f] mb-6">Share Your Story</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Story Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="author_name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              id="author_name"
              value={formData.author_name}
              onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
            />
          </div>
          <div>
            <label htmlFor="author_email" className="block text-sm font-medium text-gray-700 mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              id="author_email"
              value={formData.author_email || ''}
              onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="author_role" className="block text-sm font-medium text-gray-700 mb-1">
              Your Role (Optional)
            </label>
            <input
              type="text"
              id="author_role"
              value={formData.author_role || ''}
              onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
            />
          </div>
          <div>
            <label htmlFor="author_region" className="block text-sm font-medium text-gray-700 mb-1">
              Region (Optional)
            </label>
            <input
              type="text"
              id="author_region"
              value={formData.author_region || ''}
              onChange={(e) => setFormData({ ...formData, author_region: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
          >
            <option value="testimony">Testimony</option>
            <option value="impact">Impact</option>
            <option value="farmer">Farmer Story</option>
            <option value="chef">Chef Story</option>
            <option value="community">Community Story</option>
            <option value="partner">Partner Story</option>
          </select>
        </div>

        <div>
          <label htmlFor="story_text" className="block text-sm font-medium text-gray-700 mb-1">
            Your Story *
          </label>
          <textarea
            id="story_text"
            value={formData.story_text}
            onChange={(e) => setFormData({ ...formData, story_text: e.target.value })}
            required
            rows={8}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
            placeholder="Tell us your story... (minimum 50 characters)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 mb-1">
              Video URL (Optional)
            </label>
            <input
              type="url"
              id="video_url"
              value={formData.video_url || ''}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="YouTube or Vimeo URL"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
            />
          </div>
          <div>
            <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL (Optional)
            </label>
            <input
              type="url"
              id="image_url"
              value={formData.image_url || ''}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="Image URL"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-[#1a5f3f] text-white rounded-lg font-semibold hover:bg-[#154a32] transition disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Story'}
        </button>
      </form>
    </div>
  )
}

