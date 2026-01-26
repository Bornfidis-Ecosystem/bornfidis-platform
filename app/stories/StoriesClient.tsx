'use client'

import { useState } from 'react'
import { Story } from '@/types/launch'
import StorySubmissionForm from './StorySubmissionForm'

interface StoriesClientProps {
  initialData: {
    stories: Story[]
    featured: Story[]
  }
}

export default function StoriesClient({ initialData }: StoriesClientProps) {
  const [stories, setStories] = useState(initialData.stories)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const featuredStories = initialData.featured
  const otherStories = stories.filter(s => !s.is_featured)

  const categories = ['all', 'testimony', 'impact', 'farmer', 'chef', 'community', 'partner'] as const
  const [selectedCategory, setSelectedCategory] = useState<'all' | Story['category']>('all')

  const filteredStories = selectedCategory === 'all'
    ? otherStories
    : otherStories.filter(s => s.category === selectedCategory)

  // Extract video ID from YouTube/Vimeo URLs
  const getVideoEmbedUrl = (url: string | null | undefined) => {
    if (!url) return null
    if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1]
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null
    }
    return url
  }

  return (
    <div className="space-y-12">
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

      {/* Featured Stories */}
      {featuredStories.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold text-[#1a5f3f] mb-6">Featured Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredStories.map((story) => {
              const videoEmbedUrl = getVideoEmbedUrl(story.video_url)
              return (
                <div key={story.id} className="bg-white border-2 border-[#d1fae5] rounded-lg p-6 shadow-sm">
                  {story.image_url && (
                    <img
                      src={story.image_url}
                      alt={story.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  {videoEmbedUrl && (
                    <div className="w-full mb-4 rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%', position: 'relative', height: 0 }}>
                      <iframe
                        src={videoEmbedUrl}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-[#1a5f3f] mb-2">{story.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{story.story_text}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {story.author_name}
                      {story.author_region && ` • ${story.author_region}`}
                    </p>
                    <span className="px-2 py-1 bg-[#FFBC00] text-[#1a5f3f] rounded-full text-xs font-semibold capitalize">
                      {story.category}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* All Stories */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-[#1a5f3f]">All Stories</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-2 bg-[#FFBC00] text-[#1a5f3f] rounded-lg font-semibold hover:bg-gold-dark transition"
          >
            {showForm ? 'Cancel' : 'Share Your Story'}
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === category
                  ? 'bg-[#1a5f3f] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Submission Form */}
        {showForm && (
          <div className="mb-8">
            <StorySubmissionForm
              onSuccess={() => {
                setShowForm(false)
                setMessage({ type: 'success', text: 'Story submitted! We will review it and publish if approved.' })
              }}
              onError={(error) => {
                setMessage({ type: 'error', text: error })
              }}
            />
          </div>
        )}

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            {selectedCategory === 'all' ? 'No stories yet. Be the first to share!' : `No ${selectedCategory} stories yet.`}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => {
              const videoEmbedUrl = getVideoEmbedUrl(story.video_url)
              return (
                <div key={story.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition">
                  {story.image_url && (
                    <img
                      src={story.image_url}
                      alt={story.title}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  {videoEmbedUrl && (
                    <div className="w-full mb-4 rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%', position: 'relative', height: 0 }}>
                      <iframe
                        src={videoEmbedUrl}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-[#1a5f3f] mb-2">{story.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{story.story_text}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {story.author_name}
                      {story.author_region && ` • ${story.author_region}`}
                    </p>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs capitalize">
                      {story.category}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
