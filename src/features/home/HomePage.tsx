import { Link } from 'react-router-dom'
import { useSessions } from '../sessions/useSessions'

export function HomePage() {
  const { activeSession, latestSession } = useSessions()
  const featured = activeSession ?? latestSession
  const bites = featured?.feedback.filter(item=>item.outcome==='bite').length ?? 0
  const catches = featured?.feedback.filter(item=>item.outcome==='catch').length ?? 0
  return <section className="home">
    <div className="hero">
      <p className="eyebrow">BARSCH & HECHT · SEE · VOM UFER</p>
      <h1>Ein klarer Plan für deine ersten Würfe.</h1>
      <p>Wähle Barsch oder Hecht und beschreibe die Situation am See. Angelkompass erstellt einen festen, nachvollziehbaren Plan.</p>
      <Link className="primary big" to="/neu">Session starten <span>→</span></Link>
    </div>
    {featured&&<article className={`home-session ${activeSession?'active-session':''}`}><span className="overline">{activeSession?'AKTIVE SESSION':'LETZTE SESSION'}</span><h2>{featured.conditions.targetFish==='pike'?'Hecht':'Barsch'} · {featured.recommendation.setup.lure.label}</h2><p>{featured.recommendation.spot.spot.label}{activeSession?` · ${featured.recommendation.switchPlan.find(step=>step.phase===featured.progress)?.title??'Plan ausgeschöpft'}`:` · ${bites} Bisse · ${catches} Fänge`}</p><Link className="secondary" to={`/session/${featured.id}`}>{activeSession?'Session fortsetzen':'Ergebnis ansehen'} →</Link></article>}
    <article className="notice"><strong>Entscheidungshilfe, keine Fanggarantie.</strong><p>Beachte lokale Gewässerordnungen, Schonzeiten und sichere Uferbereiche.</p></article>
  </section>
}
