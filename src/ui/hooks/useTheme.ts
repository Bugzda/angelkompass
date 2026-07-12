import { useEffect, useState } from 'react'

export type ThemePreference = 'system' | 'light' | 'dark'
const KEY = 'angelkompass.theme.v1'
const read = (): ThemePreference => {
  const value = localStorage.getItem(KEY)
  return value === 'light' || value === 'dark' ? value : 'system'
}

export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(read)
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => document.documentElement.dataset.theme = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [preference])
  const setPreference = (value: ThemePreference) => { localStorage.setItem(KEY, value); setPreferenceState(value) }
  return { preference, setPreference }
}
