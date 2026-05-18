import React, { useMemo, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '@/constants/tokens'
import { useStore } from '@/store'
import { useApi } from '@/lib/useApi'
import { queries } from '@/lib/queries'
import Card from '@/components/ui/Card'
import MonoText from '@/components/ui/MonoText'
import AsyncBoundary from '@/components/ui/AsyncBoundary'
import { TrendIcon, SearchIcon, ArrowUpIcon, ArrowDownIcon } from '@/components/Icons'

type Filter = 'all' | 'rent' | 'tokens'

type Entry = {
  id: string
  title: string
  amount: number | null
  tokens: number | null
  date: string
  method: string
  isTokenTx: boolean
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function tokenTxnLabel(type: string): string {
  switch (type) {
    case 'EARN': return 'Tokens earned'
    case 'PURCHASE': return 'Tokens purchased'
    case 'REDEEM': return 'Tokens redeemed'
    case 'SPEND': return 'Maka Card spend'
    case 'GIFT_SENT': return 'Tokens gifted'
    case 'GIFT_RECEIVED': return 'Tokens received'
    default: return 'Token activity'
  }
}

const CREDIT_TYPES = ['EARN', 'PURCHASE', 'GIFT_RECEIVED']

export default function TenantHistory() {
  const dark = useStore((s) => s.dark)
  const t = useColors(dark)
  const insets = useSafeAreaInsets()
  const [filter, setFilter] = useState<Filter>('all')

  const payments = useApi(queries.myPayments)
  const txns = useApi(queries.myTransactions)

  const loading = payments.loading && txns.loading
  const error = payments.error ?? txns.error

  const entries: Entry[] = useMemo(() => {
    const merged: Entry[] = []
    payments.data?.payments.forEach((p) => {
      merged.push({
        id: `p:${p.id}`,
        title: `Rent · ${p.property.address}${p.property.unit ? ' ' + p.property.unit : ''}`,
        amount: -p.amount,
        tokens: p.tokensEarned > 0 ? p.tokensEarned : null,
        date: p.paidAt ?? p.createdAt,
        method: p.method,
        isTokenTx: false,
      })
    })
    txns.data?.transactions.forEach((tx) => {
      const sign = (CREDIT_TYPES.includes(tx.type) ? 1 : -1) * tx.amount
      merged.push({
        id: `t:${tx.id}`,
        title: tx.description ?? tokenTxnLabel(tx.type),
        amount: null,
        tokens: sign,
        date: tx.createdAt,
        method: 'Tokens',
        isTokenTx: true,
      })
    })
    merged.sort((a, b) => +new Date(b.date) - +new Date(a.date))
    return merged
  }, [payments.data, txns.data])

  const filtered = entries.filter((e) => {
    if (filter === 'all') return true
    if (filter === 'rent') return !e.isTokenTx
    if (filter === 'tokens') return e.isTokenTx
    return true
  })

  function refreshBoth() {
    payments.refresh()
    txns.refresh()
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading && entries.length > 0} onRefresh={refreshBoth} tintColor={t.primary} />}
    >
      <View style={styles.header}>
        <TrendIcon size={20} color={t.ink} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.subtitle, { color: t.muted }]}>ALL MOVEMENTS</Text>
          <Text style={[styles.title, { color: t.ink }]}>Activity</Text>
        </View>
        <SearchIcon size={18} color={t.muted} />
      </View>

      <View style={[styles.filterRow, styles.px]}>
        {(['all', 'rent', 'tokens'] as Filter[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterPill,
              {
                borderColor: filter === f ? t.ink : t.line,
                backgroundColor: filter === f ? t.ink : t.surface,
              },
            ]}
          >
            <Text style={[styles.filterText, { color: filter === f ? (dark ? t.bg : '#fff') : t.ink }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.px}>
        <AsyncBoundary
          loading={loading && entries.length === 0}
          error={error}
          empty={!loading && filtered.length === 0}
          emptyMessage="No activity yet."
          onRetry={refreshBoth}
        >
          <Card dark={dark} padding={0}>
            {filtered.map((e, i, arr) => (
              <View
                key={e.id}
                style={[styles.txRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: t.line2 }]}
              >
                <View
                  style={[
                    styles.txIcon,
                    { backgroundColor: (e.amount ?? e.tokens ?? 0) < 0 ? t.chip : t.primarySoft },
                  ]}
                >
                  {(e.amount ?? e.tokens ?? 0) < 0 ? (
                    <ArrowUpIcon size={14} color={t.ink2} />
                  ) : (
                    <ArrowDownIcon size={14} color={t.primaryInk} />
                  )}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.txTitle, { color: t.ink }]} numberOfLines={1}>{e.title}</Text>
                  <Text style={[styles.txSub, { color: t.muted }]}>
                    {shortDate(e.date)} · {e.method}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  {e.amount !== null ? (
                    <MonoText style={[styles.txAmount, { color: e.amount < 0 ? t.ink : t.primary }]}>
                      {e.amount < 0 ? '−' : '+'}${Math.abs(e.amount).toFixed(2)}
                    </MonoText>
                  ) : null}
                  {e.tokens !== null && e.tokens !== 0 ? (
                    <Text style={[styles.txTokens, { color: e.tokens > 0 ? t.primary : t.muted }]}>
                      {e.tokens > 0 ? '+' : ''}{e.tokens} MKT
                    </Text>
                  ) : null}
                </View>
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
  filterRow: { flexDirection: 'row', gap: 6, paddingBottom: 10 },
  filterPill: { height: 32, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filterText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 14, gap: 10 },
  txIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  txTitle: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  txSub: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  txAmount: { fontSize: 13, fontWeight: '600' },
  txTokens: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2 },
})
