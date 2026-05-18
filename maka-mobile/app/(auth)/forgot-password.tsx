import React, { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, Pressable,
} from 'react-native'
import { router } from 'expo-router'
import { useColors } from '@/constants/tokens'
import { useStore } from '@/store'
import { forgotPassword } from '@/lib/auth'
import { ApiError } from '@/lib/api'
import MakaLogo from '@/components/ui/MakaLogo'
import Button from '@/components/ui/Button'
import TextField from '@/components/ui/TextField'
import { ChevronLeftIcon, CheckIcon } from '@/components/Icons'

export default function ForgotPasswordScreen() {
  const dark = useStore((s) => s.dark)
  const t = useColors(dark)

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit() {
    setError(null)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email')
      return
    }
    setPending(true)
    try {
      await forgotPassword(email.trim().toLowerCase())
      setSent(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Network error. Try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.back()}
              style={[styles.iconBtn, { borderColor: t.line, backgroundColor: t.surface }]}
            >
              <ChevronLeftIcon size={16} color={t.ink} />
            </Pressable>
            <MakaLogo size={22} dark={dark} />
            <View style={{ width: 36 }} />
          </View>

          {sent ? (
            <View style={styles.successWrap}>
              <View style={[styles.successCircle, { backgroundColor: t.primarySoft }]}>
                <CheckIcon size={36} color={t.primary} />
              </View>
              <Text style={[styles.h1, { color: t.ink, marginTop: 18 }]}>Check your email</Text>
              <Text style={[styles.sub, { color: t.muted, textAlign: 'center', marginTop: 8 }]}>
                If an account exists for {email}, we sent a link to reset your password. The link
                expires in 1 hour.
              </Text>
              <View style={{ marginTop: 30, width: '100%' }}>
                <Button dark={dark} onPress={() => router.replace('/(auth)/login')}>
                  Back to sign in
                </Button>
              </View>
            </View>
          ) : (
            <>
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.h1, { color: t.ink }]}>Reset your password</Text>
                <Text style={[styles.sub, { color: t.muted, marginTop: 6 }]}>
                  Enter the email on your Maka account.
                </Text>
              </View>

              {error ? (
                <View style={[styles.banner, { backgroundColor: t.dangerSoft, borderColor: t.danger }]}>
                  <Text style={[styles.bannerText, { color: t.danger }]}>{error}</Text>
                </View>
              ) : null}

              <View style={{ marginTop: 18 }}>
                <TextField
                  label="Email"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  editable={!pending}
                  onSubmitEditing={onSubmit}
                  returnKeyType="send"
                />
              </View>

              <View style={{ marginTop: 18 }}>
                <Button dark={dark} onPress={onSubmit} disabled={pending}>
                  {pending ? 'Sending…' : 'Send reset link'}
                </Button>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 40 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, marginBottom: 24,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  h1: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.4 },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  banner: { padding: 12, borderRadius: 12, borderWidth: 1, marginTop: 14 },
  bannerText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  successWrap: { alignItems: 'center', paddingTop: 60 },
  successCircle: {
    width: 84, height: 84, borderRadius: 42,
    alignItems: 'center', justifyContent: 'center',
  },
})
