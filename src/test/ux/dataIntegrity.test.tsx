import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Conditions } from '../../domain/models/types'
import { createRecommendationDecision, createRecommendations } from '../../domain/engine/scoring'
import { sessionStore, SESSION_KEY } from '../../features/sessions/sessionStore'
import { serializeSessions } from '../../features/sessions/sessionExport'
import { INVENTORY_KEY, loadInventory } from '../../features/inventory/inventoryStorage'
import { useInventory } from '../../features/inventory/useInventory'
import { parseBackup, planRestore, restoreBackup, serializeBackup } from '../../features/data/dataBackup'
import { recoverPendingRestore, storageSnapshot } from '../../features/data/storageTransaction'
import { DataPage } from '../../features/data/DataPage'
import { WeatherAssist } from '../../features/situation/WeatherAssist'

const conditions: Conditions = { targetFish: 'perch', waterType: 'lake', season: 'summer', timeOfDay: 'day', turbidity: 'clear', depth: 'medium', waterTemperature: 'mild', light: 'diffuse', activity: { status: 'none', signs: [] }, vegetation: 'none', observedStructure: [] }
const stock = [{ targetFish: 'perch', lureTypeId: 'jig', sizes: ['medium'] }]
const makeSession = () => sessionStore.create(conditions, createRecommendations(conditions)[0])!
beforeEach(() => { localStorage.clear(); sessionStore.resetForTests() })
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers() })

describe('Verlustfreie Speicherung', () => {
  it.each(['{broken', '{"schemaVersion":2}', '{"schemaVersion":4,"items":[]}'])('verdeckt beschädigten Altbestand nicht mit einer leeren Migration: %s', raw => {
    localStorage.setItem('angelkompass.inventory.v2', raw)
    const { result } = renderHook(() => useInventory())
    act(() => result.current.toggleSize('perch', 'jig', 'medium'))
    expect(localStorage.getItem(INVENTORY_KEY)).toBeNull()
    expect(localStorage.getItem('angelkompass.inventory.v2')).toBe(raw)
    expect(result.current.error).toBeTruthy()
  })
  it('erhält unbekannte Bestandsdatensätze bei Änderungen an gültigen Ködern', () => {
    const unreadable = { targetFish: 'future-fish', lureTypeId: 'future-lure', sizes: ['medium'], notes: 'behalten' }
    localStorage.setItem(INVENTORY_KEY, JSON.stringify({ schemaVersion: 3, items: [...stock, unreadable] }))
    const { result } = renderHook(() => useInventory())
    act(() => result.current.toggleSize('perch', 'jig', 'small'))
    expect(result.current.inventory[0].sizes).toEqual(['small', 'medium'])
    expect(JSON.parse(localStorage.getItem(INVENTORY_KEY)!).items).toContainEqual(unreadable)
    expect(result.current.error).toMatch(/unverändert/)
  })
  it('erhält defekte Logbucheinträge bei Rückmeldungen und beim Löschen gültiger Einträge', () => {
    const session = makeSession(), broken = { id: 'unreadable', feedback: ['original'] }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ schemaVersion: 1, sessions: [session, broken] }))
    sessionStore.resetForTests()
    expect(sessionStore.addFeedback(session.id, 'bite')).toBe(true)
    expect(JSON.parse(localStorage.getItem(SESSION_KEY)!).sessions).toContainEqual(broken)
    expect(sessionStore.getError()).toMatch(/unverändert/)
    sessionStore.delete(session.id)
    expect(JSON.parse(localStorage.getItem(SESSION_KEY)!).sessions).toEqual([broken])
  })
  it('bewahrt eine zweite aktive Session und macht sie nach Abschluss der ersten wieder zugänglich', () => {
    const first = makeSession(), second = { ...first, id: 'second', createdAt: new Date(Date.now() + 1000).toISOString() }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ schemaVersion: 1, sessions: [first, second] }))
    sessionStore.resetForTests()
    sessionStore.complete(second.id)
    expect(sessionStore.getSnapshot()).toHaveLength(2)
    expect(sessionStore.getSnapshot().find(item => item.id === first.id)?.status).toBe('active')
  })
  it('sortiert auch alte Zeitstempel mit Zeitzonen nach dem Zeitpunkt', () => {
    const first = { ...makeSession(), status: 'completed', createdAt: '2026-09-07T11:00:00+02:00' }
    const second = { ...first, id: 'later', createdAt: '2026-09-07T10:00:00Z' }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ schemaVersion: 1, sessions: [first, second] }))
    sessionStore.resetForTests()
    expect(sessionStore.getSnapshot()[0].id).toBe('later')
  })
  it('meldet neu auftretende Lesefehler aus einem anderen Tab', () => {
    const { result } = renderHook(() => useInventory())
    localStorage.setItem(INVENTORY_KEY, '{broken')
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: INVENTORY_KEY })))
    expect(result.current.error).toMatch(/nicht lesbar/)
  })
})

describe('Vollständige Datensicherung und Wiederherstellung', () => {
  it('stellt unbekannte Gewichte, Wechselschritt-Snapshots und spätes Feedback ohne Neuberechnung wieder her', () => {
    const input={...conditions,depth:'unknown' as const}
    const inventory=[{targetFish:'perch' as const,lureTypeId:'jig' as const,sizes:['medium' as const]}]
    localStorage.setItem(INVENTORY_KEY,JSON.stringify({schemaVersion:3,items:inventory}))
    const recommendation=createRecommendationDecision(input,inventory).practicalRanking[0]
    const session=sessionStore.create(input,recommendation)!
    for(let i=0;i<3;i++)sessionStore.addFeedback(session.id,'no_success')
    sessionStore.addFeedback(session.id,'catch')
    const original=sessionStore.getSnapshot()[0]
    const backup=parseBackup(serializeBackup())
    localStorage.clear();sessionStore.resetForTests()
    restoreBackup(planRestore(backup))
    expect(sessionStore.getSnapshot()[0]).toEqual(original)
    expect(sessionStore.getSnapshot()[0].recommendation.setup.weight).toBe('unknown')
    sessionStore.undoFeedback(session.id)
    expect(sessionStore.getSnapshot()[0].progress).toBe('exhausted')
  })
  it('stellt Bestand, Fortschritt und Empfehlungssnapshot unverändert auf einem leeren Gerät wieder her', () => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify({ schemaVersion: 3, items: stock }))
    const session = makeSession()
    sessionStore.addFeedback(session.id, 'catch')
    const original = sessionStore.getSnapshot()
    const backup = parseBackup(serializeBackup())
    localStorage.clear(); sessionStore.resetForTests()
    const plan = planRestore(backup)
    expect(plan).toMatchObject({ addedSessions: 1, addedSizes: 1 })
    restoreBackup(plan)
    expect(sessionStore.getSnapshot()).toEqual(original)
    expect(loadInventory().items[0]).toMatchObject(stock[0])
  })
  it('ergänzt Größen ohne Abwahl und lässt vorhandene Session-Snapshots unverändert', () => {
    const session = makeSession()
    const backup = parseBackup(serializeBackup())
    backup.inventory = [{ targetFish: 'perch', lureTypeId: 'jig', sizes: ['small'] }]
    localStorage.setItem(INVENTORY_KEY, JSON.stringify({ schemaVersion: 3, items: stock }))
    sessionStore.addFeedback(session.id, 'bite')
    const plan = planRestore(backup)
    expect(plan).toMatchObject({ addedSessions: 0, skippedSessions: 1, addedSizes: 1 })
    restoreBackup(plan)
    expect(loadInventory().items[0].sizes).toEqual(['small', 'medium'])
    expect(sessionStore.getSnapshot()[0].feedback).toHaveLength(1)
  })
  it('übernimmt einen importierten aktiven Plan als Rückblick, wenn lokal bereits geangelt wird', () => {
    makeSession()
    const backup = parseBackup(serializeBackup())
    const imported = { ...backup.sessions[0], id: 'imported-active' }
    backup.sessions = [imported]
    const plan = planRestore(backup)
    expect(plan.archivedSessions).toBe(1)
    restoreBackup(plan)
    expect(sessionStore.getSnapshot().filter(item => item.status === 'active')).toHaveLength(1)
    expect(sessionStore.getSnapshot().find(item => item.id === imported.id)).toMatchObject({ status: 'completed', recommendation: imported.recommendation })
  })
  it('liest das bereits vorhandene reine Session-Exportformat', () => {
    makeSession()
    const backup = parseBackup(serializeSessions(sessionStore.getSnapshot()))
    expect(backup.inventory).toEqual([])
    expect(backup.sessions).toEqual(sessionStore.getSnapshot())
  })
  it('enthält beschädigte Originaldaten weiterhin vollständig in der Sicherungsdatei', () => {
    localStorage.setItem(INVENTORY_KEY, '{original')
    const backup = JSON.parse(serializeBackup())
    expect(backup.originalStorage[INVENTORY_KEY]).toBe('{original')
    expect(backup.inventory).toEqual([])
  })
  it('lehnt unbekannte Sicherungen, ungültige Einträge und doppelte IDs ab', () => {
    makeSession()
    const backup = JSON.parse(serializeBackup())
    for (const value of [{ ...backup, schemaVersion: 5 }, { ...backup, inventory: [{}] }, { ...backup, sessions: [{}] }, { ...backup, sessions: [...backup.sessions, ...backup.sessions] }]) {
      expect(() => parseBackup(JSON.stringify(value))).toThrow()
    }
  })
  it('erkennt Änderungen nach der Vorschau vor dem ersten Schreibzugriff', () => {
    const backup = parseBackup(serializeBackup())
    const plan = planRestore(backup)
    localStorage.setItem(INVENTORY_KEY, JSON.stringify({ schemaVersion: 3, items: stock }))
    const changed = storageSnapshot()
    expect(() => restoreBackup(plan)).toThrow(/inzwischen geändert/)
    expect(storageSnapshot()).toEqual(changed)
  })
  it('setzt beide Speicherbereiche bei einem Schreibfehler zurück', () => {
    makeSession()
    localStorage.setItem(INVENTORY_KEY, JSON.stringify({ schemaVersion: 3, items: stock }))
    const backup = parseBackup(serializeBackup())
    backup.inventory = [{ targetFish: 'perch', lureTypeId: 'jig', sizes: ['small'] }]
    const plan = planRestore(backup), before = storageSnapshot()
    const original = Storage.prototype.setItem
    let failed = false
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === SESSION_KEY && !failed) { failed = true; throw new DOMException('Quota', 'QuotaExceededError') }
      original.call(this, key, value)
    })
    expect(() => restoreBackup(plan)).toThrow(/zurückgesetzt/)
    expect(storageSnapshot()).toEqual(before)
    expect(localStorage.getItem('angelkompass.restore.pending.v1')).toBeNull()
  })
  it('holt eine nach Tab-Abbruch offene Rücksicherung beim Start nach', () => {
    const before = storageSnapshot()
    localStorage.setItem('angelkompass.restore.pending.v1', JSON.stringify({ schemaVersion: 1, before }))
    localStorage.setItem(INVENTORY_KEY, JSON.stringify({ schemaVersion: 3, items: stock }))
    recoverPendingRestore()
    expect(storageSnapshot()).toEqual(before)
    expect(localStorage.getItem('angelkompass.restore.pending.v1')).toBeNull()
  })
  it('sperrt weitere Änderungen bis eine offene Rücksicherung erledigt ist', () => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify({ schemaVersion: 3, items: stock }))
    const { result } = renderHook(() => useInventory())
    const before = storageSnapshot()
    localStorage.setItem('angelkompass.restore.pending.v1', JSON.stringify({ schemaVersion: 1, before }))
    localStorage.setItem(INVENTORY_KEY, JSON.stringify({ schemaVersion: 3, items: [] }))
    act(() => result.current.toggleSize('perch', 'jig', 'small'))
    expect(result.current.error).toMatch(/nicht übernommen/)
    expect(JSON.parse(localStorage.getItem(INVENTORY_KEY)!).items).toEqual([])
    recoverPendingRestore()
    act(() => result.current.toggleSize('perch', 'jig', 'small'))
    expect(loadInventory().items[0].sizes).toEqual(['small', 'medium'])
    expect(localStorage.getItem('angelkompass.restore.pending.v1')).toBeNull()
  })
  it('zeigt Wiederherstellung auch auf einem noch leeren Gerät', () => {
    render(<MemoryRouter><DataPage/></MemoryRouter>)
    expect(screen.getByLabelText('Sicherungsdatei auswählen')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Vollständige Sicherung herunterladen' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: 'Daten ergänzen' })).not.toBeInTheDocument()
  })
})

describe('Abbrechbare Wetterhilfe', () => {
  it('startet eingeklappt und sendet beim Aufklappen keine Anfrage', () => {
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher)
    render(<WeatherAssist onApply={vi.fn()}/>)
    const toggle = screen.getByRole('button', { name: /Wetter am Angelort/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('button', { name: 'Meinen Standort verwenden' })).not.toBeInTheDocument()
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Meinen Standort verwenden' })).toBeVisible()
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('beendet auch eine unbeantwortete Standortanfrage nach 15 Sekunden', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: vi.fn() } })
    render(<WeatherAssist onApply={vi.fn()}/>)
    fireEvent.click(screen.getByRole('button', { name: /Wetter am Angelort/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Meinen Standort verwenden' }))
    await act(async () => { await vi.advanceTimersByTimeAsync(15000) })
    expect(screen.getByRole('alert')).toHaveTextContent('zu lange gedauert')
    expect(screen.getByRole('button', { name: 'Meinen Standort verwenden' })).toBeEnabled()
  })
  it('bricht manuell ab und ignoriert später eintreffende Standortdaten', async () => {
    let success: PositionCallback | undefined
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher)
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition: (callback: PositionCallback) => { success = callback } } })
    render(<WeatherAssist onApply={vi.fn()}/>)
    fireEvent.click(screen.getByRole('button', { name: /Wetter am Angelort/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Meinen Standort verwenden' }))
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Abruf abbrechen' })) })
    expect(screen.getByRole('status')).toHaveTextContent('abgebrochen')
    await act(async () => { success?.({ coords: { latitude: 52, longitude: 13 } } as GeolocationPosition) })
    expect(fetcher).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Meinen Standort verwenden' })).toBeEnabled()
  })
})
