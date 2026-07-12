import { lures } from '../../domain/catalogs/lures'
import { pikeLures } from '../../domain/catalogs/pikeLures'
import { Icon } from '../../ui/components/Icon'
import { useInventory } from './useInventory'

export function InventoryPage() {
  const { inventory, toggleSize, toggleAllSizes } = useInventory()
  const catalog=[...lures,...pikeLures].filter((lure,index,all)=>all.findIndex(item=>item.id===lure.id)===index)
  return <section className="page-shell inventory-page">
    <p className="eyebrow">PERSÖNLICHER BESTAND</p>
    <h1>Welche Köder hast du dabei?</h1>
    <p className="lead">Der Bestand verändert niemals die fachliche Rangfolge. Er bestimmt nur, welche Option du direkt praktisch einsetzen kannst.</p>
    <div className="inventory-options">{catalog.map((lure) => {const item=inventory.find(entry=>entry.lureTypeId===lure.id);const hasAllSizes=item?.sizes?.length===3&&(['small','medium','large'] as const).every(size=>item.sizes?.includes(size));return <article className={item?'selected inventory-sized':''} key={lure.id}><div className="inventory-title"><span className="inventory-check" aria-hidden="true">{item&&<Icon name="check" size={16}/>}</span><div><strong>{lure.label}</strong>{item?.legacyPerch&&<small>Altbestand · für Hecht bitte Größe ergänzen</small>}</div></div><div className="chips"><button type="button" className={`all-sizes${hasAllSizes?' selected':''}`} aria-label={`${lure.label}: Alle Größen`} aria-pressed={hasAllSizes} onClick={()=>toggleAllSizes(lure.id)}>Alle Größen</button>{(['small','medium','large'] as const).map(size=>{const label=size==='small'?'Klein':size==='medium'?'Mittel':'Groß';return <button type="button" className={item?.sizes?.includes(size)?'selected':''} aria-label={`${lure.label}: ${label}`} aria-pressed={item?.sizes?.includes(size)??false} onClick={()=>toggleSize(lure.id,size)} key={size}>{label}</button>})}</div></article>})}</div>
  </section>
}
