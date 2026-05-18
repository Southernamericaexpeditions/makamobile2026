import React, { useState } from 'react'
import {
  View, Text, StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, Pressable,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useColors } from '@/constants/tokens'
import { useStore } from '@/store'
import { resetPassword } from '@/lib/auth'
import { ApiError } from '@/lib/api'
import MakaLogo from '@/components/ui/MakaLogo'
import Button from '@/components/ui/Button'
import TextField from '@/components/ui/TextField'
import Stack from '@/components/ui/Stack'
import { ChevronLeftIcon, CheckIcon } from '@/components/Icons'

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string }>()
  const dark = useStore((s) => s.dark)
  const t = useColors(dark)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  const token = (params.token as string | undefined)?.trim() ?? ''

  async function onSubmit() {
    setError(null)
    if (!token) {
      setError('Missing reset token. Open the link from your email again.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setPending(true)
    try {
      await resetPassword(token, password)
      setDone(true)
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
              onPress={() => router.replace('/(auth)/login')}
              style={[styles.iconBtn, { borderColor: t.line, backgroundColor: t.surface }]}
            >
              <ChevronLeftIcon size={16} color={t.ink} />
            </Pressable>
            <MakaLogo size={22} dark={dark} />
            <View style={{ width: 36 }} />
          </View>

          {done ? (
            <View style={styles.successWrap}>
              <View style={[styles.successCircle, { backgroundColor: t.primarySoft }]}>
                <CheckIcon size={36} color={t.primary} />
              </View>
              <Text style={[styles.h1, { color: t.ink, marginTop: 18 }]}>Password updated</Text>
              <Text style={[styles.sub, { color: t.muted, textAlign: 'center', marginTop: 8 }]}>
                You can now sign in with your new password.
              </Text>
              <View style={{ marginTop: 30, width: '100%' }}>
                <Button dark={dark} onPress={() => router.replace('/(auth)/login')}>
                  Sign in
                </Button>
              </View>
            </View>
          ) : (
            <>
              <Text style={[styles.h1, { color: t.ink }]}>Set a new password</Text>
              <Text style={[styles.sub, { color: t.muted, marginTop: 6 }]}>
                Choose something at least 8 characters long.
              </Text>

              {error ? (
                <View style={[styles.banner, { backgroundColor: t.dangerSoft, borderColor: t.danger }]}>
                  <Text style={[styles.bannerText, { color: t.danger }]}>{error}</Text>
                </View>
              ) : null}

              <Stack gap={14} style={{ marginTop: 18 }}>
                <TextField
                  label="New password"
                  secureTextEntry
                  textContentType="newPassword"
                  placeholder="At least 8 characters"
                  value={password}
                  onChangeText={setPassword}
                  editable={!pending}
                />
                <TextField
                  label="Confirm password"
                  secureTextEntry
                  textContentType="newPassword"
                  placeholder="Re-enter password"
                  value={confirm}
                  onChangeText={setConfirm}
                  editable={!pending}
                  onSubmitEditing={onSubmit}
                  returnKeyType="go"
                />
              </Stack>

              <View style={{ marginTop: 18 }}>
                <Button dark={dark} onPress={onSubmit} disabled={pending}>
                  {pending ? 'Updating…' : 'Update password'}
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
