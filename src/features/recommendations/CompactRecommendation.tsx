import type { Recommendation, SessionProgress, TargetFish } from '../../domain/models/types'

const labels: Record<string,string> = { small:'3–5 cm', medium:'5–8 cm', large:'8–12 cm', ultralight:'Ultraleicht', light:'Leicht', heavy:'Schwer' }

export function CompactRecommendation({ recommendation, fish, progress = 'initial' }: { recommendation: Recommendation; fish: TargetFish; progress?: SessionProgress }) {
  const current = recommendation.switchPlan.find(step => step.phase === progress)
  return <article className="water-card">
    <div className="water-contours" aria-hidden="true"/><img className="water-fish" src={`${import.meta.env.BASE_URL}assets/terrain/${fish==='pike'?'pike':'perch'}.webp`} alt=""/>
    <div className="water-heading"><span className="overline">{fish==='pike'?'HECHT':'BARSCH'} · RANG {recommendation.rank}</span><h1>{recommendation.setup.lure.label}</h1><p className="water-spot">{recommendation.spot.spot.label}</p></div>
    <div className="water-specs"><span><small>Größe</small>{labels[recommendation.setup.size]}</span><span><small>Gewicht</small>{labels[recommendation.setup.weight]??'Mittel'}</span><span><small>Farbe</small>{recommendation.colorGuidance.familyLabel}</span></div>
    <section><h2>Montage</h2><p>{recommendation.setup.lure.mounting}</p></section>
    <section><h2>Führung</h2><p>{recommendation.setup.lure.guidance}</p></section>
    <section className="current-step"><span className="overline">{current?'JETZT':'PLAN BEENDET'}</span><h2>{current?.title??'Alle Schritte ausgeschöpft'}</h2><p>{current?.change??'Session beenden oder neue Bedingungen erfassen.'}</p>{current&&<small>{current.limit}</small>}</section>
  </article>
}
