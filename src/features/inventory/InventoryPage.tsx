import { lures } from '../../domain/catalogs/lures'
import { pikeLures } from '../../domain/catalogs/pikeLures'
import { useInventory } from './useInventory'

export function InventoryPage() {
  const { inventory, toggleSize } = useInventory()
  const catalog=[...lures,...pikeLures].filter((lure,index,all)=>all.findIndex(item=>item.id===lure.id)===index)
  return <section>
    <p className="eyebrow">PERSÖNLICHER BESTAND</p>
    <h1>Welche Köder hast du dabei?</h1>
    <p className="lead">Der Bestand verändert niemals die fachliche Rangfolge. Er bestimmt nur, welche Option du direkt praktisch einsetzen kannst.</p>
    <div className="inventory-options">{catalog.map((lure) => {const item=inventory.find(entry=>entry.lureTypeId===lure.id);return <article className={item?'selected inventory-sized':''} key={lure.id}><div><strong>{lure.label}</strong>{item?.legacyPerch&&<small>Altbestand · für Hecht bitte Größe ergänzen</small>}</div><div className="chips">{(['small','medium','large'] as const).map(size=><button type="button" className={item?.sizes?.includes(size)?'selected':''} aria-pressed={item?.sizes?.includes(size)??false} onClick={()=>toggleSize(lure.id,size)} key={size}>{size==='small'?'Klein':size==='medium'?'Mittel':'Groß'}</button>)}</div></article>})}</div>
  </section>
}
