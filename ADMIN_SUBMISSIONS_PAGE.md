# ✅ Admin Submissions Page

## Overview

A comprehensive admin submissions page has been created to manage all platform submissions with filtering, search, pagination, and status management.

## Features

### 1. ✅ Unified Submissions View
- Fetches from multiple tables:
  - `booking_inquiries` (bookings)
  - `farmers` (farmer applications)
  - `chefs` (chef applications)
  - `submissions` (generic submissions)
- Combines all submissions into a single view
- Sorted by date (newest first)

### 2. ✅ Table Display
Columns:
- **Type**: Submission type badge (Booking, Farmer, Chef, Submission)
- **Name**: Submitter's name
- **Phone**: Phone number (or "-" if not provided)
- **Email**: Email address (or "-" if not provided)
- **Date**: Formatted submission date with time
- **Status**: Color-coded status badge
- **Actions**: Edit and Delete buttons

### 3. ✅ Filters
- **Type Filter**: All, Booking, Farmer, Chef, Submission
- **Status Filter**: All, Pending, Contacted, Approved, Rejected
- **Date Range**: Start date and end date pickers
- **Search**: Search by name, email, or phone number
- **Clear Filters**: Quick reset button

### 4. ✅ Status Management
- **Status Dropdown**: Edit status inline
- **Status Options**:
  - pending, new, contacted, reviewed
  - approved, confirmed
  - rejected, declined, closed
- **Color Coding**:
  - Yellow: Pending/New
  - Blue: Contacted/Reviewed
  - Green: Approved/Confirmed
  - Red: Rejected/Declined/Closed
  - Gray: Other

### 5. ✅ Pagination
- **20 submissions per page**
- Shows current page and total pages
- Previous/Next navigation
- Displays total count and range

### 6. ✅ Delete Functionality
- **Delete Button**: Red delete button for each submission
- **Confirmation Modal**: 
  - Shows submission type
  - Requires explicit confirmation
  - Cannot be undone warning
- **Protected**: Only admins can delete (via requireAdmin guard)

### 7. ✅ Empty State
- Friendly message when no submissions found
- Different message for filtered vs. unfiltered state
- Suggests adjusting filters if results are filtered

### 8. ✅ Admin Guard
- Protected by `requireAdmin` guard in layout
- Redirects to login if not authenticated
- Shows "Access Denied" if not admin role

---

## Files Created/Modified

1. **`app/admin/submissions/page.tsx`** (REPLACED)
   - Complete rewrite with all requested features
   - Client component with state management
   - Tailwind CSS styling

2. **`app/api/admin/submissions/route.ts`** (UPDATED)
   - **GET**: Enhanced to fetch from multiple tables with filters
   - **PATCH**: Updated to handle different submission types
   - **DELETE**: New endpoint for deleting submissions

---

## API Endpoints

### GET /api/admin/submissions

**Query Parameters:**
- `type`: all | booking | farmer | chef | submission
- `status`: all | pending | contacted | approved | rejected
- `search`: Search term (name, email, phone)
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "submissions": [
    {
      "id": "uuid",
      "type": "booking",
      "name": "John Doe",
      "phone": "+18761234567",
      "email": "john@example.com",
      "date": "2026-01-23T10:00:00Z",
      "status": "New",
      "createdAt": "2026-01-23T10:00:00Z",
      "rawData": { /* original submission data */ }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### PATCH /api/admin/submissions

**Body:**
```json
{
  "id": "submission-uuid",
  "type": "booking",
  "status": "approved"
}
```

**Response:**
```json
{
  "success": true,
  "submission": { /* updated submission */ }
}
```

### DELETE /api/admin/submissions?id=uuid&type=booking

**Response:**
```json
{
  "success": true,
  "message": "Submission deleted"
}
```

---

## Usage

### Accessing the Page

1. Navigate to `/admin/submissions`
2. Admin guard checks authentication and role
3. Page loads with all submissions

### Filtering Submissions

1. **By Type**: Select submission type from dropdown
2. **By Status**: Select status from dropdown
3. **By Date**: Set start and end dates
4. **By Search**: Type name, email, or phone in search box
5. **Clear**: Click "Clear all filters" to reset

### Updating Status

1. Click **Edit** button on a submission
2. Select new status from dropdown
3. Click **Save** to update
4. Click **Cancel** to discard changes

### Deleting Submissions

1. Click **Delete** button on a submission
2. Confirm deletion in modal
3. Submission is permanently deleted

### Pagination

- Use **Previous** and **Next** buttons to navigate
- Shows current page and total pages
- Displays range of submissions shown

---

## Status Values by Type

### Bookings
- New, Contacted, Confirmed, Closed

### Farmers
- pending, reviewed, approved, declined

### Chefs
- pending, approved, rejected

### Generic Submissions
- pending (default)

---

## Styling

- **Tailwind CSS**: All styling uses Tailwind utility classes
- **Brand Colors**: 
  - Primary: `#1a5f3f` (green)
  - Accent: `#FFBC00` (gold)
- **Responsive**: Table scrolls horizontally on mobile
- **Hover Effects**: Row hover states for better UX

---

## Security

- ✅ Protected by `requireAdmin` guard
- ✅ All API routes check admin access
- ✅ Delete requires explicit confirmation
- ✅ Status updates validated server-side

---

## Future Enhancements

1. **Export**: CSV/Excel export functionality
2. **Bulk Actions**: Select multiple submissions for bulk status update
3. **Detail View**: Click row to see full submission details
4. **Notes**: Add internal notes to submissions
5. **Email Integration**: Send emails directly from page
6. **Advanced Filters**: More granular filtering options

---

## ✅ Complete!

The admin submissions page is now:
- ✅ Fetching from multiple tables via Prisma/Supabase
- ✅ Displaying comprehensive table with all requested columns
- ✅ Filtering by type, status, date range, and search
- ✅ Pagination (20 per page)
- ✅ Status update dropdown
- ✅ Delete with confirmation modal
- ✅ Tailwind CSS styling
- ✅ Empty state with friendly message
- ✅ Protected by requireAdmin guard

Ready to use! 🎉
