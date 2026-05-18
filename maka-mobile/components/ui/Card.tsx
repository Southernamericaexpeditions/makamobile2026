import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { useColors, shadow } from '@/constants/tokens'

interface CardProps {
  children: React.ReactNode
  dark?: boolean
  padding?: number
  style?: object
  onPress?: () => void
}

export default function Card({ children, dark = false, padding = 16, style, onPress }: CardProps) {
  const t = useColors(dark)

  const content = (
    <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.line, padding }, style]}>
      {children}
    </View>
  )

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
        {content}
      </Pressable>
    )
  }
  return content
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    ...shadow.card,
  },
})
