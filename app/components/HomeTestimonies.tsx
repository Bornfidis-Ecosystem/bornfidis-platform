'use client'

import { useState, useEffect } from 'react'
import { LivingTestament } from '@/types/testament'
import Link from 'next/link'

interface HomeTestimoniesProps {
  testimonies: LivingTestament[]
}

export default function HomeTestimonies({ testimonies }: HomeTestimoniesProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (testimonies.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonies.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonies.length])

  if (testimonies.length === 0) {
    return null
  }

  const currentTestimony = testimonies[currentIndex]

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-forestDark mb-4">Living Testimonies</h2>
          <div className="h-1 w-24 bg-[#FFBC00] mx-auto mb-6"></div>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#f0fdf4] border-2 border-[#d1fae5] rounded-lg p-8 md:p-12 shadow-lg">
            <p className="text-gold font-semibold italic mb-4 text-lg">
              "{currentTestimony.scripture}"
            </p>
            {currentTestimony.scripture_text && (
              <p className="text-gray-700 italic mb-6">{currentTestimony.scripture_text}</p>
            )}
            <p className="text-gray-800 text-lg leading-relaxed mb-6">
              {currentTestimony.testimony}
            </p>
            {currentTestimony.author_name && (
              <p className="text-gray-600">
                — {currentTestimony.author_name}
                {currentTestimony.author_role && `, ${currentTestimony.author_role}`}
                {currentTestimony.region && ` (${currentTestimony.region})`}
              </p>
            )}
          </div>
          {testimonies.length > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {testimonies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition ${
                    index === currentIndex ? 'bg-[#FFBC00]' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimony ${index + 1}`}
                />
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link
              href="/testament"
              className="inline-block px-6 py-2 text-forestDark font-semibold hover:text-[#154a32] transition"
            >
              Read More Testimonies →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

