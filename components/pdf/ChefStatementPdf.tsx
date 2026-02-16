import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ChefMonthStatement } from '@/lib/chef-statements'
import { formatUSD } from '@/lib/money'
import { colors } from '@/lib/design-tokens'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
  },
  header: {
    marginBottom: 24,
    borderBottom: `3 solid ${colors.forestDark}`,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.forestDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.forestDark,
    marginBottom: 8,
    borderBottom: `1 solid ${colors.gold}`,
    paddingBottom: 4,
  },
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.forestDark,
    color: colors.white,
    padding: 6,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottom: '1 solid #E5E5E5',
    fontSize: 10,
  },
  colDate: { width: '18%' },
  colService: { width: '32%' },
  colBase: { width: '12%', textAlign: 'right' },
  colTier: { width: '12%', textAlign: 'right' },
  colBonus: { width: '12%', textAlign: 'right' },
  colTotal: { width: '14%', textAlign: 'right' },
  totals: {
    marginTop: 16,
    marginLeft: 'auto',
    width: '45%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
    fontSize: 11,
  },
  totalLabel: { fontWeight: 'bold', color: '#333333' },
  totalValue: { color: '#333333' },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: colors.forestDark,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 8,
  },
  paymentDates: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#f0f9f4',
    borderLeft: `3 solid ${colors.forestDark}`,
    fontSize: 10,
    color: '#333333',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: '#999999',
    textAlign: 'center',
  },
})

type Props = { statement: ChefMonthStatement }

export function ChefStatementPdfDocument({ statement }: Props) {
  const fmtDate = (d: Date) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Monthly Chef Statement</Text>
          <Text style={styles.subtitle}>{statement.monthLabel} — {statement.chefName}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jobs completed & paid</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colDate}>Date</Text>
              <Text style={styles.colService}>Service</Text>
              <Text style={styles.colBase}>Base</Text>
              <Text style={styles.colTier}>Tier</Text>
              <Text style={styles.colBonus}>Bonus</Text>
              <Text style={styles.colTotal}>Total</Text>
            </View>
            {statement.jobs.map((job) => (
              <View key={job.bookingId} style={styles.tableRow}>
                <Text style={styles.colDate}>{fmtDate(job.eventDate)}</Text>
                <Text style={styles.colService}>{job.serviceName}</Text>
                <Text style={styles.colBase}>{formatUSD(job.baseCents)}</Text>
                <Text style={styles.colTier}>{job.tierUpliftCents > 0 ? formatUSD(job.tierUpliftCents) : '—'}</Text>
                <Text style={styles.colBonus}>{job.bonusCents > 0 ? formatUSD(job.bonusCents) : '—'}</Text>
                <Text style={styles.colTotal}>{formatUSD(job.totalCents)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Base earnings</Text>
            <Text style={styles.totalValue}>{formatUSD(statement.totalBaseCents)}</Text>
          </View>
          {statement.totalTierUpliftCents > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tier uplift</Text>
              <Text style={styles.totalValue}>{formatUSD(statement.totalTierUpliftCents)}</Text>
            </View>
          )}
          {statement.totalBonusCents > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Performance bonuses</Text>
              <Text style={styles.totalValue}>{formatUSD(statement.totalBonusCents)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text>Total paid</Text>
            <Text>{formatUSD(statement.totalPaidCents)}</Text>
          </View>
        </View>

        {statement.paymentDates.length > 0 && (
          <View style={styles.paymentDates}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Payment dates</Text>
            <Text>{statement.paymentDates.join(', ')}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Bornfidis Provisions — Chef earnings statement. Read-only; no regeneration after payment.</Text>
        </View>
      </Page>
    </Document>
  )
}
