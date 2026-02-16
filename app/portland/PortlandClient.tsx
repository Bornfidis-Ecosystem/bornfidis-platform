'use client'

import { useState } from 'react'
import { usePatois } from './PatoisProvider'
import FarmerJoinFlow from './FarmerJoinFlow'
import Link from 'next/link'

export default function PortlandClient() {
  const { isPatois, togglePatois, t } = usePatois()
  const [showFarmerJoin, setShowFarmerJoin] = useState(false)
  const [showChefJoin, setShowChefJoin] = useState(false)
  const [showYouthApp, setShowYouthApp] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-[#1a5f3f] text-white py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {t('heroTitle')}
              </h1>
              <p className="text-green-100 text-lg md:text-xl">
                {t('heroSubtitle')}
              </p>
            </div>
            {/* Language Toggle - Top Right */}
            <button
              onClick={togglePatois}
              className="px-4 py-2 bg-[#FFBC00] text-forestDark rounded-lg font-semibold text-sm md:text-base hover:bg-gold-dark transition active:scale-95 ml-4 flex-shrink-0"
            >
              {isPatois ? '🇯🇲 Patois' : '🇺🇸 English'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Big Action Buttons - 5 Large Tap Targets */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowFarmerJoin(true)}
              className="p-8 bg-[#1a5f3f] text-white rounded-xl text-center hover:bg-[#154a32] transition active:scale-95 min-h-[120px] flex flex-col items-center justify-center"
            >
              <div className="text-5xl mb-4">🌾</div>
              <h2 className="text-2xl font-bold mb-2">{t('joinAsFarmer')}</h2>
            </button>
            <button
              onClick={() => setShowChefJoin(true)}
              className="p-8 bg-[#FFBC00] text-forestDark rounded-xl text-center hover:bg-gold-dark transition active:scale-95 min-h-[120px] flex flex-col items-center justify-center"
            >
              <div className="text-5xl mb-4">👨‍🍳</div>
              <h2 className="text-2xl font-bold mb-2">{t('joinAsChef')}</h2>
            </button>
            <button
              onClick={() => setShowYouthApp(true)}
              className="p-8 bg-[#1a5f3f] text-white rounded-xl text-center hover:bg-[#154a32] transition active:scale-95 min-h-[120px] flex flex-col items-center justify-center"
            >
              <div className="text-5xl mb-4">🌱</div>
              <h2 className="text-2xl font-bold mb-2">{t('youthApprenticeship')}</h2>
            </button>
            <Link
              href="/book"
              className="p-8 bg-[#FFBC00] text-forestDark rounded-xl text-center hover:bg-gold-dark transition active:scale-95 min-h-[120px] flex flex-col items-center justify-center"
            >
              <div className="text-5xl mb-4">🍽️</div>
              <h2 className="text-2xl font-bold mb-2">{t('bookEvent')}</h2>
            </Link>
            <Link
              href="/impact"
              className="p-8 bg-[#1a5f3f] text-white rounded-xl text-center hover:bg-[#154a32] transition active:scale-95 min-h-[120px] flex flex-col items-center justify-center md:col-span-2"
            >
              <div className="text-5xl mb-4">🤝</div>
              <h2 className="text-2xl font-bold mb-2">{t('supportMovement')}</h2>
            </Link>
          </div>
        </section>

        {/* What is Bornfidis - One Sentence */}
        <section className="mb-12 bg-[#f0fdf4] rounded-xl p-6 md:p-8 border border-[#d1fae5]">
          <h2 className="text-2xl font-bold text-forestDark mb-4 text-center">{t('whatIsBornfidis')}</h2>
          <p className="text-gray-800 text-lg md:text-xl text-center leading-relaxed">
            {t('whatIsBornfidisText')}
          </p>
        </section>

        {/* How it Works - 3 Steps */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-forestDark mb-8 text-center">{t('howItWorks')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🌾</div>
              <h3 className="text-2xl font-bold text-forestDark mb-2">{t('grow')}</h3>
              <p className="text-gray-700 text-lg">{t('growDesc')}</p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-4">→</div>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-4">👨‍🍳</div>
              <h3 className="text-2xl font-bold text-forestDark mb-2">{t('cook')}</h3>
              <p className="text-gray-700 text-lg">{t('cookDesc')}</p>
            </div>
            <div className="text-center md:col-start-2">
              <div className="text-6xl mb-4">→</div>
            </div>
            <div className="text-center md:col-start-3">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-2xl font-bold text-forestDark mb-2">{t('serve')}</h3>
              <p className="text-gray-700 text-lg">{t('serveDesc')}</p>
            </div>
          </div>
        </section>

        {/* Stories Teaser Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-forestDark mb-8 text-center">{t('portlandStories')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-[#d1fae5] rounded-xl p-6">
              <div className="w-20 h-20 bg-[#1a5f3f] rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                👤
              </div>
              <h3 className="text-xl font-semibold text-forestDark mb-2 text-center">{t('story1Name')}</h3>
              <p className="text-gray-700 text-center">{t('story1Text')}</p>
            </div>
            <div className="bg-white border-2 border-[#d1fae5] rounded-xl p-6">
              <div className="w-20 h-20 bg-[#FFBC00] rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                👤
              </div>
              <h3 className="text-xl font-semibold text-forestDark mb-2 text-center">{t('story2Name')}</h3>
              <p className="text-gray-700 text-center">{t('story2Text')}</p>
            </div>
          </div>
        </section>

        {/* Footer with Covenant + Scripture */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600 mb-2">{t('covenantLine')}</p>
          <p className="text-sm text-gray-500">{t('scriptureReference')}</p>
        </footer>
      </main>

      {/* Farmer Join Flow Modal */}
      {showFarmerJoin && (
        <FarmerJoinFlow
          onClose={() => setShowFarmerJoin(false)}
          onSuccess={() => {
            setShowFarmerJoin(false)
          }}
        />
      )}
    </div>
  )
}

