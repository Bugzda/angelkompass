import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import { timeDefaults } from '../../features/situation/timeDefaults'
import { SituationPage } from '../../features/situation/SituationPage'

afterEach(() => { cleanup(); vi.useRealTimers() })
it.each([[0,'winter'],[2,'spring'],[5,'summer'],[8,'autumn'],[11,'winter']] as const)('ermittelt Jahreszeit für Monat %s', (month, season) => {
  expect(timeDefaults(new Date(2026, month, 1, 12)).season).toBe(season)
})
it.each([[0,'night'],[4,'night'],[5,'dawn'],[8,'dawn'],[9,'day'],[17,'day'],[18,'dusk'],[21,'dusk'],[22,'night']] as const)('ermittelt Tageszeit für Stunde %s', (hour, timeOfDay) => {
  expect(timeDefaults(new Date(2026, 8, 5, hour)).timeOfDay).toBe(timeOfDay)
})
it('wählt Zeitangaben ohne Abruf vor und erlaubt Korrektur', () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 11, 5, 23))
  render(<MemoryRouter initialEntries={['/neu/perch']}><Routes><Route path="/neu/:fish" element={<SituationPage/>}/></Routes></MemoryRouter>)
  expect(screen.getByRole('button',{name:'Zeit ändern: Winter · Nacht'})).toHaveAttribute('aria-expanded','false')
  fireEvent.click(screen.getByRole('button',{name:/Zeit ändern:/}))
  expect(screen.getByRole('button',{name:'Winter'})).toHaveAttribute('aria-pressed','true')
  expect(screen.getByRole('button',{name:'Nacht'})).toHaveAttribute('aria-pressed','true')
  fireEvent.click(screen.getByRole('button',{name:'Morgen'}))
  expect(screen.getByRole('button',{name:'Morgen'})).toHaveAttribute('aria-pressed','true')
  expect(screen.getByText(/Keine Eingabe nötig/)).toBeInTheDocument()
})
