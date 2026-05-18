import React from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '@/constants/tokens'
import { useStore } from '@/store'
import { useApi } from '@/lib/useApi'
import { queries } from '@/lib/queries'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Row from '@/components/ui/Row'
import MonoText from '@/components/ui/MonoText'
import AsyncBoundary from '@/components/ui/AsyncBoundary'
import { BankIcon, ArrowDownIcon } from '@/components/Icons'

export default function LandlordPayouts() {
  const dark = useStore((s) => s.dark)
  const user = useStore((s) => s.user)
  const t = useColors(dark)
  const insets = useSafeAreaInsets()

  const { data, loading, error, refresh } = useApi(queries.myPayouts)

  const payouts = data?.payouts ?? []
  const pending = payouts.filter((p) => p.status === 'PENDING')
  const pendingTotal = pending.reduce((s, p) => s + p.netAmount, 0)

  const bankLine = user?.bankName
    ? `${user.bankName} · ${user.bankAccountNumber ? '••••' + user.bankAccountNumber.slice(-4) : 'linked'}`
    : 'Add a payout account in settings'

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading && !!data} onRefresh={refresh} tintColor={t.primary} />}
    >
      <View style={styles.header}>
        <BankIcon size={20} color={t.ink} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.subtitle, { color: t.muted }]}>YOUR EARNINGS</Text>
          <Text style={[styles.title, { color: t.ink }]}>Payouts</Text>
        </View>
      </View>

      <View style={styles.px}>
        <Card dark={dark} padding={18}>
          <Text style={[styles.fieldLabel, { color: t.muted }]}>PENDING</Text>
          <Row align="flex-end" gap={6} style={{ marginTop: 8 }}>
            <Text style={[{ fontSize: 16, color: t.muted }]}>$</Text>
            <MonoText style={[styles.payoutAmount, { color: t.ink }]}>
              {Math.round(pendingTotal).toLocaleString()}
            </MonoText>
          </Row>
          <Text style={[styles.payoutMeta, { color: t.muted }]}>
            {pending.length} pending · {bankLine}
          </Text>
          <View style={{ marginTop: 14 }}>
            <Button dark={dark}>Manage account</Button>
          </View>
        </Card>

        <Text style={[styles.sectionLabel, { color: t.muted }]}>HISTORY</Text>
        <AsyncBoundary
          loading={loading && !data}
          error={error}
          empty={data && payouts.length === 0}
          emptyMessage="No payouts yet. Once a tenant pays, your share is queued for payout."
          onRetry={refresh}
          minHeight={120}
        >
          <Card dark={dark} padding={0}>
            {payouts.map((p, i, arr) => (
              <View
                key={p.id}
                style={[styles.payoutRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: t.line2 }]}
              >
                <View
                  style={[
                    styles.payoutIcon,
                    { backgroundColor: p.status === 'PROCESSED' ? t.primarySoft : t.chip },
                  ]}
                >
                  <ArrowDownIcon size={14} color={p.status === 'PROCESSED' ? t.primary : t.muted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.payoutDate, { color: t.ink }]}>
                    {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                  <Text style={[styles.payoutMethod, { color: t.muted }]} numberOfLines={1}>
                    {p.property.address}{p.property.unit ? ' · ' + p.property.unit : ''} · {p.status}
                  </Text>
                </View>
                <MonoText
                  style={[styles.payoutValue, { color: p.status === 'PROCESSED' ? t.primary : t.ink }]}
                >
                  +${p.netAmount.toFixed(2)}
                </MonoText>
              </View>
            ))}
          </Card>
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
  payoutAmount: { fontSize: 36, fontWeight: '600' },
  payoutMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 4 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginTop: 14, marginBottom: 8 },
  payoutRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, paddingHorizontal: 14 },
  payoutIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  payoutDate: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  payoutMethod: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  payoutValue: { fontSize: 13, fontWeight: '600' },
})
