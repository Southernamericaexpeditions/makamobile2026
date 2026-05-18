import React, { useMemo } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '@/constants/tokens'
import { useStore } from '@/store'
import { useApi } from '@/lib/useApi'
import { queries } from '@/lib/queries'
import Card from '@/components/ui/Card'
import Pill from '@/components/ui/Pill'
import Row from '@/components/ui/Row'
import MonoText from '@/components/ui/MonoText'
import AsyncBoundary from '@/components/ui/AsyncBoundary'
import { TrendIcon, DocsIcon } from '@/components/Icons'

const MONTHS_BACK = 6

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short' })
}

export default function LandlordReports() {
  const dark = useStore((s) => s.dark)
  const t = useColors(dark)
  const insets = useSafeAreaInsets()

  const payments = useApi(() => queries.myPayments(500))

  const { months, values, total, onTimeRate, avgDays, tokensDistributed } = useMemo(() => {
    const now = new Date()
    const labels: string[] = []
    const keys: string[] = []
    for (let i = MONTHS_BACK - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      labels.push(monthLabel(d))
      keys.push(monthKey(d))
    }
    const buckets: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]))

    let total = 0
    let onTimeCount = 0
    let completedCount = 0
    let daysSum = 0
    let daysSumN = 0
    let tokens = 0

    payments.data?.payments.forEach((p) => {
      if (p.status !== 'COMPLETED' && p.status !== 'LATE') return
      const d = new Date(p.paidAt ?? p.createdAt)
      const key = monthKey(d)
      if (key in buckets) buckets[key] += p.amount
      total += p.amount
      completedCount += 1
      if (p.status === 'COMPLETED') onTimeCount += 1
      const due = new Date(p.dueDate)
      const diffDays = Math.max(0, Math.round((d.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)))
      daysSum += diffDays
      daysSumN += 1
      tokens += p.tokensEarned
    })

    return {
      months: labels,
      values: keys.map((k) => buckets[k]),
      total,
      onTimeRate: completedCount > 0 ? Math.round((onTimeCount / completedCount) * 100) : 0,
      avgDays: daysSumN > 0 ? (daysSum / daysSumN).toFixed(1) : '0',
      tokensDistributed: tokens,
    }
  }, [payments.data])

  const max = Math.max(1, ...values)
  const yoyDelta = (() => {
    if (values.length < 2 || values[values.length - 2] === 0) return null
    const pct = ((values[values.length - 1] - values[values.length - 2]) / values[values.length - 2]) * 100
    return Math.round(pct)
  })()

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={payments.loading && !!payments.data} onRefresh={payments.refresh} tintColor={t.primary} />}
    >
      <View style={styles.header}>
        <TrendIcon size={20} color={t.ink} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.subtitle, { color: t.muted }]}>LAST 6 MONTHS</Text>
          <Text style={[styles.title, { color: t.ink }]}>Reports</Text>
        </View>
      </View>

      <View style={styles.px}>
        <AsyncBoundary
          loading={payments.loading && !payments.data}
          error={payments.error}
          onRetry={payments.refresh}
          minHeight={300}
        >
          <Card dark={dark} padding={18}>
            <Row>
              <Text style={[styles.fieldLabel, { color: t.muted }]}>REVENUE</Text>
              {yoyDelta !== null ? (
                <Pill tone={yoyDelta >= 0 ? 'primary' : 'danger'} dark={dark}>
                  {yoyDelta >= 0 ? '+' : ''}{yoyDelta}% MoM
                </Pill>
              ) : null}
            </Row>
            <Row align="flex-end" gap={4} style={{ marginTop: 8 }}>
              <Text style={[{ fontSize: 14, color: t.muted }]}>$</Text>
              <MonoText style={[styles.totalRevenue, { color: t.ink }]}>
                {Math.round(total).toLocaleString()}
              </MonoText>
            </Row>

            <View style={styles.chart}>
              {values.map((v, i) => (
                <View key={i} style={styles.barCol}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (v / max) * 88,
                        backgroundColor: i === values.length - 1 ? t.ink : t.chip,
                      },
                    ]}
                  />
                  <Text style={[styles.barLabel, { color: t.muted, fontFamily: 'JetBrainsMono_400Regular' }]}>
                    {months[i]}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          <Text style={[styles.sectionLabel, { color: t.muted }]}>BREAKDOWN</Text>
          <Card dark={dark} padding={0}>
            {[
              { label: 'Rent collected', value: `$${Math.round(total).toLocaleString()}` },
              { label: 'On-time rate', value: `${onTimeRate}%` },
              { label: 'Avg. days late', value: avgDays },
              { label: 'Token rewards distributed', value: `${tokensDistributed} MKT` },
            ].map((row, i, arr) => (
              <View
                key={row.label}
                style={[styles.infoRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: t.line2 }]}
              >
                <Text style={[styles.infoLabel, { color: t.muted }]}>{row.label}</Text>
                <Text style={[styles.infoValue, { color: t.ink }]}>{row.value}</Text>
              </View>
            ))}
          </Card>

          <Pressable style={[styles.exportBtn, { borderColor: t.line, backgroundColor: t.surface }]}>
            <DocsIcon size={18} color={t.ink} />
            <Text style={[styles.exportText, { color: t.ink }]}>Export PDF report</Text>
          </Pressable>
        </AsyncBoundary>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {},
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingBottom: 14 },
  subtitle: { fontSize: 11, fontFamily: 'Inter_400Regular', letterSpacing: 0.4 },
  title: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  px: { paddingHorizontal: 16 },
  fieldLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  totalRevenue: { fontSize: 32, fontWeight: '600' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 110, marginTop: 16, gap: 8 },
  barCol: { flex: 1, alignItems: 'center', gap: 6, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 10 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginTop: 14, marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, paddingHorizontal: 14 },
  infoLabel: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  infoValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  exportBtn: { marginTop: 14, height: 44, borderRadius: 12, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  exportText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
})
