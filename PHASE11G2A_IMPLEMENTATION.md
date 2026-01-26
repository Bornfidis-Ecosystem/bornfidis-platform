# Phase 11G.2A — Intake Parsing Engine (Production-Ready)

## ✅ Implementation Complete

This phase implements a deterministic, production-ready intake parsing engine that converts raw intake text into structured farmer data.

## 📁 Files Created

### 1. Parsing Contract (Single Source of Truth)
**File:** `lib/intake/types.ts`

Defines the `ParsedFarmerIntake` type that all parsing functions must return:
```typescript
export type ParsedFarmerIntake = {
  name?: string
  phone?: string
  parish?: string
  crops?: string[]
  quantity?: string
  frequency?: 'weekly' | 'biweekly' | 'monthly'
}
```

### 2. Core Parser (Deterministic)
**File:** `lib/intake/parseIntake.ts`

Fast, predictable parser with no hallucinations:
- ✅ Extracts parish from whitelist
- ✅ Extracts crops from keyword list
- ✅ Extracts phone numbers via regex
- ✅ Extracts name from common patterns
- ✅ Extracts quantity and frequency (optional)
- ✅ No AI dependencies (can be layered later in Phase 11G.2B)

**Key Features:**
- Deterministic output (same input = same output)
- Fast execution (no external API calls)
- No hallucinations (only extracts what's explicitly found)
- Handles common Jamaican Patois patterns

### 3. Intake Processing API
**File:** `app/api/intakes/process/route.ts`

**Endpoint:** `POST /api/intakes/process`

**Request:**
```json
{
  "intakeId": "uuid-string"
}
```

**Response:**
```json
{
  "status": "parsed" | "needs_followup",
  "parsed": {
    "name": "John Doe",
    "phone": "+18761234567",
    "parish": "St Thomas",
    "crops": ["yam", "banana"],
    "quantity": "5 lbs",
    "frequency": "weekly"
  }
}
```

**Status Decision Rules:**
| Condition | Status |
|-----------|--------|
| Parsed successfully + all required fields present | `parsed` |
| Parsed successfully + missing key info | `needs_followup` |
| Parsing fails | `needs_followup` |

**Required Fields to Advance:**
- `phone` (must be present)
- `parish` (must be present)
- `crops.length > 0` (must have at least one crop)

**Security:**
- Protected with `requireAuth()` - only authenticated admins can process intakes

### 4. Database Schema Updates
**File:** `prisma/schema.prisma`

**Changes:**
1. Added `needs_followup` to `FarmerIntakeStatus` enum
2. Added `parsedData` JSONB column to `FarmerIntake` model

**Migration:** `prisma/migrations/20250123000000_phase11g2a_intake_parsing/migration.sql`

## 🔄 Status Flow

```
received → [process] → parsed (if complete) OR needs_followup (if incomplete)
```

## 📊 Usage Example

```typescript
import { parseIntakeText } from '@/lib/intake/parseIntake'

// Parse a message
const parsed = parseIntakeText(
  "My name is John Brown. I'm in St Thomas. Growing yam and banana. Phone: 876-123-4567"
)

// Result:
// {
//   name: "John Brown",
//   phone: "876-123-4567",
//   parish: "St Thomas",
//   crops: ["yam", "banana"]
// }
```

## 🚀 Next Steps

### To Apply Database Changes:

1. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Apply Migration:**
   ```bash
   # Option 1: Use Prisma migrate (if connection works)
   npx prisma migrate dev --name phase11g2a_intake_parsing
   
   # Option 2: Apply SQL manually in Supabase Dashboard
   # Copy contents of prisma/migrations/20250123000000_phase11g2a_intake_parsing/migration.sql
   # Paste into Supabase SQL Editor and run
   ```

3. **Test the API:**
   ```bash
   # Get an intake ID from your database
   curl -X POST http://localhost:3000/api/intakes/process \
     -H "Content-Type: application/json" \
     -H "Cookie: your-auth-cookie" \
     -d '{"intakeId": "your-intake-id"}'
   ```

## 🔍 Testing

### Manual Testing:
1. Create a test intake record in the database
2. Call the processing API with the intake ID
3. Verify:
   - `parsed_data` column is populated
   - `status` is set correctly (`parsed` or `needs_followup`)
   - Parsed data matches expected structure

### Test Cases:
- **Complete intake:** Has phone, parish, and crops → `status: "parsed"`
- **Missing phone:** Has parish and crops → `status: "needs_followup"`
- **Missing parish:** Has phone and crops → `status: "needs_followup"`
- **Missing crops:** Has phone and parish → `status: "needs_followup"`
- **Empty message:** No data extracted → `status: "needs_followup"`

## 📝 Notes

- The parser is deterministic and fast (no external API calls)
- AI can be layered on top in Phase 11G.2B for enhanced extraction
- `parsed_data` JSONB column enables:
  - Audit trail of AI output
  - Re-processing later
  - Training smarter models
  - Debugging parsing issues

## 🔗 Related Files

- `lib/intakeParser.ts` - Original parser (Phase 11G.2, more complex)
- `app/api/whatsapp/inbound/route.ts` - WhatsApp webhook (uses old parser)
- `app/admin/intakes/page.tsx` - Admin dashboard for viewing intakes

## ⚠️ Important

- The new parser (`parseIntake`) is simpler and more focused than the original
- Both parsers can coexist - use the new one for Phase 11G.2A requirements
- The old parser (`parseFarmerMessage`) is still available for backward compatibility
