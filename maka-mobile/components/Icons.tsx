import React from 'react'
import Svg, { Path, Rect, Circle } from 'react-native-svg'

interface IconProps {
  size?: number
  color?: string
}

export const HomeIcon = ({ size = 20, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 11l9-7 9 7v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2v-9z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
  </Svg>
)

export const PayIcon = ({ size = 20, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={6} width={18} height={12} rx={2.5} stroke={color} strokeWidth={1.7} />
    <Path d="M3 10h18" stroke={color} strokeWidth={1.7} />
    <Circle cx={17} cy={14.5} r={1.2} fill={color} />
  </Svg>
)

export const CardIcon = ({ size = 20, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={6} width={18} height={12} rx={2.5} stroke={color} strokeWidth={1.7} />
    <Path d="M3 10h18" stroke={color} strokeWidth={1.7} />
  </Svg>
)

export const CoinIcon = ({ size = 20, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.7} />
    <Path d="M8.5 12c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5-1.5 3.5-3.5 3.5" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    <Path d="M9 9.5v5" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
  </Svg>
)

export const UserIcon = ({ size = 20, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.7} />
    <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
  </Svg>
)

export const BellIcon = ({ size = 20, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9a6 6 0 1112 0v4l2 3H4l2-3V9z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    <Path d="M10 19a2 2 0 004 0" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
  </Svg>
)

export const ChevronIcon = ({ size = 16, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5l7 7-7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const ChevronLeftIcon = ({ size = 16, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 5l-7 7 7 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const PlusIcon = ({ size = 18, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
)

export const CheckIcon = ({ size = 16, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12.5L10 17l9-10" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const ArrowUpIcon = ({ size = 14, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 19V5M6 11l6-6 6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const ArrowDownIcon = ({ size = 14, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5v14M6 13l6 6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const LockIcon = ({ size = 16, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={5} y={11} width={14} height={10} rx={2} stroke={color} strokeWidth={1.7} />
    <Path d="M8 11V8a4 4 0 018 0v3" stroke={color} strokeWidth={1.7} />
  </Svg>
)

export const SplitIcon = ({ size = 18, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={7} cy={8} r={3} stroke={color} strokeWidth={1.7} />
    <Circle cx={17} cy={8} r={3} stroke={color} strokeWidth={1.7} />
    <Circle cx={12} cy={17} r={3} stroke={color} strokeWidth={1.7} />
  </Svg>
)

export const BankIcon = ({ size = 20, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 10l9-5 9 5" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    <Path d="M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
  </Svg>
)

export const PhoneIcon = ({ size = 18, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={7} y={3} width={10} height={18} rx={2} stroke={color} strokeWidth={1.7} />
    <Circle cx={12} cy={18} r={0.8} fill={color} />
  </Svg>
)

export const BuildingIcon = ({ size = 20, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={4} y={3} width={16} height={18} rx={1.5} stroke={color} strokeWidth={1.7} />
    <Path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
)

export const TrendIcon = ({ size = 18, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 17l6-6 4 4 8-9" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 6h6v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export const DocsIcon = ({ size = 18, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    <Path d="M14 3v5h5" stroke={color} strokeWidth={1.7} />
  </Svg>
)

export const SettingsIcon = ({ size = 20, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={1.7} />
    <Path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.9 2.9l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.9-2.9l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.9-2.9l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.9 2.9l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" stroke={color} strokeWidth={1.4} />
  </Svg>
)

export const SearchIcon = ({ size = 18, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={1.7} />
    <Path d="M20 20l-3.5-3.5" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
  </Svg>
)

export const QrIcon = ({ size = 18, color = '#0E1311' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={3} width={7} height={7} rx={1} stroke={color} strokeWidth={1.6} />
    <Rect x={14} y={3} width={7} height={7} rx={1} stroke={color} strokeWidth={1.6} />
    <Rect x={3} y={14} width={7} height={7} rx={1} stroke={color} strokeWidth={1.6} />
    <Path d="M14 14h3v3h-3zM20 14h1v1h-1zM14 20h1v1h-1zM17 17h1v1h-1zM20 17v4M17 20h3" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
  </Svg>
)

export const BigCheckIcon = ({ size = 36, color = '#1F6B4A' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12.5L10 17l9-10" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)
