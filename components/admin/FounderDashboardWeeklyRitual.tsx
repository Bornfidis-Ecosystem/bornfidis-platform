'use client'

import { useState } from 'react'

const QUESTIONS = [
  'Revenue up this week?',
  'Email list grew?',
  'Content published?',
  'Customer returned?',
  'One division moved forward?',
] as const

type Answer = 'yes' | 'no' | null

export function FounderDashboardWeeklyRitual() {
  const [answers, setAnswers] = useState<Answer[]>(QUESTIONS.map(() => null))

  const setAnswer = (index: number, value: 'yes' | 'no') => {
    setAnswers((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const allAnswered = answers.every((a) => a !== null)
  const yesCount = answers.filter((a) => a === 'yes').length

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {QUESTIONS.map((q, i) => (
          <div
            key={i}
            className="bg-white border border-stone-200/80 rounded-xl p-5 flex flex-col min-w-0"
          >
            <p className="text-sm font-medium text-stone-800 mb-4 break-words leading-snug">{q}</p>
            <div className="flex gap-2 mt-auto flex-shrink-0">
              <button
                type="button"
                onClick={() => setAnswer(i, 'yes')}
                className={`flex-1 min-w-0 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  answers[i] === 'yes'
                    ? 'bg-[#1A3C34] text-white border-[#1A3C34]'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:text-stone-800'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setAnswer(i, 'no')}
                className={`flex-1 min-w-0 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  answers[i] === 'no'
                    ? 'bg-stone-600 text-white border-stone-600'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:text-stone-800'
                }`}
              >
                No
              </button>
            </div>
          </div>
        ))}
      </div>
      {allAnswered && (
        <p className="text-sm text-stone-600 border-t border-stone-200 pt-5">
          Weekly ritual: {yesCount}/5 yes — {yesCount >= 4 ? 'Strong week.' : yesCount >= 2 ? 'Mixed.' : 'Focus next week.'}
        </p>
      )}
    </div>
  )
}
