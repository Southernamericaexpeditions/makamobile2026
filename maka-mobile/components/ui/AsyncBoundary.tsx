import React from 'react'
import { View, Text, ActivityIndicator, StyleSheet, Pressable } from 'react-native'
import { useColors } from '@/constants/tokens'
import { useStore } from '@/store'

type Props = {
  loading: boolean
  error: string | null
  empty?: boolean | null
  emptyMessage?: string
  onRetry?: () => void
  children: React.ReactNode
  minHeight?: number
}

export default function AsyncBoundary({
  loading, error, empty, emptyMessage, onRetry, children, minHeight = 120,
}: Props) {
  const dark = useStore((s) => s.dark)
  const t = useColors(dark)

  if (loading) {
    return (
      <View style={[styles.center, { minHeight }]}>
        <ActivityIndicator color={t.primary} />
      </View>
    )
  }
  if (error) {
    return (
      <View style={[styles.center, { minHeight }]}>
        <Text style={[styles.errorText, { color: t.danger }]}>{error}</Text>
        {onRetry ? (
          <Pressable onPress={onRetry} style={[styles.retry, { backgroundColor: t.chip }]}>
            <Text style={[styles.retryText, { color: t.ink }]}>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    )
  }
  if (empty) {
    return (
      <View style={[styles.center, { minHeight }]}>
        <Text style={[styles.emptyText, { color: t.muted }]}>{emptyMessage ?? 'Nothing here yet.'}</Text>
      </View>
    )
  }
  return <>{children}</>
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  errorText: { fontSize: 13, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  emptyText: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  retry: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  retryText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
})
