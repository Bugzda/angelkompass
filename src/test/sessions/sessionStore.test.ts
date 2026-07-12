import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRecommendations } from '../../domain/engine/scoring'
import type { Conditions } from '../../domain/models/types'
import { sessionStore } from '../../features/sessions/sessionStore'

const conditions: Conditions = {
  targetFish: 'perch', waterType: 'lake', season: 'summer', timeOfDay: 'day', turbidity: 'slightly_turbid',
  depth: 'medium', waterTemperature: 'mild', light: 'diffuse', activity: { status: 'none', signs: [] },
  vegetation: 'edgeOrGaps', observedStructure: ['dropoff'],
}

let id = 0
beforeEach(() => {
  localStorage.clear()
  sessionStore.resetForTests()
  vi.stubGlobal('crypto', { randomUUID: () => `test-${++id}` })
})
afterEach(() => vi.restoreAllMocks())

describe('lokaler Session-Zustandsautomat', () => {
  it('speichert einen stabilen Empfehlungssnapshot und erlaubt nur eine aktive Session', () => {
    const recommendation = createRecommendations(conditions)[0]
    const created = sessionStore.create(conditions, recommendation)
    expect(created?.recommendation).toEqual(recommendation)
    expect(sessionStore.create(conditions, createRecommendations(conditions)[1])).toBeUndefined()
    expect(sessionStore.getSnapshot()).toHaveLength(1)
    expect(created?.rulesetVersion).toBe('perch-lake-2.0.0')
    expect(created?.recommendation.setup.resolvedPresentation).toBeDefined()
  })

  it('hält die Phase bei Biss und Fang', () => {
    const session = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    expect(sessionStore.addFeedback(session.id, 'bite')).toBe(true)
    expect(sessionStore.addFeedback(session.id, 'catch')).toBe(true)
    const updated = sessionStore.getSnapshot()[0]
    expect(updated.progress).toBe('initial')
    expect(updated.feedback.map((item) => item.outcome)).toEqual(['bite', 'catch'])
  })

  it('schaltet bei drei erfolglosen Versuchen bis zum ausgeschöpften Plan', () => {
    const session = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    sessionStore.addFeedback(session.id, 'no_success')
    expect(sessionStore.getSnapshot()[0].progress).toBe('refine')
    sessionStore.addFeedback(session.id, 'no_success')
    expect(sessionStore.getSnapshot()[0].progress).toBe('move')
    sessionStore.addFeedback(session.id, 'no_success')
    expect(sessionStore.getSnapshot()[0].progress).toBe('exhausted')
    expect(sessionStore.addFeedback(session.id, 'no_success')).toBe(false)
    expect(sessionStore.getSnapshot()[0].feedback).toHaveLength(3)
  })

  it('schließt manuell ab, sperrt Feedback und erlaubt danach eine neue Session', () => {
    const first = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    expect(sessionStore.complete(first.id)).toBe(true)
    expect(sessionStore.getSnapshot()[0].status).toBe('completed')
    expect(sessionStore.getSnapshot()[0].completedAt).toBeTruthy()
    expect(sessionStore.addFeedback(first.id, 'bite')).toBe(false)
    expect(sessionStore.create(conditions, createRecommendations(conditions)[1])).toBeTruthy()
  })

  it('löscht Sessions einzeln und übersteht einen erneuten Store-Aufbau', () => {
    const session = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    sessionStore.addFeedback(session.id, 'bite')
    sessionStore.resetForTests()
    expect(sessionStore.getSnapshot()[0].feedback[0].outcome).toBe('bite')
    expect(sessionStore.delete(session.id)).toBe(true)
    expect(sessionStore.getSnapshot()).toEqual([])
  })

  it('ignoriert beschädigte und strukturell ungültige Speicherung', () => {
    localStorage.setItem('angelkompass.sessions.v1', '{kaputt')
    sessionStore.resetForTests()
    expect(sessionStore.getSnapshot()).toEqual([])
    localStorage.setItem('angelkompass.sessions.v1', JSON.stringify({ schemaVersion: 1, sessions: [{ id: 'unvollständig' }] }))
    sessionStore.resetForTests()
    expect(sessionStore.getSnapshot()).toEqual([])
  })

  it('verwirft einen unvollständigen Empfehlungssnapshot vor der Darstellung',()=>{
    const session=sessionStore.create(conditions,createRecommendations(conditions)[0])!
    const envelope=JSON.parse(localStorage.getItem('angelkompass.sessions.v1')!)
    delete envelope.sessions[0].recommendation.colorGuidance
    localStorage.setItem('angelkompass.sessions.v1',JSON.stringify(envelope))
    sessionStore.resetForTests()
    expect(sessionStore.getSnapshot()).toEqual([])
    expect(session.id).toBeTruthy()
  })

  it('übernimmt aus manipulierten Daten höchstens eine aktive Session', () => {
    const first = sessionStore.create(conditions, createRecommendations(conditions)[0])!
    const second = { ...first, id: 'zweite-aktive', createdAt: new Date(Date.now() + 1_000).toISOString() }
    localStorage.setItem('angelkompass.sessions.v1', JSON.stringify({ schemaVersion: 1, sessions: [first, second] }))
    sessionStore.resetForTests()
    expect(sessionStore.getSnapshot().filter((session) => session.status === 'active')).toHaveLength(1)
    expect(sessionStore.getSnapshot()[0].id).toBe('zweite-aktive')
  })

  it('meldet Schreibfehler und übernimmt keinen scheinbaren Fortschritt', () => {
    const recommendation = createRecommendations(conditions)[0]
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Quota', 'QuotaExceededError') })
    expect(sessionStore.create(conditions, recommendation)).toBeUndefined()
    expect(sessionStore.getSnapshot()).toEqual([])
    expect(sessionStore.getError()).toMatch(/nicht lokal gespeichert/)
  })
})
