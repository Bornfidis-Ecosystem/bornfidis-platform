/**
 * Test script to submit a booking via the API
 * Run with: npx tsx scripts/test-booking-submission.ts
 */

const testBooking = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '18761234567',
  eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
  eventTime: '18:00',
  location: '123 Test Street, Kingston, Jamaica',
  guests: '50',
  budgetRange: '2000_5000',
  dietaryRestrictions: 'Vegetarian options needed',
  notes: 'Test booking submission to verify Prisma integration',
  website_url: '', // Honeypot - must be empty
}

async function testBookingSubmission() {
  try {
    console.log('📝 Submitting test booking...')
    console.log('Booking data:', JSON.stringify(testBooking, null, 2))

    const response = await fetch('http://localhost:3000/api/submit-booking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBooking),
    })

    const result = await response.json()

    if (result.success) {
      console.log('✅ Booking submitted successfully!')
      console.log('Booking ID:', result.bookingId)
      console.log('\n📋 Next steps:')
      console.log('1. Check http://localhost:3000/admin/bookings')
      console.log('2. You should see the test booking in the list')
    } else {
      console.error('❌ Booking submission failed:')
      console.error('Error:', result.error)
      process.exit(1)
    }
  } catch (error: any) {
    console.error('❌ Error submitting booking:')
    console.error(error.message)
    process.exit(1)
  }
}

// Run the test
testBookingSubmission()
