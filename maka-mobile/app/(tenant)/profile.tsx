import React from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native'
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

export default function TenantProfile() {
  const dark = useStore((s) => s.dark)
  const user = useStore((s) => s.user)
  const signOut = useStore((s) => s.signOut)
  const t = useColors(dark)
  const insets = useSafeAreaInsets()

  const properties = useApi(queries.myProperties)
  const primary = properties.data?.properties[0]

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={properties.loading && !!properties.data} onRefresh={properties.refresh} tintColor={t.primary} />}
    >
      <View style={styles.header}>
        <UserIcon size={20} color={t.ink} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.subtitle, { color: t.muted }]}>PROFILE & SETTINGS</Text>
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
                <Text style={[styles.role, { color: t.muted }]}>Tenant</Text>
              </View>
            </Row>
            {user?.onboardingComplete ? <Pill tone="primary" dark={dark}>Verified</Pill> : null}
          </Row>
        </Card>

        <Text style={[styles.sectionLabel, { color: t.muted }]}>LEASE</Text>
        <AsyncBoundary
          loading={properties.loading && !properties.data}
          error={properties.error}
          empty={properties.data && properties.data.properties.length === 0}
          emptyMessage="No active lease linked. Complete onboarding to link one."
          onRetry={properties.refresh}
          minHeight={140}
        >
          {primary ? (
            <Card dark={dark} padding={0}>
              {[
                { label: 'Address', value: `${primary.address}${primary.unit ? ' · ' + primary.unit : ''}` },
                { label: 'Landlord', value: primary.landlord?.name ?? primary.landlord?.email ?? '—' },
                { label: 'Monthly rent', value: `$${primary.monthlyRent.toFixed(2)}` },
                { label: 'Due day', value: String(primary.dueDay) },
              ].map((row, i, arr) => (
                <View
                  key={row.label}
                  style={[styles.infoRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: t.line2 }]}
                >
                  <Text style={[styles.infoLabel, { color: t.muted }]}>{row.label}</Text>
                  <Text style={[styles.infoValue, { color: t.ink }]} numberOfLines={1}>{row.value}</Text>
                </View>
              ))}
            </Card>
          ) : null}
        </AsyncBoundary>

        <Text style={[styles.sectionLabel, { color: t.muted }]}>PREFERENCES</Text>
        <Card dark={dark} padding={0}>
          {[
            { label: 'Maka Card', value: 'Active', route: '/(tenant)/card' as const },
            { label: 'Notifications', value: 'On', route: null },
            { label: 'Language', value: 'English', route: null },
          ].map((row, i, arr) => (
            <Pressable
              key={row.label}
              onPress={() => row.route && router.push(row.route)}
              style={[styles.prefRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: t.line2 }]}
            >
              <Text style={[styles.prefTitle, { color: t.ink }]}>{row.label}</Text>
              <Row gap={4}>
                <Text style={[styles.prefValue, { color: t.muted }]}>{row.value}</Text>
                {row.route ? <ChevronIcon size={14} color={t.muted2} /> : null}
              </Row>
            </Pressable>
          ))}
        </Card>

        <Text style={[styles.sectionLabel, { color: t.muted }]}>ACCOUNT</Text>
        <Card dark={dark} padding={12}>
          <Row>
            <Text style={[styles.prefTitle, { color: t.ink }]}>Sign out</Text>
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
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, paddingHorizontal: 14, alignItems: 'center' },
  infoLabel: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  infoValue: { fontSize: 13, fontFamily: 'Inter_500Medium', maxWidth: '60%', textAlign: 'right' },
  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, paddingHorizontal: 14 },
  prefTitle: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  prefValue: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  version: { textAlign: 'center', fontSize: 11, marginTop: 24, marginBottom: 8 },
})
