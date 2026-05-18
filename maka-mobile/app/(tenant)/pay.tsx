import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '@/constants/tokens'
import { useStore } from '@/store'
import { useApi } from '@/lib/useApi'
import { queries } from '@/lib/queries'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Pill from '@/components/ui/Pill'
import Row from '@/components/ui/Row'
import Stack from '@/components/ui/Stack'
import MonoText from '@/components/ui/MonoText'
import AsyncBoundary from '@/components/ui/AsyncBoundary'
import {
  ChevronLeftIcon, CoinIcon, PhoneIcon, CardIcon, BankIcon, LockIcon, BigCheckIcon,
} from '@/components/Icons'
import type { PaymentMethod } from '@/lib/types'

type MethodOption = {
  id: PaymentMethod
  label: string
  detail: string
  Icon: typeof CardIcon
}

const METHODS: MethodOption[] = [
  { id: 'PAYPHONE', label: 'PayPhone', detail: 'Pay with your Ecuadorian mobile money', Icon: PhoneIcon },
  { id: 'CARD', label: 'Credit / debit card', detail: 'Stripe-powered, secure card payment', Icon: CardIcon },
  { id: 'PAYPAL', label: 'PayPal', detail: 'Pay from your PayPal balance or linked card', Icon: BankIcon },
]

export default function TenantPay() {
  const dark = useStore((s) => s.dark)
  const t = useColors(dark)
  const insets = useSafeAreaInsets()

  const dashboard = useApi(queries.tenantDashboard)
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState<number>(0)
  const [method, setMethod] = useState<PaymentMethod>('PAYPHONE')

  const property = dashboard.data?.properties[0] ?? null
  const rent = dashboard.data?.rent ?? null

  useEffect(() => {
    if (rent && amount === 0) setAmount(Math.round(rent.amount))
  }, [rent, amount])

  const tokensEarned = useMemo(() => Math.max(0, Math.round(amount / 16.4)), [amount])
  const selectedMethod = METHODS.find((m) => m.id === method)!

  const next = () => setStep((s) => Math.min(4, s + 1))
  const back = () => (step === 1 ? router.back() : setStep((s) => s - 1))

  return (
    <View style={[styles.root, { backgroundColor: t.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={back} style={[styles.backBtn, { borderColor: t.line, backgroundColor: t.surface }]}>
          <ChevronLeftIcon size={16} color={t.ink} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.stepLabel, { color: t.muted }]}>STEP {step} OF 4</Text>
          <Text style={[styles.screenTitle, { color: t.ink }]}>Pay rent</Text>
        </View>
        <Text style={[styles.stepFrac, { color: t.muted, fontFamily: 'JetBrainsMono_500Medium' }]}>{step}/4</Text>
      </View>

      <View style={styles.progress}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.progressSeg, { backgroundColor: i <= step ? t.ink : t.line }]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 40 }]} showsVerticalScrollIndicator={false}>
        <AsyncBoundary
          loading={dashboard.loading && !dashboard.data}
          error={dashboard.error}
          onRetry={dashboard.refresh}
          minHeight={400}
        >
          {!rent || !property ? (
            <View style={styles.px}>
              <Card dark={dark} padding={20}>
                <Text style={[styles.fieldLabel, { color: t.ink, fontSize: 14 }]}>No active lease</Text>
                <Text style={[{ fontSize: 12, fontFamily: 'Inter_400Regular', color: t.muted, marginTop: 6 }]}>
                  Link a lease in onboarding before paying rent.
                </Text>
                <View style={{ marginTop: 14 }}>
                  <Button dark={dark} onPress={() => router.replace('/(tenant)')}>Back to home</Button>
                </View>
              </Card>
            </View>
          ) : (
            <>
              {step === 1 && (
                <Stack gap={16} style={styles.px}>
                  <Card dark={dark} padding={20}>
                    <Text style={[styles.fieldLabel, { color: t.muted }]}>AMOUNT TO PAY</Text>
                    <Row align="flex-end" style={{ marginTop: 10 }}>
                      <Text style={[styles.dollarSign, { color: t.muted }]}>$</Text>
                      <MonoText style={[styles.bigAmount, { color: t.ink }]}>{amount}</MonoText>
                      <Text style={[styles.usd, { color: t.muted }]}>USD</Text>
                    </Row>
                    <Text style={[styles.addressSub, { color: t.muted }]}>
                      Monthly rent · {property.address}{property.unit ? ' · ' + property.unit : ''}
                    </Text>
                  </Card>

                  <View style={styles.toggleRow}>
                    <Pressable
                      onPress={() => setAmount(Math.round(rent.amount))}
                      style={[styles.toggleBtn, { borderColor: amount === Math.round(rent.amount) ? t.ink : t.line, backgroundColor: t.surface }]}
                    >
                      <Text style={[styles.toggleText, { color: t.ink }]}>Full ${Math.round(rent.amount)}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setAmount(Math.round(rent.amount / 2))}
                      style={[styles.toggleBtn, { borderColor: amount === Math.round(rent.amount / 2) ? t.ink : t.line, backgroundColor: t.surface }]}
                    >
                      <Text style={[styles.toggleText, { color: t.ink }]}>Half ${Math.round(rent.amount / 2)}</Text>
                    </Pressable>
                  </View>

                  <Card dark={dark} padding={14}>
                    <Row>
                      <Row gap={10} justify="flex-start" style={{ flex: 1 }}>
                        <View style={[styles.earnIcon, { backgroundColor: t.primarySoft }]}>
                          <CoinIcon size={16} color={t.primaryInk} />
                        </View>
                        <View>
                          <Text style={[styles.earnTitle, { color: t.ink }]}>You'll earn {tokensEarned} tokens</Text>
                          <Text style={[styles.earnSub, { color: t.muted }]}>On-time payment bonus</Text>
                        </View>
                      </Row>
                      <Pill tone="primary" dark={dark}>+credit</Pill>
                    </Row>
                  </Card>

                  <Button dark={dark} onPress={next}>Continue</Button>
                </Stack>
              )}

              {step === 2 && (
                <Stack gap={10} style={styles.px}>
                  <Text style={[styles.fieldLabel, { color: t.muted, marginBottom: 4 }]}>PAY WITH</Text>
                  {METHODS.map((m) => {
                    const selected = method === m.id
                    return (
                      <Pressable
                        key={m.id}
                        onPress={() => setMethod(m.id)}
                        style={[styles.methodRow, { borderColor: selected ? t.ink : t.line, backgroundColor: t.surface }]}
                      >
                        <View style={[styles.methodIcon, { backgroundColor: t.chip }]}>
                          <m.Icon size={18} color={t.ink} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.methodLabel, { color: t.ink }]}>{m.label}</Text>
                          <Text style={[styles.methodDetail, { color: t.muted }]}>{m.detail}</Text>
                        </View>
                        <View style={[styles.radio, { borderColor: selected ? t.ink : t.line }]}>
                          {selected ? <View style={[styles.radioFill, { backgroundColor: t.ink }]} /> : null}
                        </View>
                      </Pressable>
                    )
                  })}
                  <View style={{ height: 10 }} />
                  <Button dark={dark} onPress={next}>Review</Button>
                </Stack>
              )}

              {step === 3 && (
                <Stack gap={12} style={styles.px}>
                  <Card dark={dark} padding={18}>
                    <Text style={[styles.fieldLabel, { color: t.muted }]}>TOTAL</Text>
                    <Row align="flex-end" style={{ marginTop: 4 }}>
                      <Text style={[styles.dollarSign, { color: t.muted, fontSize: 18 }]}>$</Text>
                      <MonoText style={[styles.reviewAmount, { color: t.ink }]}>{amount}</MonoText>
                    </Row>
                    <View style={[styles.divider, { backgroundColor: t.line2 }]} />
                    <Stack gap={8}>
                      {[
                        { label: 'To', value: property.landlord?.name ?? property.landlord?.email ?? '—' },
                        { label: 'Property', value: property.address },
                        { label: 'Method', value: selectedMethod.label },
                        { label: 'Fee', value: '$0.00' },
                      ].map((row) => (
                        <Row key={row.label}>
                          <Text style={[styles.reviewLabel, { color: t.muted }]}>{row.label}</Text>
                          <MonoText style={[styles.reviewValue, { color: t.ink }]} numberOfLines={1}>
                            {row.value}
                          </MonoText>
                        </Row>
                      ))}
                      <Row>
                        <Text style={[styles.reviewLabel, { color: t.muted }]}>Tokens earned</Text>
                        <MonoText style={[styles.reviewValue, { color: t.primary }]}>+{tokensEarned}</MonoText>
                      </Row>
                    </Stack>
                  </Card>
                  <Row style={{ paddingHorizontal: 6 }} gap={6}>
                    <LockIcon size={14} color={t.muted} />
                    <Text style={[styles.security, { color: t.muted, flex: 1 }]}>
                      Payments are processed securely. By confirming you authorize Maka to charge {selectedMethod.label} for ${amount}.
                    </Text>
                  </Row>
                  <View style={{ height: 10 }} />
                  <Button dark={dark} onPress={next}>Confirm payment</Button>
                </Stack>
              )}

              {step === 4 && (
                <View style={styles.success}>
                  <View style={[styles.successRing, { backgroundColor: t.primarySoft, shadowColor: t.primary }]}>
                    <BigCheckIcon size={36} color={t.primary} />
                  </View>
                  <Text style={[styles.successTitle, { color: t.ink }]}>Payment sent</Text>
                  <Text style={[styles.successSub, { color: t.muted }]}>
                    ${amount} paid to {property.landlord?.name ?? property.landlord?.email ?? 'your landlord'} via {selectedMethod.label}.
                  </Text>
                  <Card dark={dark} padding={14} style={{ width: '100%', marginTop: 16 }}>
                    <Row>
                      <Text style={[styles.reviewLabel, { color: t.muted }]}>Tokens earned</Text>
                      <MonoText style={[{ fontSize: 16, fontWeight: '700', color: t.primary }]}>+{tokensEarned}</MonoText>
                    </Row>
                  </Card>
                  <View style={{ marginTop: 40, width: '100%' }}>
                    <Button dark={dark} onPress={() => router.replace('/(tenant)')}>Back to home</Button>
                  </View>
                  <Pressable onPress={() => router.push('/(tenant)/history')} style={{ marginTop: 14 }}>
                    <Text style={[styles.viewReceipt, { color: t.muted }]}>View receipt</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </AsyncBoundary>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },
  screenTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', letterSpacing: -0.2 },
  stepFrac: { fontSize: 11 },
  progress: { flexDirection: 'row', gap: 4, paddingHorizontal: 18, paddingBottom: 14 },
  progressSeg: { flex: 1, height: 3, borderRadius: 2 },
  scroll: { paddingTop: 4 },
  px: { paddingHorizontal: 16 },
  fieldLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },
  dollarSign: { fontSize: 20, marginBottom: 8 },
  bigAmount: { fontSize: 48, fontWeight: '600', letterSpacing: -1 },
  usd: { fontSize: 13, marginBottom: 10, marginLeft: 4 },
  addressSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 4 },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  toggleText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  earnIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  earnTitle: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  earnSub: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  methodIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  methodLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  methodDetail: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioFill: { width: 10, height: 10, borderRadius: 5 },
  reviewAmount: { fontSize: 40, fontWeight: '600' },
  divider: { height: 1, marginVertical: 14 },
  reviewLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  reviewValue: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  security: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 16 },
  success: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 16 },
  successRing: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  successTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', letterSpacing: -0.3, marginTop: 20 },
  successSub: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', maxWidth: 260, marginTop: 8 },
  viewReceipt: { fontSize: 12, fontFamily: 'Inter_400Regular' },
})
