/**
 * Phase 11G.2: Farmer Intake Message Parser
 * 
 * Parses WhatsApp/voice messages from farmers to extract structured information.
 * Handles Jamaican Patois, informal English, and various message formats.
 */

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface ParsedFarmerMessage {
  name: string | null
  parish: string | null
  acres: number | null
  crops: string[]
  confidence: ConfidenceLevel
  notes: string[]
}

// Parish whitelist (Jamaican parishes)
const PARISH_WHITELIST = [
  'portland',
  'st thomas',
  'st. thomas',
  'saint thomas',
  'st mary',
  'st. mary',
  'saint mary',
  'st ann',
  'st. ann',
  'saint ann',
  'manchester',
  'clarendon',
  'kingston',
  'st andrew',
  'st. andrew',
  'saint andrew',
  'westmoreland',
  'hanover',
  'trelawny',
  'st james',
  'st. james',
  'saint james',
  'st elizabeth',
  'st. elizabeth',
  'saint elizabeth',
] as const

// Known crops whitelist
const KNOWN_CROPS = [
  'callaloo',
  'yam',
  'yellow yam',
  'banana',
  'plantain',
  'dasheen',
  'coco',
  'cocoa',
  'ginger',
  'turmeric',
  'pepper',
  'hot pepper',
  'scallion',
  'thyme',
  'okra',
  'pumpkin',
  'corn',
  'cucumber',
  'tomato',
  'carrot',
] as const

// Crop synonyms mapping
const CROP_SYNONYMS: Record<string, string> = {
  'coco': 'cocoa',
  'pepper': 'hot pepper',
  'scallions': 'scallion',
  'spring onion': 'scallion',
  'green onion': 'scallion',
  'sweet pepper': 'pepper',
  'bell pepper': 'pepper',
}

/**
 * Normalizes crop name: lowercase, trim, handle synonyms
 */
function normalizeCrop(crop: string): string {
  const normalized = crop.toLowerCase().trim()
  
  // Check synonyms first
  if (CROP_SYNONYMS[normalized]) {
    return CROP_SYNONYMS[normalized]
  }
  
  return normalized
}

/**
 * Detects name from various patterns
 */
function extractName(text: string): string | null {
  const lowerText = text.toLowerCase()
  
  // Pattern 1: "my name is X" or "mi name a X" (Patois)
  const pattern1 = /(?:my|mi)\s+name\s+(?:is|a|ah)\s+([a-z\s'-]+?)(?:\s|$|,|\.)/i
  const match1 = text.match(pattern1)
  if (match1) {
    const name = match1[1].trim()
    if (name.length > 1 && name.length < 50) {
      return name
    }
  }
  
  // Pattern 2: "name: X" or "name is X"
  const pattern2 = /name\s*:?\s*(?:is\s+)?([a-z\s'-]+?)(?:\s|$|,|\.)/i
  const match2 = text.match(pattern2)
  if (match2) {
    const name = match2[1].trim()
    if (name.length > 1 && name.length < 50) {
      return name
    }
  }
  
  // Pattern 3: "I am X" or "mi a X" (Patois)
  const pattern3 = /(?:i|mi)\s+(?:am|a)\s+([a-z\s'-]+?)(?:\s|$|,|\.)/i
  const match3 = text.match(pattern3)
  if (match3) {
    const name = match3[1].trim()
    // Filter out common false positives
    const falsePositives = ['a', 'the', 'farmer', 'farming', 'growing']
    if (name.length > 1 && name.length < 50 && !falsePositives.includes(name.toLowerCase())) {
      return name
    }
  }
  
  return null
}

/**
 * Detects acres from various patterns
 */
function extractAcres(text: string): number | null {
  const lowerText = text.toLowerCase()
  
  // Pattern 1: "X acres" or "X acre"
  const pattern1 = /(\d+\.?\d*)\s*(?:acres?|acre)/i
  const match1 = text.match(pattern1)
  if (match1) {
    const acres = parseFloat(match1[1])
    if (!isNaN(acres) && acres > 0 && acres < 10000) {
      return acres
    }
  }
  
  // Pattern 2: "about X acres" or "around X acres"
  const pattern2 = /(?:about|around|approximately|approx)\s+(\d+\.?\d*)\s*(?:acres?|acre)/i
  const match2 = text.match(pattern2)
  if (match2) {
    const acres = parseFloat(match2[1])
    if (!isNaN(acres) && acres > 0 && acres < 10000) {
      return acres
    }
  }
  
  // Pattern 3: "X acres of" or "X acre farm"
  const pattern3 = /(\d+\.?\d*)\s*(?:acres?|acre)\s+(?:of|farm)/i
  const match3 = text.match(pattern3)
  if (match3) {
    const acres = parseFloat(match3[1])
    if (!isNaN(acres) && acres > 0 && acres < 10000) {
      return acres
    }
  }
  
  return null
}

/**
 * Detects parish from whitelist
 */
function extractParish(text: string): string | null {
  const lowerText = text.toLowerCase()
  
  // Check each parish in whitelist
  for (const parish of PARISH_WHITELIST) {
    // Match whole word or after "in", "from", "located in"
    const pattern = new RegExp(
      `(?:^|\\s|in|from|located\\s+in|based\\s+in)\\s*${parish.replace(/\./g, '\\.')}(?:\\s|$|,|\\.)`,
      'i'
    )
    
    if (pattern.test(lowerText)) {
      // Normalize parish name (remove dots, capitalize properly)
      const normalized = parish
        .replace(/st\./g, 'st')
        .replace(/saint/g, 'st')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      return normalized
    }
  }
  
  return null
}

/**
 * Detects crops from whitelist and fallback
 */
function extractCrops(text: string): string[] {
  const lowerText = text.toLowerCase()
  const foundCrops: Set<string> = new Set()
  
  // Check known crops
  for (const crop of KNOWN_CROPS) {
    const normalizedCrop = normalizeCrop(crop)
    
    // Match whole word (not part of another word)
    const pattern = new RegExp(
      `(?:^|\\s|,|and|or|with|growing|planting|have|got)\\s*${normalizedCrop.replace(/\s+/g, '\\s+')}(?:\\s|$|,|and|or|\\.)`,
      'i'
    )
    
    if (pattern.test(lowerText)) {
      foundCrops.add(normalizedCrop)
    }
  }
  
  // Fallback: look for crop-like words (2+ letters, not common words)
  // This is a simple heuristic - can be improved
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'from', 'by', 'is', 'are', 'was', 'were', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
    'might', 'can', 'my', 'mi', 'name', 'acres', 'acre', 'parish', 'about',
    'around', 'growing', 'planting', 'farm', 'farming'
  ])
  
  // Extract potential crop words (simple heuristic)
  const words = lowerText
    .split(/[\s,;:]+/)
    .map(w => w.trim())
    .filter(w => w.length >= 3 && !commonWords.has(w) && !/^\d+$/.test(w))
  
  // If we found known crops, only return those
  // Otherwise, include potential fallback crops (up to 5)
  if (foundCrops.size > 0) {
    return Array.from(foundCrops).sort()
  }
  
  // Fallback: return unique potential crops (limited)
  const fallbackCrops = Array.from(new Set(words)).slice(0, 5)
  return fallbackCrops.map(normalizeCrop)
}

/**
 * Calculates confidence level based on extracted fields
 */
function calculateConfidence(result: Omit<ParsedFarmerMessage, 'confidence' | 'notes'>): ConfidenceLevel {
  const fieldsFound = [
    result.name !== null,
    result.parish !== null,
    result.acres !== null,
    result.crops.length > 0,
  ].filter(Boolean).length
  
  if (fieldsFound >= 2) {
    return 'high'
  } else if (fieldsFound === 1) {
    return 'medium'
  } else {
    return 'low'
  }
}

/**
 * Main parser function
 * 
 * @param text - Raw message text from farmer (WhatsApp message or transcript)
 * @returns Parsed farmer information with confidence level
 * 
 * @example
 * ```ts
 * const result = parseFarmerMessage(
 *   "My name is John Brown. I have 5 acres in St Thomas. Growing yam, banana, and callaloo."
 * )
 * // Returns:
 * // {
 * //   name: "John Brown",
 * //   parish: "St Thomas",
 * //   acres: 5,
 * //   crops: ["banana", "callaloo", "yam"],
 * //   confidence: "high",
 * //   notes: []
 * // }
 * ```
 * 
 * @example
 * ```ts
 * // Patois example
 * const result = parseFarmerMessage(
 *   "Mi name a Mary. Mi have 2.5 acre in Clarendon. A grow pepper and ginger."
 * )
 * // Returns:
 * // {
 * //   name: "Mary",
 * //   parish: "Clarendon",
 * //   acres: 2.5,
 * //   crops: ["ginger", "hot pepper"],
 * //   confidence: "high",
 * //   notes: []
 * // }
 * ```
 */
export function parseFarmerMessage(text: string): ParsedFarmerMessage {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      name: null,
      parish: null,
      acres: null,
      crops: [],
      confidence: 'low',
      notes: ['Empty or invalid input'],
    }
  }
  
  const notes: string[] = []
  
  // Extract fields
  const name = extractName(text)
  const parish = extractParish(text)
  const acres = extractAcres(text)
  const crops = extractCrops(text)
  
  // Add notes for edge cases
  if (name && name.length < 3) {
    notes.push('Name seems unusually short')
  }
  
  if (acres && acres > 1000) {
    notes.push('Acres value seems unusually large')
  }
  
  if (crops.length === 0) {
    notes.push('No known crops detected')
  } else if (crops.length > 10) {
    notes.push('Many crops detected - may need review')
  }
  
  // Build result
  const result: Omit<ParsedFarmerMessage, 'confidence' | 'notes'> = {
    name,
    parish,
    acres,
    crops,
  }
  
  const confidence = calculateConfidence(result)
  
  return {
    ...result,
    confidence,
    notes,
  }
}

// ============================================================================
// Unit Tests / Examples
// ============================================================================

/**
 * Test cases and examples
 * 
 * Run these in a test file or use as inline documentation
 */

// Test cases and examples (for use in test files)
// Note: These use Jest's `expect` - remove if not using Jest
export const parserTestCases = [
  {
    name: 'Complete information',
    input: 'My name is John Brown. I have 5 acres in St Thomas. Growing yam, banana, and callaloo.',
    expected: {
      name: 'John Brown',
      parish: 'St Thomas',
      acres: 5,
      crops: ['banana', 'callaloo', 'yam'],
      confidence: 'high' as ConfidenceLevel,
    },
  },
  {
    name: 'Patois format',
    input: 'Mi name a Mary Smith. Mi have 2.5 acre in Clarendon. A grow pepper and ginger.',
    expected: {
      name: 'Mary Smith',
      parish: 'Clarendon',
      acres: 2.5,
      crops: ['ginger', 'hot pepper'],
      confidence: 'high' as ConfidenceLevel,
    },
  },
  {
    name: 'Name only',
    input: 'My name is Bob.',
    expected: {
      name: 'Bob',
      parish: null,
      acres: null,
      crops: [],
      confidence: 'medium' as ConfidenceLevel,
    },
  },
  {
    name: 'Crops only',
    input: 'I grow yam, banana, and dasheen.',
    expected: {
      name: null,
      parish: null,
      acres: null,
      crops: ['banana', 'dasheen', 'yam'],
      confidence: 'medium' as ConfidenceLevel,
    },
  },
  {
    name: 'About acres',
    input: 'About 3 acres in Manchester. Name: Sarah.',
    expected: {
      name: 'Sarah',
      parish: 'Manchester',
      acres: 3,
      crops: [],
      confidence: 'high' as ConfidenceLevel,
    },
  },
  {
    name: 'Crop synonyms',
    input: 'Growing coco and pepper in St Ann.',
    expected: {
      name: null,
      parish: 'St Ann',
      acres: null,
      crops: ['cocoa', 'hot pepper'],
      confidence: 'medium' as ConfidenceLevel,
    },
  },
  {
    name: 'Empty input',
    input: '',
    expected: {
      name: null,
      parish: null,
      acres: null,
      crops: [],
      confidence: 'low' as ConfidenceLevel,
      notes: ['Empty or invalid input'],
    },
  },
]
