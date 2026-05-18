// Storage wrapper that prefers expo-secure-store (encrypted, native keychain)
// and falls back to AsyncStorage when SecureStore is unavailable —
// e.g. in older Expo Go builds, on web, or any environment where the native
// module didn't get linked.
//
// Tokens stored via the fallback are NOT encrypted at rest. That's acceptable
// for development in Expo Go; production / dev-client builds get the real
// SecureStore path automatically.

import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'

let secureAvailable: boolean | null = null

async function checkSecure(): Promise<boolean> {
  if (secureAvailable !== null) return secureAvailable
  try {
    // Probe the native module. A passing read (even returning null) means
    // the bridge is wired up.
    await SecureStore.getItemAsync('__maka_probe__')
    secureAvailable = true
  } catch {
    secureAvailable = false
  }
  return secureAvailable
}

export async function getItem(key: string): Promise<string | null> {
  if (await checkSecure()) {
    try {
      return await SecureStore.getItemAsync(key)
    } catch {
      secureAvailable = false
    }
  }
  return AsyncStorage.getItem(key)
}

export async function setItem(key: string, value: string): Promise<void> {
  if (await checkSecure()) {
    try {
      await SecureStore.setItemAsync(key, value)
      return
    } catch {
      secureAvailable = false
    }
  }
  await AsyncStorage.setItem(key, value)
}

export async function removeItem(key: string): Promise<void> {
  if (await checkSecure()) {
    try {
      await SecureStore.deleteItemAsync(key)
      return
    } catch {
      secureAvailable = false
    }
  }
  await AsyncStorage.removeItem(key)
}
