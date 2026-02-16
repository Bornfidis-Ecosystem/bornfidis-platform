'use client'

import { useState } from 'react'
import { evaluateAllChefsAction } from './actions'

export default function EvaluateAllButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setResult(null)
    const res = await evaluateAllChefsAction()
    setLoading(false)
    if (res.success) {
      if (res.created > 0) {
        setResult(`Created ${res.created} case(s) for ${res.chefsAffected} chef(s).`)
      } else {
        setResult('No new cases; no triggers fired.')
      }
      window.location.reload()
    } else {
      setResult('Error: ' + (res.error ?? 'Failed'))
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="px-3 py-1.5 bg-amber-600 text-white rounded text-sm hover:bg-amber-700 disabled:opacity-50"
      >
        {loading ? 'Running…' : 'Evaluate all chefs (create cases)'}
      </button>
      {result && <span className="ml-2 text-sm text-gray-600">{result}</span>}
    </div>
  )
}

