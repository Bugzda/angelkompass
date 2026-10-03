import type { Conditions, Light, TimeOfDay } from '../../domain/models/types'

export interface WeatherPlace {
  name: string
  latitude: number
  longitude: number
}
export interface WeatherSuggestion {
  timeOfDay: TimeOfDay
  light: Light
  timestamp: number
  temperature: number | null
  wind: number | null
  precipitation: number | null
}
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {}
const number = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null)
const first = (value: unknown) => (Array.isArray(value) ? number(value[0]) : null)

export function parseWeather(value: unknown, now = Date.now()): WeatherSuggestion {
  const data = record(value),
    current = record(data.current),
    daily = record(data.daily)
  const timestamp = number(current.time)
  if (timestamp === null || Math.abs(now / 1000 - timestamp) > 7200)
    throw new Error('Die Wetterdaten sind unvollständig oder veraltet. Bitte erneut versuchen.')
  const sunrise = first(daily.sunrise),
    sunset = first(daily.sunset)
  const isDay = current.is_day === 1 ? true : current.is_day === 0 ? false : null
  let timeOfDay: TimeOfDay = isDay === null ? 'unknown' : isDay ? 'day' : 'night'
  // Bedienhilfe, keine Fangregel: jeweils eine Stunde um Auf- und Untergang.
  if (sunrise !== null && sunset !== null && sunrise > 0 && sunset > sunrise) {
    if (Math.abs(timestamp - sunrise) <= 3600) timeOfDay = 'dawn'
    else if (Math.abs(timestamp - sunset) <= 3600) timeOfDay = 'dusk'
    else timeOfDay = timestamp > sunrise && timestamp < sunset ? 'day' : 'night'
  }
  const cloud = number(current.cloud_cover)
  const light: Light =
    timeOfDay === 'night'
      ? 'dark'
      : ['dawn', 'dusk'].includes(timeOfDay)
        ? 'diffuse'
        : timeOfDay === 'day' && cloud !== null && cloud >= 0 && cloud <= 100
          ? cloud >= 50
            ? 'diffuse'
            : 'bright'
          : 'unknown'
  return {
    timeOfDay,
    light,
    timestamp,
    temperature: number(current.temperature_2m),
    wind: number(current.wind_speed_10m),
    precipitation: number(current.precipitation),
  }
}

export function applyWeather(conditions: Conditions, suggestion: WeatherSuggestion): Conditions {
  return {
    ...conditions,
    timeOfDay: conditions.timeOfDay === 'unknown' ? suggestion.timeOfDay : conditions.timeOfDay,
    light: conditions.light === 'unknown' ? suggestion.light : conditions.light,
  }
}

async function request(url: URL, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal, credentials: 'omit', referrerPolicy: 'no-referrer' })
  if (!response.ok) throw new Error('Der Wetterdienst ist gerade nicht erreichbar. Bitte später erneut versuchen.')
  return response.json()
}
export async function searchPlaces(query: string, signal: AbortSignal): Promise<WeatherPlace[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.search = new URLSearchParams({ name: query.trim(), count: '5', language: 'de', format: 'json' }).toString()
  const data = record(await request(url, signal))
  if (!Array.isArray(data.results)) return []
  return data.results.flatMap(value => {
    const place = record(value),
      latitude = number(place.latitude),
      longitude = number(place.longitude)
    return typeof place.name === 'string' &&
      latitude !== null &&
      longitude !== null &&
      Math.abs(latitude) <= 90 &&
      Math.abs(longitude) <= 180
      ? [
          {
            name: [place.name, place.admin1, place.country].filter(x => typeof x === 'string' && x).join(', '),
            latitude,
            longitude,
          },
        ]
      : []
  })
}
export async function loadWeather(place: WeatherPlace, signal: AbortSignal): Promise<WeatherSuggestion> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.search = new URLSearchParams({
    latitude: place.latitude.toFixed(2),
    longitude: place.longitude.toFixed(2),
    current: 'temperature_2m,cloud_cover,is_day,wind_speed_10m,precipitation',
    daily: 'sunrise,sunset',
    timezone: 'auto',
    timeformat: 'unixtime',
    forecast_days: '1',
    wind_speed_unit: 'kmh',
    temperature_unit: 'celsius',
    precipitation_unit: 'mm',
  }).toString()
  return parseWeather(await request(url, signal))
}
