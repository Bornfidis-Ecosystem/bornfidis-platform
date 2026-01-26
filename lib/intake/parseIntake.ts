/**
 * Phase 11G.2A: Core Parser (Deterministic + AI-Assist)
 * 
 * Fast, predictable, no hallucinations.
 * AI can be layered later (Phase 11G.2B).
 */

import { ParsedFarmerIntake } from './types'

const PARISHES = [
  'portland',
  'st mary',
  'st ann',
  'clarendon',
  'manchester',
  'st elizabeth',
  'kingston',
  'st catherine',
  'trelawny',
  'westmoreland',
  'hanover',
  'st james',
]

const CROP_KEYWORDS = [
  'yam',
  'banana',
  'plantain',
  'dasheen',
  'callaloo',
  'pak choi',
  'cabbage',
  'carrot',
  'scotch bonnet',
  'pepper',
  'okra',
  'tomato',
]

/**
 * Deterministic parser for intake text
 * 
 * @param message - Raw intake message text
 * @returns Parsed farmer intake data
 */
export function parseIntakeText(message: string): ParsedFarmerIntake {
  if (!message || typeof message !== 'string') {
    return {}
  }

  const text = message.toLowerCase().trim()

  // Extract parish
  const parish = PARISHES.find(p => {
    const normalizedParish = p.toLowerCase()
    // Match whole word or after common prepositions
    return new RegExp(
      `(?:^|\\s|in|from|located\\s+in|based\\s+in)\\s*${normalizedParish.replace(/\s+/g, '\\s+')}(?:\\s|$|,|\\.)`,
      'i'
    ).test(text)
  })

  // Extract crops
  const crops: string[] = []
  for (const crop of CROP_KEYWORDS) {
    const normalizedCrop = crop.toLowerCase()
    // Match whole word (not part of another word)
    const pattern = new RegExp(
      `(?:^|\\s|,|and|or|with|growing|planting|have|got)\\s*${normalizedCrop.replace(/\s+/g, '\\s+')}(?:\\s|$|,|and|or|\\.)`,
      'i'
    )
    
    if (pattern.test(text)) {
      crops.push(crop)
    }
  }

  // Extract phone number
  // Matches: +1234567890, (123) 456-7890, 123-456-7890, 123.456.7890, etc.
  const phoneMatch = message.match(/(\+?\d{1,3})?\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  const phone = phoneMatch?.[0]?.replace(/\s/g, '')

  // Extract name (simple patterns)
  let name: string | undefined
  const namePatterns = [
    /(?:my|mi)\s+name\s+(?:is|a|ah)\s+([a-z\s'-]+?)(?:\s|$|,|\.)/i,
    /name\s*:?\s*(?:is\s+)?([a-z\s'-]+?)(?:\s|$|,|\.)/i,
    /(?:i|mi)\s+(?:am|a)\s+([a-z\s'-]+?)(?:\s|$|,|\.)/i,
  ]
  
  for (const pattern of namePatterns) {
    const match = message.match(pattern)
    if (match && match[1]) {
      const extractedName = match[1].trim()
      // Filter out false positives
      const falsePositives = ['a', 'the', 'farmer', 'farming', 'growing']
      if (extractedName.length > 1 && extractedName.length < 50 && 
          !falsePositives.includes(extractedName.toLowerCase())) {
        name = extractedName
        break
      }
    }
  }

  // Extract quantity (simple patterns like "5 lbs", "10 kg", etc.)
  let quantity: string | undefined
  const quantityMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:lbs?|kg|kilograms?|pounds?|units?|pieces?)/i)
  if (quantityMatch) {
    quantity = quantityMatch[0]
  }

  // Extract frequency
  let frequency: 'weekly' | 'biweekly' | 'monthly' | undefined
  if (/\bweekly\b/i.test(text)) {
    frequency = 'weekly'
  } else if (/\b(?:bi-?weekly|every\s+two\s+weeks?)\b/i.test(text)) {
    frequency = 'biweekly'
  } else if (/\bmonthly\b/i.test(text)) {
    frequency = 'monthly'
  }

  const result: ParsedFarmerIntake = {}

  if (name) result.name = name
  if (phone) result.phone = phone
  if (parish) result.parish = parish
  if (crops.length > 0) result.crops = crops
  if (quantity) result.quantity = quantity
  if (frequency) result.frequency = frequency

  return result
}
