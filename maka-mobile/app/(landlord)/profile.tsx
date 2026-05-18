import React from 'react'
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '@/constants/tokens'
import { useStore } from '@/store'
import { useApi } from '@/lib/useApi'
import { queries } from '@/lib/queries'
import Card from '@/components/ui/Card'
import Pill from '@/components/ui/Pill'
import Row from '@/components/ui/Row'
import Button from '@/components/ui/Button'
import AsyncBoundary from '@/components/ui/AsyncBoundary'
import { UserIcon, ChevronIcon } from '@/components/Icons'

function initials(name: string | null | undefined, email: string | undefined): string {
  if (name && name.trim()) {
    return name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  }
  return (email ?? '?').slice(0, 2).toUpperCase()
}

export default function LandlordProfile() {
  const dark = useStore((s) => s.dark)
  const user = useStore((s) => s.user)
  const signOut = useStore((s) => s.signOut)
  const t = useColors(dark)
  const insets = useSafeAreaInsets()

  const dashboard = useApi(queries.landlordDashboard)
  const summary = dashboard.data?.summary

  const bankLine = user?.bankName
    ? `${user.bankName} · ${user.bankAccountNumber ? '••••' + user.bankAccountNumber.slice(-4) : 'linked'}`
    : 'Not linked'
  const paypalLine = user?.paypalEmail ?? 'Not linked'
  const stripeLine = user?.stripeOnboardingComplete ? 'Connected' : 'Not connected'

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={dashboard.loading && !!dashboard.data} onRefresh={dashboard.refresh} tintColor={t.primary} />}
    >
      <View style={styles.header}>
        <UserIcon size={20} color={t.ink} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.subtitle, { color: t.muted }]}>LANDLORD ACCOUNT</Text>
          <Text style={[styles.title, { color: t.ink }]}>You</Text>
        </View>
      </View>

      <View style={styles.px}>
        <Card dark={dark} padding={16}>
          <Row>
            <Row gap={12} justify="flex-start">
              <View style={[styles.avatar, { backgroundColor: t.ink }]}>
                <Text style={styles.avatarText}>{initials(user?.name, user?.email)}</Text>
              </View>
              <View>
                <Text style={[styles.name, { color: t.ink }]}>{user?.name ?? user?.email ?? 'You'}</Text>
                <Text style={[styles.role, { color: t.muted }]}>
                  Landlord{summary ? ` · ${summary.units} unit${summary.units === 1 ? '' : 's'}` : ''}
                </Text>
              </View>
            </Row>
            {user?.onboardingComplete ? <Pill tone="primary" dark={dark}>Verified</Pill> : null}
          </Row>
        </Card>

        <AsyncBoundary
          loading={dashboard.loading && !dashboard.data}
          error={dashboard.error}
          onRetry={dashboard.refresh}
          minHeight={120}
        >
          <Text style={[styles.sectionLabel, { color: t.muted }]}>PAYOUT ACCOUNTS</Text>
          <Card dark={dark} padding={0}>
            {[
              { label: 'Bank account', value: bankLine },
              { label: 'PayPal', value: paypalLine },
              { label: 'Stripe Connect', value: stripeLine },
            ].map((row, i, arr) => (
              <View
                key={row.label}
                style={[styles.settingRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: t.line2 }]}
              >
                <Text style={[styles.settingLabel, { color: t.ink }]}>{row.label}</Text>
                <Row gap={4}>
                  <Text style={[styles.settingValue, { color: t.muted }]} numberOfLines={1}>{row.value}</Text>
                  <ChevronIcon size={14} color={t.muted2} />
                </Row>
              </View>
            ))}
          </Card>

          {summary ? (
            <>
              <Text style={[styles.sectionLabel, { color: t.muted }]}>PORTFOLIO</Text>
              <Card dark={dark} padding={0}>
                {[
                  { label: 'Units', value: String(summary.units) },
                  { label: 'Occupied', value: String(summary.occupied) },
                  { label: 'Month-to-date', value: `$${Math.round(summary.mtd).toLocaleString()}` },
                  { label: 'Pending', value: `$${Math.round(summary.pending).toLocaleString()}` },
                ].map((row, i, arr) => (
                  <View
                    key={row.label}
                    style={[styles.settingRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: t.line2 }]}
                  >
                    <Text style={[styles.settingLabel, { color: t.ink }]}>{row.label}</Text>
                    <Text style={[styles.settingValue, { color: t.muted }]}>{row.value}</Text>
                  </View>
                ))}
              </Card>
            </>
          ) : null}
        </AsyncBoundary>

        <Text style={[styles.sectionLabel, { color: t.muted }]}>ACCOUNT</Text>
        <Card dark={dark} padding={12}>
          <Row>
            <Text style={[styles.settingLabel, { color: t.ink }]}>Sign out</Text>
            <Button
              dark={dark}
              tone="soft"
              size="sm"
              full={false}
              onPress={async () => {
                await signOut()
                router.replace('/(auth)/login')
              }}
            >
              Sign out
            </Button>
          </Row>
        </Card>

        <Text style={[styles.version, { color: t.muted2, fontFamily: 'JetBrainsMono_500Medium' }]}>
          maka mobile · {user?.email ?? ''}
        </Text>
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
  avatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  name: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  role: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginTop: 14, marginBottom: 8 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, paddingHorizontal: 14 },
  settingLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  settingValue: { fontSize: 12, fontFamily: 'Inter_400Regular', maxWidth: '60%', textAlign: 'right' },
  version: { textAlign: 'center', fontSize: 11, marginTop: 24, marginBottom: 8 },
})
