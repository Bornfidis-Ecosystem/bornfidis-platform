# Phase 11G.3: WhatsApp Coordinator Hub

## Overview

Phase 11G.3 extends Phase 11G.1 and 11G.2 to add WhatsApp support and build a Coordinator Command Center for managing farmers, making calls, and sending WhatsApp messages.

## What Was Built

### 1. WhatsApp Integration

**File:** `lib/twilio.ts`

**New Functions:**
- `sendWhatsApp()` - Generic WhatsApp sending function
- `sendCoordinatorWhatsAppNotification()` - Sends WhatsApp to coordinators about new farmers

**Features:**
- Uses Twilio WhatsApp API
- Formats phone numbers as `whatsapp:+1234567890`
- Graceful error handling
- Non-blocking (doesn't fail request if WhatsApp fails)

### 2. Updated Farmer Join API

**File:** `app/api/farmers/join/route.ts`

**Changes:**
- Added WhatsApp support for farmer welcome message
- Added WhatsApp support for coordinator notifications
- Controlled by `ENABLE_WHATSAPP` environment variable
- Falls back to SMS if WhatsApp not enabled

**WhatsApp Messages:**
- **Farmer:** "Bornfidis Portland: Thank you for joining our farmer network. We will call you soon to connect your farm to chefs and markets. 🇯🇲🌱"
- **Coordinators:** "🌾 New farmer joined: {name} from {parish}\n📞 Phone: {phone}\n🌱 Crops: {crops}\n📏 Acres: {acres}"

### 3. WhatsApp API Endpoint

**File:** `app/api/farmers/whatsapp/route.ts`

**Endpoint:** `POST /api/farmers/whatsapp`

**Accepts:**
```json
{
  "farmer_id": "uuid (required)",
  "phone": "string (required, E.164 format)",
  "message": "string (required)"
}
```

**Features:**
- Requires authentication (coordinator/admin)
- Validates farmer exists
- Sends WhatsApp via Twilio
- Returns message SID

### 4. Coordinator Command Center

**File:** `app/admin/coordinator/page.tsx` + `CoordinatorDashboardClient.tsx`

**Features:**
- **Farmer List:**
  - Table view with all farmers
  - Sortable columns
  - Quick actions per farmer

- **Filters:**
  - Search (name, phone, crops)
  - Parish filter
  - Crop filter
  - Status filter
  - Real-time filtering

- **Actions per Farmer:**
  - **View** - Opens farmer profile page
  - **📞 Call** - Initiates Twilio voice call
  - **💬 WhatsApp** - Sends WhatsApp message

- **Statistics:**
  - Total farmers count
  - Filtered results count

### 5. Enhanced Farmer Profile Page

**File:** `app/admin/farmers/[id]/FarmerDetailClient.tsx`

**New Features:**
- **WhatsApp Section:**
  - Send WhatsApp button
  - Custom message modal
  - Message preview
  - Send confirmation

- **Layout:**
  - Call and WhatsApp side-by-side
  - Consistent styling
  - Mobile-responsive

## Environment Variables

Add to `.env.local`:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+18664917107

# WhatsApp Configuration
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ENABLE_WHATSAPP=true

# Coordinator WhatsApp Numbers
COORDINATOR_SHAMAINE_WHATSAPP=whatsapp:+1XXXXXXXXXX
COORDINATOR_SUZETTE_WHATSAPP=whatsapp:+1XXXXXXXXXX
```

## Database

No new database tables required. Uses existing `farmers_applications` table.

## Testing Checklist

### 1. WhatsApp Integration
- [ ] Set `ENABLE_WHATSAPP=true`
- [ ] Set `TWILIO_WHATSAPP_FROM`
- [ ] Submit farmer application
- [ ] Verify WhatsApp sent to farmer
- [ ] Verify WhatsApp sent to coordinators
- [ ] Check Twilio logs

### 2. Coordinator Dashboard
- [ ] Navigate to `/admin/coordinator`
- [ ] See list of all farmers
- [ ] Test search filter
- [ ] Test parish filter
- [ ] Test crop filter
- [ ] Test status filter
- [ ] Verify filtered results count

### 3. Call Functionality
- [ ] Click "Call" button on farmer
- [ ] Verify call initiated
- [ ] Check call log created
- [ ] Verify farmer receives call

### 4. WhatsApp Functionality
- [ ] Click "WhatsApp" button on farmer
- [ ] Customize message in modal
- [ ] Send WhatsApp
- [ ] Verify message sent
- [ ] Check Twilio logs
- [ ] Verify farmer receives WhatsApp

### 5. Farmer Profile Page
- [ ] Navigate to `/admin/farmers/[id]`
- [ ] See farmer details
- [ ] Test call functionality
- [ ] Test WhatsApp functionality
- [ ] View call history
- [ ] Add/edit call summary

### 6. Error Handling
- [ ] Test with missing Twilio config
- [ ] Test with invalid phone number
- [ ] Test with farmer not found
- [ ] Verify graceful error messages

## Files Created

1. `app/admin/coordinator/page.tsx` - Coordinator dashboard page
2. `app/admin/coordinator/CoordinatorDashboardClient.tsx` - Coordinator dashboard client
3. `app/api/farmers/whatsapp/route.ts` - WhatsApp API endpoint
4. `PHASE11G3_WHATSAPP_COORDINATOR_HUB.md` - This documentation

## Files Modified

1. `lib/twilio.ts` - Added WhatsApp functions
2. `app/api/farmers/join/route.ts` - Added WhatsApp support
3. `app/admin/farmers/[id]/FarmerDetailClient.tsx` - Added WhatsApp section

## Key Features

### 1. WhatsApp Sending
- Twilio WhatsApp API integration
- Phone number formatting (`whatsapp:+1234567890`)
- Error handling
- Non-blocking (doesn't fail requests)

### 2. Coordinator Dashboard
- Comprehensive farmer list
- Advanced filtering
- Quick actions (View, Call, WhatsApp)
- Real-time search
- Status indicators

### 3. WhatsApp Modal
- Custom message input
- Message preview
- Send confirmation
- Error handling

### 4. Integration
- Works with existing call system
- Extends Phase 11G.1 and 11G.2
- Uses existing farmer data
- Maintains consistency

## Workflow

### 1. New Farmer Joins
1. Farmer submits application
2. If `ENABLE_WHATSAPP=true`:
   - WhatsApp sent to farmer
   - WhatsApp sent to coordinators
3. If WhatsApp disabled:
   - SMS sent (existing behavior)

### 2. Coordinator Views Dashboard
1. Navigate to `/admin/coordinator`
2. See all farmers
3. Apply filters (parish, crop, status)
4. Search for specific farmer

### 3. Coordinator Calls Farmer
1. Click "Call" button
2. Call initiated via Twilio
3. Call log created
4. Farmer receives call

### 4. Coordinator Sends WhatsApp
1. Click "WhatsApp" button
2. Modal opens with message
3. Customize message
4. Send WhatsApp
5. Message sent via Twilio
6. Confirmation shown

## WhatsApp Message Format

### Farmer Welcome
```
Bornfidis Portland: Thank you for joining our farmer network. We will call you soon to connect your farm to chefs and markets. 🇯🇲🌱
```

### Coordinator Notification
```
🌾 New farmer joined: {name} from {parish}
📞 Phone: {phone}
🌱 Crops: {crops}
📏 Acres: {acres}
```

## Security

1. **Authentication:**
   - All API routes require authentication
   - Only coordinators/admins can access
   - RLS policies protect data

2. **Input Validation:**
   - Zod schemas
   - Server-side validation
   - Phone number validation
   - Message length limits

3. **Rate Limiting:**
   - Existing rate limits apply
   - Prevents abuse

## Performance

1. **Non-Blocking:**
   - WhatsApp sending is async
   - Doesn't delay API response
   - Errors logged but don't fail request

2. **Efficient Filtering:**
   - Client-side filtering
   - Real-time updates
   - No server round-trips

## Troubleshooting

### WhatsApp Not Sending
1. Verify `ENABLE_WHATSAPP=true`
2. Check `TWILIO_WHATSAPP_FROM` format
3. Verify phone number format
4. Check Twilio account balance
5. Review Twilio logs
6. Check API response

### Coordinator Dashboard Not Loading
1. Verify authentication
2. Check database connection
3. Review server logs
4. Check browser console

### Filters Not Working
1. Check filter state
2. Verify data structure
3. Review React DevTools
4. Check browser console

## Next Steps

1. **Set Up Twilio WhatsApp:**
   - Configure WhatsApp Business API
   - Get WhatsApp number
   - Add credentials to `.env.local`
   - Test WhatsApp sending

2. **Test End-to-End:**
   - Submit farmer application
   - Verify WhatsApp received
   - Test coordinator dashboard
   - Test call and WhatsApp actions

3. **Enhancements:**
   - Add WhatsApp message templates
   - Add WhatsApp conversation history
   - Add bulk WhatsApp sending
   - Add WhatsApp webhook handling

## Support

For issues:
1. Check Twilio console logs
2. Verify WhatsApp configuration
3. Check API responses
4. Review browser console
5. Test with Twilio test numbers
6. Review this documentation

## Notes

- WhatsApp requires Twilio WhatsApp Business API
- Phone numbers must be in E.164 format
- WhatsApp messages have character limits
- WhatsApp requires opt-in (for production)
- All features degrade gracefully
- Works alongside existing SMS system
