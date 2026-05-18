import React, { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, Pressable,
} from 'react-native'
import { Link, router } from 'expo-router'
import { useColors } from '@/constants/tokens'
import { useStore } from '@/store'
import { login } from '@/lib/auth'
import { ApiError } from '@/lib/api'
import MakaLogo from '@/components/ui/MakaLogo'
import Button from '@/components/ui/Button'
import TextField from '@/components/ui/TextField'
import Stack from '@/components/ui/Stack'

export default function LoginScreen() {
  const dark = useStore((s) => s.dark)
  const setUser = useStore((s) => s.setUser)
  const t = useColors(dark)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [pending, setPending] = useState(false)

  async function onSubmit() {
    setErrors({})
    if (!email.trim() || !password) {
      setErrors({
        email: !email.trim() ? 'Required' : undefined,
        password: !password ? 'Required' : undefined,
      })
      return
    }
    setPending(true)
    try {
      const user = await login(email.trim().toLowerCase(), password)
      setUser(user)
      if (!user.onboardingComplete) router.replace('/onboarding')
      else router.replace(user.role === 'LANDLORD' ? '/(landlord)' : '/(tenant)')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) {
          setErrors({
            email: err.fieldErrors.email?.[0],
            password: err.fieldErrors.password?.[0],
            form: err.fieldErrors.email || err.fieldErrors.password ? undefined : err.message,
          })
        } else {
          setErrors({ form: err.message })
        }
      } else {
        setErrors({ form: 'Network error. Check your connection and try again.' })
      }
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
          <View style={styles.header}>
            <MakaLogo size={48} dark={dark} wordmark={false} />
            <Text style={[styles.h1, { color: t.ink }]}>Welcome back</Text>
            <Text style={[styles.sub, { color: t.muted }]}>Sign in to your Maka wallet.</Text>
          </View>

          {errors.form ? (
            <View style={[styles.banner, { backgroundColor: t.dangerSoft, borderColor: t.danger }]}>
              <Text style={[styles.bannerText, { color: t.danger }]}>{errors.form}</Text>
            </View>
          ) : null}

          <Stack gap={14}>
            <TextField
              label="Email"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              editable={!pending}
            />
            <TextField
              label="Password"
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              editable={!pending}
              onSubmitEditing={onSubmit}
              returnKeyType="go"
            />
            <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotWrap}>
              <Text style={[styles.forgot, { color: t.muted }]}>Forgot password?</Text>
            </Pressable>
          </Stack>

          <View style={{ marginTop: 22 }}>
            <Button dark={dark} onPress={onSubmit} disabled={pending}>
              {pending ? 'Signing in…' : 'Sign in'}
            </Button>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: t.muted }]}>No account? </Text>
            <Link href="/(auth)/signup" replace>
              <Text style={[styles.footerLink, { color: t.ink }]}>Create one</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingTop: 30, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 28, gap: 10 },
  h1: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.4, marginTop: 14 },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  banner: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 14 },
  bannerText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  forgotWrap: { alignSelf: 'flex-end' },
  forgot: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  footerLink: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
})
