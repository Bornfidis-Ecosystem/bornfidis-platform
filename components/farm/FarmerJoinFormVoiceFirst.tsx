'use client'

import { useState, useEffect } from 'react'
import VoiceField from './VoiceField'
import { normalizePhoneNumber } from '@/lib/phone-normalize'
import { queueRequest, initOfflineQueue } from '@/lib/offline-queue'

interface FarmerJoinFormVoiceFirstProps {
  language?: 'en' | 'pat'
  onLanguageChange?: (lang: 'en' | 'pat') => void
  onSuccess?: () => void
}

const translations = {
  en: {
    headline: 'Join as a Farmer',
    helper: 'Quick signup. We\'ll call you soon.',
    name: 'Full Name',
    namePlaceholder: 'Your name',
    phone: 'Phone Number',
    phonePlaceholder: '8761234567 or +18761234567',
    parish: 'Parish',
    parishPlaceholder: 'Portland (default)',
    acres: 'Acres (Optional)',
    acresPlaceholder: 'Number of acres',
    crops: 'What do you grow?',
    cropsPlaceholder: 'e.g., yam, banana, callaloo',
    submit: 'Submit',
    submitting: 'Submitting...',
    success: 'Thank you! We\'ll reach out soon.',
    error: 'Something went wrong. Please try again.',
    offlineSaved: 'Saved offline — will send when online.',
    offlineBanner: 'Offline — we\'ll send when you\'re back online.',
    phoneError: 'Invalid phone number. Use 876XXXXXXXX or +1876XXXXXXXX for Jamaica.',
    language: 'Language',
  },
  pat: {
    headline: 'Join as Farmer',
    helper: 'Quick signup. Wi link yuh up soon.',
    name: 'Full Name',
    namePlaceholder: 'Yuh name',
    phone: 'Phone Number',
    phonePlaceholder: '8761234567 or +18761234567',
    parish: 'Parish',
    parishPlaceholder: 'Portland (default)',
    acres: 'Acres (Optional)',
    acresPlaceholder: 'Number of acres',
    crops: 'Wah yuh grow?',
    cropsPlaceholder: 'e.g., yam, banana, callaloo',
    submit: 'Submit',
    submitting: 'Submitting...',
    success: 'Respect! Wi ago link yuh up soon.',
    error: 'Something go wrong. Please try again.',
    offlineSaved: 'Save offline — wi send it when yuh online.',
    offlineBanner: 'No signal — wi send it when yuh back online.',
    phoneError: 'Invalid phone number. Use 876XXXXXXXX or +1876XXXXXXXX for Jamaica.',
    language: 'Language',
  },
}

export default function FarmerJoinFormVoiceFirst({
  language: initialLanguage = 'en',
  onLanguageChange,
  onSuccess,
}: FarmerJoinFormVoiceFirstProps) {
  const [language, setLanguage] = useState<'en' | 'pat'>(initialLanguage)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    parish: 'Portland',
    acres: '',
    crops: '',
    voice_ready: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [voiceUsed, setVoiceUsed] = useState(false)

  const t = translations[language]

  // Initialize offline queue and check online status
  useEffect(() => {
    initOfflineQueue()
    setIsOnline(navigator.onLine)
    const handleOnline = () => {
      setIsOnline(true)
    }
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'pat' : 'en'
    setLanguage(newLang)
    if (onLanguageChange) {
      onLanguageChange(newLang)
    }
  }

  const handleVoiceUsed = () => {
    setVoiceUsed(true)
    setFormData(prev => ({ ...prev, voice_ready: true }))
  }

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }))
    setPhoneError(null)
    
    // Validate phone as user types (only if they've entered something)
    if (value.trim()) {
      const normalized = normalizePhoneNumber(value)
      if (!normalized.isValid && value.length > 5) {
        setPhoneError(normalized.error || t.phoneError)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    setPhoneError(null)

    // Validate phone
    const phoneNormalized = normalizePhoneNumber(formData.phone)
    if (!phoneNormalized.isValid) {
      setPhoneError(phoneNormalized.error || t.phoneError)
      setIsSubmitting(false)
      return
    }

    // Validate required fields
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: t.error })
      setIsSubmitting(false)
      return
    }

    if (!formData.crops.trim()) {
      setMessage({ type: 'error', text: t.error })
      setIsSubmitting(false)
      return
    }

    const payload = {
      name: formData.name.trim(),
      phone: phoneNormalized.normalized,
      parish: formData.parish || 'Portland',
      acres: formData.acres || null,
      crops: formData.crops.trim(),
      voice_ready: formData.voice_ready || voiceUsed,
      language: language,
    }

    try {
      const response = await fetch('/api/farmers/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: t.success })
        setFormData({
          name: '',
          phone: '',
          parish: 'Portland',
          acres: '',
          crops: '',
          voice_ready: false,
        })
        setVoiceUsed(false)
        if (onSuccess) {
          setTimeout(() => onSuccess(), 2000)
        }
      } else {
        setMessage({ type: 'error', text: result.error || t.error })
      }
    } catch (error: any) {
      // If offline or network error, queue for retry
      if (!navigator.onLine || error.message?.includes('fetch')) {
        setMessage({ type: 'success', text: t.offlineSaved })
        queueRequest('/api/farmers/join', 'POST', payload)
      } else {
        setMessage({ type: 'error', text: error.message || t.error })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Language Toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-forestDark">{t.headline}</h2>
        <button
          type="button"
          onClick={handleLanguageToggle}
          className="px-4 py-2 bg-forestDark text-white rounded-lg font-semibold hover:bg-forestDarker transition active:scale-95 min-h-[44px]"
        >
          {language === 'en' ? '🇺🇸 EN' : '🇯🇲 PAT'}
        </button>
      </div>

      <p className="text-gray-600">{t.helper}</p>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg">
          {t.offlineBanner}
        </div>
      )}

      {/* Messages */}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-lg font-semibold text-forestDark mb-2">
            {t.name} *
          </label>
          <VoiceField
            value={formData.name}
            onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            onVoiceUsed={handleVoiceUsed}
            placeholder={t.namePlaceholder}
            required
            language={language}
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-lg font-semibold text-forestDark mb-2">
            {t.phone} *
          </label>
          <VoiceField
            value={formData.phone}
            onChange={handlePhoneChange}
            onVoiceUsed={handleVoiceUsed}
            placeholder={t.phonePlaceholder}
            type="tel"
            required
            language={language}
          />
          {phoneError && (
            <p className="text-red-600 text-sm mt-1">{phoneError}</p>
          )}
        </div>

        {/* Parish */}
        <div>
          <label htmlFor="parish" className="block text-lg font-semibold text-forestDark mb-2">
            {t.parish}
          </label>
          <VoiceField
            value={formData.parish}
            onChange={(value) => setFormData(prev => ({ ...prev, parish: value }))}
            onVoiceUsed={handleVoiceUsed}
            placeholder={t.parishPlaceholder}
            language={language}
          />
        </div>

        {/* Acres */}
        <div>
          <label htmlFor="acres" className="block text-lg font-semibold text-forestDark mb-2">
            {t.acres}
          </label>
          <VoiceField
            value={formData.acres}
            onChange={(value) => setFormData(prev => ({ ...prev, acres: value }))}
            onVoiceUsed={handleVoiceUsed}
            placeholder={t.acresPlaceholder}
            type="number"
            language={language}
          />
        </div>

        {/* Crops */}
        <div>
          <label htmlFor="crops" className="block text-lg font-semibold text-forestDark mb-2">
            {t.crops} *
          </label>
          <VoiceField
            value={formData.crops}
            onChange={(value) => setFormData(prev => ({ ...prev, crops: value }))}
            onVoiceUsed={handleVoiceUsed}
            placeholder={t.cropsPlaceholder}
            required
            language={language}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-4 bg-forestDark text-white rounded-lg font-bold text-xl hover:bg-forestDarker transition active:scale-95 disabled:opacity-50 min-h-[48px]"
        >
          {isSubmitting ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  )
}
