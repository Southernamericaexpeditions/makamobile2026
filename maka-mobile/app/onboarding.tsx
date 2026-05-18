import React, { useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native'
import { router } from 'expo-router'
import { useColors } from '@/constants/tokens'
import { useStore } from '@/store'
import { apiFetch, ApiError } from '@/lib/api'
import MakaLogo from '@/components/ui/MakaLogo'
import Button from '@/components/ui/Button'
import Row from '@/components/ui/Row'
import Stack from '@/components/ui/Stack'
import TextField from '@/components/ui/TextField'
import { CheckIcon, ChevronLeftIcon } from '@/components/Icons'

const STEPS = ['welcome', 'lease', 'done'] as const
type Step = typeof STEPS[number]

type TenantForm = {
  address: string
  landlordEmail: string
  rent: string
  dueDay: string
}

type LandlordForm = {
  propAddress: string
  propUnit: string
  propRent: string
  propDueDay: string
  tenantEmail: string
}

export default function Onboarding() {
  const dark = useStore((s) => s.dark)
  const user = useStore((s) => s.user)
  const refreshMe = useStore((s) => s.refreshMe)
  const t = useColors(dark)

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tenantForm, setTenantForm] = useState<TenantForm>({
    address: '',
    landlordEmail: '',
    rent: '',
    dueDay: '1',
  })
  const [landlordForm, setLandlordForm] = useState<LandlordForm>({
    propAddress: '',
    propUnit: '',
    propRent: '',
    propDueDay: '1',
    tenantEmail: '',
  })

  const currentStep: Step = STEPS[step]
  const role = user?.role ?? 'TENANT'
  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1))
  const back = () => step > 0 && setStep((s) => s - 1)

  async function submitLease() {
    setError(null)
    setSubmitting(true)
    try {
      const body: Record<string, string | undefined> =
        role === 'TENANT'
          ? {
              name: user?.name ?? undefined,
              address: tenantForm.address.trim() || undefined,
              landlordEmail: tenantForm.landlordEmail.trim().toLowerCase() || undefined,
              rent: tenantForm.rent.trim() || undefined,
              dueDay: tenantForm.dueDay.trim() || '1',
            }
          : {
              name: user?.name ?? undefined,
              propAddress: landlordForm.propAddress.trim() || undefined,
              propUnit: landlordForm.propUnit.trim() || undefined,
              propRent: landlordForm.propRent.trim() || undefined,
              propDueDay: landlordForm.propDueDay.trim() || '1',
              tenantEmail: landlordForm.tenantEmail.trim().toLowerCase() || undefined,
            }
      await apiFetch('/api/onboarding/complete', { method: 'POST', json: body })
      await refreshMe()
      next()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function skipLease() {
    setSubmitting(true)
    try {
      await apiFetch('/api/onboarding/complete', {
        method: 'POST',
        json: { name: user?.name ?? undefined },
      })
      await refreshMe()
      next()
    } catch {
      // Still proceed visually — user can complete from profile later.
      next()
    } finally {
      setSubmitting(false)
    }
  }

  function finish() {
    router.replace(role === 'LANDLORD' ? '/(landlord)' : '/(tenant)')
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={back}
            style={[styles.iconBtn, { borderColor: t.line, backgroundColor: t.surface, opacity: step > 0 ? 1 : 0 }]}
          >
            <ChevronLeftIcon size={16} color={t.ink} />
          </Pressable>
          <MakaLogo size={22} dark={dark} />
          <Text style={[styles.stepNum, { color: t.muted, fontFamily: 'JetBrainsMono_500Medium' }]}>
            {step + 1}/{STEPS.length}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressRow}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.progressSeg, { backgroundColor: i <= step ? t.ink : t.line }]} />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View style={[styles.banner, { backgroundColor: t.dangerSoft, borderColor: t.danger }]}>
              <Text style={[styles.bannerText, { color: t.danger }]}>{error}</Text>
            </View>
          ) : null}

          {currentStep === 'welcome' && (
            <WelcomeStep dark={dark} t={t} role={role} next={next} />
          )}

          {currentStep === 'lease' && role === 'TENANT' && (
            <TenantLeaseStep
              dark={dark}
              t={t}
              form={tenantForm}
              setForm={setTenantForm}
              submitting={submitting}
              onSubmit={submitLease}
              onSkip={skipLease}
            />
          )}

          {currentStep === 'lease' && role === 'LANDLORD' && (
            <LandlordPropertyStep
              dark={dark}
              t={t}
              form={landlordForm}
              setForm={setLandlordForm}
              submitting={submitting}
              onSubmit={submitLease}
              onSkip={skipLease}
            />
          )}

          {currentStep === 'done' && <DoneStep dark={dark} t={t} role={role} finish={finish} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function WelcomeStep({ dark, t, role, next }: any) {
  const features =
    role === 'TENANT'
      ? [
          ['Build credit', 'Every on-time payment counts'],
          ['Earn tokens', 'Redeem with the Maka Card'],
          ['Split rent', 'Share with roommates, no math'],
        ]
      : [
          ['Reliable payouts', 'On the 3rd, every month'],
          ['Clear dashboards', "See who's paid at a glance"],
          ['Lower late rate', 'Tenants get nudged automatically'],
        ]

  return (
    <View style={styles.stepContent}>
      <MakaLogo size={64} dark={dark} wordmark={false} />
      <Text style={[styles.h1, { color: t.ink, marginTop: 12 }]}>
        {role === 'TENANT' ? 'Pay rent. Earn. Grow.' : 'Rent, simplified.'}
      </Text>
      <Text style={[styles.body, { color: t.muted, marginTop: 8 }]}>
        {role === 'TENANT'
          ? 'Every on-time payment builds your credit and earns Maka Tokens you can spend at partner stores.'
          : 'Collect rent on time, track every unit, and get paid into your bank — automatically.'}
      </Text>
      <Stack gap={8} style={{ marginTop: 24 }}>
        {features.map(([title, sub]) => (
          <Row key={title} style={[styles.featureRow, { backgroundColor: t.surface, borderColor: t.line }]}>
            <View style={[styles.featureIcon, { backgroundColor: t.primarySoft }]}>
              <CheckIcon size={14} color={t.primaryInk} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.featureTitle, { color: t.ink }]}>{title}</Text>
              <Text style={[styles.featureSub, { color: t.muted }]}>{sub}</Text>
            </View>
          </Row>
        ))}
      </Stack>
      <View style={{ marginTop: 24 }}>
        <Button dark={dark} onPress={next}>Get started</Button>
      </View>
    </View>
  )
}

function TenantLeaseStep({ dark, t, form, setForm, submitting, onSubmit, onSkip }: any) {
  return (
    <View style={styles.stepContent}>
      <Text style={[styles.h2, { color: t.ink }]}>Link your lease</Text>
      <Text style={[styles.body, { color: t.muted, marginTop: 4 }]}>
        Tell us about your rental. Your landlord gets invited automatically.
      </Text>
      <Stack gap={12} style={{ marginTop: 20 }}>
        <TextField
          label="Address"
          placeholder="Av. Amazonas 3424, Apt 7B"
          value={form.address}
          onChangeText={(v: string) => setForm({ ...form, address: v })}
          autoCapitalize="words"
        />
        <TextField
          label="Landlord email"
          placeholder="carla@example.com"
          keyboardType="email-address"
          value={form.landlordEmail}
          onChangeText={(v: string) => setForm({ ...form, landlordEmail: v })}
        />
        <TextField
          label="Monthly rent (USD)"
          placeholder="820"
          keyboardType="decimal-pad"
          value={form.rent}
          onChangeText={(v: string) => setForm({ ...form, rent: v })}
        />
        <TextField
          label="Due day"
          placeholder="1"
          keyboardType="number-pad"
          value={form.dueDay}
          onChangeText={(v: string) => setForm({ ...form, dueDay: v })}
        />
      </Stack>
      <View style={{ marginTop: 20 }}>
        <Button dark={dark} onPress={onSubmit} disabled={submitting}>
          {submitting ? 'Saving…' : 'Link lease'}
        </Button>
      </View>
      <Pressable onPress={onSkip} disabled={submitting} style={{ marginTop: 14, alignItems: 'center' }}>
        <Text style={[styles.skip, { color: t.muted }]}>Skip for now</Text>
      </Pressable>
    </View>
  )
}

function LandlordPropertyStep({ dark, t, form, setForm, submitting, onSubmit, onSkip }: any) {
  return (
    <View style={styles.stepContent}>
      <Text style={[styles.h2, { color: t.ink }]}>Add your first property</Text>
      <Text style={[styles.body, { color: t.muted, marginTop: 4 }]}>You can add more later.</Text>
      <Stack gap={12} style={{ marginTop: 20 }}>
        <TextField
          label="Address"
          placeholder="Av. Amazonas 3424"
          value={form.propAddress}
          onChangeText={(v: string) => setForm({ ...form, propAddress: v })}
          autoCapitalize="words"
        />
        <TextField
          label="Unit (optional)"
          placeholder="Apt 7B"
          value={form.propUnit}
          onChangeText={(v: string) => setForm({ ...form, propUnit: v })}
          autoCapitalize="words"
        />
        <TextField
          label="Monthly rent (USD)"
          placeholder="820"
          keyboardType="decimal-pad"
          value={form.propRent}
          onChangeText={(v: string) => setForm({ ...form, propRent: v })}
        />
        <TextField
          label="Due day"
          placeholder="1"
          keyboardType="number-pad"
          value={form.propDueDay}
          onChangeText={(v: string) => setForm({ ...form, propDueDay: v })}
        />
        <TextField
          label="Invite tenant by email (optional)"
          placeholder="tenant@example.com"
          keyboardType="email-address"
          value={form.tenantEmail}
          onChangeText={(v: string) => setForm({ ...form, tenantEmail: v })}
        />
      </Stack>
      <View style={{ marginTop: 20 }}>
        <Button dark={dark} onPress={onSubmit} disabled={submitting}>
          {submitting ? 'Saving…' : 'Add property'}
        </Button>
      </View>
      <Pressable onPress={onSkip} disabled={submitting} style={{ marginTop: 14, alignItems: 'center' }}>
        <Text style={[styles.skip, { color: t.muted }]}>Skip for now</Text>
      </Pressable>
    </View>
  )
}

function DoneStep({ dark, t, role, finish }: any) {
  return (
    <View style={[styles.stepContent, styles.center]}>
      <View style={[styles.successCircle, { backgroundColor: t.primarySoft, shadowColor: t.primary }]}>
        <CheckIcon size={36} color={t.primary} />
      </View>
      <Text style={[styles.h2, { color: t.ink, marginTop: 20 }]}>You're all set</Text>
      <Text style={[styles.body, { color: t.muted, marginTop: 8, textAlign: 'center', maxWidth: 260 }]}>
        {role === 'TENANT'
          ? 'Your wallet is ready. Pay your first rent to earn tokens.'
          : 'Your first property is live.'}
      </Text>
      <View style={{ marginTop: 40, width: '100%' }}>
        <Button dark={dark} onPress={finish}>Enter Maka</Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 12,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { fontSize: 11 },
  progressRow: { flexDirection: 'row', gap: 4, paddingHorizontal: 18, paddingBottom: 12 },
  progressSeg: { flex: 1, height: 3, borderRadius: 2 },
  scrollContent: { paddingHorizontal: 18, paddingBottom: 40 },
  stepContent: { paddingTop: 16 },
  center: { alignItems: 'center' },
  h1: { fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.4, lineHeight: 34 },
  h2: { fontSize: 22, fontFamily: 'Inter_700Bold', letterSpacing: -0.3, lineHeight: 28 },
  body: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  skip: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  banner: { padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 8, marginBottom: 8 },
  bannerText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, borderWidth: 1, padding: 10,
  },
  featureIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  featureSub: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  successCircle: {
    width: 84, height: 84, borderRadius: 42,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
})
