import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '@/constants/tokens'

interface AppHeaderProps {
  dark?: boolean
  left?: React.ReactNode
  right?: React.ReactNode
  title?: string
  subtitle?: string
}

export default function AppHeader({ dark = false, left, right, title, subtitle }: AppHeaderProps) {
  const t = useColors(dark)
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
      <View style={styles.inner}>
        <View style={styles.left}>
          {left}
          {(title || subtitle) && (
            <View>
              {subtitle ? (
                <Text style={[styles.subtitle, { color: t.muted }]}>{subtitle.toUpperCase()}</Text>
              ) : null}
              {title ? (
                <Text style={[styles.title, { color: t.ink }]}>{title}</Text>
              ) : null}
            </View>
          )}
        </View>
        {right && <View>{right}</View>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.2,
  },
})
