import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { InventoryPage } from '../../features/inventory/InventoryPage'

const storageKey = 'angelkompass.inventory.v3'
const group = () => within(screen.getByRole('region', { name: 'Barsch' }))
const button = (size: string) => group().getByRole('button', { name: `Barsch Softbait / Gummifisch: ${size}` })
const storedSizes = () => JSON.parse(localStorage.getItem(storageKey)!).items.find((item: { targetFish: string; lureTypeId: string }) => item.targetFish === 'perch' && item.lureTypeId === 'jig')?.sizes

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('Eindeutige Größenauswahl in der Köderbox', () => {
  it.each([['Klein · 3–5 cm', 'small', 'Klein'], ['Mittel · 5–8 cm', 'medium', 'Mittel'], ['Groß · 8–12 cm', 'large', 'Groß']])('speichert nur %s und zeigt dieselbe Auswahl nach erneutem Öffnen', (label, size, summary) => {
    const view = render(<MemoryRouter><InventoryPage/></MemoryRouter>)
    fireEvent.click(button(label))
    expect(storedSizes()).toEqual([size])
    expect(button('Alle Größen')).toHaveAttribute('aria-pressed', 'false')
    expect(button('Alle Größen').querySelector('svg')).toBeNull()
    expect(button(label)).toHaveAttribute('aria-pressed', 'true')
    expect(button(label).querySelector('svg')).not.toBeNull()
    expect(group().getByText(`Gespeichert: ${summary}`)).toBeInTheDocument()
    view.unmount()
    render(<MemoryRouter><InventoryPage/></MemoryRouter>)
    expect(group().getByText(`Gespeichert: ${summary}`)).toBeInTheDocument()
    expect(button(label)).toHaveAttribute('aria-pressed', 'true')
    expect(button('Alle Größen')).toHaveAttribute('aria-pressed', 'false')
  })

  it('unterscheidet alle Größen von einer Teilmenge und entfernt die letzte Größe', () => {
    render(<MemoryRouter><InventoryPage/></MemoryRouter>)
    fireEvent.click(button('Alle Größen'))
    expect(storedSizes()).toEqual(['small', 'medium', 'large'])
    expect(button('Alle Größen')).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(button('Mittel · 5–8 cm'))
    expect(storedSizes()).toEqual(['small', 'large'])
    expect(button('Alle Größen')).toHaveAttribute('aria-pressed', 'false')
    expect(group().getByText('Gespeichert: Klein, Groß')).toBeInTheDocument()
    fireEvent.click(button('Klein · 3–5 cm'))
    fireEvent.click(button('Groß · 8–12 cm'))
    expect(storedSizes()).toBeUndefined()
    expect(button('Alle Größen')).toHaveAttribute('aria-pressed', 'false')
  })
})
