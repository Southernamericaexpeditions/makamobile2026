import React, { useMemo } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '@/constants/tokens'
import { useStore } from '@/store'
import { useApi } from '@/lib/useApi'
import { queries } from '@/lib/queries'
import MakaLogo from '@/components/ui/MakaLogo'
import Card from '@/components/ui/Card'
import Pill from '@/components/ui/Pill'
import Row from '@/components/ui/Row'
import MonoText from '@/components/ui/MonoText'
import AsyncBoundary from '@/components/ui/AsyncBoundary'
import {
  BellIcon, CoinIcon, TrendIcon, ArrowUpIcon, ArrowDownIcon,
  SplitIcon, PayIcon, CardIcon, BuildingIcon,
} from '@/components/Icons'

function initials(name: string | null | undefined, email: string | undefined): string {
  if (name && name.trim()) {
    return name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  }
  return (email ?? '?').slice(0, 2).toUpperCase()
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}

export default function TenantHome() {
  const dark = useStore((s) => s.dark)
  const user = useStore((s) => s.user)
  const t = useColors(dark)
  const insets = useSafeAreaInsets()

  const { data, loading, error, refresh } = useApi(queries.tenantDashboard)

  const avatar = useMemo(() => initials(user?.name, user?.email), [user])
  const firstName = (user?.name ?? user?.email ?? 'there').split(' ')[0].split('@')[0]

  const primarySplit = data?.splits[0]

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading && !!data} onRefresh={refresh} tintColor={t.primary} />}
    >
      {/* Header */}
      <Row style={styles.header}>
        <MakaLogo size={26} dark={dark} />
        <Row gap={8}>
          <Pressable style={[styles.iconBtn, { borderColor: t.line, backgroundColor: t.surface }]}>
            <BellIcon size={18} color={t.ink2} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(tenant)/profile')}
            style={[styles.iconBtn, { borderColor: t.line, backgroundColor: t.chip }]}
          >
            <Text style={[styles.avatarText, { color: t.ink }]}>{avatar}</Text>
          </Pressable>
        </Row>
      </Row>

      {/* Greeting */}
      <View style={styles.greeting}>
        <Text style={[styles.greetSub, { color: t.muted }]}>Welcome back,</Text>
        <Text style={[styles.greetName, { color: t.ink }]}>{firstName}</Text>
      </View>

      <AsyncBoundary loading={loading && !data} error={error} onRetry={refresh} minHeight={400}>
        {data ? (
          <>
            {/* Rent hero card */}
            <View style={styles.px}>
              {data.rent ? (
                <View style={[styles.heroCard, { backgroundColor: dark ? '#0F1A14' : '#0E1311', overflow: 'hidden' }]}>
                  <LinearGradient
                    colors={['rgba(91,198,143,0.35)', 'transparent']}
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0.3, y: 0.8 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Row>
                    <View style={styles.accentPill}>
                      <Text style={styles.accentPillText}>
                        {data.rent.daysLeft > 0
                          ? `Rent due in ${data.rent.daysLeft} day${data.rent.daysLeft === 1 ? '' : 's'}`
                          : data.rent.daysLeft === 0
                            ? 'Rent due today'
                            : `Late by ${Math.abs(data.rent.daysLeft)} day${Math.abs(data.rent.daysLeft) === 1 ? '' : 's'}`}
                      </Text>
                    </View>
                    <Text style={[styles.dueDate, { fontFamily: 'JetBrainsMono_500Medium' }]}>
                      {shortDate(data.rent.dueDate)}
                    </Text>
                  </Row>
                  <Row align="flex-end" style={{ marginTop: 18 }}>
                    <Text style={styles.currSign}>$</Text>
                    <MonoText style={styles.heroAmount}>{Math.round(data.rent.amount).toLocaleString()}</MonoText>
                    <Text style={styles.currCode}>{data.rent.currency}</Text>
                  </Row>
                  {data.properties[0] ? (
                    <Text style={styles.heroSub}>
                      {data.properties[0].address}
                      {data.properties[0].landlord?.name ? ` · ${data.properties[0].landlord.name}` : ''}
                    </Text>
                  ) : null}
                  <Row gap={8} style={{ marginTop: 16 }}>
                    <Pressable onPress={() => router.push('/(tenant)/pay')} style={styles.payBtn}>
                      <Text style={styles.payBtnText}>Pay rent</Text>
                    </Pressable>
                    <Pressable onPress={() => router.push('/(tenant)/split')} style={styles.splitBtn}>
                      <SplitIcon size={16} color="#fff" />
                      <Text style={styles.splitBtnText}>Split</Text>
                    </Pressable>
                  </Row>
                </View>
              ) : (
                <Card dark={dark} padding={20}>
                  <Text style={[styles.cardTitle, { color: t.ink }]}>No active lease</Text>
                  <Text style={[{ fontSize: 12, fontFamily: 'Inter_400Regular', color: t.muted, marginTop: 6 }]}>
                    Link a lease from your profile, or ask your landlord to invite you.
                  </Text>
                </Card>
              )}
            </View>

            {/* Quick stats */}
            <View style={[styles.statsGrid, styles.px14]}>
              <Card dark={dark} padding={14} onPress={() => router.push('/(tenant)/rewards')} style={{ flex: 1 }}>
                <Row>
                  <Text style={[styles.statLabel, { color: t.muted }]}>TOKENS</Text>
                  <CoinIcon size={16} color={t.primary} />
                </Row>
                <MonoText style={[styles.statValue, { color: t.ink, marginTop: 8 }]}>
                  {data.tokens.balance.toLocaleString()}
                </MonoText>
                {data.tokens.thisMonth > 0 ? (
                  <Row justify="flex-start" gap={3} style={{ marginTop: 4 }}>
                    <ArrowUpIcon size={12} color={t.primary} />
                    <Text style={[styles.statDelta, { color: t.primary }]}>+{data.tokens.thisMonth} this month</Text>
                  </Row>
                ) : null}
              </Card>
              <Card dark={dark} padding={14} onPress={() => router.push('/(tenant)/card')} style={{ flex: 1 }}>
                <Row>
                  <Text style={[styles.statLabel, { color: t.muted }]}>CARD</Text>
                  <CardIcon size={16} color={t.primary} />
                </Row>
                <MonoText style={[styles.statValue, { color: t.ink, marginTop: 8, fontSize: 18 }]}>
                  {data.tokens.balance.toLocaleString()}
                </MonoText>
                <Row justify="flex-start" gap={3} style={{ marginTop: 4 }}>
                  <Text style={[styles.statDelta, { color: t.muted }]}>Spendable MKT</Text>
                </Row>
              </Card>
            </View>

            {/* Split section */}
            {primarySplit ? (
              <View style={[styles.px14, { marginTop: 10 }]}>
                <Card dark={dark} padding={16} onPress={() => router.push('/(tenant)/split')}>
                  <Row>
                    <Row gap={8} justify="flex-start">
                      <SplitIcon size={16} color={t.ink2} />
                      <Text style={[styles.cardTitle, { color: t.ink }]}>Split with roommates</Text>
                    </Row>
                    <Pill dark={dark}>{primarySplit.myStatus === 'PAID' ? 'Paid' : 'Pending'}</Pill>
                  </Row>
                  <Row style={{ marginTop: 12 }}>
                    <Text style={[styles.collected, { color: t.muted }]}>
                      ${Math.round(primarySplit.collected)} of ${Math.round(primarySplit.totalAmount)} collected
                    </Text>
                  </Row>
                  <View style={[styles.progressBar, { backgroundColor: t.chip }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: t.primary,
                          width: `${Math.min(100, Math.round((primarySplit.collected / primarySplit.totalAmount) * 100))}%`,
                        },
                      ]}
                    />
                  </View>
                </Card>
              </View>
            ) : null}

            {/* Quick actions */}
            <View style={styles.px14}>
              <Text style={[styles.sectionLabel, { color: t.muted }]}>QUICK ACTIONS</Text>
              <View style={styles.actionsGrid}>
                {[
                  { key: 'pay', label: 'Pay', Icon: PayIcon, route: '/(tenant)/pay' as const },
                  { key: 'card', label: 'Card', Icon: CardIcon, route: '/(tenant)/card' as const },
                  { key: 'split', label: 'Split', Icon: SplitIcon, route: '/(tenant)/split' as const },
                  { key: 'rewards', label: 'Rewards', Icon: BuildingIcon, route: '/(tenant)/rewards' as const },
                ].map((a) => (
                  <Pressable
                    key={a.key}
                    onPress={() => router.push(a.route)}
                    style={[styles.actionBtn, { borderColor: t.line, backgroundColor: t.surface }]}
                  >
                    <a.Icon size={20} color={t.ink} />
                    <Text style={[styles.actionLabel, { color: t.ink }]}>{a.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Recent activity */}
            <View style={styles.px14}>
              <Row style={{ marginBottom: 8 }}>
                <Text style={[styles.sectionLabel, { color: t.muted }]}>RECENT</Text>
                <Pressable onPress={() => router.push('/(tenant)/history')}>
                  <Text style={[styles.seeAll, { color: t.muted }]}>See all</Text>
                </Pressable>
              </Row>
              {data.recentPayments.length === 0 ? (
                <Card dark={dark} padding={20}>
                  <Text style={[{ fontSize: 13, fontFamily: 'Inter_400Regular', color: t.muted, textAlign: 'center' }]}>
                    No activity yet. Your payments will show up here.
                  </Text>
                </Card>
              ) : (
                <Card dark={dark} padding={0}>
                  {data.recentPayments.slice(0, 3).map((p, i, arr) => (
                    <View
                      key={p.id}
                      style={[
                        styles.txRow,
                        { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: t.line2 },
                      ]}
                    >
                      <View style={[styles.txIcon, { backgroundColor: t.chip }]}>
                        <ArrowUpIcon size={14} color={t.ink2} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.txTitle, { color: t.ink }]}>{p.title}</Text>
                        <Text style={[styles.txSub, { color: t.muted }]}>
                          {shortDate(p.paidAt ?? p.createdAt)} · {p.method}
                        </Text>
                      </View>
                      <MonoText style={[styles.txAmount, { color: t.ink }]}>
                        −${p.amount.toFixed(2)}
                      </MonoText>
                    </View>
                  ))}
                </Card>
              )}
            </View>
          </>
        ) : null}
      </AsyncBoundary>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 0 },
  px: { paddingHorizontal: 16 },
  px14: { paddingHorizontal: 16, marginTop: 14 },
  header: { paddingHorizontal: 18, paddingBottom: 6 },
  iconBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  greeting: { paddingHorizontal: 18, paddingBottom: 14 },
  greetSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  greetName: { fontSize: 22, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  heroCard: { borderRadius: 24, padding: 18 },
  accentPill: { backgroundColor: 'rgba(182,225,75,0.22)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  accentPillText: { color: '#D9EF9A', fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  dueDate: { color: 'rgba(255,255,255,0.55)', fontSize: 11 },
  currSign: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 },
  heroAmount: { fontSize: 44, fontWeight: '600', color: '#fff', lineHeight: 52 },
  currCode: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 6, marginLeft: 4 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  payBtn: { flex: 1, height: 46, backgroundColor: '#fff', borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  payBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#0E1311' },
  splitBtn: { height: 46, paddingHorizontal: 16, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', flexDirection: 'row', alignItems: 'center', gap: 6 },
  splitBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  statsGrid: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6 },
  statValue: { fontSize: 22, fontWeight: '600' },
  statDelta: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  cardTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  collected: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  progressBar: { height: 6, borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginBottom: 8 },
  actionsGrid: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, borderRadius: 14, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 6, alignItems: 'center', gap: 6 },
  actionLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  seeAll: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 14, gap: 10 },
  txIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  txTitle: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  txSub: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  txAmount: { fontSize: 13, fontWeight: '600' },
})
