import React, { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, Pressable,
} from 'react-native'
import { Link, router } from 'expo-router'
import { useColors } from '@/constants/tokens'
import { useStore } from '@/store'
import { signup, type Role } from '@/lib/auth'
import { ApiError } from '@/lib/api'
import MakaLogo from '@/components/ui/MakaLogo'
import Button from '@/components/ui/Button'
import TextField from '@/components/ui/TextField'
import Stack from '@/components/ui/Stack'
import Row from '@/components/ui/Row'

type Errors = Partial<Record<'name' | 'email' | 'password' | 'form', string>>

export default function SignupScreen() {
  const dark = useStore((s) => s.dark)
  const setUser = useStore((s) => s.setUser)
  const t = useColors(dark)

  const [role, setRole] = useState<Role>('TENANT')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)

  async function onSubmit() {
    setErrors({})
    const next: Errors = {}
    if (name.trim().length < 2) next.name = 'Name is too short'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email'
    if (password.length < 8) next.password = 'At least 8 characters'
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }
    setPending(true)
    try {
      const user = await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
      })
      setUser(user)
      router.replace('/onboarding')
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors) {
          setErrors({
            name: err.fieldErrors.name?.[0],
            email: err.fieldErrors.email?.[0],
            password: err.fieldErrors.password?.[0],
            form: err.fieldErrors.name || err.fieldErrors.email || err.fieldErrors.password
              ? undefined
              : err.message,
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
            <Text style={[styles.h1, { color: t.ink }]}>Create your account</Text>
            <Text style={[styles.sub, { color: t.muted }]}>
              {role === 'TENANT' ? 'Pay rent. Earn. Grow.' : 'Rent, simplified.'}
            </Text>
          </View>

          {errors.form ? (
            <View style={[styles.banner, { backgroundColor: t.dangerSoft, borderColor: t.danger }]}>
              <Text style={[styles.bannerText, { color: t.danger }]}>{errors.form}</Text>
            </View>
          ) : null}

          <Row gap={8} style={{ marginBottom: 16 }}>
            <RoleTab dark={dark} active={role === 'TENANT'} onPress={() => setRole('TENANT')}>
              I'm a tenant
            </RoleTab>
            <RoleTab dark={dark} active={role === 'LANDLORD'} onPress={() => setRole('LANDLORD')}>
              I'm a landlord
            </RoleTab>
          </Row>

          <Stack gap={14}>
            <TextField
              label="Full name"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              placeholder="Martín Bastidas"
              value={name}
              onChangeText={setName}
              error={errors.name}
              editable={!pending}
            />
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
              autoComplete="password-new"
              textContentType="newPassword"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              editable={!pending}
            />
          </Stack>

          <Text style={[styles.legal, { color: t.muted, marginTop: 14 }]}>
            By continuing you accept the Terms and Privacy Policy.
          </Text>

          <View style={{ marginTop: 18 }}>
            <Button dark={dark} onPress={onSubmit} disabled={pending}>
              {pending ? 'Creating account…' : 'Create account'}
            </Button>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: t.muted }]}>Have an account? </Text>
            <Link href="/(auth)/login" replace>
              <Text style={[styles.footerLink, { color: t.ink }]}>Sign in</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function RoleTab({
  active, dark, onPress, children,
}: {
  active: boolean; dark: boolean; onPress: () => void; children: React.ReactNode
}) {
  const t = useColors(dark)
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tab,
        {
          backgroundColor: active ? t.ink : t.surface,
          borderColor: active ? t.ink : t.line,
        },
      ]}
    >
      <Text
        style={[
          styles.tabLabel,
          { color: active ? (dark ? t.bg : '#fff') : t.ink },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingTop: 30, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24, gap: 10 },
  h1: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.4, marginTop: 14 },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  banner: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 14 },
  bannerText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  tab: {
    flex: 1, height: 44, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  tabLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  legal: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  footerLink: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
})
