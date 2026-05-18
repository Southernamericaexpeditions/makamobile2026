import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter'
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
} from '@expo-google-fonts/jetbrains-mono'
import { useStore } from '@/store'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const dark = useStore((s) => s.dark)
  const hydrated = useStore((s) => s.hydrated)
  const hydrate = useStore((s) => s.hydrate)

  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  })

  useEffect(() => {
    hydrate()
  }, [hydrate])

  useEffect(() => {
    if (loaded && hydrated) SplashScreen.hideAsync()
  }, [loaded, hydrated])

  if (!loaded || !hydrated) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tenant)" />
          <Stack.Screen name="(landlord)" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
