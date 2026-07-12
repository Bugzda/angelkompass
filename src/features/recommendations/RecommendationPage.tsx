import { Link,useLocation } from 'react-router-dom'
import { createRecommendationDecision } from '../../domain/engine/scoring'
import type { Conditions,ConfidenceMetric,Recommendation } from '../../domain/models/types'
import { useInventory } from '../inventory/useInventory'

const labels:Record<string,string>={small:'3–5 cm',medium:'5–8 cm',large:'8–12 cm',natural:'Naturdekor',contrast:'Dunkel/kontrastreich',transparent:'Transparent',ultralight:'Ultraleicht',light:'Leicht',heavy:'Schwer'}
const confidenceLabel=(level:ConfidenceMetric['level'])=>level==='high'?'Hoch':level==='medium'?'Mittel':'Niedrig'
function Summary({recommendation,label}:{recommendation:Recommendation;label:string}){return <article className="practical-summary"><span className="overline">{label}</span><h2>{recommendation.setup.lure.label}</h2><p>{recommendation.spot.spot.label} · {labels[recommendation.setup.size]} · {labels[recommendation.setup.color]}</p></article>}
function Confidence({title,metric}:{title:string;metric:ConfidenceMetric}){return <div className="confidence-metric"><span>{title}</span><strong className={`confidence ${metric.level}`}>{confidenceLabel(metric.level)} · {metric.value}%</strong><small>{metric.explanation}</small></div>}

export function RecommendationPage(){const conditions=useLocation().state as Conditions|null;const{inventory}=useInventory();if(!conditions)return <section><h1>Keine Session vorhanden</h1><p>Erfasse zuerst die Bedingungen am See.</p><Link className="primary" to="/neu">Session starten</Link></section>;const decision=createRecommendationDecision(conditions,inventory);return <section>
  <p className="eyebrow">DEIN PLAN AM SEE</p><h1>Fachlich bewertet. Praktisch gefiltert.</h1><p className="lead">Die Rangfolge entsteht ausschließlich aus den Bedingungen. Dein Bestand wird erst danach berücksichtigt.</p>
  {decision.hotWaterWarning&&<aside className="heat-warning"><strong>Hinweis bei sehr warmem Wasser</strong><p>{decision.hotWaterWarning}</p></aside>}
  <div className="practical-grid">{decision.practicalPrimary?<Summary recommendation={decision.practicalPrimary} label="BESTE VORHANDENE OPTION"/>:<article className="practical-summary warning"><span className="overline">BESTAND LEER</span><h2>Keine praktische Empfehlung</h2><p>Markiere zuerst mindestens einen Köder als vorhanden.</p></article>}{decision.bestMissing&&<Summary recommendation={decision.bestMissing} label="BESTE FEHLENDE OPTION"/>}</div>
  {decision.suitabilityWarning&&<p className="suitability-warning"><strong>Eignungshinweis:</strong> {decision.suitabilityWarning} Nutze die vorhandene Option bewusst als Kompromiss.</p>}<Link className="inventory-link" to="/bestand">Persönlichen Bestand bearbeiten →</Link>
  <h2 className="ranking-title">Unveränderte fachliche Top 3</h2><div className="recommendation-list">{decision.expertRanking.map(recommendation=><article className="recommendation-card" key={`${recommendation.spot.spot.id}-${recommendation.setup.lure.id}`}><div className="recommendation-rank">0{recommendation.rank}</div><div className="recommendation-content">
    <div className="card-title"><div><span className="overline">{recommendation.spot.spot.label}</span><h2>{recommendation.setup.lure.label}</h2></div></div>
    <div className="confidence-grid"><Confidence title="Datenlage" metric={recommendation.inputCoverage}/><Confidence title="Regel-Evidenz" metric={recommendation.evidenceQuality}/></div>
    <div className="specs"><span>{labels[recommendation.setup.size]}</span><span>{labels[recommendation.setup.color]}</span><span>{labels[recommendation.setup.weight]??'Mittel'}</span></div><p><strong>Montage:</strong> {recommendation.setup.lure.mounting}</p><p><strong>Führung:</strong> {recommendation.setup.lure.guidance}</p>
    <div className="reason-box"><strong>Warum?</strong><ul>{recommendation.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul></div>
    <div className="switch-plan"><strong>Wenn nichts beißt</strong>{recommendation.switchPlan.map((step,index)=><div className="switch-step" key={step.phase}><span>0{index+1}</span><div><h3>{step.title}</h3><p>{step.change}</p><small><b>{step.limit}</b> · {step.reason}</small></div></div>)}</div>
  </div></article>)}</div><Link className="secondary full" to="/neu">Bedingungen ändern</Link>
</section>}
