import { Link } from 'react-router-dom'
import { Icon } from '../../ui/components/Icon'
import { useSessions } from '../sessions/useSessions'

const species=[
  {id:'perch',label:'Barsch',image:`${import.meta.env.BASE_URL}assets/terrain/perch.webp`,to:'/neu/perch'},
  {id:'pike',label:'Hecht',image:`${import.meta.env.BASE_URL}assets/terrain/pike.webp`,to:'/neu/pike'},
] as const

export function HomePage() {
  const { activeSession, latestSession } = useSessions()
  const featured = activeSession ?? latestSession
  const bites = featured?.feedback.filter(item=>item.outcome==='bite').length ?? 0
  const catches = featured?.feedback.filter(item=>item.outcome==='catch').length ?? 0
  const phase=featured&&activeSession?featured.recommendation.switchPlan.find(step=>step.phase===featured.progress)?.title??'Plan ausgeschöpft':undefined
  return <section className="home page-wide">
    <article className="terrain-hero">
      <picture className="hero-media" aria-hidden="true"><source srcSet={`${import.meta.env.BASE_URL}assets/terrain/lake-morning.avif`} type="image/avif"/><img src={`${import.meta.env.BASE_URL}assets/terrain/lake-morning.webp`} alt=""/></picture>
      <div className="hero-shade" aria-hidden="true"/>
      <div className="hero-copy"><p className="eyebrow">RAUBFISCH · SEE · VOM UFER</p><h1>Dein Plan für die ersten Würfe.</h1><p>Beobachte die Situation am See. Angelkompass übersetzt sie in einen klaren, nachvollziehbaren Angelplan.</p><Link className="primary hero-action" to="/neu">Session starten <Icon name="arrow-right"/></Link></div>
      <nav className="species-rail" aria-label="Zielfische">
        {species.map(item=><Link key={item.id} to={item.to} className="species-chip"><img src={item.image} alt=""/><span>{item.label}</span></Link>)}
        <div className="species-chip coming-soon" aria-disabled="true"><img src={`${import.meta.env.BASE_URL}assets/terrain/zander.webp`} alt=""/><span>Zander<small>Bald verfügbar</small></span></div>
      </nav>
    </article>
    {featured&&<article className={`home-session ${activeSession?'active-session':''}`}><div><span className="overline">{activeSession?'AKTIVE SESSION':'LETZTE SESSION'}</span><h2>{featured.conditions.targetFish==='pike'?'Hecht':'Barsch'} · {featured.recommendation.setup.lure.label}</h2><p>{featured.recommendation.spot.spot.label}{activeSession?` · ${phase}`:` · ${bites} Bisse · ${catches} Fänge`}</p></div><Link className="session-resume" to={`/session/${featured.id}`}>{activeSession?'Session fortsetzen':'Ergebnis ansehen'}<Icon name="arrow-right"/></Link></article>}
    <article className="notice home-notice"><strong>Entscheidungshilfe, keine Fanggarantie.</strong><p>Beachte lokale Gewässerordnungen, Schonzeiten und sichere Uferbereiche.</p></article>
  </section>
}
