import type { Season, TimeOfDay } from '../../domain/models/types'

/** Lokale Kalender-/Uhrzeithilfe für Mitteleuropa, keine berechneten Sonnenzeiten. */
export function timeDefaults(now = new Date()): { season: Season; timeOfDay: TimeOfDay } {
  const season = (['winter', 'spring', 'summer', 'autumn'] as const)[Math.floor(((now.getMonth() + 1) % 12) / 3)]
  const hour = now.getHours()
  const timeOfDay: TimeOfDay = hour < 5 || hour >= 22 ? 'night' : hour < 9 ? 'dawn' : hour < 18 ? 'day' : 'dusk'
  return { season, timeOfDay }
}
