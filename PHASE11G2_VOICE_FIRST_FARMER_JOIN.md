# Phase 11G.2: Voice-First Farmer Join (Patois/EN) + Offline-First UX

## Overview

Phase 11G.2 implements a voice-first, low-bandwidth, offline-friendly Farmer Join experience for Portland Jamaica, with an English/Patois toggle, and optional voice-to-text input per field using Web Speech API. Designed to work well on mobile devices.

## What Was Built

### 1. VoiceField Component

**File:** `components/farm/VoiceField.tsx`

**Features:**
- Reusable voice input component
- Web Speech API integration
- Microphone button with visual feedback
- Listening state (pulsing red animation)
- Error handling
- Graceful fallback if not supported
- Supports en-US for both English and Patois modes
- Free-form speech (doesn't block unknown words)
- Minimum 48px touch targets

**Usage:**
```tsx
<VoiceField
  value={formData.name}
  onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
  onVoiceUsed={() => setVoiceUsed(true)}
  placeholder="Your name"
  required
  language="en"
/>
```

### 2. Phone Number Normalization

**File:** `lib/phone-normalize.ts`

**Features:**
- Jamaica support: +1-876, +1-658
- US support: +1
- E.164 format validation
- Auto-detection of Jamaican numbers
- Clear error messages

**Normalization Rules:**
- `876XXXXXXXX` → `+1876XXXXXXXX` (Jamaica)
- `658XXXXXXXX` → `+1658XXXXXXXX` (Jamaica)
- `XXXXXXXXXX` (10 digits, not 876/658) → `+1XXXXXXXXXX` (US)
- `+1XXXXXXXXXX` → Kept as is
- Invalid formats return clear error messages

### 3. Voice-First Farmer Join Form

**File:** `components/farm/FarmerJoinFormVoiceFirst.tsx`

**Features:**
- English/Patois toggle (prominent, top-right)
- Offline banner when offline
- Voice input for all fields:
  - Name (required)
  - Phone (required, with validation)
  - Parish (default: Portland)
  - Acres (optional)
  - Crops (required, comma-separated)
- Big tap targets (minimum 48px)
- High contrast for sunlight readability
- Offline queue integration
- Voice_ready flag automatically set when voice is used

**Fields:**
- All fields support voice input
- Phone field has special validation
- Crops field allows comma-separated values
- Parish defaults to "Portland"

### 4. Updated API Endpoint

**File:** `app/api/farmers/join/route.ts`

**Changes:**
- Added `language` field to schema ('en' | 'pat')
- Enhanced phone normalization for Jamaica
- Validates E.164 format
- Stores language preference

### 5. Updated Farmer Apply Page

**File:** `app/farm/apply/page.tsx`

**Changes:**
- Uses new `FarmerJoinFormVoiceFirst` component
- Initializes offline queue on page load
- Maintains existing header/footer styling

## Translations

### English (EN)
- Headline: "Join as a Farmer"
- Helper: "Quick signup. We'll call you soon."
- Success: "Thank you! We'll reach out soon."
- Offline: "Offline — we'll send when you're back online."
- Offline Saved: "Saved offline — will send when online."

### Patois (PAT)
- Headline: "Join as Farmer"
- Helper: "Quick signup. Wi link yuh up soon."
- Success: "Respect! Wi ago link yuh up soon."
- Offline: "No signal — wi send it when yuh back online."
- Offline Saved: "Save offline — wi send it when yuh online."

## Phone Number Validation

### Jamaica Numbers
- **876 prefix:** `8761234567` → `+18761234567`
- **658 prefix:** `6581234567` → `+16581234567`
- **With +1:** `+18761234567` → Kept as is

### US Numbers
- **10 digits:** `5035551234` → `+15035551234`
- **With +1:** `+15035551234` → Kept as is

### Error Messages
- Invalid format: "Phone number must be 10 digits (Jamaica: 876 or 658 prefix, US: any 10 digits)"
- Too short: "Phone number is required"
- Invalid format: "Invalid phone number format"

## Offline Behavior

### When Offline
1. User fills out form
2. Submits form
3. Request fails (network error)
4. Request automatically queued via `queueRequest()`
5. Shows message: "Saved offline — will send when online."

### When Back Online
1. Browser detects online status
2. Offline queue automatically processes
3. Queued request sent to API
4. Success message shown
5. Form cleared

## Voice Input Behavior

### Supported Browsers
- ✅ Chrome/Edge (desktop & mobile)
- ✅ Safari (iOS 14.1+)
- ❌ Firefox (graceful fallback - mic button hidden)

### Language Support
- Uses `en-US` for both English and Patois modes
- Free-form speech recognition
- Doesn't block unknown words
- Works with Jamaican accents

### Voice Usage Tracking
- When any field uses voice input, `voice_ready` flag is set to `true`
- Flag is included in API payload
- Stored in database for future voice features

## Accessibility

### Touch Targets
- All buttons minimum 48px height
- Full width on mobile
- Large tap areas

### Contrast
- High contrast colors (forest green & gold)
- Readable in sunlight
- Clear visual feedback

### Screen Readers
- Proper labels on all inputs
- ARIA labels on buttons
- Error messages announced

## Testing Checklist

### Device Tests

#### Mobile Chrome (Android)
- [ ] Open `/farm/apply`
- [ ] Verify language toggle visible
- [ ] Test voice input on name field
- [ ] Test voice input on phone field
- [ ] Test voice input on crops field
- [ ] Verify microphone button appears
- [ ] Test phone normalization (876 prefix)
- [ ] Submit form successfully
- [ ] Test offline mode

#### Mobile Safari (iOS)
- [ ] Open `/farm/apply`
- [ ] Verify language toggle visible
- [ ] Test voice input (requires permission)
- [ ] Verify microphone button appears
- [ ] Test form submission
- [ ] Test offline mode

#### Desktop Chrome
- [ ] Open `/farm/apply`
- [ ] Test all voice inputs
- [ ] Test language toggle
- [ ] Test phone validation
- [ ] Test offline mode

### Offline Test Steps

1. **Prepare:**
   - Open browser DevTools
   - Go to Network tab
   - Enable "Offline" mode

2. **Test Form:**
   - Fill out farmer join form
   - Use voice input for at least one field
   - Submit form
   - Verify "Saved offline" message appears

3. **Test Queue:**
   - Check localStorage for queued request
   - Verify request is in queue

4. **Test Reconnection:**
   - Disable "Offline" mode in DevTools
   - Wait for queue to process
   - Verify success message appears
   - Check database for saved application

### Voice Supported/Not Supported Behavior

#### Voice Supported (Chrome/Edge/Safari)
- [ ] Microphone button appears
- [ ] Clicking mic requests permission
- [ ] Permission granted: voice input works
- [ ] Permission denied: error message shown
- [ ] Voice input populates field
- [ ] `voice_ready` flag set to true

#### Voice Not Supported (Firefox)
- [ ] Microphone button hidden
- [ ] "Voice not supported on this device" hint shown
- [ ] Form still works with typing only
- [ ] No errors or crashes

### Patois Toggle Behavior

1. **Default State:**
   - [ ] Form loads in English
   - [ ] All text in English
   - [ ] Toggle shows "🇺🇸 EN"

2. **Switch to Patois:**
   - [ ] Click toggle
   - [ ] All text changes to Patois
   - [ ] Toggle shows "🇯🇲 PAT"
   - [ ] Form labels translated
   - [ ] Messages translated
   - [ ] Placeholders translated

3. **Switch Back to English:**
   - [ ] Click toggle again
   - [ ] All text changes back to English
   - [ ] Toggle shows "🇺🇸 EN"

4. **Form Submission:**
   - [ ] Language preference sent to API
   - [ ] Stored in database (if implemented)
   - [ ] Used for future communications

### Phone Validation Tests

#### Jamaica Numbers
- [ ] `8761234567` → Normalizes to `+18761234567`
- [ ] `6581234567` → Normalizes to `+16581234567`
- [ ] `+18761234567` → Kept as is
- [ ] `+16581234567` → Kept as is

#### US Numbers
- [ ] `5035551234` → Normalizes to `+15035551234`
- [ ] `+15035551234` → Kept as is

#### Invalid Numbers
- [ ] `123` → Shows error
- [ ] `876123` → Shows error (too short)
- [ ] `abc123` → Shows error

### Form Validation Tests

#### Required Fields
- [ ] Name: Empty → Shows error
- [ ] Phone: Empty → Shows error
- [ ] Crops: Empty → Shows error

#### Optional Fields
- [ ] Parish: Can be empty (defaults to Portland)
- [ ] Acres: Can be empty

### Voice Input Tests

#### Name Field
- [ ] Click mic button
- [ ] Speak name
- [ ] Name appears in field
- [ ] `voice_ready` flag set

#### Phone Field
- [ ] Click mic button
- [ ] Speak phone number
- [ ] Phone appears in field
- [ ] Validation runs
- [ ] Error shown if invalid

#### Crops Field
- [ ] Click mic button
- [ ] Speak crops (comma-separated)
- [ ] Crops appear in field
- [ ] Multiple crops accepted

## Files Created

1. `components/farm/VoiceField.tsx` - Voice input component
2. `components/farm/FarmerJoinFormVoiceFirst.tsx` - Voice-first form
3. `lib/phone-normalize.ts` - Phone normalization utility
4. `PHASE11G2_VOICE_FIRST_FARMER_JOIN.md` - This documentation

## Files Modified

1. `app/farm/apply/page.tsx` - Updated to use new form
2. `app/api/farmers/join/route.ts` - Added language field, enhanced phone normalization

## API Changes

### Request Payload
```json
{
  "name": "string (required)",
  "phone": "string (required, E.164 format)",
  "parish": "string (optional, default: Portland)",
  "acres": "string (optional)",
  "crops": "string (required)",
  "voice_ready": "boolean (optional, default: false)",
  "language": "en | pat (optional, default: en)"
}
```

### Response
```json
{
  "success": true,
  "message": "Application submitted successfully...",
  "application_id": "uuid"
}
```

## Browser Compatibility

### Web Speech API
- ✅ Chrome 33+ (desktop & mobile)
- ✅ Edge 79+ (desktop & mobile)
- ✅ Safari 14.1+ (iOS & macOS)
- ❌ Firefox (graceful fallback)

### Offline Queue
- ✅ All modern browsers
- ✅ Mobile browsers
- ✅ Works with localStorage

## Performance

### Low Bandwidth Optimization
- Minimal dependencies
- No heavy images
- Efficient rendering
- Small bundle size
- Fast load time

### Voice Input
- Only loads when needed
- Graceful fallback
- No blocking resources
- Efficient recognition

## Security

1. **Input Validation:**
   - Client-side validation
   - Server-side validation (Zod)
   - Phone number normalization
   - SQL injection protection (Supabase)

2. **Rate Limiting:**
   - 5 requests per minute per IP
   - Prevents abuse

3. **Offline Queue:**
   - Stored locally only
   - Not sent until online
   - Validated on server

## Troubleshooting

### Voice Input Not Working
1. Check browser compatibility
2. Verify microphone permissions
3. Check HTTPS (required)
4. Test in incognito mode
5. Review browser console

### Phone Validation Failing
1. Check phone format
2. Verify normalization logic
3. Test with different formats
4. Review error messages

### Offline Queue Not Working
1. Check localStorage support
2. Verify online/offline detection
3. Check browser console
4. Review queue processing logs

### Language Toggle Not Working
1. Verify component state
2. Check translations object
3. Review React DevTools
4. Check browser console

## Next Steps

1. **Test on Real Devices:**
   - Test on Android phones
   - Test on iPhones
   - Test voice input
   - Test offline mode

2. **Gather Feedback:**
   - User testing
   - Accessibility audit
   - Performance testing
   - Language accuracy

3. **Enhancements:**
   - Add more Patois translations
   - Improve voice recognition accuracy
   - Add voice feedback
   - Enhance offline sync

## Support

For issues:
1. Check browser console
2. Verify microphone permissions
3. Test phone number formats
4. Check network connectivity
5. Review this documentation
6. Test in different browsers

## Notes

- Voice input requires HTTPS in production
- Microphone permission required
- Offline queue uses localStorage
- Phone normalization handles Jamaica + US
- Language preference stored for future use
- Voice_ready flag enables future voice features
- All features degrade gracefully
