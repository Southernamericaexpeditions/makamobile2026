import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Tabs } from 'expo-router'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useColors, shadow } from '@/constants/tokens'
import { useStore } from '@/store'
import { HomeIcon, PayIcon, CoinIcon, TrendIcon, UserIcon } from '@/components/Icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function TenantTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { dark } = useStore()
  const t = useColors(dark)
  const insets = useSafeAreaInsets()

  const tabs = [
    { key: 'index', label: 'Home', Icon: HomeIcon },
    { key: 'pay', label: 'Pay', Icon: PayIcon },
    { key: 'rewards', label: 'Rewards', Icon: CoinIcon },
    { key: 'history', label: 'History', Icon: TrendIcon },
    { key: 'profile', label: 'You', Icon: UserIcon },
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

export default function TenantLayout() {
  const { dark } = useStore()
  const t = useColors(dark)

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <Tabs
        tabBar={(props) => <TenantTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="pay" />
        <Tabs.Screen name="rewards" />
        <Tabs.Screen name="history" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="split" options={{ href: null }} />
        <Tabs.Screen name="card" options={{ href: null }} />
      </Tabs>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  barWrap: {
    position: 'absolute',
    left: 12,
    right: 12,
  },
  bar: {
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
  },
  tabLabel: {
    fontSize: 10.5,
  },
})
