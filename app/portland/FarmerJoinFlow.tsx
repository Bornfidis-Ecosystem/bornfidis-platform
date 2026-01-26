'use client'

import { useState, useEffect } from 'react'
import { usePatois } from './PatoisProvider'
import { useOfflineStorage } from './OfflineStorage'
import VoiceInput from './VoiceInput'
import { queueRequest, initOfflineQueue } from '@/lib/offline-queue'

interface FarmerJoinFlowProps {
  onClose: () => void
  onSuccess: () => void
}

export default function FarmerJoinFlow({ onClose, onSuccess }: FarmerJoinFlowProps) {
  const { t } = usePatois()
  const { saveFormData, loadFormData, clearFormData } = useOfflineStorage()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    parish: '',
    acres: '',
    crops: '',
    voice_ready: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isOnline, setIsOnline] = useState(true)

  // Initialize offline queue and check online status
  useEffect(() => {
    initOfflineQueue()
    setIsOnline(navigator.onLine)
    const handleOnline = () => {
      setIsOnline(true)
      // Auto-submit pending when back online
      const pending = loadFormData('farmer-join-pending')
      if (pending && pending.name && pending.phone) {
        handleSubmit(pending, true)
      }
    }
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load saved form data
  useEffect(() => {
    const saved = loadFormData('farmer-join')
    if (saved) {
      setFormData(saved)
    }
  }, [loadFormData])

  // Save form data on change
  useEffect(() => {
    if (formData.name || formData.phone || formData.acres || formData.crops) {
      saveFormData('farmer-join', formData)
    }
  }, [formData, saveFormData])

  const handleVoiceInput = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (data = formData, isAutoSubmit = false) => {
    if (!isAutoSubmit) {
      setIsSubmitting(true)
    }
    setMessage(null)

    try {
      const response = await fetch('/api/farmers/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          parish: data.parish || null,
          acres: data.acres || null,
          crops: data.crops || null,
          voice_ready: data.voice_ready || false,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: t('thankYouMessage') })
        setFormData({ name: '', phone: '', parish: '', acres: '', crops: '', voice_ready: false })
        clearFormData('farmer-join')
        clearFormData('farmer-join-pending')
        setTimeout(() => {
          onSuccess()
        }, 3000)
      } else {
        setMessage({ type: 'error', text: result.error || t('submitError') })
        if (!isAutoSubmit) {
          setIsSubmitting(false)
        }
      }
    } catch (error: any) {
      // If offline or network error, queue for retry
      if (!navigator.onLine || error.message?.includes('fetch')) {
        setMessage({ type: 'success', text: t('offlineSaved') })
        saveFormData('farmer-join-pending', data)
        // Queue request for retry when online
        queueRequest('/api/farmers/join', 'POST', {
          name: data.name,
          phone: data.phone,
          parish: data.parish || null,
          acres: data.acres || null,
          crops: data.crops || null,
          voice_ready: data.voice_ready || false,
        })
      } else {
        setMessage({ type: 'error', text: error.message || t('submitError') })
      }
      if (!isAutoSubmit) {
        setIsSubmitting(false)
      }
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#1a5f3f] text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">{t('joinAsFarmer')}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-[#FFBC00] text-2xl font-bold w-10 h-10 flex items-center justify-center"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {message && (
            <div
              className={`p-4 rounded-lg text-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {!isOnline && (
            <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-base">
              {t('offlineIndicator')}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-xl font-semibold text-[#1a5f3f] mb-2">
              {t('fullName')} *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
                placeholder={t('namePlaceholder')}
              />
              <VoiceInput
                onResult={(text) => handleVoiceInput('name', text)}
                label={t('speakName')}
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-xl font-semibold text-[#1a5f3f] mb-2">
              {t('phoneNumber')} *
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
                className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
                placeholder={t('phonePlaceholder')}
              />
              <VoiceInput
                onResult={(text) => handleVoiceInput('phone', text)}
                label={t('speakPhone')}
              />
            </div>
          </div>

          <div>
            <label htmlFor="acres" className="block text-xl font-semibold text-[#1a5f3f] mb-2">
              {t('approxAcres')}
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                id="acres"
                value={formData.acres}
                onChange={(e) => setFormData(prev => ({ ...prev, acres: e.target.value }))}
                className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
                placeholder={t('acresPlaceholder')}
              />
              <VoiceInput
                onResult={(text) => handleVoiceInput('acres', text)}
                label={t('speakAcres')}
              />
            </div>
          </div>

          <div>
            <label htmlFor="crops" className="block text-xl font-semibold text-[#1a5f3f] mb-2">
              {t('whatDoYouGrow')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="crops"
                value={formData.crops}
                onChange={(e) => setFormData(prev => ({ ...prev, crops: e.target.value }))}
                className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] focus:border-[#1a5f3f]"
                placeholder={t('cropsPlaceholder')}
              />
              <VoiceInput
                onResult={(text) => handleVoiceInput('crops', text)}
                label={t('speakCrops')}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-bold text-xl hover:bg-gray-300 transition active:scale-95 min-h-[48px]"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-4 bg-[#1a5f3f] text-white rounded-lg font-bold text-xl hover:bg-[#154a32] transition active:scale-95 disabled:opacity-50 min-h-[48px]"
            >
              {isSubmitting ? t('submitting') : t('submitForm')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
