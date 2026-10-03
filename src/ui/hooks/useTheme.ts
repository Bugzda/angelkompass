import { useEffect, useState } from 'react'

export type ThemePreference = 'system' | 'light' | 'dark'
const KEY = 'angelkompass.theme.v1'
const read = (): ThemePreference => {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(read)
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () =>
      (document.documentElement.dataset.theme =
        preference === 'system' ? (media.matches ? 'dark' : 'light') : preference)
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [preference])
  const setPreference = (value: ThemePreference) => {
    try {
      localStorage.setItem(KEY, value)
    } catch {
      /* The current visit still supports theme switching. */
    }
    setPreferenceState(value)
  }
  return { preference, setPreference }
}
