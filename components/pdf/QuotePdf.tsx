'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { BookingQuote } from '@/types/quote'
import { formatMoney } from '@/lib/money'
import { BookingInquiry } from '@/types/booking'
import { colors } from '@/lib/design-tokens'

// Register fonts if needed (optional - using system fonts for now)
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf',
// })

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
  },
  header: {
    marginBottom: 30,
    borderBottom: `2 solid ${colors.navy}`,
    paddingBottom: 15,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.navy,
    marginBottom: 5,
  },
  tagline: {
    fontSize: 10,
    color: '#666666',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.navy,
    marginBottom: 10,
    borderBottom: `1 solid ${colors.gold}`,
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
    color: '#333333',
  },
  value: {
    width: '70%',
    color: '#666666',
  },
  table: {
    marginTop: 15,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.navy,
    color: '#FFFFFF',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #E5E5E5',
  },
  tableCellTitle: {
    width: '40%',
    fontSize: 10,
  },
  tableCellDescription: {
    width: '30%',
    fontSize: 9,
    color: '#666666',
  },
  tableCellQty: {
    width: '10%',
    fontSize: 10,
    textAlign: 'right',
  },
  tableCellPrice: {
    width: '20%',
    fontSize: 10,
    textAlign: 'right',
  },
  totals: {
    marginTop: 10,
    marginLeft: 'auto',
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    fontSize: 10,
  },
  totalLabel: {
    fontWeight: 'bold',
    color: '#333333',
  },
  totalValue: {
    color: '#333333',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: colors.navy,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 5,
  },
  deposit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: colors.gold,
    color: colors.navy,
    fontWeight: 'bold',
    fontSize: 11,
    marginTop: 10,
  },
  notes: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F9F9F9',
    borderLeft: `3 solid ${colors.gold}`,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.navy,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.5,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: '1 solid #E5E5E5',
    fontSize: 9,
    color: '#999999',
    textAlign: 'center',
  },
})

interface QuotePdfProps {
  booking: BookingInquiry
  quote: BookingQuote
}

export function QuotePdfDocument({ booking, quote }: QuotePdfProps) {
  const depositPercent = quote.total_cents > 0
    ? Math.round((quote.deposit_cents / quote.total_cents) * 100)
    : 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>Bornfidis Provisions</Text>
          <Text style={styles.tagline}>Faith-anchored culinary excellence</Text>
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{booking.name}</Text>
          </View>
          {booking.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{booking.email}</Text>
            </View>
          )}
          {booking.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{booking.phone}</Text>
            </View>
          )}
        </View>

        {/* Event Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Event Date:</Text>
            <Text style={styles.value}>
              {new Date(booking.event_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          {booking.event_time && (
            <View style={styles.row}>
              <Text style={styles.label}>Event Time:</Text>
              <Text style={styles.value}>{booking.event_time}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>{booking.location}</Text>
          </View>
          {booking.guests && (
            <View style={styles.row}>
              <Text style={styles.label}>Number of Guests:</Text>
              <Text style={styles.value}>{booking.guests}</Text>
            </View>
          )}
        </View>

        {/* Quote Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quote Items</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellTitle}>Item</Text>
              <Text style={styles.tableCellDescription}>Description</Text>
              <Text style={styles.tableCellQty}>Qty</Text>
              <Text style={styles.tableCellPrice}>Total</Text>
            </View>
            {/* Table Rows */}
            {quote.items.map((item, index) => (
              <View key={item.id || index} style={styles.tableRow}>
                <Text style={styles.tableCellTitle}>{item.title}</Text>
                <Text style={styles.tableCellDescription}>{item.description || '—'}</Text>
                <Text style={styles.tableCellQty}>{item.quantity}</Text>
                <Text style={styles.tableCellPrice}>{formatMoney(item.line_total_cents, quote.currency)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{formatMoney(quote.subtotal_cents, quote.currency)}</Text>
            </View>
            {quote.tax_cents > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax:</Text>
                <Text style={styles.totalValue}>{formatMoney(quote.tax_cents, quote.currency)}</Text>
              </View>
            )}
            <View style={styles.grandTotal}>
              <Text>Total:</Text>
              <Text>{formatMoney(quote.total_cents, quote.currency)}</Text>
            </View>
            <View style={styles.deposit}>
              <Text>Deposit ({depositPercent}%):</Text>
              <Text>{formatMoney(quote.deposit_cents, quote.currency)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Additional Notes</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}

        {/* Next Steps */}
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Next Steps</Text>
          <Text style={styles.notesText}>
            This quote is valid for 30 days. To confirm your booking, please pay the deposit amount indicated above.
            Once the deposit is received, we will confirm your event date and finalize the details.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for considering Bornfidis Provisions for your event.</Text>
          <Text style={{ marginTop: 5 }}>
            Questions? Contact us at your convenience.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
