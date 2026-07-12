import { lures } from '../../domain/catalogs/lures'
import { pikeLures } from '../../domain/catalogs/pikeLures'
import { sizeLabelFor } from '../../domain/engine/presentation'
import type { LureType, SizeClass, TargetFish } from '../../domain/models/types'
import { Icon } from '../../ui/components/Icon'
import { useInventory } from './useInventory'

const sizeNames:Record<SizeClass,string>={small:'Klein',medium:'Mittel',large:'Groß'}

export function InventoryPage(){
  const{inventory,toggleSize,toggleAllSizes,error}=useInventory()
  const groups:Array<{fish:TargetFish;label:string;description:string;lures:LureType[]}>= [
    {fish:'perch',label:'Barsch',description:'Feine bis mittlere Ködergrößen für den Barschplan.',lures},
    {fish:'pike',label:'Hecht',description:'Artspezifisch größere Köder und ausschließlich hechtsichere Montagen.',lures:pikeLures},
  ]
  return <section className="page-shell inventory-page">
    <p className="eyebrow">PERSÖNLICHER BESTAND</p><h1>Welche Köder hast du dabei?</h1><p className="lead">Der Bestand verändert niemals die fachliche Rangfolge. Er bestimmt nur, welche artspezifische Größe du direkt praktisch einsetzen kannst.</p>{error&&<p className="storage-error">{error}</p>}
    {groups.map(group=><section className="inventory-species" aria-labelledby={`inventory-${group.fish}`} key={group.fish}><header><div><span className="overline">ZIELFISCH</span><h2 id={`inventory-${group.fish}`}>{group.label}</h2><p>{group.description}</p></div></header><div className="inventory-options">{group.lures.map(lure=>{
      const item=inventory.find(entry=>entry.targetFish===group.fish&&entry.lureTypeId===lure.id)
      const hasAll=Boolean(item)&&lure.sizes.every(size=>item?.sizes?.includes(size))
      return <article className={item?'selected inventory-sized':''} key={lure.id}><div className="inventory-title"><span className="inventory-check" aria-hidden="true">{item&&<Icon name="check" size={16}/>}</span><div><strong>{lure.label}</strong>{item?.migratedNeedsReview&&<small>Aus Altbestand übernommen · Größen prüfen</small>}</div></div><div className="chips"><button type="button" className={`all-sizes${hasAll?' selected':''}`} aria-label={`${group.label} ${lure.label}: Alle Größen`} aria-pressed={hasAll} onClick={()=>toggleAllSizes(group.fish,lure.id)}>Alle Größen</button>{lure.sizes.map(size=>{const selected=item?.sizes?.includes(size)??false;const label=`${sizeNames[size]} · ${sizeLabelFor(lure,size)}`;return <button type="button" className={selected?'selected':''} aria-label={`${group.label} ${lure.label}: ${label}`} aria-pressed={selected} onClick={()=>toggleSize(group.fish,lure.id,size)} key={size}>{label}</button>})}</div></article>
    })}</div></section>)}
  </section>
}
