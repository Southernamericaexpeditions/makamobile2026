import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Tabs } from 'expo-router'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useColors, shadow } from '@/constants/tokens'
import { useStore } from '@/store'
import { HomeIcon, UserIcon, BankIcon, TrendIcon, SettingsIcon } from '@/components/Icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function LandlordTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { dark } = useStore()
  const t = useColors(dark)
  const insets = useSafeAreaInsets()

  const tabs = [
    { key: 'index', label: 'Portfolio', Icon: HomeIcon },
    { key: 'tenants', label: 'Tenants', Icon: UserIcon },
    { key: 'payouts', label: 'Payouts', Icon: BankIcon },
    { key: 'reports', label: 'Reports', Icon: TrendIcon },
    { key: 'profile', label: 'You', Icon: SettingsIcon },
  ]

  return (
    <View style={[styles.barWrap, { bottom: insets.bottom + 12 }]}>
      <View style={[styles.bar, { backgroundColor: t.surface, borderColor: t.line, ...shadow.float }]}>
        {state.routes.map((route, i) => {
          const tab = tabs.find((t) => t.key === route.name) || tabs[0]
          const focused = state.index === i
          const color = focused ? t.ink : t.muted

          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tabItem}
            >
              <tab.Icon size={20} color={color} />
              <Text style={[styles.tabLabel, { color, fontFamily: focused ? 'Inter_600SemiBold' : 'Inter_500Medium' }]}>
                {tab.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export default function LandlordLayout() {
  const { dark } = useStore()
  const t = useColors(dark)

  return (
    <View style={[{ flex: 1 }, { backgroundColor: t.bg }]}>
      <Tabs
        tabBar={(props) => <LandlordTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="tenants" />
        <Tabs.Screen name="payouts" />
        <Tabs.Screen name="reports" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="tenant-detail" options={{ href: null }} />
      </Tabs>
    </View>
  )
}

const styles = StyleSheet.create({
  barWrap: { position: 'absolute', left: 12, right: 12 },
  bar: { borderRadius: 22, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 6, flexDirection: 'row' },
  tabItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 6 },
  tabLabel: { fontSize: 10.5 },
})
