import React from 'react'
import { View } from 'react-native'

interface StackProps {
  children: React.ReactNode
  gap?: number
  style?: object
}

export default function Stack({ children, gap = 8, style }: StackProps) {
  return (
    <View style={[{ flexDirection: 'column', gap }, style]}>
      {children}
    </View>
  )
}
