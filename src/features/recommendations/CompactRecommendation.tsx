import { fishLabel } from '../../domain/species/profiles'
import type { Recommendation, SessionProgress, TargetFish } from '../../domain/models/types'
import { presentationForDisplay } from '../../domain/engine/presentation'

export function CompactRecommendation({ recommendation, fish, progress = 'initial', completed = false }: { recommendation: Recommendation; fish: TargetFish; progress?: SessionProgress; completed?: boolean }) {
  const current = recommendation.switchPlan.find(step => step.phase === progress)
  const presentation=presentationForDisplay(recommendation.setup)
  const measurements=recommendation.setup.lure.material==='metal'
    ?[{label:'Ködergewicht',value:presentation.weightLabel},{label:'Länge',value:presentation.sizeLabel}]
    :[{label:'Größe',value:presentation.sizeLabel},{label:presentation.weightKind==='lure-total'?'Ködergewicht':'Beschwerung',value:presentation.weightLabel}]
  return <article className="water-card">
    <div className="water-contours" aria-hidden="true"/><img className="water-fish" src={`${import.meta.env.BASE_URL}assets/terrain/${fish}.webp`} alt=""/>
    <div className="water-heading"><span className="overline">{fishLabel[fish].toUpperCase()} · RANG {recommendation.rank}</span><h1>{recommendation.setup.lure.label}</h1><p className="water-spot">{recommendation.spot.spot.label}</p></div>
    <div className="water-specs">{measurements.map(item=><span key={item.label}><small>{item.label}</small>{item.value}</span>)}<span><small>Farbe</small>{recommendation.colorGuidance.baseLabel??recommendation.colorGuidance.familyLabel}</span></div>
    <section><h2>Montage</h2><p>{presentation.mounting}</p></section>
    <section><h2>Führung</h2><p>{presentation.guidance}</p></section>
    <ol role="list" className="water-progress" aria-label="Wechselplan">{recommendation.switchPlan.map((step,index)=><li key={step.phase} className={!completed&&step.phase===progress?'current':''} aria-current={!completed&&step.phase===progress?'step':undefined}><span>0{index+1}</span>{step.title}</li>)}</ol>
    <section className="current-step" aria-live="polite" aria-atomic="true"><span className="overline">{completed?'SESSION ABGESCHLOSSEN':current?'JETZT':'PLAN BEENDET'}</span><h2>{completed?'Dein gespeicherter Angelplan':current?.title??'Alle Schritte ausgeschöpft'}</h2><p>{completed?'Dein Angelplan bleibt hier als Rückblick gespeichert.':current?.change??'Session beenden oder neue Bedingungen erfassen.'}</p>{current&&!completed&&<small>{current.limit}</small>}</section>
  </article>
}
