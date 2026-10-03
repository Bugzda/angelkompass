import { useSyncExternalStore } from 'react'

export interface WaterPreferences {
  /** Keep the display on while the on-water card is open. */
  keepAwake: boolean
  /** Short vibration as confirmation for feedback and step reminders. */
  vibration: boolean
  /** Bigger feedback buttons for wet hands or gloves. */
  largeButtons: boolean
}

export const WATER_PREFERENCES_KEY = 'angelkompass.water-preferences.v1'
const defaults: WaterPreferences = { keepAwake: true, vibration: true, largeButtons: false }
const listeners = new Set<() => void>()
let cache: WaterPreferences | undefined

function read(): WaterPreferences {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(WATER_PREFERENCES_KEY) ?? '{}')
    if (typeof parsed !== 'object' || parsed === null) return defaults
    const value = parsed as Record<string, unknown>
    return {
      keepAwake: typeof value.keepAwake === 'boolean' ? value.keepAwake : defaults.keepAwake,
      vibration: typeof value.vibration === 'boolean' ? value.vibration : defaults.vibration,
      largeButtons: typeof value.largeButtons === 'boolean' ? value.largeButtons : defaults.largeButtons,
    }
  } catch {
    return defaults
  }
}

export const waterPreferences = {
  get: () => (cache ??= read()),
  set(change: Partial<WaterPreferences>) {
    cache = { ...waterPreferences.get(), ...change }
    try {
      localStorage.setItem(WATER_PREFERENCES_KEY, JSON.stringify(cache))
    } catch {
      /* The choice still applies for this visit. */
    }
    listeners.forEach(listener => listener())
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
  resetForTests() {
    cache = undefined
  },
}

export function useWaterPreferences() {
  return useSyncExternalStore(waterPreferences.subscribe, waterPreferences.get)
}

/** Haptic confirmation; silently ignored where vibration is unsupported or switched off. */
export function vibrate(pattern: number | number[]) {
  if (!waterPreferences.get().vibration) return
  // Browsers block vibration before the first user gesture and log an intervention.
  if (typeof navigator !== 'undefined' && navigator.userActivation && !navigator.userActivation.hasBeenActive) return
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* Some browsers throw when vibration is blocked. */
  }
}
