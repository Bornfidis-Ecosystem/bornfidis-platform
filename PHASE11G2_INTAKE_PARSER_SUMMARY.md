# Phase 11G.2: Intake Parser Implementation

## ✅ Created Files

### 1. `lib/intakeParser.ts`
Main parser implementation with:
- ✅ `parseFarmerMessage(text: string)` function
- ✅ Type definitions (`ParsedFarmerMessage`, `ConfidenceLevel`)
- ✅ Name extraction (multiple patterns including Patois)
- ✅ Acres extraction (various formats)
- ✅ Parish detection (whitelist of 14 Jamaican parishes)
- ✅ Crop detection (whitelist + fallback, normalization, deduplication, synonyms)
- ✅ Confidence calculation (high/medium/low)
- ✅ Notes generation for edge cases
- ✅ Inline examples and documentation

### 2. `lib/__tests__/intakeParser.test.ts`
Comprehensive unit tests covering:
- Name extraction patterns
- Acres extraction patterns
- Parish detection
- Crop extraction and normalization
- Confidence calculation
- Edge cases
- Complete real-world examples

### 3. `lib/intakeParser.examples.ts`
Usage examples and demo:
- 8 different example scenarios
- Real-world WhatsApp message examples
- Patois format examples
- Can be run standalone for testing

## 📋 Function Signature

```typescript
function parseFarmerMessage(text: string): ParsedFarmerMessage
```

## 📊 Output Shape

```typescript
interface ParsedFarmerMessage {
  name: string | null
  parish: string | null
  acres: number | null
  crops: string[]
  confidence: 'high' | 'medium' | 'low'
  notes: string[]
}
```

## 🔍 Parsing Rules Implemented

### Name Detection
- ✅ "my name is X"
- ✅ "mi name a X" (Patois)
- ✅ "name: X"
- ✅ "I am X"
- ✅ Filters false positives

### Acres Detection
- ✅ "X acres" / "X acre"
- ✅ "about X acres" / "around X acres"
- ✅ "approximately X acres"
- ✅ Handles decimals (2.5, 3.7, etc.)
- ✅ Validates range (0 < acres < 10000)

### Parish Detection
- ✅ Whitelist of 14 Jamaican parishes:
  - Portland, St Thomas, St Mary, St Ann
  - Manchester, Clarendon, Kingston, St Andrew
  - Westmoreland, Hanover, Trelawny, St James, St Elizabeth
- ✅ Handles variations: "St Thomas", "St. Thomas", "Saint Thomas"
- ✅ Matches in context: "in X", "from X", "located in X"

### Crop Detection
- ✅ Known crops whitelist (20 crops)
- ✅ Normalization (lowercase, trim)
- ✅ Deduplication
- ✅ Synonym mapping:
  - "coco" → "cocoa"
  - "pepper" → "hot pepper"
  - "scallions" → "scallion"
- ✅ Fallback for unknown crops (up to 5)
- ✅ Handles "and", commas, various separators

### Confidence Calculation
- ✅ **high**: 2+ fields found
- ✅ **medium**: 1 field found
- ✅ **low**: 0 fields found

## 📝 Usage Examples

### Basic Usage

```typescript
import { parseFarmerMessage } from '@/lib/intakeParser'

const message = 'My name is John Brown. I have 5 acres in St Thomas. Growing yam, banana, and callaloo.'

const result = parseFarmerMessage(message)

console.log(result)
// {
//   name: "John Brown",
//   parish: "St Thomas",
//   acres: 5,
//   crops: ["banana", "callaloo", "yam"],
//   confidence: "high",
//   notes: []
// }
```

### Patois Example

```typescript
const patoisMessage = 'Mi name a Mary. Mi have 2.5 acre in Clarendon. A grow pepper and ginger.'

const result = parseFarmerMessage(patoisMessage)
// {
//   name: "Mary",
//   parish: "Clarendon",
//   acres: 2.5,
//   crops: ["ginger", "hot pepper"], // pepper normalized to hot pepper
//   confidence: "high",
//   notes: []
// }
```

### Integration with FarmerIntake

```typescript
import { parseFarmerMessage } from '@/lib/intakeParser'
import { db } from '@/lib/db'

// After receiving WhatsApp message
const intake = await db.farmerIntake.create({
  data: {
    channel: 'whatsapp',
    fromPhone: phone,
    messageText: message,
    status: 'received',
  },
})

// Parse the message
const parsed = parseFarmerMessage(message)

// Update intake with parsed data
await db.farmerIntake.update({
  where: { id: intake.id },
  data: {
    parsedJson: parsed,
    status: parsed.confidence === 'high' ? 'parsed' : 'needs_review',
  },
})
```

## 🧪 Testing

### Run Unit Tests

```bash
# If using Jest
npx jest lib/__tests__/intakeParser.test.ts

# Or run examples
RUN_EXAMPLES=true npx ts-node lib/intakeParser.examples.ts
```

### Test Coverage

- ✅ Name extraction (4 patterns)
- ✅ Acres extraction (3 patterns)
- ✅ Parish detection (14 parishes)
- ✅ Crop extraction (20 known crops + fallback)
- ✅ Confidence calculation (3 levels)
- ✅ Edge cases (empty input, invalid data)
- ✅ Real-world examples (8 scenarios)

## 🔧 Configuration

### Adding New Crops

Edit `KNOWN_CROPS` array in `lib/intakeParser.ts`:

```typescript
const KNOWN_CROPS = [
  // ... existing crops
  'new crop name',
] as const
```

### Adding Crop Synonyms

Edit `CROP_SYNONYMS` object:

```typescript
const CROP_SYNONYMS: Record<string, string> = {
  // ... existing synonyms
  'synonym': 'canonical name',
}
```

### Adding Parishes

Edit `PARISH_WHITELIST` array:

```typescript
const PARISH_WHITELIST = [
  // ... existing parishes
  'new parish',
] as const
```

## 📚 Next Steps

1. **Integrate with WhatsApp webhook:**
   - Parse incoming messages
   - Store in `parsedJson` field
   - Update `status` based on confidence

2. **Create farmer profile:**
   - Use parsed data to create `Farmer` record
   - Link `FarmerIntake` to `Farmer`
   - Create `FarmerCrop` records

3. **Review queue:**
   - Show intakes with `confidence: 'low'` or `'needs_review'` status
   - Allow admin to manually correct/approve

4. **Improve parser:**
   - Add more patterns based on real messages
   - Machine learning for better extraction
   - Handle more Patois variations

## ✅ Features

- ✅ Handles Jamaican Patois
- ✅ Normalizes crop names
- ✅ Maps synonyms
- ✅ Deduplicates crops
- ✅ Validates data ranges
- ✅ Generates helpful notes
- ✅ Calculates confidence
- ✅ Comprehensive error handling
- ✅ Well-documented with examples
- ✅ Unit tested
