import type { Recommendation, SessionProgress, TargetFish } from '../../domain/models/types'
import { presentationForDisplay } from '../../domain/engine/presentation'

export function CompactRecommendation({ recommendation, fish, progress = 'initial' }: { recommendation: Recommendation; fish: TargetFish; progress?: SessionProgress }) {
  const current = recommendation.switchPlan.find(step => step.phase === progress)
  const presentation=presentationForDisplay(recommendation.setup)
  const measurements=recommendation.setup.lure.material==='metal'
    ?[{label:'Ködergewicht',value:presentation.weightLabel},{label:'Länge',value:presentation.sizeLabel}]
    :[{label:'Größe',value:presentation.sizeLabel},{label:presentation.weightKind==='lure-total'?'Ködergewicht':'Beschwerung',value:presentation.weightLabel}]
  return <article className="water-card">
    <div className="water-contours" aria-hidden="true"/><img className="water-fish" src={`${import.meta.env.BASE_URL}assets/terrain/${fish==='pike'?'pike':'perch'}.webp`} alt=""/>
    <div className="water-heading"><span className="overline">{fish==='pike'?'HECHT':'BARSCH'} · RANG {recommendation.rank}</span><h1>{recommendation.setup.lure.label}</h1><p className="water-spot">{recommendation.spot.spot.label}</p></div>
    <div className="water-specs">{measurements.map(item=><span key={item.label}><small>{item.label}</small>{item.value}</span>)}<span><small>Farbe</small>{recommendation.colorGuidance.baseLabel??recommendation.colorGuidance.familyLabel}</span></div>
    <section><h2>Montage</h2><p>{presentation.mounting}</p></section>
    <section><h2>Führung</h2><p>{presentation.guidance}</p></section>
    <section className="current-step"><span className="overline">{current?'JETZT':'PLAN BEENDET'}</span><h2>{current?.title??'Alle Schritte ausgeschöpft'}</h2><p>{current?.change??'Session beenden oder neue Bedingungen erfassen.'}</p>{current&&<small>{current.limit}</small>}</section>
  </article>
}
