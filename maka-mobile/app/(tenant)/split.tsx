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
import MonoText from '@/components/ui/MonoText'
import Stack from '@/components/ui/Stack'
import AsyncBoundary from '@/components/ui/AsyncBoundary'
import { ChevronLeftIcon, PlusIcon } from '@/components/Icons'
import type { Split, SplitParticipantStatus } from '@/lib/types'

function initials(name: string | null | undefined, email: string): string {
  if (name && name.trim()) {
    return name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

function statusPill(status: SplitParticipantStatus): { label: string; tone: 'primary' | 'neutral' | 'danger' } {
  switch (status) {
    case 'PAID': return { label: 'Paid', tone: 'primary' }
    case 'ACCEPTED': return { label: 'Accepted', tone: 'neutral' }
    case 'INVITED': return { label: 'Invited', tone: 'danger' }
  }
}

export default function TenantSplit() {
  const dark = useStore((s) => s.dark)
  const user = useStore((s) => s.user)
  const t = useColors(dark)
  const insets = useSafeAreaInsets()

  const { data, loading, error, refresh } = useApi(queries.mySplits)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6, paddingBottom: 40 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading && !!data} onRefresh={refresh} tintColor={t.primary} />}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { borderColor: t.line, backgroundColor: t.surface }]}>
          <ChevronLeftIcon size={16} color={t.ink} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.subtitle, { color: t.muted }]}>SHARED RENT</Text>
          <Text style={[styles.title, { color: t.ink }]}>Splits</Text>
        </View>
      </View>

      <View style={styles.px}>
        <AsyncBoundary
          loading={loading && !data}
          error={error}
          empty={data && data.splits.length === 0}
          emptyMessage="No splits yet. Create one to share rent with roommates."
          onRetry={refresh}
          minHeight={200}
        >
          <Stack gap={14}>
            {data?.splits.map((split) => (
              <SplitCard key={split.id} split={split} dark={dark} myUserId={user?.id} />
            ))}
          </Stack>
        </AsyncBoundary>

        <Pressable style={[styles.inviteBtn, { borderColor: t.line, marginTop: 16 }]}>
          <PlusIcon size={16} color={t.muted} />
          <Text style={[styles.inviteBtnText, { color: t.muted }]}>Create a split (coming soon)</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

function SplitCard({ split, dark, myUserId }: { split: Split; dark: boolean; myUserId?: string }) {
  const t = useColors(dark)
  const pct = Math.min(100, Math.round((split.collected / split.totalAmount) * 100))
  const dueDate = new Date(split.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  const myParticipant = split.participants.find((p) => p.userId === myUserId)

  return (
    <Card dark={dark} padding={18}>
      <Row>
        <Text style={[styles.subtitle, { color: t.muted }]} numberOfLines={1}>
          {split.property.address}{split.property.unit ? ` · ${split.property.unit}` : ''}
        </Text>
        <Pill dark={dark}>{split.status}</Pill>
      </Row>
      <Row align="flex-end" gap={6} style={{ marginTop: 8 }}>
        <MonoText style={[styles.collected, { color: t.ink }]}>
          ${Math.round(split.collected)}
        </MonoText>
        <Text style={[styles.total, { color: t.muted }]}>of ${Math.round(split.totalAmount)}</Text>
      </Row>
      <Text style={[{ fontSize: 11, color: t.muted, fontFamily: 'Inter_400Regular', marginTop: 2 }]}>
        Due {dueDate}
      </Text>
      <View style={[styles.progressBar, { backgroundColor: t.chip }]}>
        <View style={[styles.progressFill, { backgroundColor: t.primary, width: `${pct}%` as const }]} />
      </View>

      <Text style={[styles.sectionLabel, { color: t.muted, marginTop: 14, marginBottom: 8 }]}>PARTICIPANTS</Text>
      <Stack gap={0}>
        {split.participants.map((p, i, arr) => {
          const pill = statusPill(p.status)
          return (
            <View
              key={p.id}
              style={[styles.partRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: t.line2 }]}
            >
              <View style={[styles.avatar, { backgroundColor: p.status === 'PAID' ? t.primary : t.chip }]}>
                <Text style={[styles.avatarText, { color: p.status === 'PAID' ? '#fff' : t.ink2 }]}>
                  {initials(null, p.email)}
                </Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.partName, { color: t.ink }]} numberOfLines={1}>
                  {p.userId === myUserId ? 'You' : p.email}
                </Text>
                <Text style={[styles.partShare, { color: t.muted }]}>
                  ${p.amount.toFixed(2)}
                </Text>
              </View>
              <Pill tone={pill.tone} dark={dark}>{pill.label}</Pill>
            </View>
          )
        })}
      </Stack>

      {myParticipant && myParticipant.status !== 'PAID' ? (
        <View style={{ marginTop: 14 }}>
          <Button dark={dark} onPress={() => router.push('/(tenant)/pay')}>Pay my share</Button>
        </View>
      ) : null}
    </Card>
  )
}

const styles = StyleSheet.create({
  scroll: {},
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingBottom: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontSize: 11, fontFamily: 'Inter_400Regular', letterSpacing: 0.4 },
  title: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  px: { paddingHorizontal: 16 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  collected: { fontSize: 28, fontWeight: '600' },
  total: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  progressBar: { height: 8, borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  partRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  avatar: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  partName: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  partShare: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', padding: 14 },
  inviteBtnText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
})
