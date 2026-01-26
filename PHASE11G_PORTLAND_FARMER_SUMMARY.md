# Phase 11G: Portland Farmer Experience Upgrade

## Overview

Phase 11G creates a specialized Portland farmer experience page with mobile-first design, voice-first forms, offline support, SMS confirmation, and Patois language toggle. The page is optimized for low bandwidth and designed for a 60-second join flow.

## What Was Built

### 1. Portland Page

**File:** `app/portland/PortlandClient.tsx`
- Hero section with specific messaging
- Big action buttons (5 total)
- Language toggle (English ↔ Patois)
- "What is Bornfidis" section
- "How it Works" section (Grow → Cook → Serve)
- Stories section with Portland faces
- Farmer join flow modal

### 2. Farmer Join Flow

**File:** `app/portland/FarmerJoinFlow.tsx`
- Voice-first form with Web Speech API
- Fields: name, phone, acres, crops
- Microphone icon for each field
- Offline support with IndexedDB
- Auto-submit when coming back online
- SMS confirmation via Twilio
- Accessible big buttons
- 60-second join flow design

### 3. API Integration

**File:** `app/api/portland/farmer-join/route.ts`
- Farmer application endpoint
- Phone number validation and formatting
- Twilio SMS integration
- Error handling
- Ready for database integration

### 4. Enhanced Components

**Voice Input:** `app/portland/VoiceInput.tsx`
- Web Speech API integration
- Visual feedback
- Browser compatibility

**Offline Storage:** `app/portland/OfflineStorage.tsx`
- IndexedDB + localStorage
- Auto-save functionality
- Pending submission queue

**Patois Provider:** `app/portland/PatoisProvider.tsx`
- Extended translations
- All new content translated

## Key Features

### 1. Hero Section
- **Title:** "Bornfidis Portland – Restoring land, people, and purpose through food"
- **Subtitle:** "Join our regenerative food movement in the Pacific Northwest"
- Forest green background with gold accent

### 2. Big Action Buttons
1. **Join as Farmer** - Opens farmer join flow
2. **Join as Chef** - Opens chef join (placeholder)
3. **Youth Apprenticeship** - Opens youth app (placeholder)
4. **Book Event** - Links to booking page
5. **Support** - Links to impact page

### 3. What is Bornfidis
- One sentence explanation
- Simple, clear language
- Centered in light green box

### 4. How it Works
- Three icons: 🌾 Grow → 👨‍🍳 Cook → 🍽️ Serve
- Simple descriptions
- Visual flow

### 5. Stories Section
- Portland faces (placeholder avatars)
- Two story cards
- Personal testimonials

### 6. Farmer Join Flow
- **Voice-First:** Microphone button for each field
- **Fields:**
  - Name (required)
  - Phone (required)
  - Acres (optional)
  - Crops (optional)
- **Offline Support:** Saves form, auto-submits when online
- **SMS Confirmation:** Sends text via Twilio
- **60-Second Flow:** Optimized for speed

## Technical Implementation

### Voice Input
```typescript
<VoiceInput
  onResult={(text) => handleVoiceInput('name', text)}
  label="Speak"
/>
```

**Features:**
- Web Speech API
- Visual feedback (pulsing when listening)
- Browser compatibility check
- Automatic field population

### Offline Support
```typescript
// Save form data
saveFormData('farmer-join', formData)

// Save pending submission
saveFormData('farmer-join-pending', formData)

// Auto-submit when online
useEffect(() => {
  if (isOnline && formData.name && formData.phone) {
    const saved = loadFormData('farmer-join-pending')
    if (saved) {
      handleSubmit(saved, true)
    }
  }
}, [isOnline])
```

### SMS Integration
```typescript
// Twilio API call
const response = await fetch(
  `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      From: fromNumber,
      To: phone,
      Body: `Welcome to Bornfidis Portland, ${name}!...`,
    }),
  }
)
```

## Environment Variables

Add to `.env.local`:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Design Principles

### Mobile-First
- Large touch targets (minimum 48x48px)
- Big buttons with clear labels
- Simplified navigation
- Responsive grid layouts
- Readable font sizes (minimum 18px)

### Plain Language
- Simple, direct wording
- No jargon
- Clear action buttons
- Helpful error messages

### Low Bandwidth
- Minimal dependencies
- No heavy images
- Inline styles
- Small bundle size
- Efficient rendering

### 60-Second Flow
- Minimal fields
- Voice input for speed
- Auto-save
- Quick submission
- Immediate feedback

## Testing Checklist

### 1. Mobile-First Design
- [ ] Test on iPhone
- [ ] Test on Android
- [ ] Verify large touch targets
- [ ] Check responsive layout
- [ ] Test on tablet

### 2. Voice Input
- [ ] Test in Chrome/Edge
- [ ] Test in Safari
- [ ] Verify microphone permission
- [ ] Test start/stop
- [ ] Verify text appears in field
- [ ] Test with different accents

### 3. Patois Toggle
- [ ] Click toggle button
- [ ] Verify all text changes
- [ ] Test form labels
- [ ] Test button text
- [ ] Test error messages

### 4. Offline Support
- [ ] Fill out form
- [ ] Go offline
- [ ] Verify form saved
- [ ] Submit form offline
- [ ] Go back online
- [ ] Verify auto-submit
- [ ] Check SMS received

### 5. SMS Confirmation
- [ ] Submit farmer form
- [ ] Verify SMS sent
- [ ] Check message content
- [ ] Test with invalid phone
- [ ] Test with missing Twilio config

### 6. 60-Second Flow
- [ ] Time form completion
- [ ] Test voice input speed
- [ ] Verify quick submission
- [ ] Check immediate feedback

### 7. Low Bandwidth
- [ ] Test on slow 3G
- [ ] Verify page loads quickly
- [ ] Check bundle size
- [ ] Test with images disabled

## Files Created

1. `app/portland/PortlandClient.tsx` - Main page component (updated)
2. `app/portland/FarmerJoinFlow.tsx` - Farmer join modal
3. `app/api/portland/farmer-join/route.ts` - Farmer join API
4. `PHASE11G_PORTLAND_FARMER_SUMMARY.md` - This documentation

## Files Modified

1. `app/portland/PatoisProvider.tsx` - Extended translations
2. `app/portland/OfflineStorage.tsx` - Enhanced for pending submissions

## Workflow

### 1. User Visits Page
1. Sees hero section
2. Sees big action buttons
3. Can toggle language
4. Reads "What is Bornfidis"
5. Sees "How it Works"
6. Reads stories

### 2. User Clicks "Join as Farmer"
1. Modal opens
2. Form appears with voice input buttons
3. User can type or speak
4. Form auto-saves as they type
5. User submits form

### 3. Form Submission
1. If online: Submits immediately, sends SMS
2. If offline: Saves to pending queue
3. When back online: Auto-submits pending form
4. SMS confirmation sent
5. Success message shown

## SMS Message

**Template:**
```
Welcome to Bornfidis Portland, [Name]! We've received your application and will be in touch soon. Reply STOP to opt out.
```

**Customization:**
- Can be modified in `app/api/portland/farmer-join/route.ts`
- Supports Patois version (future enhancement)

## Error Handling

### Voice Input Errors
- Browser not supported: Button hidden
- Permission denied: Alert shown
- Recognition error: Logged, form still works

### Offline Errors
- Form saved locally
- Pending queue maintained
- Auto-retry on reconnect

### SMS Errors
- Application still saved
- Error logged
- User notified
- Can retry manually

## Security Considerations

1. **Phone Number Validation**
   - Format validation
   - E.164 formatting
   - Length checks

2. **SMS Sending**
   - Twilio credentials in env vars
   - Rate limiting (Twilio default)
   - Opt-out support (STOP keyword)

3. **Form Data**
   - Stored locally only
   - Not sent until submission
   - Validated on server
   - No sensitive data exposed

## Future Enhancements

1. **Chef Join Flow**
   - Similar to farmer join
   - Different fields
   - Same voice input

2. **Youth Apprenticeship**
   - Application form
   - Parent/guardian fields
   - Age verification

3. **Enhanced SMS**
   - Patois messages
   - Follow-up messages
   - Two-way communication

4. **Database Integration**
   - Save to `portland_farmers` table
   - Track application status
   - Admin dashboard

5. **Analytics**
   - Track voice input usage
   - Monitor offline submissions
   - Language preference tracking
   - Form completion time

## Troubleshooting

### Voice Input Not Working
1. Check browser compatibility
2. Verify microphone permissions
3. Check HTTPS (required)
4. Test in incognito mode
5. Review browser console

### SMS Not Sending
1. Verify Twilio credentials
2. Check phone number format
3. Verify Twilio account balance
4. Check Twilio logs
5. Review API response

### Offline Auto-Submit Not Working
1. Check online/offline detection
2. Verify pending queue
3. Check IndexedDB/localStorage
4. Review network events
5. Test manual retry

### Form Not Saving
1. Check localStorage support
2. Verify no private mode
3. Check storage quota
4. Review browser console
5. Test with different browser

## Next Steps

1. **Set Up Twilio**
   - Create Twilio account
   - Get phone number
   - Add credentials to `.env.local`
   - Test SMS sending

2. **Test on Real Devices**
   - Test on iPhone
   - Test on Android
   - Test voice input
   - Test offline mode

3. **Database Integration**
   - Create `portland_farmers` table
   - Update API to save to database
   - Add admin dashboard

4. **Gather Feedback**
   - User testing
   - Accessibility audit
   - Performance testing
   - Language accuracy

5. **Deploy**
   - Test in staging
   - Monitor performance
   - Gather user feedback
   - Iterate based on data

## Support

For issues:
1. Check browser console
2. Verify Twilio configuration
3. Test microphone permissions
4. Check network connectivity
5. Review this documentation
6. Test in different browsers

## Notes

- Voice input requires HTTPS in production
- SMS requires Twilio account and credentials
- Offline storage uses localStorage + IndexedDB
- Form validation on client and server
- All features degrade gracefully
- 60-second flow is a goal, not a requirement
- Patois translations are basic (can be expanded)
