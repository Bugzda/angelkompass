import { fishLabel } from '../../domain/species/profiles'
import { zanderLures } from '../../domain/catalogs/zanderLures'
import { lures } from '../../domain/catalogs/lures'
import { pikeLures } from '../../domain/catalogs/pikeLures'
import { sizeLabelFor } from '../../domain/engine/presentation'
import type { LureType, SizeClass, TargetFish } from '../../domain/models/types'
import { Icon } from '../../ui/components/Icon'
import { useInventory } from './useInventory'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { canRecommend, isConditions, isRecord } from '../../domain/models/validation'

const sizeNames:Record<SizeClass,string>={small:'Klein',medium:'Mittel',large:'Groß'}

export function InventoryPage(){
  const{inventory,toggleSize,toggleAllSizes,error}=useInventory()
  const state:unknown=useLocation().state
  const returnConditions=isRecord(state)&&canRecommend(state.returnConditions)?state.returnConditions:undefined
  const draftConditions=isRecord(state)&&isConditions(state.draftConditions)?state.draftConditions:undefined
  const context=returnConditions??draftConditions
  const [fishFilter,setFishFilter]=useState<TargetFish|'all'>(context?.targetFish??'all')
  const [query,setQuery]=useState('')
  const groups:Array<{fish:TargetFish;label:string;description:string;lures:LureType[]}>= [
    {fish:'perch',label:'Barsch',description:'Feine bis mittlere Ködergrößen für den Barschplan.',lures},
    {fish:'zander',label:'Zander',description:'Gummifische, Finesse-Rigs und Wobbler für kontrollierte Uferpräsentationen.',lures:zanderLures},
    {fish:'pike',label:'Hecht',description:'Artspezifisch größere Köder und ausschließlich hechtsichere Montagen.',lures:pikeLures},
  ]
  const selectedForContext=context?inventory.filter(item=>item.targetFish===context.targetFish).length:0
  const visibleGroups=groups.filter(group=>fishFilter==='all'||fishFilter===group.fish)
  const hasResults=visibleGroups.some(group=>group.lures.some(lure=>lure.label.toLocaleLowerCase('de').includes(query.trim().toLocaleLowerCase('de'))))
  return <section className="page-shell inventory-page">
    <p className="eyebrow">PERSÖNLICHER BESTAND</p><h1>Welche Köder hast du dabei?</h1><p className="lead">Markiere deine Köder und die Größen in deiner Box. Dein Angelplan zeigt dir dann passende Optionen, die du direkt einsetzen kannst.</p>{error&&<p className="storage-error" role="alert">{error}</p>}
    {context&&<p className="context-label">DEIN {fishLabel[context.targetFish].toUpperCase()}-PLAN · Nur die passenden Köder markieren</p>}
    {draftConditions&&!returnConditions&&<Link className="secondary inventory-return" to={`/neu/${draftConditions.targetFish}`} state={draftConditions}>Zurück zu deinen Bedingungen <Icon name="arrow-right"/></Link>}
    {!error&&<p className="save-status" role="status"><Icon name="check" size={16}/> Änderungen werden direkt auf diesem Gerät gespeichert.</p>}
    {returnConditions&&<Link className="primary full inventory-return" to="/empfehlung" state={returnConditions}>Zurück zu deinen Empfehlungen <Icon name="arrow-right"/></Link>}
    <div className="inventory-overview"><Icon name="inventory" size={28}/><div><strong>{inventory.length} Köderprofile in deiner Box</strong><span>{inventory.filter(item=>item.targetFish==='perch').length} für Barsch · {inventory.filter(item=>item.targetFish==='pike').length} für Hecht · {inventory.filter(item=>item.targetFish==='zander').length} für Zander</span></div></div>
    <div className="collection-toolbar"><div className="chips" role="group" aria-label="Bestand nach Zielfisch filtern">{(['all','perch','pike','zander'] as const).map(value=><button key={value} type="button" className={fishFilter===value?'selected':''} aria-pressed={fishFilter===value} onClick={()=>setFishFilter(value)}>{value==='all'?'Alle':fishLabel[value]}</button>)}</div><label className="search-field"><Icon name="search" size={18}/><span className="sr-only">Köder suchen</span><input type="search" placeholder="Köder suchen …" value={query} onChange={event=>setQuery(event.target.value)}/></label></div>
    {visibleGroups.map(group=><section className="inventory-species" aria-labelledby={`inventory-${group.fish}`} key={group.fish}><header><img src={`${import.meta.env.BASE_URL}assets/terrain/${group.fish}.webp`} alt=""/><div><span className="overline">ZIELFISCH</span><h2 id={`inventory-${group.fish}`}>{group.label}</h2><p>{group.description}</p></div></header><div className="inventory-options">{group.lures.filter(lure=>lure.label.toLocaleLowerCase('de').includes(query.trim().toLocaleLowerCase('de'))).map(lure=>{
      const item=inventory.find(entry=>entry.targetFish===group.fish&&entry.lureTypeId===lure.id)
      const hasAll=Boolean(item)&&lure.sizes.every(size=>item?.sizes?.includes(size))
      return <article className={item?'selected inventory-sized':''} key={lure.id}>
        <div className="inventory-title"><span className="inventory-check" aria-hidden="true">{item&&<Icon name="check" size={16}/>}</span><div><strong>{lure.label}</strong><small className="inventory-size-summary">{item?`Gespeichert: ${lure.sizes.filter(size=>item.sizes.includes(size)).map(size=>sizeNames[size]).join(', ')}`:'Keine Größe ausgewählt'}</small>{item?.migratedNeedsReview&&<small>Aus Altbestand übernommen · Größen prüfen</small>}</div></div>
        <div className="chips inventory-size-choices">
          <button type="button" className={`all-sizes${hasAll?' selected':''}`} aria-label={`${group.label} ${lure.label}: Alle Größen`} aria-pressed={hasAll} onClick={()=>toggleAllSizes(group.fish,lure.id)}>{hasAll&&<Icon name="check" size={16}/>}Alle Größen</button>
          {lure.sizes.map(size=>{const selected=item?.sizes?.includes(size)??false;const label=`${sizeNames[size]} · ${sizeLabelFor(lure,size)}`;return <button type="button" className={selected?'selected':''} aria-label={`${group.label} ${lure.label}: ${label}`} aria-pressed={selected} onClick={()=>toggleSize(group.fish,lure.id,size)} key={size}>{selected&&<Icon name="check" size={16}/>}<span>{label}</span></button>})}
        </div>
      </article>
    })}</div>{!group.lures.some(lure=>lure.label.toLocaleLowerCase('de').includes(query.trim().toLocaleLowerCase('de')))&&<p className="filter-empty">Keine Köder für „{query}“ gefunden.</p>}</section>)}
    {!hasResults&&<button className="secondary" onClick={()=>setQuery('')}>Suche zurücksetzen</button>}
    {context&&<div className="flow-action"><span role="status">{selectedForContext} {selectedForContext===1?'Köderprofil':'Köderprofile'} für {fishLabel[context.targetFish]} ausgewählt</span><Link className="primary" to={returnConditions?'/empfehlung':`/neu/${context.targetFish}`} state={context}>{returnConditions?'Auswahl übernehmen & zum Angelplan':'Auswahl übernehmen & weiter'} <Icon name="arrow-right"/></Link></div>}
  </section>
}
