'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { BookingInquiry, QuoteLineItem } from '@/types/booking'
import { formatUSD } from '@/lib/money'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
    borderBottom: '3 solid #002747',
    paddingBottom: 15,
  },
  companyName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#002747',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 10,
    color: '#666666',
    marginTop: 5,
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002747',
    marginTop: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#002747',
    marginBottom: 10,
    borderBottom: '1 solid #FFBC00',
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
    backgroundColor: '#002747',
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
    backgroundColor: '#002747',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 5,
  },
  paymentSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F9F9F9',
    borderLeft: '3 solid #FFBC00',
  },
  paymentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#002747',
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    fontSize: 10,
  },
  balanceDue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#FFBC00',
    color: '#002747',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 10,
  },
  blessing: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderTop: '2 solid #002747',
    textAlign: 'center',
  },
  blessingText: {
    fontSize: 11,
    color: '#002747',
    fontStyle: 'italic',
    lineHeight: 1.6,
  },
  footer: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: '1 solid #E5E5E5',
    fontSize: 9,
    color: '#999999',
    textAlign: 'center',
  },
})

interface InvoicePdfProps {
  booking: BookingInquiry
  lineItems: QuoteLineItem[]
}

export function InvoicePdfDocument({ booking, lineItems }: InvoicePdfProps) {
  // Calculate totals (use Phase 4A fields if available, otherwise calculate)
  const subtotalCents = booking.quote_subtotal_cents || lineItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price_cents)
  }, 0)
  
  const taxCents = booking.quote_tax_cents || booking.tax_cents || 0
  const serviceFeeCents = booking.quote_service_fee_cents || booking.service_fee_cents || 0
  const totalCents = booking.quote_total_cents || (subtotalCents + taxCents + serviceFeeCents)
  
  const depositPaidCents = booking.deposit_amount_cents || 0
  const balancePaidCents = booking.balance_amount_cents || 0
  const balanceDueCents = booking.balance_amount_cents || Math.max(totalCents - depositPaidCents, 0)
  
  // Format invoice date
  const invoiceDate = booking.quote_updated_at 
    ? new Date(booking.quote_updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>Bornfidis Provisions</Text>
          <Text style={styles.tagline}>Faith-anchored culinary excellence</Text>
          <Text style={styles.invoiceTitle}>INVOICE</Text>
        </View>

        {/* Invoice Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice Date:</Text>
            <Text style={styles.value}>{invoiceDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice #:</Text>
            <Text style={styles.value}>{booking.id.slice(0, 8).toUpperCase()}</Text>
          </View>
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
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

        {/* Line Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableCellTitle}>Item</Text>
              <Text style={styles.tableCellDescription}>Description</Text>
              <Text style={styles.tableCellQty}>Qty</Text>
              <Text style={styles.tableCellPrice}>Amount</Text>
            </View>
            {/* Table Rows */}
            {lineItems.map((item, index) => {
              const lineTotal = item.quantity * item.unit_price_cents
              return (
                <View key={item.id || index} style={styles.tableRow}>
                  <Text style={styles.tableCellTitle}>{item.title}</Text>
                  <Text style={styles.tableCellDescription}>{item.description || '—'}</Text>
                  <Text style={styles.tableCellQty}>{item.quantity}</Text>
                  <Text style={styles.tableCellPrice}>{formatUSD(lineTotal)}</Text>
                </View>
              )
            })}
          </View>

          {/* Totals */}
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{formatUSD(subtotalCents)}</Text>
            </View>
            {taxCents > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax:</Text>
                <Text style={styles.totalValue}>{formatUSD(taxCents)}</Text>
              </View>
            )}
            {serviceFeeCents > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Service Fee:</Text>
                <Text style={styles.totalValue}>{formatUSD(serviceFeeCents)}</Text>
              </View>
            )}
            <View style={styles.grandTotal}>
              <Text>Total:</Text>
              <Text>{formatUSD(totalCents)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Payment Summary</Text>
          {depositPaidCents > 0 && (
            <View style={styles.paymentRow}>
              <Text>Deposit Received:</Text>
              <Text style={{ fontWeight: 'bold', color: '#22c55e' }}>-{formatUSD(depositPaidCents)}</Text>
            </View>
          )}
          {booking.paid_at && (
            <View style={styles.paymentRow}>
              <Text>Deposit Paid On:</Text>
              <Text>{new Date(booking.paid_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</Text>
            </View>
          )}
          {balanceDueCents > 0 && (
            <View style={styles.balanceDue}>
              <Text>Balance Due:</Text>
              <Text>{formatUSD(balanceDueCents)}</Text>
            </View>
          )}
          {balanceDueCents <= 0 && depositPaidCents > 0 && (
            <View style={styles.balanceDue}>
              <Text>Fully Paid</Text>
              <Text>✓</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {booking.quote_notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={{ fontSize: 10, color: '#666666', lineHeight: 1.5 }}>
              {booking.quote_notes}
            </Text>
          </View>
        )}

        {/* Blessing Footer */}
        <View style={styles.blessing}>
          <Text style={styles.blessingText}>
            "May the Lord bless you and keep you;{'\n'}
            the Lord make his face shine on you and be gracious to you;{'\n'}
            the Lord turn his face toward you and give you peace."{'\n\n'}
            — Numbers 6:24-26
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for choosing Bornfidis Provisions.</Text>
          <Text style={{ marginTop: 5 }}>
            Questions? Contact us at your convenience.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
