import { supabaseAdmin } from '@/lib/supabase'
import { Story } from '@/types/launch'

async function getDocumentaryData() {
  // Get stories with videos
  const { data: videoStories } = await supabaseAdmin
    .from('stories')
    .select('*')
    .eq('is_approved', true)
    .eq('is_public', true)
    .not('video_url', 'is', null)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    videoStories: (videoStories || []) as Story[],
  }
}

export default async function DocumentaryPage() {
  const documentaryData = await getDocumentaryData()

  // Extract video ID from YouTube/Vimeo URLs
  const getVideoEmbedUrl = (url: string) => {
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
    <div className="bg-white">
      {/* Header */}
      <header className="bg-[#1a5f3f] text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl font-bold mb-4">The Bornfidis Documentary</h1>
          <div className="h-1 w-32 bg-[#FFBC00] mx-auto mb-6"></div>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Watch the story of Bornfidis come to life through video testimonies and documentaries.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {documentaryData.videoStories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Video content coming soon!</p>
            <p className="text-gray-600">
              Check back soon for documentary videos and testimonies from the Bornfidis community.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {documentaryData.videoStories.map((story) => {
              const embedUrl = getVideoEmbedUrl(story.video_url!)
              if (!embedUrl) return null

              return (
                <div key={story.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h2 className="text-2xl font-semibold text-forestDark mb-4">{story.title}</h2>
                  <div className="w-full mb-4 rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%', position: 'relative', height: 0 }}>
                    <iframe
                      src={embedUrl}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <p className="text-gray-700 mb-2">{story.story_text}</p>
                  <p className="text-sm text-gray-500">
                    — {story.author_name}
                    {story.author_region && ` (${story.author_region})`}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

