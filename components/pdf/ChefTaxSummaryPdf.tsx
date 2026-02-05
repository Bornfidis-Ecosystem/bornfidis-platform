import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ChefTaxSummaryData } from '@/lib/chef-tax-summary'
import { formatUSD } from '@/lib/money'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 24,
    borderBottom: '3 solid #1a5f3f',
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a5f3f',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  disclaimer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#fef3c7',
    borderLeft: '3 solid #d97706',
    fontSize: 10,
    color: '#92400e',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a5f3f',
    marginBottom: 8,
    borderBottom: '1 solid #FFBC00',
    paddingBottom: 4,
  },
  infoRow: { flexDirection: 'row', marginBottom: 4, fontSize: 10 },
  infoLabel: { width: 100, color: '#666666' },
  infoValue: { flex: 1 },
  table: { marginTop: 8 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a5f3f',
    color: '#FFFFFF',
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
  colDate: { width: '22%' },
  colService: { width: '48%' },
  colAmount: { width: '30%', textAlign: 'right' },
  totals: {
    marginTop: 16,
    marginLeft: 'auto',
    width: '50%',
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
    backgroundColor: '#1a5f3f',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 8,
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

type Props = { data: ChefTaxSummaryData }

export function ChefTaxSummaryPdfDocument({ data }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Annual Tax Summary (Informational)</Text>
          <Text style={styles.subtitle}>
            Calendar year {data.year} — {data.chefName}
          </Text>
          <View style={styles.disclaimer}>
            <Text>
              This is an informational summary of earnings for your records. It is not tax advice. Consult a tax professional for filing.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chef information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{data.chefName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{data.chefEmail}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Year</Text>
            <Text style={styles.infoValue}>{data.year}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payouts (by payment date)</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colDate}>Payment date</Text>
              <Text style={styles.colService}>Service / Booking</Text>
              <Text style={styles.colAmount}>Amount</Text>
            </View>
            {data.rows.map((row, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.colDate}>{row.date}</Text>
                <Text style={styles.colService}>{row.serviceName}</Text>
                <Text style={styles.colAmount}>{formatUSD(row.amountCents)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Number of jobs</Text>
            <Text style={styles.totalValue}>{data.jobCount}</Text>
          </View>
          {data.totalBonusCents > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total bonuses</Text>
              <Text style={styles.totalValue}>{formatUSD(data.totalBonusCents)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Payment dates</Text>
            <Text style={styles.totalValue}>{data.payoutDates.join(', ')}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>Total gross earnings</Text>
            <Text>{formatUSD(data.totalGrossCents)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Bornfidis Provisions — Chef Tax Summary {data.year}. Informational only. No tax advice. Read-only.</Text>
        </View>
      </Page>
    </Document>
  )
}
