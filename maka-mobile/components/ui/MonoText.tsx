import React from 'react'
import { Text, TextProps } from 'react-native'

interface MonoTextProps extends TextProps {
  children: React.ReactNode
}

export default function MonoText({ children, style, ...props }: MonoTextProps) {
  return (
    <Text style={[{ fontFamily: 'JetBrainsMono_500Medium', letterSpacing: -0.2 }, style]} {...props}>
      {children}
    </Text>
  )
}
