/**
 * OpenAI Whisper Transcription
 * Phase 11G.2: Voice note transcription for WhatsApp intake
 */

interface TranscriptionResult {
  success: boolean
  transcript?: string
  error?: string
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  contentType: string
): Promise<TranscriptionResult> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.warn('OPENAI_API_KEY not configured - transcription unavailable')
    return {
      success: false,
      error: 'Transcription not available - OPENAI_API_KEY not configured',
    }
  }

  // Validate content type
  if (!contentType.startsWith('audio/')) {
    return {
      success: false,
      error: `Invalid content type: ${contentType}. Expected audio/*`,
    }
  }

  try {
    // Create form data for multipart upload
    const formData = new FormData()
    
    // Determine file extension from content type
    let extension = 'mp3' // default
    if (contentType.includes('mpeg') || contentType.includes('mp3')) {
      extension = 'mp3'
    } else if (contentType.includes('wav')) {
      extension = 'wav'
    } else if (contentType.includes('ogg')) {
      extension = 'ogg'
    } else if (contentType.includes('webm')) {
      extension = 'webm'
    } else if (contentType.includes('m4a')) {
      extension = 'm4a'
    }

    // Create a Blob from the buffer
    const audioBlob = new Blob([audioBuffer], { type: contentType })
    formData.append('file', audioBlob, `audio.${extension}`)
    formData.append('model', 'whisper-1')
    formData.append('language', 'en') // English (works for Jamaican Patois too)

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI Whisper API error:', errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const transcript = data.text || ''

    if (!transcript) {
      return {
        success: false,
        error: 'Empty transcript returned from OpenAI',
      }
    }

    console.log('Transcription successful, length:', transcript.length)
    return {
      success: true,
      transcript: transcript.trim(),
    }
  } catch (error: any) {
    console.error('Error transcribing audio:', error)
    return {
      success: false,
      error: error.message || 'Failed to transcribe audio',
    }
  }
}
