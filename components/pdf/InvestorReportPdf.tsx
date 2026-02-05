'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { InvestorReportData } from '@/lib/investor-report'

function formatUSD(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    cents / 100
  )
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: '#002747' },
  subtitle: { fontSize: 9, color: '#666', marginBottom: 20 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 6, color: '#002747', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: '50%', color: '#555' },
  value: { width: '50%', fontWeight: 'bold' },
})

export default function InvestorReportPdf({ data }: { data: InvestorReportData }) {
  const r = data.revenue
  const g = data.growth
  const q = data.quality
  const u = data.unitEconomics
  const o = data.outlook

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Investor Report</Text>
        <Text style={styles.subtitle}>
          {data.periodLabel} · Generated {new Date(data.generatedAt).toLocaleString()}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue</Text>
          <View style={styles.row}><Text style={styles.label}>MTD</Text><Text style={styles.value}>{formatUSD(r.mtdCents)} ({r.mtdBookings} bookings)</Text></View>
          <View style={styles.row}><Text style={styles.label}>QTD</Text><Text style={styles.value}>{formatUSD(r.qtdCents)} ({r.qtdBookings} bookings)</Text></View>
          {r.yoyPercent != null && (
            <View style={styles.row}><Text style={styles.label}>YoY (same month)</Text><Text style={styles.value}>{r.yoyPercent}%</Text></View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Growth</Text>
          <View style={styles.row}><Text style={styles.label}>Bookings MTD / QTD</Text><Text style={styles.value}>{g.bookingsMtd} / {g.bookingsQtd}</Text></View>
          <View style={styles.row}><Text style={styles.label}>AOV</Text><Text style={styles.value}>{formatUSD(g.aovCents)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Active chefs (MTD)</Text><Text style={styles.value}>{g.activeChefs}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quality</Text>
          <View style={styles.row}><Text style={styles.label}>Avg rating</Text><Text style={styles.value}>{q.avgRating} ({q.reviewCount} reviews)</Text></View>
          <View style={styles.row}><Text style={styles.label}>SLA adherence</Text><Text style={styles.value}>{q.slaAdherencePct}% ({q.slaOnTrack}/{q.slaTotal})</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unit economics</Text>
          <View style={styles.row}><Text style={styles.label}>Margin (MTD)</Text><Text style={styles.value}>{u.marginPct}%</Text></View>
          <View style={styles.row}><Text style={styles.label}>Revenue / Payout (MTD)</Text><Text style={styles.value}>{formatUSD(u.revenueMtdCents)} / {formatUSD(u.payoutMtdCents)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Bonus % (of paid payouts)</Text><Text style={styles.value}>{u.bonusPct}%</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outlook (next 90 days)</Text>
          <View style={styles.row}><Text style={styles.label}>Forecast (expected)</Text><Text style={styles.value}>{formatUSD(o.forecast90dCents)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Range</Text><Text style={styles.value}>{formatUSD(o.forecast90dLow)} – {formatUSD(o.forecast90dHigh)}</Text></View>
        </View>

        <Text style={{ marginTop: 24, fontSize: 8, color: '#999' }}>
          Definitions aligned with ops dashboard and forecast. Read-only snapshot. Not guarantees.
        </Text>
      </Page>
    </Document>
  )
}
