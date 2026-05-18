import React, { forwardRef } from 'react'
import { TextInput, type TextInputProps, View, Text, StyleSheet } from 'react-native'
import { useColors } from '@/constants/tokens'
import { useStore } from '@/store'

type Props = TextInputProps & {
  label?: string
  error?: string | null
  hint?: string
}

const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, hint, style, ...rest },
  ref,
) {
  const dark = useStore((s) => s.dark)
  const t = useColors(dark)

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text style={[styles.label, { color: t.muted }]}>{label.toUpperCase()}</Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={t.muted2}
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
        style={[
          styles.input,
          {
            backgroundColor: t.surface,
            borderColor: error ? t.danger : t.line,
            color: t.ink,
          },
          style as object | undefined,
        ]}
      />
      {error ? (
        <Text style={[styles.err, { color: t.danger }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: t.muted }]}>{hint}</Text>
      ) : null}
    </View>
  )
})

export default TextField

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  label: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  err: {
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'Inter_500Medium',
  },
  hint: {
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'Inter_400Regular',
  },
})
