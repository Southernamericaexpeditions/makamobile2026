import React, { useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '@/constants/tokens'
import { useStore } from '@/store'
import { useApi } from '@/lib/useApi'
import { queries } from '@/lib/queries'
import Card from '@/components/ui/Card'
import Row from '@/components/ui/Row'
import MonoText from '@/components/ui/MonoText'
import AsyncBoundary from '@/components/ui/AsyncBoundary'
import { BuildingIcon, SearchIcon, ChevronIcon } from '@/components/Icons'

type Filter = 'all' | 'paid' | 'due' | 'late'

export default function LandlordTenants() {
  const dark = useStore((s) => s.dark)
  const t = useColors(dark)
  const insets = useSafeAreaInsets()
  const [filter, setFilter] = useState<Filter>('all')

  const { data, loading, error, refresh } = useApi(queries.myTenants)

  const tenants = data?.tenants ?? []
  const filtered = tenants.filter((tp) => filter === 'all' || tp.status === filter)

  function statusStyle(status: string) {
    if (status === 'paid') return { bg: t.primarySoft, fg: t.primary }
    if (status === 'late') return { bg: t.dangerSoft, fg: t.danger }
    return { bg: t.chip, fg: t.ink2 }
  }

  function statusLabel(status: string, nextDueDate: string) {
    if (status === 'paid') return 'Paid'
    if (status === 'late') {
      const days = Math.ceil((Date.now() - new Date(nextDueDate).getTime()) / (1000 * 60 * 60 * 24))
      return `${days}d late`
    }
    const days = Math.ceil((new Date(nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return `Due in ${days}d`
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading && !!data} onRefresh={refresh} tintColor={t.primary} />}
    >
      <View style={styles.header}>
        <BuildingIcon size={20} color={t.ink} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.subtitle, { color: t.muted }]}>{tenants.length} ACTIVE</Text>
          <Text style={[styles.title, { color: t.ink }]}>Tenants</Text>
        </View>
        <SearchIcon size={18} color={t.muted} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filterRow, styles.px]}>
        {(['all', 'paid', 'due', 'late'] as Filter[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterPill,
              { borderColor: filter === f ? t.ink : t.line, backgroundColor: filter === f ? t.ink : t.surface },
            ]}
          >
            <Text style={[styles.filterText, { color: filter === f ? (dark ? t.bg : '#fff') : t.ink }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={[styles.px, { gap: 10 }]}>
        <AsyncBoundary
          loading={loading && !data}
          error={error}
          empty={!loading && filtered.length === 0}
          emptyMessage={filter === 'all' ? 'No active tenants yet.' : `No ${filter} tenants.`}
          onRetry={refresh}
          minHeight={200}
        >
          {filtered.map((tp) => {
            const ss = statusStyle(tp.status)
            return (
              <Card
                key={tp.tenantPropertyId}
                dark={dark}
                padding={14}
                onPress={() => router.push({
                  pathname: '/(landlord)/tenant-detail',
                  params: { id: tp.property.id, tenantId: tp.tenant.id },
                })}
              >
                <Row>
                  <Row gap={12} justify="flex-start" style={{ flex: 1, minWidth: 0 }}>
                    <View style={[styles.propIcon, { backgroundColor: t.chip }]}>
                      <BuildingIcon size={18} color={t.ink2} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[styles.propTitle, { color: t.ink }]} numberOfLines={1}>
                        {tp.property.unit ? `${tp.property.unit} · ` : ''}{tp.property.address}
                      </Text>
                      <Text style={[styles.propTenant, { color: t.muted }]} numberOfLines={1}>
                        {tp.tenant.name ?? tp.tenant.email}
                      </Text>
                    </View>
                  </Row>
                  <ChevronIcon size={14} color={t.muted} />
                </Row>
                <View style={[styles.divider, { backgroundColor: t.line2 }]} />
                <Row>
                  <View>
                    <Text style={[styles.rentLabel, { color: t.muted }]}>RENT</Text>
                    <MonoText style={[styles.rentAmount, { color: t.ink }]}>${Math.round(tp.property.monthlyRent)}</MonoText>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: ss.bg }]}>
                    <Text style={[styles.statusText, { color: ss.fg }]}>{statusLabel(tp.status, tp.nextDueDate)}</Text>
                  </View>
                </Row>
              </Card>
            )
          })}
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
  filterRow: { gap: 6, paddingBottom: 10 },
  filterPill: { height: 32, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filterText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  propIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  propTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  propTenant: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  divider: { height: 1, marginVertical: 12 },
  rentLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6 },
  rentAmount: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.5 },
})
