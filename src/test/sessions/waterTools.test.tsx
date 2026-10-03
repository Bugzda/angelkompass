import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRecommendations } from '../../domain/engine/scoring'
import type { Conditions } from '../../domain/models/types'
import { parseSessions, sessionStore } from '../../features/sessions/sessionStore'
import { WaterCardPage } from '../../features/sessions/WaterCardPage'
import { minuteRange, restartStepClock, stepStartedAt } from '../../features/water/stepTiming'
import { vibrate, waterPreferences } from '../../features/water/waterPreferences'

const conditions: Conditions = {
  targetFish: 'perch',
  waterType: 'lake',
  season: 'summer',
  timeOfDay: 'day',
  turbidity: 'slightly_turbid',
  depth: 'medium',
  waterTemperature: 'mild',
  light: 'diffuse',
  activity: { status: 'none', signs: [] },
  vegetation: 'edgeOrGaps',
  observedStructure: ['dropoff'],
}

let id = 0
beforeEach(() => {
  localStorage.clear()
  sessionStore.resetForTests()
  waterPreferences.resetForTests()
  vi.stubGlobal('crypto', { randomUUID: () => `water-${++id}` })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const card = (sessionId: string) =>
  render(
    <MemoryRouter initialEntries={[`/session/${sessionId}/karte`]}>
      <Routes>
        <Route path="/session/:id/karte" element={<WaterCardPage />} />
      </Routes>
    </MemoryRouter>,
  )

describe('Schrittuhr', () => {
  it('liest Minutenangaben aus dem Wechselplan, ohne Würfe als Minuten zu deuten', () => {
    expect(minuteRange('15–25 gute Würfe oder 10–15 Minuten')).toEqual({ min: 10, max: 15 })
    expect(minuteRange('Nach zwei Versuchen ohne Kontakt')).toBeUndefined()
    expect(minuteRange(undefined)).toBeUndefined()
  })

  it('beginnt mit dem letzten Wechsel und lässt sich für den aktuellen Schritt neu starten', () => {
    const session = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    expect(stepStartedAt(session)).toBe(session.createdAt)
    sessionStore.addFeedback(session.id, 'no_success')
    const switched = sessionStore.getSnapshot()[0]
    expect(stepStartedAt(switched)).toBe(switched.feedback[0].createdAt)
    restartStepClock(switched, new Date('2030-01-01T10:00:00Z'))
    expect(stepStartedAt(switched)).toBe('2030-01-01T10:00:00.000Z')
    // A manual restart belongs to one step only.
    sessionStore.addFeedback(session.id, 'no_success')
    expect(stepStartedAt(sessionStore.getSnapshot()[0])).not.toBe('2030-01-01T10:00:00.000Z')
  })
})

describe('Fang-Details', () => {
  it('ergänzt Länge und Notiz, ohne Fortschritt oder Reihenfolge zu ändern', () => {
    const session = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    sessionStore.addFeedback(session.id, 'catch')
    const [catchEntry] = sessionStore.getSnapshot()[0].feedback
    expect(
      sessionStore.updateFeedbackDetails(session.id, catchEntry.id, { lengthCm: 31.54, note: '  Krautkante  ' }),
    ).toBe(true)
    const updated = sessionStore.getSnapshot()[0]
    expect(updated.progress).toBe('initial')
    expect(updated.feedback[0]).toMatchObject({ outcome: 'catch', lengthCm: 31.5, note: 'Krautkante' })
    // Stored data stays readable after a reload.
    expect(parseSessions(localStorage.getItem('angelkompass.sessions.v1')!).sessions[0].feedback[0].lengthCm).toBe(31.5)
  })

  it('speichert bei Bissen nur Notizen und lehnt unplausible Längen ab', () => {
    const session = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    sessionStore.addFeedback(session.id, 'bite')
    const [bite] = sessionStore.getSnapshot()[0].feedback
    sessionStore.updateFeedbackDetails(session.id, bite.id, { lengthCm: 40, note: 'Nachläufer' })
    expect(sessionStore.getSnapshot()[0].feedback[0]).not.toHaveProperty('lengthCm')
    const raw = JSON.parse(localStorage.getItem('angelkompass.sessions.v1')!)
    raw.sessions[0].feedback[0].lengthCm = 900
    expect(parseSessions(JSON.stringify(raw)).sessions).toHaveLength(0)
  })

  it('öffnet nach einem Fang ein optionales Detailblatt und vibriert kurz', () => {
    const vibrateSpy = vi.fn(() => true)
    vi.stubGlobal('navigator', { ...navigator, vibrate: vibrateSpy })
    const session = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    card(session.id)
    fireEvent.click(screen.getByRole('button', { name: 'Fang' }))
    expect(vibrateSpy).toHaveBeenCalledWith([60, 40, 60])
    const sheet = screen.getByRole('dialog', { name: 'Fang-Details' })
    fireEvent.change(screen.getByLabelText('Länge in cm'), { target: { value: '28,5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Details speichern' }))
    expect(sheet).not.toBeInTheDocument()
    expect(sessionStore.getSnapshot()[0].feedback[0].lengthCm).toBe(28.5)
  })
})

describe('Am-Wasser-Einstellungen', () => {
  it('merkt sich große Tasten und schaltet Vibration ab', () => {
    const vibrateSpy = vi.fn(() => true)
    vi.stubGlobal('navigator', { ...navigator, vibrate: vibrateSpy })
    const session = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    const { container } = card(session.id)
    fireEvent.click(screen.getByRole('button', { name: 'Große Tasten' }))
    expect(container.querySelector('.water-view')).toHaveClass('large-feedback')
    fireEvent.click(screen.getByRole('button', { name: 'Vibration' }))
    act(() => vibrate(50))
    expect(vibrateSpy).not.toHaveBeenCalled()
    expect(JSON.parse(localStorage.getItem('angelkompass.water-preferences.v1')!)).toMatchObject({
      largeButtons: true,
      vibration: false,
    })
  })
})
