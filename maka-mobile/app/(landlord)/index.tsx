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
import Row from '@/components/ui/Row'
import MonoText from '@/components/ui/MonoText'
import AsyncBoundary from '@/components/ui/AsyncBoundary'
import { BellIcon, PlusIcon, BuildingIcon } from '@/components/Icons'

function initials(name: string | null | undefined, email: string | undefined): string {
  if (name && name.trim()) {
    return name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  }
  return (email ?? '?').slice(0, 2).toUpperCase()
}

export default function LandlordPortfolio() {
  const dark = useStore((s) => s.dark)
  const user = useStore((s) => s.user)
  const t = useColors(dark)
  const insets = useSafeAreaInsets()

  const { data, loading, error, refresh } = useApi(queries.landlordDashboard)

  const avatar = useMemo(() => initials(user?.name, user?.email), [user])
  const firstName = (user?.name ?? user?.email ?? 'there').split(' ')[0].split('@')[0]

  const summary = data?.summary
  const properties = data?.properties ?? []
  const occupied = summary?.occupied ?? 0
  const totalUnits = summary?.units ?? 0
  const vacant = Math.max(0, totalUnits - occupied)
  const onTimeRate = (() => {
    const nonVacant = properties.filter((p) => p.status !== 'vacant')
    if (nonVacant.length === 0) return 0
    const paid = nonVacant.filter((p) => p.status === 'paid').length
    return Math.round((paid / nonVacant.length) * 100)
  })()

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading && !!data} onRefresh={refresh} tintColor={t.primary} />}
    >
      <Row style={styles.header}>
        <MakaLogo size={26} dark={dark} />
        <Row gap={8}>
          <Pressable style={[styles.iconBtn, { borderColor: t.line, backgroundColor: t.surface }]}>
            <BellIcon size={18} color={t.ink2} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(landlord)/profile')}
            style={[styles.iconBtn, { borderColor: t.line, backgroundColor: t.chip }]}
          >
            <Text style={[styles.avatarText, { color: t.ink }]}>{avatar}</Text>
          </Pressable>
        </Row>
      </Row>

      <View style={styles.greeting}>
        <Text style={[styles.greetSub, { color: t.muted }]}>Welcome back,</Text>
        <Text style={[styles.greetName, { color: t.ink }]}>{firstName}</Text>
      </View>

      <AsyncBoundary loading={loading && !data} error={error} onRetry={refresh} minHeight={400}>
        {data ? (
          <>
            <View style={styles.px}>
              <View style={[styles.heroCard, { backgroundColor: dark ? '#0F1A14' : '#0E1311', overflow: 'hidden' }]}>
                <LinearGradient
                  colors={['rgba(91,198,143,0.28)', 'transparent']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0.6, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Row>
                  <View style={styles.accentPill}>
                    <Text style={styles.accentPillText}>Month to date</Text>
                  </View>
                  <Text style={[styles.nextPayout, { fontFamily: 'JetBrainsMono_500Medium' }]}>
                    UNITS · {totalUnits}
                  </Text>
                </Row>
                <Row align="flex-end" style={{ marginTop: 18 }}>
                  <Text style={styles.currSign}>$</Text>
                  <MonoText style={styles.heroAmount}>{Math.round(summary?.mtd ?? 0).toLocaleString()}</MonoText>
                </Row>
                <Text style={styles.heroSub}>
                  ${Math.round(summary?.pending ?? 0).toLocaleString()} pending · {onTimeRate}% on-time
                </Text>
                <Row gap={8} style={{ marginTop: 16 }}>
                  <Pressable onPress={() => router.push('/(landlord)/tenants')} style={styles.viewBtn}>
                    <Text style={styles.viewBtnText}>View tenants</Text>
                  </Pressable>
                  <Pressable style={styles.addBtn}>
                    <PlusIcon size={16} color="#fff" />
                    <Text style={styles.addBtnText}>Add</Text>
                  </Pressable>
                </Row>
              </View>
            </View>

            <View style={[styles.statsGrid, styles.px14]}>
              {[
                { label: 'Units', value: String(totalUnits), sub: `${occupied} occupied` },
                { label: 'On-time', value: `${onTimeRate}%`, sub: 'This month' },
                { label: 'Vacant', value: String(vacant), sub: vacant === 1 ? '1 unit' : 'units' },
              ].map((m) => (
                <Card key={m.label} dark={dark} padding={12} style={{ flex: 1 }}>
                  <Text style={[styles.statLabel, { color: t.muted }]}>{m.label.toUpperCase()}</Text>
                  <MonoText style={[styles.statValue, { color: t.ink }]}>{m.value}</MonoText>
                  <Text style={[styles.statSub, { color: t.muted }]}>{m.sub}</Text>
                </Card>
              ))}
            </View>

            <View style={styles.px14}>
              <Row style={{ marginBottom: 8 }}>
                <Text style={[styles.sectionLabel, { color: t.muted }]}>INCOMING THIS PERIOD</Text>
                <Pressable onPress={() => router.push('/(landlord)/tenants')}>
                  <Text style={[styles.seeAll, { color: t.muted }]}>All</Text>
                </Pressable>
              </Row>
              {properties.length === 0 ? (
                <Card dark={dark} padding={20}>
                  <Text style={[{ fontSize: 13, fontFamily: 'Inter_400Regular', color: t.muted, textAlign: 'center' }]}>
                    No properties yet. Add one to start collecting rent.
                  </Text>
                </Card>
              ) : (
                <Card dark={dark} padding={0}>
                  {properties.slice(0, 4).map((p, i, arr) => (
                    <Pressable
                      key={p.id}
                      onPress={() => router.push('/(landlord)/tenant-detail')}
                      style={[styles.txRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: t.line2 }]}
                    >
                      <View style={[styles.txIcon, { backgroundColor: t.chip }]}>
                        <BuildingIcon size={16} color={t.ink2} />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={[styles.txTitle, { color: t.ink }]} numberOfLines={1}>
                          {p.tenant?.name ?? p.tenant?.email ?? '— vacant'}
                        </Text>
                        <Text style={[styles.txSub, { color: t.muted }]}>
                          {p.unit ? `${p.unit} · ` : ''}{p.address}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <MonoText style={[styles.txAmount, { color: t.ink }]}>${Math.round(p.monthlyRent)}</MonoText>
                        <Text
                          style={[
                            styles.txStatus,
                            {
                              color:
                                p.status === 'paid' ? t.primary
                                : p.status === 'late' ? t.danger
                                : p.status === 'vacant' ? t.muted
                                : t.muted,
                            },
                          ]}
                        >
                          {p.status === 'paid' ? 'Received'
                            : p.status === 'late' ? `${Math.abs(p.dueIn ?? 0)}d late`
                            : p.status === 'due' ? `In ${p.dueIn}d`
                            : 'Vacant'}
                        </Text>
                      </View>
                    </Pressable>
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
  scroll: {},
  header: { paddingHorizontal: 18, paddingBottom: 6 },
  iconBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  greeting: { paddingHorizontal: 18, paddingBottom: 14 },
  greetSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  greetName: { fontSize: 22, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  px: { paddingHorizontal: 16 },
  px14: { paddingHorizontal: 16, marginTop: 14 },
  heroCard: { borderRadius: 24, padding: 18 },
  accentPill: { backgroundColor: 'rgba(182,225,75,0.22)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  accentPillText: { color: '#D9EF9A', fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  nextPayout: { color: 'rgba(255,255,255,0.55)', fontSize: 11 },
  currSign: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 },
  heroAmount: { fontSize: 44, fontWeight: '600', color: '#fff', lineHeight: 52 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  viewBtn: { flex: 1, height: 46, backgroundColor: '#fff', borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  viewBtnText: { fontFamily: 'Inter_700Bold', fontSize: 14, color: '#0E1311' },
  addBtn: { height: 46, paddingHorizontal: 16, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', flexDirection: 'row', alignItems: 'center', gap: 6 },
  addBtnText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6 },
  statValue: { fontSize: 20, fontWeight: '600', marginTop: 4 },
  statSub: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 1 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  seeAll: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  txRow: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 14, gap: 10 },
  txIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  txTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  txSub: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  txAmount: { fontSize: 13, fontWeight: '600' },
  txStatus: { fontSize: 10, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', marginTop: 1 },
})
