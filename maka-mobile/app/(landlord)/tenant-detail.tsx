import React, { useMemo } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '@/constants/tokens'
import { useStore } from '@/store'
import { useApi } from '@/lib/useApi'
import { queries } from '@/lib/queries'
import Card from '@/components/ui/Card'
import Pill from '@/components/ui/Pill'
import Row from '@/components/ui/Row'
import Stack from '@/components/ui/Stack'
import Button from '@/components/ui/Button'
import MonoText from '@/components/ui/MonoText'
import AsyncBoundary from '@/components/ui/AsyncBoundary'
import { ChevronLeftIcon, CheckIcon } from '@/components/Icons'

export default function TenantDetail() {
  const dark = useStore((s) => s.dark)
  const t = useColors(dark)
  const insets = useSafeAreaInsets()
  const { id, tenantId } = useLocalSearchParams<{ id?: string; tenantId?: string }>()

  const tenants = useApi(queries.myTenants)
  const payments = useApi(queries.myPayments)

  const link = useMemo(() => {
    if (!tenants.data) return null
    return tenants.data.tenants.find(
      (tp) => tp.property.id === id || tp.tenant.id === tenantId,
    ) ?? tenants.data.tenants[0] ?? null
  }, [tenants.data, id, tenantId])

  const tenantPayments = useMemo(() => {
    if (!payments.data || !link) return []
    return payments.data.payments.filter((p) => p.tenant?.id === link.tenant.id).slice(0, 6)
  }, [payments.data, link])

  function refreshAll() {
    tenants.refresh()
    payments.refresh()
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 6, paddingBottom: 40 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={tenants.loading && !!tenants.data} onRefresh={refreshAll} tintColor={t.primary} />}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { borderColor: t.line, backgroundColor: t.surface }]}>
          <ChevronLeftIcon size={16} color={t.ink} />
        </Pressable>
        {link ? (
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.subtitle, { color: t.muted }]} numberOfLines={1}>
              {link.property.unit ? `${link.property.unit} · ` : ''}{link.property.address}
            </Text>
            <Text style={[styles.title, { color: t.ink }]} numberOfLines={1}>
              {link.tenant.name ?? link.tenant.email}
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={[styles.title, { color: t.ink }]}>Tenant</Text>
          </View>
        )}
      </View>

      <View style={styles.px}>
        <AsyncBoundary
          loading={tenants.loading && !tenants.data}
          error={tenants.error}
          empty={!tenants.loading && !link}
          emptyMessage="Tenant not found."
          onRetry={refreshAll}
          minHeight={300}
        >
          {link ? (
            <>
              <Card dark={dark} padding={18}>
                <Row>
                  <View>
                    <Text style={[styles.fieldLabel, { color: t.muted }]}>MONTHLY RENT</Text>
                    <Row align="flex-end" gap={4} style={{ marginTop: 4 }}>
                      <Text style={[{ fontSize: 14, color: t.muted }]}>$</Text>
                      <MonoText style={[styles.rentAmount, { color: t.ink }]}>
                        {Math.round(link.property.monthlyRent)}
                      </MonoText>
                    </Row>
                  </View>
                  <Pill
                    tone={link.status === 'paid' ? 'primary' : link.status === 'late' ? 'danger' : 'neutral'}
                    dark={dark}
                  >
                    {link.status === 'paid' ? 'Paid' : link.status === 'late' ? 'Late' : 'Due'}
                  </Pill>
                </Row>
                <View style={[styles.divider, { backgroundColor: t.line2 }]} />
                <Stack gap={8}>
                  <Row><Text style={[styles.infoLabel, { color: t.muted }]}>Email</Text><Text style={[styles.infoValue, { color: t.ink }]} numberOfLines={1}>{link.tenant.email}</Text></Row>
                  <Row><Text style={[styles.infoLabel, { color: t.muted }]}>Due day</Text><Text style={[styles.infoValue, { color: t.ink }]}>{link.property.dueDay}</Text></Row>
                  <Row><Text style={[styles.infoLabel, { color: t.muted }]}>Next due</Text><Text style={[styles.infoValue, { color: t.ink }]}>{new Date(link.nextDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text></Row>
                  <Row>
                    <Text style={[styles.infoLabel, { color: t.muted }]}>Last paid</Text>
                    <Text style={[styles.infoValue, { color: t.ink }]}>
                      {link.lastPaymentAt ? new Date(link.lastPaymentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </Text>
                  </Row>
                </Stack>
              </Card>

              <View style={styles.actionRow}>
                <Button dark={dark} tone="soft" style={{ flex: 1 }}>Send reminder</Button>
                <Button dark={dark} tone="primary" style={{ flex: 1 }}>Message</Button>
              </View>

              <Text style={[styles.sectionLabel, { color: t.muted }]}>RECENT PAYMENTS</Text>
              <AsyncBoundary
                loading={payments.loading && !payments.data}
                error={payments.error}
                empty={payments.data && tenantPayments.length === 0}
                emptyMessage="No payments yet."
                onRetry={refreshAll}
                minHeight={120}
              >
                <Card dark={dark} padding={0}>
                  {tenantPayments.map((p, i, arr) => (
                    <View
                      key={p.id}
                      style={[styles.payRow, { borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: t.line2 }]}
                    >
                      <View
                        style={[
                          styles.payIcon,
                          { backgroundColor: p.status === 'COMPLETED' ? t.primarySoft : p.status === 'LATE' ? t.dangerSoft : t.chip },
                        ]}
                      >
                        <CheckIcon size={14} color={p.status === 'COMPLETED' ? t.primary : p.status === 'LATE' ? t.danger : t.muted} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.payMonth, { color: t.ink }]}>
                          {new Date(p.paidAt ?? p.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </Text>
                        <Text style={[styles.payDate, { color: t.muted }]}>
                          {new Date(p.paidAt ?? p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {p.method}
                        </Text>
                      </View>
                      <MonoText style={[styles.payAmount, { color: t.ink }]}>${Math.round(p.amount)}</MonoText>
                    </View>
                  ))}
                </Card>
              </AsyncBoundary>
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
  fieldLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  rentAmount: { fontSize: 30, fontWeight: '600' },
  divider: { height: 1, marginVertical: 14 },
  infoLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  infoValue: { fontSize: 13, fontFamily: 'Inter_500Medium', maxWidth: '60%', textAlign: 'right' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginTop: 14, marginBottom: 8 },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, paddingHorizontal: 14 },
  payIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  payMonth: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  payDate: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  payAmount: { fontSize: 13, fontWeight: '600' },
})
