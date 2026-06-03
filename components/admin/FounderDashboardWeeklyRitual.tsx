'use client'

import { useState } from 'react'
import { CulinaryCard } from '@/components/culinary-os'

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
    <div className="space-y-stack-md">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {QUESTIONS.map((q, i) => (
          <CulinaryCard key={i} className="flex min-w-0 flex-col">
            <p className="mb-4 break-words font-culinary-sans text-sm font-medium leading-snug text-culinary-ink">{q}</p>
            <div className="mt-auto flex flex-shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setAnswer(i, 'yes')}
                className={`min-w-0 flex-1 rounded-none border py-2.5 font-culinary-sans text-sm font-medium transition-colors ${
                  answers[i] === 'yes'
                    ? 'border-culinary-navy bg-culinary-navy text-culinary-on-navy'
                    : 'border-culinary-outline bg-culinary-bone text-culinary-text-muted hover:border-culinary-gold-line hover:bg-culinary-surface-low hover:text-culinary-ink'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setAnswer(i, 'no')}
                className={`min-w-0 flex-1 rounded-none border py-2.5 font-culinary-sans text-sm font-medium transition-colors ${
                  answers[i] === 'no'
                    ? 'border-culinary-ink bg-culinary-ink text-culinary-on-navy'
                    : 'border-culinary-outline bg-culinary-bone text-culinary-text-muted hover:border-culinary-gold-line hover:bg-culinary-surface-low hover:text-culinary-ink'
                }`}
              >
                No
              </button>
            </div>
          </CulinaryCard>
        ))}
      </div>
      {allAnswered && (
        <p className="border-t border-culinary-outline pt-5 font-culinary-sans text-sm text-culinary-text-muted">
          Weekly ritual: {yesCount}/5 yes — {yesCount >= 4 ? 'Strong week.' : yesCount >= 2 ? 'Mixed.' : 'Focus next week.'}
        </p>
      )}
    </div>
  )
}
