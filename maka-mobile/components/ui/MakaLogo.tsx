import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Rect } from 'react-native-svg'
import { useColors } from '@/constants/tokens'

interface MakaLogoProps {
  size?: number
  dark?: boolean
  wordmark?: boolean
  color?: string
  accent?: string
}

export default function MakaLogo({ size = 28, dark = false, wordmark = true, color, accent }: MakaLogoProps) {
  const t = useColors(dark)
  const c = color || t.ink
  const a = accent || t.primary

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Rect x={1} y={1} width={30} height={30} rx={9} fill={c} />
        <Rect x={8} y={18} width={4} height={6} rx={1.2} fill={a} />
        <Rect x={14} y={13} width={4} height={11} rx={1.2} fill={a} />
        <Rect x={20} y={8} width={4} height={16} rx={1.2} fill={a} />
      </Svg>
      {wordmark && (
        <Text style={[styles.wordmark, { fontSize: size * 0.72, color: c }]}>
          maka
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordmark: {
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.3,
  },
})
