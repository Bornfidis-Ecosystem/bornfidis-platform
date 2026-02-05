'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { BoardDeckData } from '@/lib/board-deck'

function formatUSD(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    cents / 100
  )
}

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: '#002747' },
  subtitle: { fontSize: 9, color: '#666', marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#002747', borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: '55%', color: '#555' },
  value: { width: '45%', fontWeight: 'bold' },
  bullet: { marginBottom: 4, paddingLeft: 8 },
  narrative: { fontSize: 10, lineHeight: 1.4, marginTop: 8, color: '#333' },
})

type Props = { data: BoardDeckData; narrative?: string; sections?: Record<string, boolean> }

const DEFAULT_SECTIONS: Record<string, boolean> = {
  executiveSummary: true,
  growth: true,
  quality: true,
  finance: true,
  forecast: true,
  okrs: true,
  risksAndActions: true,
  roadmap: true,
}

export default function BoardDeckPdf({ data, narrative, sections: sectionFlags }: Props) {
  const sections = { ...DEFAULT_SECTIONS, ...sectionFlags }
  const e = data.executiveSummary
  const g = data.growth
  const q = data.quality
  const f = data.finance
  const fc = data.forecast
  const r = data.risksAndActions
  const road = data.roadmap

  return (
    <Document>
      {narrative?.trim() && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Board deck — Narrative</Text>
          <Text style={styles.subtitle}>{data.periodLabel} · {new Date(data.generatedAt).toLocaleString()}</Text>
          <Text style={styles.narrative}>{narrative.trim()}</Text>
        </Page>
      )}

      {sections.executiveSummary && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Executive summary</Text>
          <Text style={styles.subtitle}>{data.periodLabel}</Text>
          <View style={{ marginTop: 12 }}>
            <View style={styles.row}><Text style={styles.label}>Revenue ({data.period})</Text><Text style={styles.value}>{formatUSD(e.revenueCents)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Bookings</Text><Text style={styles.value}>{e.bookings}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Margin</Text><Text style={styles.value}>{e.marginPct}%</Text></View>
            <View style={styles.row}><Text style={styles.label}>Forecast (90d)</Text><Text style={styles.value}>{formatUSD(e.forecast90dCents)}</Text></View>
            <View style={styles.row}><Text style={styles.label}>Avg rating</Text><Text style={styles.value}>{e.avgRating}</Text></View>
            <View style={styles.row}><Text style={styles.label}>SLA adherence</Text><Text style={styles.value}>{e.slaAdherencePct}%</Text></View>
          </View>
        </Page>
      )}

      {sections.growth && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Growth</Text>
          <Text style={styles.subtitle}>{data.periodLabel}</Text>
          <Text style={styles.sectionTitle}>Bookings & AOV</Text>
          <View style={styles.row}><Text style={styles.label}>Bookings MTD / QTD</Text><Text style={styles.value}>{g.bookingsMtd} / {g.bookingsQtd}</Text></View>
          <View style={styles.row}><Text style={styles.label}>AOV</Text><Text style={styles.value}>{formatUSD(g.aovCents)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Active chefs</Text><Text style={styles.value}>{g.activeChefs}</Text></View>
        </Page>
      )}

      {sections.quality && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Quality</Text>
          <Text style={styles.subtitle}>{data.periodLabel}</Text>
          <Text style={styles.sectionTitle}>Ratings & SLA</Text>
          <View style={styles.row}><Text style={styles.label}>Avg rating</Text><Text style={styles.value}>{q.avgRating} ({q.reviewCount} reviews)</Text></View>
          <View style={styles.row}><Text style={styles.label}>SLA adherence</Text><Text style={styles.value}>{q.slaAdherencePct}% ({q.slaOnTrack}/{q.slaTotal})</Text></View>
        </Page>
      )}

      {sections.finance && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Finance</Text>
          <Text style={styles.subtitle}>{data.periodLabel}</Text>
          <Text style={styles.sectionTitle}>Revenue & margin</Text>
          <View style={styles.row}><Text style={styles.label}>Revenue MTD / QTD</Text><Text style={styles.value}>{formatUSD(f.revenueMtdCents)} / {formatUSD(f.revenueQtdCents)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Payout MTD</Text><Text style={styles.value}>{formatUSD(f.payoutMtdCents)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Margin</Text><Text style={styles.value}>{f.marginPct}%</Text></View>
          <View style={styles.row}><Text style={styles.label}>Bonus % (of paid)</Text><Text style={styles.value}>{f.bonusPct}%</Text></View>
        </Page>
      )}

      {sections.forecast && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Forecast</Text>
          <Text style={styles.subtitle}>{data.periodLabel}</Text>
          <Text style={styles.sectionTitle}>30 / 90 days</Text>
          <View style={styles.row}><Text style={styles.label}>30d confirmed</Text><Text style={styles.value}>{formatUSD(fc.period30ConfirmedCents)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>30d projected</Text><Text style={styles.value}>{formatUSD(fc.period30ProjectedCents)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>90d confirmed</Text><Text style={styles.value}>{formatUSD(fc.period90ConfirmedCents)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>90d projected</Text><Text style={styles.value}>{formatUSD(fc.period90ProjectedCents)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>90d range</Text><Text style={styles.value}>{formatUSD(fc.period90LowCents)} – {formatUSD(fc.period90HighCents)}</Text></View>
        </Page>
      )}

      {sections.okrs && data.okrSnapshot?.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>OKRs</Text>
          <Text style={styles.subtitle}>{data.periodLabel}</Text>
          {data.okrSnapshot.map((okr) => (
            <View key={okr.okrId} style={{ marginBottom: 12 }}>
              <Text style={styles.sectionTitle}>{okr.objective}</Text>
              {okr.keyResults.map((kr) => (
                <View style={styles.row} key={kr.id}>
                  <Text style={styles.label}>{kr.metric.replace(/_/g, ' ')}</Text>
                  <Text style={styles.value}>{kr.progressPct}% — {kr.status.replace('_', ' ')}</Text>
                </View>
              ))}
            </View>
          ))}
        </Page>
      )}

      {sections.risksAndActions && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Risks & actions</Text>
          <Text style={styles.subtitle}>{data.periodLabel}</Text>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {r.recommendations.length === 0 ? (
            <Text style={styles.bullet}>None this period.</Text>
          ) : (
            r.recommendations.map((rec, i) => (
              <Text key={i} style={styles.bullet}>• {rec}</Text>
            ))
          )}
          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Top improvement items</Text>
          {r.topImprovements.length === 0 ? (
            <Text style={styles.bullet}>None.</Text>
          ) : (
            r.topImprovements.map((item, i) => (
              <Text key={i} style={styles.bullet}>• {item.title} ({item.source}) — score {item.score}</Text>
            ))
          )}
        </Page>
      )}

      {sections.roadmap && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Roadmap (next 30–60 days)</Text>
          <Text style={styles.subtitle}>{data.periodLabel}</Text>
          <Text style={styles.sectionTitle}>Focus items</Text>
          {road.topItems.length === 0 ? (
            <Text style={styles.bullet}>No open items.</Text>
          ) : (
            road.topItems.map((item, i) => (
              <Text key={i} style={styles.bullet}>• {item.title} — {item.owner ?? 'Unassigned'} ({item.status})</Text>
            ))
          )}
        </Page>
      )}

      {!narrative?.trim() && !Object.values(sections).some(Boolean) && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Board deck</Text>
          <Text style={styles.subtitle}>No sections selected. Include at least one section or add narrative.</Text>
        </Page>
      )}
    </Document>
  )
}
