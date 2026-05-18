import { create } from 'zustand'
import * as Storage from '@/lib/storage'
import { clearToken, getToken } from '@/lib/api'
import { fetchMe, type AuthUser, type MeResponse } from '@/lib/auth'

const DARK_KEY = 'maka.ui.dark'

interface MakaStore {
  // UI
  dark: boolean
  toggleDark: () => void

  // Auth / session
  hydrated: boolean
  user: MeResponse | null

  hydrate: () => Promise<void>
  setUser: (user: AuthUser | MeResponse) => void
  refreshMe: () => Promise<void>
  signOut: () => Promise<void>
}

export const useStore = create<MakaStore>((set, get) => ({
  dark: false,
  toggleDark: () => {
    set((s) => {
      const next = !s.dark
      Storage.setItem(DARK_KEY, next ? '1' : '0').catch(() => {})
      return { dark: next }
    })
  },

  hydrated: false,
  user: null,

  hydrate: async () => {
    const [darkStored, token] = await Promise.all([
      Storage.getItem(DARK_KEY).catch(() => null),
      getToken(),
    ])

    if (!token) {
      set({ dark: darkStored === '1', user: null, hydrated: true })
      return
    }

    try {
      const me = await fetchMe()
      set({ dark: darkStored === '1', user: me, hydrated: true })
    } catch {
      await clearToken()
      set({ dark: darkStored === '1', user: null, hydrated: true })
    }
  },

  setUser: (user) => {
    // Coerce AuthUser → MeResponse-compatible shape (extra fields default to null/false).
    const full: MeResponse =
      'stripeOnboardingComplete' in user
        ? (user as MeResponse)
        : {
            ...(user as AuthUser),
            stripeOnboardingComplete: false,
            paypalEmail: null,
            bankName: null,
            bankAccountHolder: null,
            bankAccountNumber: null,
            bankEmail: null,
          }
    set({ user: full })
    // Fetch the full record in the background so settings/profile screens see all fields.
    get().refreshMe().catch(() => {})
  },

  refreshMe: async () => {
    try {
      const me = await fetchMe()
      set({ user: me })
    } catch {
      // Leave existing user in place; the next gated screen will handle 401s.
    }
  },

  signOut: async () => {
    await clearToken()
    set({ user: null })
  },
}))

// Convenience selectors
export const useRole = () => useStore((s) => s.user?.role ?? null)
export const useIsAuthed = () => useStore((s) => !!s.user)
export const useIsOnboarded = () => useStore((s) => s.user?.onboardingComplete ?? false)
