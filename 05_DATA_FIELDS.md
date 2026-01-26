# BORNFIDIS DATA FIELDS SPECIFICATION

## Database Schema: `booking_inquiries`

### Core Fields

| Field Name | Type | Required | Validation | Notes |
|------------|------|----------|------------|-------|
| `id` | uuid | Yes | Auto-generated | Primary key |
| `created_at` | timestamp | Yes | Auto-generated | Inquiry submission time |
| `updated_at` | timestamp | Yes | Auto-updated | Last modification time |

### Customer Information

| Field Name | Type | Required | Validation | Notes |
|------------|------|----------|------------|-------|
| `name` | text | Yes | Min 2 chars | Full name |
| `email` | text | No | Valid email format | Primary contact method |
| `phone` | text | No | Valid phone format | Include country code |
| `whatsapp` | text | No | Valid phone format | Preferred for Jamaica customers |
| `preferred_contact` | text | No | enum: email, phone, whatsapp | Default: email |

### Event Details

| Field Name | Type | Required | Validation | Notes |
|------------|------|----------|------------|-------|
| `event_type` | text | Yes | enum: private_chef, corporate_catering, other | Service type |
| `event_date` | date | Yes | Future date only | Must be at least 14 days out (rule) |
| `event_time` | text | No | Format: HH:MM AM/PM | Approximate start time |
| `event_location` | text | Yes | Min 10 chars | Full address or venue name |
| `location_city` | text | No | - | Auto-extracted or manual |
| `location_state` | text | No | Default: VT | For radius calculations |

### Service Specifications

| Field Name | Type | Required | Validation | Notes |
|------------|------|----------|------------|-------|
| `guest_count` | integer | No | Min: 1, Max: 200 | Number of guests |
| `budget_range` | text | No | enum: under_1000, 1000_2000, 2000_5000, 5000_plus, flexible | Helps with quote accuracy |
| `dietary_restrictions` | text | No | Max 500 chars | Free text for allergies, preferences |
| `menu_preferences` | text | No | Max 1000 chars | Cuisine types, specific requests |
| `special_requests` | text | No | Max 1000 chars | Additional notes |

### Admin/Operational Fields

| Field Name | Type | Required | Validation | Notes |
|------------|------|----------|------------|-------|
| `status` | text | Yes | enum: new, contacted, quoted, confirmed, completed, cancelled | Default: new |
| `status_updated_at` | timestamp | No | Auto-updated | When status last changed |
| `assigned_to` | text | No | - | Future: team member assignment |
| `follow_up_date` | date | No | - | Reminder for admin follow-up |
| `deposit_status` | text | No | enum: pending, paid, refunded | Payment tracking |
| `deposit_amount` | decimal | No | Min: 0 | Amount in USD |
| `final_quote` | decimal | No | Min: 0 | Total quoted price |
| `internal_notes` | text | No | Max 2000 chars | Admin-only notes |

### Source Tracking

| Field Name | Type | Required | Validation | Notes |
|------------|------|----------|------------|-------|
| `referral_source` | text | No | enum: website, instagram, word_of_mouth, google, other | How they found us |
| `utm_source` | text | No | - | Marketing tracking |
| `utm_campaign` | text | No | - | Marketing tracking |

---

## Form Field Configuration (Frontend)

### Booking Form (`/book` page)

**Section 1: Your Information**
- Name (text input, required)
- Email (email input, required)
- Phone (tel input, optional but recommended)
- WhatsApp (tel input, optional, label: "WhatsApp (if different from phone)")
- Preferred Contact Method (radio: Email, Phone, WhatsApp)

**Section 2: Event Details**
- Service Type (dropdown: Private Chef Service, Corporate Catering, Other)
- Event Date (date picker, required, min: today + 14 days)
- Approximate Time (time input, optional)
- Event Location (textarea, required, placeholder: "Full address or venue name")
- Number of Guests (number input, optional, min: 1, placeholder: "Approximate")

**Section 3: Preferences**
- Budget Range (dropdown: Under $1,000, $1,000-$2,000, $2,000-$5,000, $5,000+, Flexible/Not Sure)
- Dietary Restrictions (textarea, optional, placeholder: "Vegetarian, vegan, gluten-free, allergies, etc.")
- Menu Preferences (textarea, optional, placeholder: "Cuisine styles, specific dishes, or themes")
- Special Requests (textarea, optional, placeholder: "Anything else we should know?")

**Section 4: How Did You Hear About Us?**
- Referral Source (dropdown: Website Search, Instagram, Word of Mouth, Google, Other)

**Honeypot Field (Spam Protection):**
- Hidden field: `website_url` (should remain empty, reject if filled)

**Submit Button:** "Submit Inquiry"

---

## Admin Dashboard Fields (`/admin/submissions`)

### List View Columns:
1. Created Date (sortable)
2. Name
3. Event Date (sortable)
4. Guest Count
5. Status (color-coded)
6. Actions (View Details, Update Status)

### Detail View Sections:
- **Customer Info:** All customer fields
- **Event Info:** All event fields
- **Status Management:** Update status dropdown, add internal notes
- **Follow-up:** Set follow-up date, send email template
- **Payment:** Record deposit, track final payment

---

## Validation Rules (Server-Side)

### Required Field Validation:
```javascript
{
  name: required && minLength(2),
  email: required && validEmail,
  event_type: required && oneOf(['private_chef', 'corporate_catering', 'other']),
  event_date: required && futureDate && minDaysFromNow(14),
  event_location: required && minLength(10)
}
```

### Business Logic Validation:
- If `event_date` is within 60 days of major holiday → flag for manual review
- If `guest_count` > 20 → require phone contact
- If `budget_range` is "under_1000" but `guest_count` > 10 → flag mismatch
- If `dietary_restrictions` contains severe allergy keywords → flag for priority contact

### Spam Protection:
- Honeypot field must be empty
- Rate limiting: Max 3 submissions per IP per hour
- Email domain validation (block obvious spam domains)
- Captcha for high-risk traffic (optional Phase 2)

---

## Email Templates (Auto-Send on Submission)

### Customer Confirmation Email

**Subject:** "Inquiry Received - Bornfidis Provisions"

**Body:**
```
Hi [name],

Thank you for your inquiry about [event_type] on [event_date].

We've received your request and will respond within 24 hours with a custom quote and availability confirmation.

YOUR REQUEST DETAILS:
- Event Date: [event_date]
- Location: [event_location]
- Guests: [guest_count]
- Dietary Needs: [dietary_restrictions or "None specified"]

NEXT STEPS:
1. We'll review your request and check availability
2. You'll receive a detailed quote within 48 hours
3. Once you approve, we'll send a deposit invoice to secure your date

Questions? Reply to this email or reach us:
📧 brian@bornfidis.com
📱 WhatsApp: [number]

Looking forward to serving you!

Chef Brian Bornfidis
Bornfidis Provisions
```

### Admin Notification Email

**Subject:** "NEW BOOKING INQUIRY - [name] - [event_date]"

**Body:**
```
New inquiry submitted:

CUSTOMER:
Name: [name]
Email: [email]
Phone: [phone]
Preferred Contact: [preferred_contact]

EVENT:
Type: [event_type]
Date: [event_date]
Time: [event_time]
Location: [event_location]
Guests: [guest_count]

DETAILS:
Budget: [budget_range]
Dietary: [dietary_restrictions]
Menu Preferences: [menu_preferences]
Special Requests: [special_requests]

SOURCE: [referral_source]

→ View in Dashboard: [link to /admin/submissions/[id]]
```

---

## Data Export Format (For Reporting)

### CSV Export Fields:
- Inquiry ID
- Submission Date
- Customer Name
- Contact Info (email, phone)
- Event Date
- Event Type
- Guest Count
- Location
- Status
- Quote Amount
- Deposit Status

### Analytics Tracking (Future Phase):
- Conversion rate: Inquiry → Quote → Confirmed
- Average quote value by event type
- Busiest booking months
- Most common referral sources
- Response time tracking (inquiry to first contact)

---

## Privacy & GDPR Compliance

### Data Retention Policy:
- Active inquiries: Retained indefinitely
- Cancelled/completed events: Retained for 2 years
- After 2 years: Archive or delete customer data (except financial records)
- Financial records: 7 years (tax compliance)

### User Rights (Future Phase):
- Right to access: Provide copy of all data on request
- Right to deletion: Honor within 30 days (except legal retention requirements)
- Right to correction: Allow updates to contact info
- Right to portability: Export data in CSV format

### Consent:
- Form includes checkbox: "I agree to allow Bornfidis to store my information for event coordination and follow-up. See our Privacy Policy."
- Link to privacy policy (create simple 1-page version)