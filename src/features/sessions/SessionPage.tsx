import { SessionCompletion } from './SessionCompletion'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { FeedbackOutcome, FishingSession } from '../../domain/models/types'
import { sessionStore } from './sessionStore'
import { useSessions } from './useSessions'
import { Icon } from '../../ui/components/Icon'
import { presentationForDisplay } from '../../domain/engine/presentation'
import { SessionFeedback } from './SessionFeedback'

const outcomeLabels: Record<FeedbackOutcome, string> = { bite: 'Biss', catch: 'Fang', no_success: 'Kein Erfolg' }
const phaseOrder = ['initial', 'refine', 'move'] as const
const date = (value: string) => new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const conditionLabels: Record<string, string> = { spring: 'Frühling', summer: 'Sommer', autumn: 'Herbst', winter: 'Winter', dawn: 'Morgen', day: 'Tag', dusk: 'Abend', night: 'Nacht', unknown: 'Unbekannt', clear: 'Klar', slightly_turbid: 'Leicht trüb', turbid: 'Trüb', shallow: 'Flach', medium: 'Mittel', deep: 'Tief', cold: 'Bis 8 °C', cool: '9–12 °C', mild: '13–18 °C', warm: '19–23 °C', hot: 'Über 23 °C', bright: 'Hell', diffuse: 'Diffus', dark: 'Dunkel', none: 'Keine', edgeOrGaps: 'Kante/Lücken', dense: 'Sehr dicht', baitfish: 'Kleinfisch', huntingPerch: 'Jagende Barsche', pikeContact:'Hecht/Raubfischkontakt', zanderContact:'Zanderkontakt', surfaceActivity: 'Oberfläche', dropoff: 'Tiefenkante', hardCover:'Harte Deckung' }
const list = (values: string[]) => values.length ? values.map((value) => conditionLabels[value] ?? value).join(', ') : 'Keine'

function SessionDetails({ session }: { session: FishingSession }) {
  const navigate = useNavigate()
  const active = session.status === 'active'
  const restart = () => {
    if(sessionStore.complete(session.id))navigate(`/neu/${session.conditions.targetFish}`,{state:{...session.conditions,pikeSafetyConfirmed:session.conditions.targetFish==='pike'?false:undefined}})
  }
  const presentation=presentationForDisplay(session.recommendation.setup)
  return <>
    {!active&&<SessionCompletion session={session}/>}
    <div className="session-head"><div><span className="overline">GEWÄHLTE EMPFEHLUNG</span><h2>{session.recommendation.setup.lure.label}</h2><p>{session.recommendation.spot.spot.label} · Rang {session.recommendation.rank}</p></div><span className={`session-status ${session.status}`}>{active ? 'Aktiv' : 'Abgeschlossen'}</span></div>
    <Link className="primary water-card-link" to={`/session/${session.id}/karte`}>Am-Wasser-Karte öffnen <Icon name="arrow-right"/></Link>
    <div className="session-presentation"><div><span>Größe</span><strong>{presentation.sizeLabel}</strong></div><div><span>{presentation.weightKind==='lure-total'?'Ködergewicht':'Beschwerung'}</span><strong>{presentation.weightLabel}</strong></div><div><span>Montage</span><strong>{presentation.mounting}</strong></div><div><span>Führung</span><strong>{presentation.guidance}</strong></div></div>
    <dl className="condition-summary">
      <div><dt>Jahreszeit</dt><dd>{conditionLabels[session.conditions.season]}</dd></div>
      <div><dt>Tageszeit</dt><dd>{conditionLabels[session.conditions.timeOfDay]}</dd></div>
      <div><dt>Trübung</dt><dd>{conditionLabels[session.conditions.turbidity]}</dd></div>
      <div><dt>Tiefe</dt><dd>{conditionLabels[session.conditions.depth]}</dd></div>
      <div><dt>Temperatur</dt><dd>{conditionLabels[session.conditions.waterTemperature]}</dd></div>
      <div><dt>Licht</dt><dd>{conditionLabels[session.conditions.light]}</dd></div>
      <div><dt>Kraut</dt><dd>{conditionLabels[session.conditions.vegetation]}</dd></div>
      <div><dt>Aktivität</dt><dd>{session.conditions.activity.status === 'observed' ? list(session.conditions.activity.signs) : session.conditions.activity.status === 'none' ? 'Nichts sichtbar' : 'Nicht geprüft'}</dd></div>
      <div><dt>Struktur</dt><dd>{session.conditions.observedStructure.length?list(session.conditions.observedStructure):session.conditions.structureStatus==='none'?'Keine weitere Struktur':'Nicht geprüft'}</dd></div>
    </dl>
    <div className="attempts">{session.recommendation.switchPlan.map((step, index) => {
      const currentIndex = session.progress === 'exhausted' ? phaseOrder.length : phaseOrder.indexOf(session.progress)
      const state = index < currentIndex ? 'done' : active && index === currentIndex ? 'active-attempt' : ''
      return <article className={state} aria-current={active&&index===currentIndex?'step':undefined} key={step.phase}><span className="step">0{index + 1}</span><div><h3>{step.title}</h3><p>{step.change}</p><small><b>{step.limit}</b> · {step.reason}</small></div></article>
    })}</div>
    <SessionFeedback session={session}/>
    {active && session.progress === 'exhausted' && <aside className="notice"><strong>Plan ausgeschöpft</strong><p>Alle drei Wechselphasen wurden ohne Erfolg durchlaufen. Beende die Session oder erfasse neue Bedingungen.</p></aside>}
    {session.feedback.length > 0 && <div className="feedback-log"><h2>Rückmeldungen</h2>{[...session.feedback].reverse().map((item) => <p key={item.id}><strong>{outcomeLabels[item.outcome]}</strong><span>{date(item.createdAt)} · Phase {phaseOrder.indexOf(item.phase) + 1}</span></p>)}</div>}
    {active && <div className="session-actions"><button className="secondary" onClick={() => sessionStore.complete(session.id)}>Session beenden</button>{session.progress === 'exhausted' && <button className="primary" onClick={restart}>Beenden & neu planen</button>}</div>}
  </>
}

export function SessionPage() {
  const { id } = useParams()
  const { sessions, error } = useSessions()
  const session = sessions.find((item) => item.id === id)
  if (!session) return <section className="page-shell empty-state"><h1>Session nicht gefunden</h1>{error&&<p className="storage-error" role="alert">{error} <Link to="/daten">Daten sichern →</Link></p>}<p>Der Eintrag wurde möglicherweise gelöscht oder ist auf diesem Gerät nicht verfügbar.</p><Link className="primary" to="/verlauf">Zum Verlauf</Link></section>
  return <section className="page-shell session-page"><p className="eyebrow">SESSION VOM {date(session.createdAt).toUpperCase()}</p><h1>Dein Versuch am Wasser.</h1>{error && <p className="storage-error" role="alert">{error}</p>}<SessionDetails session={session} /></section>
}
