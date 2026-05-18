import { Redirect } from 'expo-router'
import { useStore } from '@/store'

export default function Index() {
  const user = useStore((s) => s.user)

  if (!user) return <Redirect href="/(auth)/login" />
  if (!user.onboardingComplete) return <Redirect href="/onboarding" />
  if (user.role === 'LANDLORD') return <Redirect href="/(landlord)" />
  return <Redirect href="/(tenant)" />
}
