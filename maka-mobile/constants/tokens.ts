export const palette = {
  light: {
    bg: '#F3F5F2',
    surface: '#FFFFFF',
    surface2: '#F7F8F6',
    ink: '#0E1311',
    ink2: '#2A302D',
    muted: '#6B7270',
    muted2: '#A7ADAA',
    line: '#E4E7E3',
    line2: '#EFF1EE',
    chip: '#EDF0EB',
    primary: '#1F6B4A',
    primarySoft: '#DEF1E5',
    primaryInk: '#0A3A26',
    accent: '#B6E14B',
    danger: '#B84A3E',
    dangerSoft: '#F7E1DE',
  },
  dark: {
    bg: '#0A0D0B',
    surface: '#111513',
    surface2: '#151917',
    ink: '#ECEFEB',
    ink2: '#C9CEC9',
    muted: '#8D938F',
    muted2: '#5C625F',
    line: '#1F2320',
    line2: '#1B201D',
    chip: '#1C221E',
    primary: '#5BC68F',
    primarySoft: '#12281C',
    primaryInk: '#D3F1DE',
    accent: '#C9ED5A',
    danger: '#E57163',
    dangerSoft: '#3A1C18',
  },
} as const

export type Colors = {
  bg: string; surface: string; surface2: string;
  ink: string; ink2: string; muted: string; muted2: string;
  line: string; line2: string; chip: string;
  primary: string; primarySoft: string; primaryInk: string;
  accent: string; danger: string; dangerSoft: string;
}

export function useColors(dark: boolean): Colors {
  return dark ? palette.dark : palette.light
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 } as const
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, card: 20, pill: 999 } as const

export const shadow = {
  card: {
    shadowColor: '#0E1311',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  float: {
    shadowColor: '#0E1311',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 10,
  },
} as const
