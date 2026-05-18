import React from 'react'
import { Pressable, Text, StyleSheet } from 'react-native'
import { useColors } from '@/constants/tokens'

type Tone = 'primary' | 'accent' | 'soft'
type Size = 'lg' | 'md' | 'sm'

interface ButtonProps {
  children: React.ReactNode
  tone?: Tone
  dark?: boolean
  onPress?: () => void
  full?: boolean
  size?: Size
  style?: object
  disabled?: boolean
}

export default function Button({ children, tone = 'primary', dark = false, onPress, full = true, size = 'lg', style, disabled }: ButtonProps) {
  const t = useColors(dark)

  const bg =
    tone === 'primary' ? t.ink
    : tone === 'accent' ? t.primary
    : t.chip

  const fg =
    tone === 'primary' ? (dark ? t.bg : '#fff')
    : tone === 'accent' ? '#fff'
    : t.ink

  const heights = { lg: 52, md: 44, sm: 36 }
  const fontSizes = { lg: 15, md: 14, sm: 13 }
  const h = heights[size]
  const fs = fontSizes[size]

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          height: h,
          width: full ? '100%' : undefined,
          opacity: pressed || disabled ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: fg, fontSize: fs }]}>{children}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.1,
  },
})
