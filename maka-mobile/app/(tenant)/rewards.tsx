import React from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '@/constants/tokens'
import { useStore } from '@/store'
import { useApi } from '@/lib/useApi'
import { queries } from '@/lib/queries'
import MakaLogo from '@/components/ui/MakaLogo'
import Card from '@/components/ui/Card'
import Row from '@/components/ui/Row'
import Stack from '@/components/ui/Stack'
import MonoText from '@/components/ui/MonoText'
import AsyncBoundary from '@/components/ui/AsyncBoundary'
import { CoinIcon } from '@/components/Icons'

export default function TenantRewards() {
  const dark = useStore((s) => s.dark)
  const t = useColors(dark)
  const insets = useSafeAreaInsets()

  const tokens = useApi(queries.myTokens)
  const businesses = useApi(queries.myBusinesses)

  function refreshAll() {
    tokens.refresh()
    businesses.refresh()
  }

  const balance = tokens.data?.balance ?? 0
  const thisMonth = tokens.data?.thisMonth ?? 0

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={(tokens.loading && !!tokens.data) || (businesses.loading && !!businesses.data)} onRefresh={refreshAll} tintColor={t.primary} />}
    >
      <View style={styles.header}>
        <MakaLogo size={24} dark={dark} wordmark={false} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.subtitle, { color: t.muted }]}>EARN · SPEND</Text>
          <Text style={[styles.title, { color: t.ink }]}>Rewards</Text>
        </View>
      </View>

      <View style={styles.px}>
        <AsyncBoundary loading={tokens.loading && !tokens.data} error={tokens.error} onRetry={refreshAll} minHeight={160}>
          <LinearGradient
            colors={[t.primary, dark ? '#0E1A14' : '#0A3A26']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGrad}
          >
            <View style={styles.heroCircle} />
            <Row>
              <Text style={styles.heroLabel}>MAKA TOKENS</Text>
              <CoinIcon size={18} color="#fff" />
            </Row>
            <Row align="flex-end" style={{ marginTop: 10 }}>
              <MonoText style={styles.heroBalance}>{balance.toLocaleString()}</MonoText>
              <Text style={styles.mkt}>MKT</Text>
            </Row>
            {thisMonth > 0 ? (
              <Text style={styles.heroValue}>+{thisMonth} earned this month</Text>
            ) : (
              <Text style={styles.heroValue}>Pay rent on time to start earning</Text>
            )}
          </LinearGradient>
        </AsyncBoundary>
      </View>

      <View style={styles.px}>
        <Card dark={dark} padding={16} style={{ marginTop: 14 }}>
          <Text style={[styles.cardTitle, { color: t.ink }]}>How to earn</Text>
          <Stack gap={10} style={{ marginTop: 10 }}>
            {[
              { text: 'Pay rent on time', value: '+50 / month' },
              { text: 'Refer a tenant', value: '+200' },
              { text: 'Buy tokens', value: 'Boost balance' },
              { text: 'Get gifted', value: 'From any user' },
            ].map((row) => (
              <Row key={row.text}>
                <Row gap={10} justify="flex-start">
                  <View style={[styles.earnIcon, { backgroundColor: t.primarySoft }]}>
                    <CoinIcon size={14} color={t.primaryInk} />
                  </View>
                  <Text style={[styles.earnText, { color: t.ink }]}>{row.text}</Text>
                </Row>
                <MonoText style={[styles.earnValue, { color: t.primary }]}>{row.value}</MonoText>
              </Row>
            ))}
          </Stack>
        </Card>

        <Text style={[styles.sectionLabel, { color: t.muted }]}>PARTNER STORES · MAKA CARD</Text>
        <AsyncBoundary
          loading={businesses.loading && !businesses.data}
          error={businesses.error}
          empty={businesses.data && businesses.data.businesses.length === 0}
          emptyMessage="No partners yet."
          onRetry={refreshAll}
          minHeight={120}
        >
          <Card dark={dark} padding={0}>
            {businesses.data?.businesses.map((b, i, arr) => (
              <View
                key={b.id}
                style={[styles.partnerRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: t.line2 }]}
              >
                <View style={[styles.partnerLogo, { backgroundColor: t.chip }]}>
                  <Text style={styles.partnerEmoji}>{b.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.partnerName, { color: t.ink }]}>{b.name}</Text>
                  <Text style={[styles.partnerCat, { color: t.muted }]}>{b.category}</Text>
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
  heroGrad: { borderRadius: 22, padding: 18, overflow: 'hidden' },
  heroCircle: { position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(182,225,75,0.18)' },
  heroLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6 },
  heroBalance: { fontSize: 40, fontWeight: '600', color: '#fff' },
  mkt: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 8, marginLeft: 6 },
  heroValue: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  cardTitle: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  earnIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  earnText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  earnValue: { fontSize: 12, fontFamily: 'JetBrainsMono_500Medium' },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginTop: 14, marginBottom: 8 },
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, paddingHorizontal: 14 },
  partnerLogo: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  partnerEmoji: { fontSize: 18 },
  partnerName: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  partnerCat: { fontSize: 11, fontFamily: 'Inter_400Regular' },
})
