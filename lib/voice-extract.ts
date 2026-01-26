/**
 * Voice/Text Field Extraction
 * Phase 11G.2: Extract farmer fields from transcript or text message
 */

interface ExtractedFields {
  name?: string | null
  parish?: string | null
  acres?: number | null
  crops?: string | null
}

// Known Jamaican parishes
const JAMAICAN_PARISHES = [
  'portland',
  'st mary',
  'st ann',
  'clarendon',
  'manchester',
  'st elizabeth',
  'westmoreland',
  'hanover',
  'st james',
  'trelawny',
  'st catherine',
  'st andrew',
  'kingston',
  'st thomas',
]

/**
 * Extract farmer fields from text using heuristics
 */
function extractFieldsHeuristic(inputText: string): ExtractedFields {
  const text = inputText.toLowerCase().trim()
  const fields: ExtractedFields = {}

  // Extract name patterns
  const namePatterns = [
    /(?:my name is|mi name|i am|i'm|call me|name is)\s+([a-z]+(?:\s+[a-z]+)*)/i,
    /^([a-z]+(?:\s+[a-z]+)*)(?:\s+here|\s+speaking)/i,
  ]

  for (const pattern of namePatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const name = match[1].trim()
      if (name.length > 2 && name.length < 50) {
        fields.name = name
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
        break
      }
    }
  }

  // Extract parish
  for (const parish of JAMAICAN_PARISHES) {
    const regex = new RegExp(`\\b${parish.replace(/\s+/g, '\\s+')}\\b`, 'i')
    if (regex.test(text)) {
      fields.parish = parish
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      break
    }
  }

  // Extract acres
  const acrePatterns = [
    /(\d+(?:\.\d+)?)\s*(?:acres?|acre)/i,
    /(?:half|quarter|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:acre|acres)/i,
  ]

  for (const pattern of acrePatterns) {
    const match = text.match(pattern)
    if (match) {
      let acres: number | null = null
      if (match[1]) {
        acres = parseFloat(match[1])
      } else {
        // Handle word numbers
        const word = match[0].toLowerCase()
        if (word.includes('half')) acres = 0.5
        else if (word.includes('quarter')) acres = 0.25
        else if (word.includes('one')) acres = 1
        else if (word.includes('two')) acres = 2
        else if (word.includes('three')) acres = 3
        else if (word.includes('four')) acres = 4
        else if (word.includes('five')) acres = 5
        else if (word.includes('six')) acres = 6
        else if (word.includes('seven')) acres = 7
        else if (word.includes('eight')) acres = 8
        else if (word.includes('nine')) acres = 9
        else if (word.includes('ten')) acres = 10
      }
      if (acres !== null && acres > 0 && acres < 10000) {
        fields.acres = acres
        break
      }
    }
  }

  // Extract crops
  const cropPatterns = [
    /(?:grow|plant|have|growing|planting|farming)\s+(?:[^.!?]*(?:yam|banana|callaloo|cassava|potato|tomato|corn|pepper|onion|carrot|cabbage|lettuce|okra|pumpkin|squash|beans|peas|rice|coconut|mango|avocado|orange|lemon|lime|papaya|guava|pineapple|sugar cane|coffee|cocoa|ginger|turmeric|herbs|spices)[^.!?]*)/i,
    /(?:crops?|produce|harvest)\s*:?\s*([^.!?]+)/i,
  ]

  for (const pattern of cropPatterns) {
    const match = text.match(pattern)
    if (match) {
      const cropsText = match[1] || match[0]
      // Clean up and extract crop names
      const crops = cropsText
        .split(/[,;]|\sand\s/)
        .map(c => c.trim())
        .filter(c => c.length > 2)
        .slice(0, 10) // Limit to 10 crops
        .join(', ')
      
      if (crops.length > 0) {
        fields.crops = crops
        break
      }
    }
  }

  return fields
}

/**
 * Extract fields using OpenAI if available
 */
async function extractFieldsWithOpenAI(inputText: string): Promise<ExtractedFields | null> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return null
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Extract farmer information from the following text. Return a JSON object with fields: name (string or null), parish (string or null - must be a Jamaican parish), acres (number or null), crops (string or null - comma-separated list). If a field cannot be determined, use null.`,
          },
          {
            role: 'user',
            content: inputText,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI extraction error:', errorText)
      return null
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return null
    }

    const extracted = JSON.parse(content)
    return {
      name: extracted.name || null,
      parish: extracted.parish || null,
      acres: typeof extracted.acres === 'number' ? extracted.acres : null,
      crops: extracted.crops || null,
    }
  } catch (error: any) {
    console.error('Error extracting fields with OpenAI:', error)
    return null
  }
}

/**
 * Extract farmer fields from text/transcript
 * Uses heuristics first, then OpenAI if available and confidence is low
 */
export async function extractFarmerFields(
  inputText: string,
  fromPhone: string
): Promise<ExtractedFields> {
  if (!inputText || inputText.trim().length === 0) {
    return {}
  }

  // First try heuristics
  const heuristicFields = extractFieldsHeuristic(inputText)

  // Calculate confidence (how many fields we found)
  const foundFields = Object.values(heuristicFields).filter(v => v !== null && v !== undefined)
  const confidence = foundFields.length

  // If low confidence (< 2 fields) and OpenAI available, try OpenAI
  if (confidence < 2) {
    const openAIFields = await extractFieldsWithOpenAI(inputText)
    if (openAIFields) {
      // Merge: prefer OpenAI for missing fields, keep heuristic for found fields
      return {
        name: heuristicFields.name || openAIFields.name || null,
        parish: heuristicFields.parish || openAIFields.parish || null,
        acres: heuristicFields.acres || openAIFields.acres || null,
        crops: heuristicFields.crops || openAIFields.crops || null,
      }
    }
  }

  return heuristicFields
}
