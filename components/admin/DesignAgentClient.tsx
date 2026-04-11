'use client'

import { useState } from 'react'
import Link from 'next/link'

const ASSET_TYPES = [
  { id: 'label', label: 'Product label', tag: 'product label, packaging' },
  { id: 'clothing', label: 'Clothing graphic', tag: 'apparel graphic, tee or hoodie print' },
  { id: 'cover', label: 'Book / course cover', tag: 'book cover, manual, course artwork' },
  { id: 'social', label: 'Marketing / social', tag: 'social media, marketing banner, campaign asset' },
] as const

const DIVISIONS = [
  { id: 'academy', label: 'Academy', style: 'educational, structured, manuals and courses' },
  { id: 'provisions', label: 'Provisions', style: 'chef-led, Caribbean-inspired, events and catering' },
  { id: 'sportswear', label: 'Sportswear', style: 'apparel, lifestyle, bold graphics' },
  { id: 'proju', label: 'ProJu', style: 'farmers, regenerative, Jamaican agriculture' },
] as const

const AI_TOOLS = [
  { id: 'midjourney', label: 'Midjourney', suffix: ' --v 6 --style raw' },
  { id: 'dalle', label: 'DALL·E', suffix: '' },
  { id: 'firefly', label: 'Adobe Firefly', suffix: '' },
] as const

const BRAND_COLORS = 'Brand palette: forest green #1A3C34, coral #E07B54, gold #C9A84C. Use these as primary accents.'
const TYPOGRAPHY = 'Typography: clean sans-serif or editorial serif for headlines; avoid script or playful fonts. Professional, timeless.'
const QUICK_TAGS = [
  'Caribbean',
  'regenerative',
  'premium',
  'minimal',
  'warm',
  'professional',
  'Jamaica',
  'farm-to-table',
]

function buildPrompt(params: {
  assetType: string
  productName: string
  division: string
  aiTool: string
  details: string
}): string {
  const asset = ASSET_TYPES.find((a) => a.id === params.assetType)
  const division = DIVISIONS.find((d) => d.id === params.division)
  const tool = AI_TOOLS.find((t) => t.id === params.aiTool)

  const parts: string[] = [
    asset?.tag ?? params.assetType,
    `for "${params.productName}"`,
    division ? `— ${division.style}.` : '.',
    BRAND_COLORS,
    TYPOGRAPHY,
    'Style: Bornfidis brand — refined, confident, Caribbean-informed but not clichéd. High quality, print-ready.',
  ]
  if (params.details.trim()) {
    parts.push(`Additional details: ${params.details.trim()}`)
  }
  let prompt = parts.join(' ')
  if (tool?.suffix) prompt += tool.suffix
  return prompt
}

export function DesignAgentClient() {
  const [assetType, setAssetType] = useState<string>('cover')
  const [productName, setProductName] = useState('')
  const [division, setDivision] = useState<string>('academy')
  const [aiTool, setAiTool] = useState<string>('midjourney')
  const [details, setDetails] = useState('')
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    const prompt = buildPrompt({
      assetType,
      productName: productName.trim() || 'Bornfidis product',
      division,
      aiTool,
      details,
    })
    setGeneratedPrompt(prompt)
    setCopied(false)
  }

  const handleCopy = async () => {
    if (!generatedPrompt) return
    try {
      await navigator.clipboard.writeText(generatedPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const addQuickTag = (tag: string) => {
    setDetails((prev) => (prev ? `${prev}, ${tag}` : tag))
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="rounded-xl border border-[#1A3C34]/20 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1A3C34] mb-4">
          Asset type
        </h2>
        <div className="flex flex-wrap gap-2">
          {ASSET_TYPES.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAssetType(a.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                assetType === a.id
                  ? 'bg-[#1A3C34] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#1A3C34]/20 bg-white p-6 shadow-sm">
        <label htmlFor="product-name" className="block text-sm font-semibold text-[#1A3C34] mb-2">
          Product name
        </label>
        <input
          id="product-name"
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="e.g. Regenerative Enterprise Foundations"
          className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-[#1A3C34] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20"
        />
      </div>

      <div className="rounded-xl border border-[#1A3C34]/20 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1A3C34] mb-3">
          Division
        </h2>
        <div className="flex flex-wrap gap-2">
          {DIVISIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDivision(d.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                division === d.id
                  ? 'bg-[#1A3C34] text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#1A3C34]/20 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1A3C34] mb-3">
          AI tool
        </h2>
        <div className="flex flex-wrap gap-2">
          {AI_TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setAiTool(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                aiTool === t.id
                  ? 'bg-[#C9A84C] text-[#1A3C34]'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#1A3C34]/20 bg-white p-6 shadow-sm">
        <label htmlFor="details" className="block text-sm font-semibold text-[#1A3C34] mb-2">
          Extra details
        </label>
        <textarea
          id="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Mood, elements, or specific requests..."
          rows={3}
          className="w-full rounded-lg border border-stone-300 px-4 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-[#1A3C34] focus:outline-none focus:ring-2 focus:ring-[#1A3C34]/20 resize-y"
        />
        <p className="text-xs text-stone-500 mt-2 mb-1">Quick tags:</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addQuickTag(tag)}
              className="px-2.5 py-1 rounded-md bg-[#E07B54]/10 text-[#1A3C34] text-xs font-medium hover:bg-[#E07B54]/20 transition"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        className="w-full rounded-xl bg-[#1A3C34] text-white font-semibold py-3.5 px-6 hover:opacity-90 transition"
      >
        Generate brand prompt
      </button>

      {generatedPrompt && (
        <div className="rounded-xl border-2 border-[#1A3C34]/30 bg-stone-50 p-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-sm font-semibold text-[#1A3C34]">Your prompt</span>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg bg-[#C9A84C] text-[#1A3C34] font-medium px-4 py-2 text-sm hover:opacity-90 transition"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="text-sm text-stone-700 whitespace-pre-wrap font-sans leading-relaxed">
            {generatedPrompt}
          </pre>
          <p className="text-xs text-stone-500 mt-3">
            Paste this into Midjourney, DALL·E, or Adobe Firefly.
          </p>
        </div>
      )}

      <p className="text-center text-sm text-stone-500">
        <Link href="/admin" className="text-[#1A3C34] hover:underline font-medium">
          ← Back to Dashboard
        </Link>
      </p>
    </div>
  )
}
