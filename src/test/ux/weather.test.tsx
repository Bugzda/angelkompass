import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SituationPage } from '../../features/situation/SituationPage'
import { parseWeather } from '../../features/situation/weather'
const now = Math.floor(Date.now() / 1000)
const data = (overrides = {}) => ({ current: { time: now, is_day: 1, cloud_cover: 80, temperature_2m: 20, wind_speed_10m: 10, precipitation: 0, ...overrides }, daily: { sunrise: [now - 10000], sunset: [now + 10000] } })
function show() { render(<MemoryRouter initialEntries={['/neu/perch']}><Routes><Route path="/neu/:fish" element={<SituationPage/>}/></Routes></MemoryRouter>) }
afterEach(() => { cleanup(); vi.unstubAllGlobals(); localStorage.clear() })
describe('Wettervorschläge', () => {
  it('ordnet Tag, Bewölkung, Dämmerung und Nacht ein', () => {
    expect(parseWeather(data())).toMatchObject({ timeOfDay: 'day', light: 'diffuse' })
    expect(parseWeather(data({ cloud_cover: 10 }))).toMatchObject({ light: 'bright' })
    expect(parseWeather({ ...data(), daily: { sunrise: [now + 1200], sunset: [now + 30000] } })).toMatchObject({ timeOfDay: 'dawn', light: 'diffuse' })
    expect(parseWeather({ ...data(), daily: { sunrise: [now - 30000], sunset: [now - 1200] } })).toMatchObject({ timeOfDay: 'dusk', light: 'diffuse' })
    expect(parseWeather({ ...data({ is_day: 0 }), daily: {} })).toMatchObject({ timeOfDay: 'night', light: 'dark' })
  })
  it('behandelt fehlende Werte neutral und lehnt alte Daten ab', () => {
    expect(parseWeather(data({ cloud_cover: null }))).toMatchObject({ light: 'unknown' })
    expect(parseWeather({ current: { time: now }, daily: {} })).toMatchObject({ timeOfDay: 'unknown', light: 'unknown' })
    expect(() => parseWeather(data({ time: now - 8000 }))).toThrow(/veraltet/)
    expect(() => parseWeather({})).toThrow(/unvollständig/)
  })
  it('ruft nur auf Wunsch ab, ergänzt offene Felder und erhält manuelle Werte sowie Wassertemperatur', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ results: [{ name: 'Potsdam', latitude: 52.40123, longitude: 13.06123, country: 'Deutschland' }] }) }).mockResolvedValueOnce({ ok: true, json: async () => data() })
    vi.stubGlobal('fetch', fetcher); show()
    expect(fetcher).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Nacht' }))
    fireEvent.change(screen.getByLabelText('Ort oder Postleitzahl am See'), { target: { value: 'Potsdam' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ort suchen' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Potsdam, Deutschland' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Offene Angaben ergänzen' }))
    expect(screen.getByRole('button', { name: 'Nacht' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Diffus/bewölkt' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Warm · 19–23 °C' })).toHaveAttribute('aria-pressed', 'false')
    expect(String(fetcher.mock.calls[1][0])).toContain('latitude=52.40')
    fireEvent.click(screen.getByRole('button', { name: 'Hell' }))
    expect(screen.getByRole('button', { name: 'Hell' })).toHaveAttribute('aria-pressed', 'true')
  })
  it('erhält Angaben bei Netzfehlern und ermöglicht erneuten Abruf', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Kein Netz'))); show()
    fireEvent.click(screen.getByRole('button', { name: 'Hell' }))
    fireEvent.change(screen.getByLabelText('Ort oder Postleitzahl am See'), { target: { value: 'Berlin' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ort suchen' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Deine Angaben bleiben erhalten')
    expect(screen.getByRole('button', { name: 'Hell' })).toHaveAttribute('aria-pressed', 'true')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ort suchen' })).toBeEnabled())
  })
  it('bietet bei verweigertem Standort weiter die Ortssuche an', async () => {
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: (_success: unknown, failure: () => void) => failure() } }); show()
    fireEvent.click(screen.getByRole('button', { name: 'Meinen Standort verwenden' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Standortfreigabe')
    expect(screen.getByLabelText('Ort oder Postleitzahl am See')).toBeEnabled()
  })
})
