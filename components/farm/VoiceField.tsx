'use client'

import { useState, useRef, useEffect } from 'react'

interface VoiceFieldProps {
  value: string
  onChange: (value: string) => void
  onVoiceUsed?: () => void
  placeholder?: string
  type?: 'text' | 'tel' | 'number'
  required?: boolean
  disabled?: boolean
  language?: 'en' | 'pat'
  className?: string
}

export default function VoiceField({
  value,
  onChange,
  onVoiceUsed,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  language = 'en',
  className = '',
}: VoiceFieldProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
      // Try en-JM first, fallback to en-US if not available
      recognition.lang = 'en-JM'
      
      // Continuous recognition for better UX
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
          onChange(finalTranscriptRef.current.trim())
          if (onVoiceUsed) {
            onVoiceUsed()
          }
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        
        // Handle language not supported error - fallback to en-US
        if (event.error === 'language-not-supported' && recognition.lang === 'en-JM') {
          recognition.lang = 'en-US'
          try {
            recognition.start()
            setError(null)
            return
          } catch (e) {
            // If restart fails, show error
          }
        }
        
        setError(event.error === 'no-speech' ? null : event.error)
        setIsListening(false)
        
        // Clear error after 3 seconds (unless it's a critical error)
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setTimeout(() => setError(null), 3000)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        setLiveTranscript('')
        // If continuous mode, restart if still needed
        // (We'll handle this manually with button clicks)
      }

      recognition.onstart = () => {
        setError(null)
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
  }, [onChange, onVoiceUsed, value])

  const handleMicClick = () => {
    if (!isSupported) {
      return
    }

    if (isListening && recognitionRef.current) {
      // Stop listening
      try {
        recognitionRef.current.stop()
        setIsListening(false)
        setLiveTranscript('')
      } catch (e) {
        setIsListening(false)
        setLiveTranscript('')
      }
    } else if (recognitionRef.current) {
      // Start listening
      try {
        finalTranscriptRef.current = value // Reset to current value
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error: any) {
        console.error('Error starting recognition:', error)
        setError('Could not start voice input')
        setIsListening(false)
        setTimeout(() => setError(null), 3000)
      }
    }
  }

  const handleClear = () => {
    onChange('')
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

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type={type}
            value={liveTranscript || value}
            onChange={(e) => {
              onChange(e.target.value)
              setLiveTranscript('')
              // Sync finalTranscriptRef when user types manually
              finalTranscriptRef.current = e.target.value
            }}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`w-full border-2 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f] ${
              isListening 
                ? 'border-[#1a5f3f] bg-green-50' 
                : 'border-gray-300'
            } ${className}`}
          />
          {/* Live transcript indicator */}
          {isListening && liveTranscript && (
            <div className="absolute top-1 right-2 text-xs text-[#1a5f3f] font-medium">
              Listening...
            </div>
          )}
        </div>
        {isSupported && (
          <>
            <button
              type="button"
              onClick={handleMicClick}
              disabled={disabled}
              className={`px-4 py-3 rounded-lg font-semibold transition active:scale-95 min-w-[48px] min-h-[48px] flex items-center justify-center relative ${
                isListening
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-[#FFBC00] text-[#1a5f3f] hover:bg-opacity-90'
              } disabled:opacity-50`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <>
                  <span className="text-xl">🎤</span>
                  {/* Pulsing animation indicator */}
                  <span className="absolute inset-0 rounded-lg bg-red-600 animate-ping opacity-75"></span>
                </>
              ) : (
                <span className="text-xl">🎙️</span>
              )}
            </button>
            {(value || liveTranscript) && (
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled || isListening}
                className="px-4 py-3 rounded-lg font-semibold transition active:scale-95 min-w-[48px] min-h-[48px] flex items-center justify-center bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear input"
                aria-label="Clear input"
              >
                ✕
              </button>
            )}
          </>
        )}
      </div>
      {/* Visual listening indicator */}
      {isListening && (
        <div className="mt-2 flex items-center gap-2 text-sm text-[#1a5f3f]">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
          <span className="font-medium">Listening... Speak now</span>
        </div>
      )}
      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
      {!isSupported && (
        <p className="text-gray-500 text-xs mt-1">Voice not supported on this device</p>
      )}
    </div>
  )
}
