# ✅ SMS Reliability System

## Overview

The SMS system now includes comprehensive reliability safeguards to ensure message delivery while protecting against abuse and handling failures gracefully.

## Features

### 1. ✅ Retry Logic
- **Max 3 attempts** per SMS
- **Exponential backoff**: 1s, 2s, 4s delays between retries
- Automatic retry on failure (network errors, Twilio errors, etc.)

### 2. ✅ Rate Limiting
- **Max 5 SMS per phone number per hour**
- In-memory cache for fast lookups
- Database fallback for distributed systems
- **Non-blocking**: Rate-limited SMS are saved for admin retry (doesn't block form submissions)

### 3. ✅ Failure Tracking
- All failed SMS attempts saved to `FailedSMS` table
- Tracks: phone, message, error, attempts, timestamps
- Enables admin review and manual retry

### 4. ✅ Admin Retry Endpoint
- **GET** `/api/admin/retry-failed-sms` - List all failed SMS
- **POST** `/api/admin/retry-failed-sms` - Retry a specific failed SMS
- **DELETE** `/api/admin/retry-failed-sms?id=...` - Remove resolved records

### 5. ✅ Non-Blocking Design
- **Never blocks form submissions** - SMS failures are logged but don't prevent form success
- All SMS operations are fire-and-forget
- Errors are logged but don't throw exceptions

---

## Database Schema

### FailedSMS Model

```prisma
model FailedSMS {
  id            String   @id @default(uuid())
  phone         String
  message       String   @db.Text
  error         String?  @db.Text
  attempts      Int      @default(1)
  createdAt     DateTime @default(now()) @map("created_at")
  lastAttemptAt DateTime? @map("last_attempt_at")

  @@map("failed_sms")
  @@schema("public")
}
```

---

## How It Works

### SMS Sending Flow

1. **Form Submission** → Database write succeeds
2. **SMS Attempt** → `sendSubmissionConfirmationSMS()` called (non-blocking)
3. **Rate Limit Check** → In-memory cache + database check
4. **If Rate Limited** → Save to `FailedSMS`, return (form still succeeds)
5. **If Allowed** → Attempt SMS send with retry logic
6. **On Failure** → Retry up to 3 times with exponential backoff
7. **If All Retries Fail** → Save to `FailedSMS` for admin retry

### Retry Logic

```
Attempt 1: Immediate
Attempt 2: Wait 1 second
Attempt 3: Wait 2 seconds
Max Attempts: 3
```

### Rate Limiting

```
Window: 1 hour
Limit: 5 SMS per phone number
Tracking: In-memory cache + database fallback
Behavior: Save to FailedSMS if rate limited (non-blocking)
```

---

## API Endpoints

### Admin: List Failed SMS

```bash
GET /api/admin/retry-failed-sms?limit=50&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "phone": "+18761234567",
      "message": "Hi John, we've received...",
      "error": "Twilio API error: 400",
      "attempts": 3,
      "createdAt": "2026-01-23T10:00:00Z",
      "lastAttemptAt": "2026-01-23T10:00:05Z"
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

### Admin: Retry Failed SMS

```bash
POST /api/admin/retry-failed-sms
Content-Type: application/json

{
  "id": "failed-sms-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "SMS retry successful",
  "messageSid": "SM1234567890"
}
```

### Admin: Delete Failed SMS Record

```bash
DELETE /api/admin/retry-failed-sms?id=failed-sms-uuid
```

**Response:**
```json
{
  "success": true,
  "message": "Failed SMS record deleted"
}
```

---

## Code Structure

### Files Created/Modified

1. **`prisma/schema.prisma`**
   - Added `FailedSMS` model

2. **`lib/sms-reliability.ts`** (NEW)
   - `sendSMSWithRetry()` - Main SMS sending function with retry logic
   - `checkRateLimit()` - Rate limiting logic
   - `saveFailedSMS()` - Save failures to database
   - `retryFailedSMS()` - Admin retry function

3. **`app/api/sms/send/route.ts`** (UPDATED)
   - Now uses `sendSMSWithRetry()` instead of direct `sendSMS()`

4. **`app/api/admin/retry-failed-sms/route.ts`** (NEW)
   - Admin endpoints for managing failed SMS

---

## Usage Examples

### From Submission Handlers

```typescript
// Already integrated - no changes needed!
// All submission handlers automatically use the new reliability system

sendSubmissionConfirmationSMS(phone, name, 'booking').catch((error) => {
  console.error('Error sending SMS (non-blocking):', error)
  // Form submission still succeeds even if SMS fails
})
```

### Admin Retry

```typescript
// List failed SMS
const response = await fetch('/api/admin/retry-failed-sms?limit=10')
const { data } = await response.json()

// Retry a specific failed SMS
await fetch('/api/admin/retry-failed-sms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 'failed-sms-uuid' }),
})
```

---

## Rate Limiting Details

### Implementation

- **In-Memory Cache**: Fast lookups for active rate limit tracking
- **Database Fallback**: Checks `FailedSMS` table for recent attempts
- **Fail-Open**: If rate limit check fails, allows SMS (prevents blocking)

### Behavior

- **Rate Limited**: SMS saved to `FailedSMS` with error "Rate limit exceeded"
- **Admin Can Retry**: Rate-limited SMS can be manually retried later
- **Form Submission**: Always succeeds regardless of SMS rate limit status

---

## Error Handling

### All Errors Are Non-Blocking

1. **Rate Limit Errors** → Saved to `FailedSMS`, form succeeds
2. **Network Errors** → Retried automatically, form succeeds
3. **Twilio API Errors** → Retried automatically, form succeeds
4. **Database Errors** → Logged, SMS attempt continues, form succeeds
5. **All Retries Exhausted** → Saved to `FailedSMS`, form succeeds

### Logging

- ✅ Success: `✅ SMS sent to +1876... (attempt 1/3)`
- ⚠️ Retry: `⏳ Retrying SMS in 1000ms... (attempt 2/3)`
- ⚠️ Rate Limit: `⚠️ Rate limited: +1876...`
- ❌ Failure: `❌ SMS failed after 3 attempts: [error]`

---

## Production Considerations

### Enhancements for Scale

1. **Redis for Rate Limiting**: Replace in-memory cache with Redis for distributed systems
2. **Successful SMS Tracking**: Add `SuccessfulSMS` table for accurate rate limiting
3. **Background Job Queue**: Use BullMQ/Agenda for retry scheduling
4. **Monitoring**: Add metrics/alerts for failure rates
5. **Authentication**: Add auth middleware for admin endpoints

### Current Limitations

- In-memory rate limit cache resets on server restart
- Rate limiting uses `FailedSMS` table as fallback (conservative)
- No automatic retry scheduling (manual admin retry only)

---

## Testing

### Test Rate Limiting

```bash
# Send 6 SMS to same phone in quick succession
# 6th SMS should be rate limited and saved to FailedSMS
```

### Test Retry Logic

```bash
# Temporarily break Twilio config
# Submit form - should retry 3 times, then save to FailedSMS
```

### Test Admin Retry

```bash
# List failed SMS
curl http://localhost:3000/api/admin/retry-failed-sms

# Retry a failed SMS
curl -X POST http://localhost:3000/api/admin/retry-failed-sms \
  -H "Content-Type: application/json" \
  -d '{"id":"failed-sms-uuid"}'
```

---

## ✅ Complete!

The SMS system now has:
- ✅ Retry logic (3 attempts, exponential backoff)
- ✅ Rate limiting (5 SMS/hour per phone)
- ✅ Failure tracking (FailedSMS table)
- ✅ Admin retry endpoint
- ✅ Non-blocking (never blocks form submissions)

All existing submission handlers automatically benefit from these improvements! 🌱
