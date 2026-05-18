import React from 'react'
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
import { ChevronLeftIcon, QrIcon, LockIcon, SettingsIcon } from '@/components/Icons'

function maskCard(num: string): string {
  // cardNumber comes formatted like ABCD-EFGH-IJKL-MNOP; show last group.
  const groups = num.split('-')
  const last = groups[groups.length - 1] ?? num.slice(-4)
  return `•••• •••• •••• ${last}`
}

export default function TenantCard() {
  const dark = useStore((s) => s.dark)
  const user = useStore((s) => s.user)
  const t = useColors(dark)
  const insets = useSafeAreaInsets()

  const card = useApi(queries.myCard)
  const tokens = useApi(queries.myTokens)

  function refreshAll() {
    card.refresh()
    tokens.refresh()
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6, paddingBottom: 40 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={(card.loading && !!card.data) || (tokens.loading && !!tokens.data)} onRefresh={refreshAll} tintColor={t.primary} />}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { borderColor: t.line, backgroundColor: t.surface }]}>
          <ChevronLeftIcon size={16} color={t.ink} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.subtitle, { color: t.muted }]}>SPEND YOUR TOKENS</Text>
          <Text style={[styles.title, { color: t.ink }]}>Maka Card</Text>
        </View>
      </View>

      <View style={styles.px}>
        <AsyncBoundary
          loading={card.loading && !card.data}
          error={card.error}
          onRetry={refreshAll}
          minHeight={260}
        >
          {card.data ? (
            <>
              <LinearGradient
                colors={['#0E1311', '#1F2622', t.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.cardVisual, !card.data.isActive && { opacity: 0.5 }]}
              >
                <View style={styles.cardGlow} />
                <Row>
                  <MakaLogo size={22} color="#fff" accent="#B6E14B" dark />
                  <Text style={[styles.cardTypeLabel, { fontFamily: 'JetBrainsMono_400Regular' }]}>
                    {card.data.isActive ? 'TOKEN CARD' : 'FROZEN'}
                  </Text>
                </Row>
                <View style={styles.cardBottom}>
                  <Text style={[styles.cardNumber, { fontFamily: 'JetBrainsMono_400Regular' }]}>
                    {maskCard(card.data.cardNumber)}
                  </Text>
                  <Row>
                    <View>
                      <Text style={styles.cardFieldLabel}>HOLDER</Text>
                      <Text style={styles.cardFieldValue}>
                        {(user?.name ?? user?.email ?? '').toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.cardFieldLabel}>BALANCE</Text>
                      <MonoText style={styles.cardFieldValue}>
                        {(tokens.data?.balance ?? 0).toLocaleString()} MKT
                      </MonoText>
                    </View>
                  </Row>
                </View>
              </LinearGradient>

              <View style={styles.cardActions}>
                {[
                  { Icon: QrIcon, label: 'Pay' },
                  { Icon: LockIcon, label: card.data.isActive ? 'Freeze' : 'Unfreeze' },
                  { Icon: SettingsIcon, label: 'Manage' },
                ].map(({ Icon, label }) => (
                  <Pressable key={label} style={[styles.cardActionBtn, { borderColor: t.line, backgroundColor: t.surface }]}>
                    <Icon size={18} color={t.ink} />
                    <Text style={[styles.cardActionLabel, { color: t.ink }]}>{label}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.sectionLabel, { color: t.muted }]}>HOW IT WORKS</Text>
              <Card dark={dark} padding={16}>
                <Text style={[styles.infoTitle, { color: t.ink }]}>Pay anywhere with QR</Text>
                <Text style={[styles.infoBody, { color: t.muted, marginTop: 6 }]}>
                  Show your QR at any Maka partner to spend tokens. 1 MKT = 1 USD off your purchase.
                </Text>
              </Card>
            </>
          ) : null}
        </AsyncBoundary>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {},
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingBottom: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontSize: 11, fontFamily: 'Inter_400Regular', letterSpacing: 0.4 },
  title: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  px: { paddingHorizontal: 16 },
  cardVisual: { borderRadius: 22, padding: 20, aspectRatio: 1.6, justifyContent: 'space-between', overflow: 'hidden' },
  cardGlow: { position: 'absolute', right: -40, bottom: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(182,225,75,0.15)' },
  cardTypeLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 2 },
  cardBottom: { gap: 4 },
  cardNumber: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  cardFieldLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardFieldValue: { fontSize: 13, color: '#fff', fontFamily: 'Inter_600SemiBold' },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  cardActionBtn: { flex: 1, height: 52, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  cardActionLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginTop: 14, marginBottom: 8 },
  infoTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  infoBody: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18 },
})
