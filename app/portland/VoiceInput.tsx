'use client'

import { useState, useRef, useEffect } from 'react'

interface VoiceInputProps {
  onResult: (text: string) => void
  label: string
  value?: string
  onClear?: () => void
}

export default function VoiceInput({ onResult, label, value = '', onClear }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState<string>('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef<string>('')

  useEffect(() => {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      
      // Language priority: en-JM (Jamaican English), fallback to en-US
      recognition.lang = 'en-JM'
      
      // Continuous recognition
      recognition.continuous = true
      
      // Enable interim results for live transcript preview
      recognition.interimResults = true
      
      recognition.maxAlternatives = 1

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = ''
        let finalTranscript = ''

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        // Update live transcript preview
        if (interimTranscript) {
          setLiveTranscript(finalTranscriptRef.current + interimTranscript)
        } else {
          setLiveTranscript('')
        }

        // Update final transcript
        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript
          onResult(finalTranscriptRef.current.trim())
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        
        // Handle language not supported error - fallback to en-US
        if (event.error === 'language-not-supported' && recognition.lang === 'en-JM') {
          recognition.lang = 'en-US'
          try {
            recognition.start()
            return
          } catch (e) {
            // If restart fails, continue with error
          }
        }
        
        setIsListening(false)
        setLiveTranscript('')
      }

      recognition.onend = () => {
        setIsListening(false)
        setLiveTranscript('')
      }

      recognition.onstart = () => {
        finalTranscriptRef.current = value // Start from current value
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore errors when stopping
        }
      }
    }
  }, [onResult, value])

  const handleClick = () => {
    if (!isSupported) {
      alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      setLiveTranscript('')
    } else if (recognitionRef.current) {
      try {
        finalTranscriptRef.current = value // Reset to current value
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error('Error starting recognition:', error)
        setIsListening(false)
      }
    }
  }

  const handleClear = () => {
    if (onClear) {
      onClear()
    }
    finalTranscriptRef.current = ''
    setLiveTranscript('')
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        setIsListening(false)
      } catch (e) {
        // Ignore errors
      }
    }
  }

  if (!isSupported) {
    return null // Don't show button if not supported
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={handleClick}
          className={`px-4 py-3 rounded-lg font-semibold text-sm transition active:scale-95 relative ${
            isListening
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-[#FFBC00] text-[#1a5f3f] hover:bg-opacity-90'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? (
            <>
              <span>🎤</span>
              <span className="absolute inset-0 rounded-lg bg-red-600 animate-ping opacity-75"></span>
            </>
          ) : (
            <span>🎙️</span>
          )}
        </button>
        {(value || liveTranscript) && onClear && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isListening}
            className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition disabled:opacity-50"
            title="Clear"
          >
            ✕
          </button>
        )}
      </div>
      {/* Live transcript preview */}
      {liveTranscript && (
        <div className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded border border-gray-200">
          {liveTranscript}
        </div>
      )}
      {/* Visual listening indicator */}
      {isListening && (
        <div className="flex items-center gap-2 text-sm text-[#1a5f3f]">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
          <span className="font-medium">Listening... Speak now</span>
        </div>
      )}
    </div>
  )
}
