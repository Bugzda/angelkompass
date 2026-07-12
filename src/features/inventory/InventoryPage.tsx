import { lures } from '../../domain/catalogs/lures'
import { useInventory } from './useInventory'

export function InventoryPage() {
  const { inventory, toggle } = useInventory()
  return <section>
    <p className="eyebrow">PERSÖNLICHER BESTAND</p>
    <h1>Welche Köder hast du dabei?</h1>
    <p className="lead">Der Bestand verändert niemals die fachliche Rangfolge. Er bestimmt nur, welche Option du direkt praktisch einsetzen kannst.</p>
    <div className="inventory-options">{lures.map((lure) => {
      const selected = inventory.some((item) => item.lureTypeId === lure.id)
      return <button type="button" aria-pressed={selected} className={selected ? 'selected' : ''} key={lure.id} onClick={() => toggle(lure.id)}><span>{selected ? '✓' : '+'}</span><div><strong>{lure.label}</strong><small>{lure.mounting}</small></div></button>
    })}</div>
  </section>
}
