import React from 'react'
import { View, StyleSheet } from 'react-native'

interface RowProps {
  children: React.ReactNode
  justify?: 'space-between' | 'flex-start' | 'flex-end' | 'center'
  align?: 'center' | 'flex-start' | 'flex-end'
  gap?: number
  style?: object
}

export default function Row({ children, justify = 'space-between', align = 'center', gap = 8, style }: RowProps) {
  return (
    <View style={[{ flexDirection: 'row', justifyContent: justify, alignItems: align, gap }, style]}>
      {children}
    </View>
  )
}
