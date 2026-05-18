import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useColors } from '@/constants/tokens'

type Tone = 'neutral' | 'primary' | 'accent' | 'danger'

interface PillProps {
  children: React.ReactNode
  tone?: Tone
  dark?: boolean
  style?: object
}

export default function Pill({ children, tone = 'neutral', dark = false, style }: PillProps) {
  const t = useColors(dark)

  const tones = {
    neutral: { bg: t.chip, fg: t.ink2 },
    primary: { bg: t.primarySoft, fg: t.primaryInk },
    accent: { bg: 'rgba(182,225,75,0.22)', fg: dark ? '#D9EF9A' : '#3C4E0F' },
    danger: { bg: t.dangerSoft, fg: t.danger },
  }
  const s = tones[tone]

  return (
    <View style={[styles.pill, { backgroundColor: s.bg }, style]}>
      <Text style={[styles.text, { color: s.fg }]}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  pill: {
    height: 22,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.2,
  },
})
