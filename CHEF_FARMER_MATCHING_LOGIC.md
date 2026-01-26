# ✅ Chef-Farmer Matching Logic

## Overview

Matching algorithm that connects chefs' ingredient needs with farmers' available crops, scoring matches based on crop compatibility, location proximity, and farmer experience.

## Matching Algorithm

### Scoring System

Each farmer is scored on a scale of 0-100 based on three factors:

1. **Crop Match (50 points)**
   - Exact match (case-insensitive): 50 points
   - Partial match (one crop name contains the other): 25 points
   - No match: 0 points

2. **Parish Proximity (30 points)**
   - Same parish: 30 points
   - Different parish: 0 points
   - Note: Currently chefs don't have parish data, so this will be 0 until chef location is added

3. **Experience/Acres (20 points)**
   - Normalized based on acres
   - 100+ acres = 20 points (maximum)
   - Linear scale below 100 acres
   - Formula: `min(20, (acres / 100) * 20)`
   - No acres or 0 acres = 0 points

### Algorithm Flow

1. **Fetch Chef Needs**
   - Get all active needs for the specified chef
   - Ordered by start date (ascending)

2. **Fetch All Farmers**
   - Get all farmers with their crops
   - Include: id, name, phone, parish, acres, crops

3. **For Each Need:**
   - Find farmers with matching crops (case-insensitive)
   - Calculate match score for each farmer
   - Sort by score (descending)
   - Return top 5 matches

4. **Return Results**
   - Grouped by chef need
   - Each match includes:
     - Farmer details (id, name, phone, parish, acres)
     - Match score (0-100)
     - Score breakdown (crop, parish, acres)

---

## API Endpoint

### GET /api/matching/chef/{chefId}

**Purpose:** Get farmer matches for a chef's needs

**Authentication:**
- Admins can access any chef's matches
- Chefs can only access their own matches

**URL Parameters:**
- `chefId` (required): UUID of the chef

**Response (Success):**
```json
{
  "success": true,
  "chefId": "chef-uuid",
  "matches": [
    {
      "needId": "need-uuid",
      "crop": "tomatoes",
      "quantity": 20,
      "frequency": "weekly",
      "startDate": "2026-02-01",
      "endDate": "2026-12-31",
      "matches": [
        {
          "farmerId": "farmer-uuid",
          "farmerName": "John Farmer",
          "farmerPhone": "+18761234567",
          "farmerParish": "St. Andrew",
          "farmerAcres": 50,
          "crop": "tomatoes",
          "matchScore": 75.5,
          "scoreBreakdown": {
            "cropMatch": 50,
            "parishProximity": 0,
            "experienceAcres": 10
          }
        }
      ]
    }
  ],
  "summary": {
    "totalNeeds": 3,
    "totalMatches": 12,
    "needsWithMatches": 2,
    "needsWithoutMatches": 1
  }
}
```

**Response (Error - Unauthorized):**
```json
{
  "success": false,
  "error": "Unauthorized. You can only access your own matches."
}
```

**Response (Error - Chef Not Found):**
```json
{
  "success": false,
  "error": "Chef not found"
}
```

---

## Implementation Details

### Files Created

1. **`lib/matching.ts`**
   - Core matching algorithm
   - Scoring functions
   - `matchChefWithFarmers()` function

2. **`app/api/matching/chef/[chefId]/route.ts`**
   - API endpoint handler
   - Authentication/authorization
   - Error handling

### Key Functions

#### `calculateCropMatchScore(chefCrop, farmerCrop)`
- Compares crop names (case-insensitive)
- Returns 50 (exact), 25 (partial), or 0 (no match)

#### `calculateParishProximityScore(chefParish, farmerParish)`
- Compares parish names (case-insensitive)
- Returns 30 (same) or 0 (different/missing)

#### `calculateExperienceAcresScore(acres)`
- Normalizes acres to 0-20 point scale
- 100+ acres = 20 points
- Linear scale below 100

#### `matchChefWithFarmers(chefId)`
- Main matching function
- Returns array of needs with top 5 matches each

---

## Usage Examples

### Get Matches for a Chef

```typescript
// As admin
const response = await fetch('/api/matching/chef/chef-uuid', {
  headers: {
    // Admin auth token
  },
})

const data = await response.json()
if (data.success) {
  console.log('Matches:', data.matches)
  console.log('Summary:', data.summary)
}
```

### Access as Chef

```typescript
// As authenticated chef (can only access own matches)
const response = await fetch('/api/matching/chef/my-chef-id', {
  headers: {
    // Chef auth token
  },
})

const data = await response.json()
if (data.success) {
  data.matches.forEach((need) => {
    console.log(`Need: ${need.crop} (${need.quantity} ${need.frequency})`)
    need.matches.forEach((match) => {
      console.log(`  - ${match.farmerName}: ${match.matchScore}% match`)
      console.log(`    Crop: ${match.crop}, Parish: ${match.farmerParish}, Acres: ${match.farmerAcres}`)
    })
  })
}
```

---

## Scoring Examples

### Example 1: Perfect Match
- **Chef Need:** "tomatoes"
- **Farmer Crop:** "tomatoes"
- **Farmer Parish:** "St. Andrew" (same as chef)
- **Farmer Acres:** 150

**Score:**
- Crop Match: 50 (exact match)
- Parish Proximity: 30 (same parish)
- Experience/Acres: 20 (150 acres = max)
- **Total: 100**

### Example 2: Good Match
- **Chef Need:** "tomatoes"
- **Farmer Crop:** "tomato" (partial match)
- **Farmer Parish:** "St. Catherine" (different)
- **Farmer Acres:** 75

**Score:**
- Crop Match: 25 (partial match)
- Parish Proximity: 0 (different parish)
- Experience/Acres: 15 (75 acres = 15 points)
- **Total: 40**

### Example 3: Basic Match
- **Chef Need:** "onions"
- **Farmer Crop:** "onions"
- **Farmer Parish:** null (unknown)
- **Farmer Acres:** 25

**Score:**
- Crop Match: 50 (exact match)
- Parish Proximity: 0 (unknown)
- Experience/Acres: 5 (25 acres = 5 points)
- **Total: 55**

---

## Future Enhancements

1. **Chef Location Data**
   - Add parish/location to chefs table
   - Enable parish proximity scoring
   - Add distance calculation for more precise matching

2. **Quantity Matching**
   - Consider farmer's production capacity
   - Match based on quantity requirements
   - Factor in frequency (weekly, biweekly, monthly)

3. **Availability Matching**
   - Check if farmer can supply during need's date range
   - Consider seasonal availability
   - Factor in farmer's current commitments

4. **Historical Performance**
   - Track past chef-farmer transactions
   - Boost score for farmers with good history
   - Consider ratings/reviews

5. **Price Considerations**
   - Factor in farmer's pricing
   - Match within chef's budget range
   - Consider bulk pricing

6. **Multiple Crop Matching**
   - Match farmers who can supply multiple needs
   - Reduce delivery costs
   - Bundle scoring

7. **Real-time Updates**
   - WebSocket notifications for new matches
   - Auto-refresh when needs/farmers change
   - Push notifications for high-score matches

---

## Security

✅ **Authentication Required:**
- All requests require authentication
- Admins can access any chef's matches
- Chefs can only access their own matches

✅ **Data Validation:**
- Chef ID validated (must be UUID)
- Error handling for missing chefs
- Graceful handling of missing data

✅ **Privacy:**
- Only returns necessary farmer information
- No sensitive data exposed
- Matches scoped to authenticated user

---

## ✅ Complete!

The chef-farmer matching logic is now:
- ✅ Matching algorithm with 3-factor scoring
- ✅ Crop match (50%), parish proximity (30%), experience/acres (20%)
- ✅ Returns top 5 farmers per need
- ✅ Match score 0-100 with breakdown
- ✅ GET /api/matching/chef/{chefId} endpoint
- ✅ Authentication and authorization
- ✅ Admin and chef access control

**Ready to use!** 🎉
