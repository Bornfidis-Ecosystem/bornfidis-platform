# ✅ Offline Submission Reliability System

## Overview

A robust offline submission system using IndexedDB for reliable form submissions even when users are offline. Automatically syncs when back online with retry logic and user-friendly notifications.

## Features

### 1. ✅ IndexedDB Storage

**File:** `lib/offline-storage.ts`

**Stores:**
- `id`: Unique submission ID
- `payload`: Form data (JSON)
- `endpoint`: API endpoint to submit to
- `createdAt`: Timestamp
- `retries`: Number of retry attempts
- `lastError`: Last error message (if any)
- `status`: 'pending' | 'syncing' | 'synced' | 'failed'

**Functions:**
- `saveOfflineSubmission()` - Save submission to IndexedDB
- `getPendingSubmissions()` - Get all pending submissions
- `getAllSubmissions()` - Get all submissions (for display)
- `updateSubmissionStatus()` - Update submission status
- `deleteSubmission()` - Delete after successful sync
- `clearSyncedSubmissions()` - Clean up old synced submissions

### 2. ✅ Auto-Sync Service

**File:** `lib/offline-sync.ts`

**Features:**
- Automatic sync when coming back online
- Periodic sync check (every 30 seconds)
- Retry logic with exponential backoff
- Max 3 retries per submission
- Network error handling
- Status change notifications

**Functions:**
- `submitWithOfflineFallback()` - Submit with offline fallback
- `syncPendingSubmissions()` - Sync all pending submissions
- `initAutoSync()` - Initialize auto-sync listeners
- `isOnline()` - Check online status
- `onSyncStatusChange()` - Subscribe to pending count changes

### 3. ✅ Online/Offline Detection

- Uses `navigator.onLine` API
- Listens to `online` and `offline` events
- Automatically syncs when connection restored
- Visual indicators in UI

### 4. ✅ Sync Now Button

**File:** `components/ui/SyncButton.tsx`

**Features:**
- Fixed position button (bottom-right)
- Shows pending submission count
- Disabled when offline
- Loading state during sync
- Auto-hides when nothing to sync (if online)

**States:**
- Online + Pending: Green button with count
- Offline: Gray button with "Offline" text
- Syncing: Loading spinner
- Synced: Checkmark (briefly shown)

### 5. ✅ Toast Notifications

**File:** `components/ui/Toast.tsx`

**Types:**
- `success` - Green, 5s duration
- `error` - Red, 7s duration
- `info` - Blue, 5s duration
- `warning` - Yellow, 6s duration

**Usage:**
```typescript
import { toast } from '@/components/ui/Toast'

toast.success('Booking submitted!')
toast.error('Submission failed')
toast.info('Saved offline')
toast.warning('Connection lost')
```

**Features:**
- Fixed position (top-right)
- Auto-dismiss with configurable duration
- Manual close button
- Stack multiple toasts
- Smooth animations

### 6. ✅ Integration

**Files Modified:**
- `app/layout.tsx` - Added ToastContainer and SyncButton
- `app/book/page.tsx` - Integrated offline submission
- `app/api/submit-booking/route.ts` - Created API route wrapper

**Components Added:**
- `components/ui/OfflineSyncProvider.tsx` - Initializes auto-sync

---

## How It Works

### Submission Flow

1. **User submits form**
   - Form calls `submitWithOfflineFallback()`
   - If online: Tries to submit via API
   - If offline or network error: Saves to IndexedDB

2. **Online submission success**
   - Shows success toast
   - Redirects to thank you page
   - No IndexedDB entry created

3. **Offline or network error**
   - Saves to IndexedDB with status 'pending'
   - Shows info toast: "Saved offline, will sync when online"
   - Redirects to thank you page
   - Sync button appears with count

4. **Auto-sync when online**
   - Listens to `online` event
   - Automatically syncs pending submissions
   - Retries up to 3 times on failure
   - Updates status and shows toasts

5. **Manual sync**
   - User clicks "Sync Now" button
   - Syncs all pending submissions
   - Shows success/error toasts
   - Updates button count

### Retry Logic

- **Max retries:** 3
- **Retry delay:** 5 seconds between retries
- **Status tracking:** Updates retries count and lastError
- **Failure handling:** After max retries, status set to 'failed'

### Data Structure

```typescript
interface OfflineSubmission {
  id: string                    // Unique ID
  payload: Record<string, any>  // Form data
  endpoint: string              // API endpoint
  createdAt: number            // Timestamp
  retries: number              // Retry count
  lastError: string | null     // Last error message
  status: 'pending' | 'syncing' | 'synced' | 'failed'
}
```

---

## API Contract

**No changes to existing API contracts!**

The system works with existing endpoints:
- `/api/submit-booking` - Booking submissions
- `/api/housing/apply` - Housing applications
- `/api/farm/apply` - Farmer applications
- `/api/chef/apply` - Chef applications
- `/api/stories/submit` - Story submissions
- etc.

All endpoints expect:
- `POST` request
- `Content-Type: application/json`
- JSON body with form data
- Response: `{ success: boolean, error?: string }`

---

## Usage Examples

### Basic Integration

```typescript
import { submitWithOfflineFallback } from '@/lib/offline-sync'
import { toast } from '@/components/ui/Toast'

const handleSubmit = async (formData: Record<string, any>) => {
  const result = await submitWithOfflineFallback(
    formData,
    '/api/submit-booking'
  )

  if (result.success) {
    toast.success('Submitted successfully!')
  } else if (result.offline) {
    toast.info('Saved offline, will sync when online')
  } else {
    toast.error(result.error || 'Submission failed')
  }
}
```

### Check Pending Count

```typescript
import { onSyncStatusChange } from '@/lib/offline-sync'

useEffect(() => {
  const unsubscribe = onSyncStatusChange((count) => {
    console.log(`Pending submissions: ${count}`)
  })
  return unsubscribe
}, [])
```

### Manual Sync

```typescript
import { syncPendingSubmissions } from '@/lib/offline-sync'

const handleSync = async () => {
  const result = await syncPendingSubmissions()
  console.log(`Synced: ${result.synced}, Failed: ${result.failed}`)
}
```

---

## Browser Compatibility

### IndexedDB Support
- ✅ Chrome/Edge: Full support
- ✅ Firefox: Full support
- ✅ Safari: Full support
- ✅ Mobile browsers: Full support

### Online/Offline API
- ✅ All modern browsers
- ✅ Mobile browsers
- ⚠️ May not detect all network issues (e.g., DNS failures)

---

## Testing

### Test Offline Submission

1. **Open browser DevTools**
2. **Go to Network tab**
3. **Enable "Offline" mode**
4. **Submit form**
5. **Verify:**
   - Toast shows "Saved offline"
6. **Disable "Offline" mode**
7. **Verify:**
   - Auto-sync triggers
   - Toast shows success
   - Sync button count decreases

### Test Retry Logic

1. **Submit form offline**
2. **Go online with slow/unreliable connection**
3. **Watch sync attempts**
4. **Verify:**
   - Retries up to 3 times
   - Error messages logged
   - Status updates correctly

### Test Manual Sync

1. **Submit multiple forms offline**
2. **Go online**
3. **Click "Sync Now" button**
4. **Verify:**
   - All submissions sync
   - Success toast shows count
   - Button updates

---

## Future Enhancements

1. **Background Sync API**
   - Use Service Worker for background sync
   - Sync even when tab is closed

2. **Conflict Resolution**
   - Handle duplicate submissions
   - Merge conflicts intelligently

3. **Submission History**
   - Show all submissions (synced and failed)
   - Allow manual retry of failed submissions

4. **Progress Indicators**
   - Show sync progress for multiple submissions
   - Individual submission status

5. **Storage Management**
   - Auto-cleanup old synced submissions
   - Storage quota warnings

---

## Security

✅ **No sensitive data exposure:**
- Form data stored locally only
- No external storage
- Cleared after successful sync

✅ **Validation:**
- Server-side validation still enforced
- Client-side validation before saving offline

✅ **Privacy:**
- Data never leaves user's device until synced
- No tracking or analytics on offline data

---

## ✅ Complete!

The offline submission system is now:
- ✅ Using IndexedDB (not localStorage)
- ✅ Storing: id, payload, createdAt, retries, lastError
- ✅ Auto-syncing when online
- ✅ Manual "Sync Now" button
- ✅ Toast notifications
- ✅ No API contract changes
- ✅ Integrated into booking form

**Ready to use!** 🎉
