import { Link } from 'react-router-dom'
import { Icon } from '../../ui/components/Icon'
import { useSessions } from '../sessions/useSessions'
import { useInventory } from '../inventory/useInventory'

const species=[
  {id:'perch',label:'Barsch',image:`${import.meta.env.BASE_URL}assets/terrain/perch.webp`,to:'/neu/perch'},
  {id:'pike',label:'Hecht',image:`${import.meta.env.BASE_URL}assets/terrain/pike.webp`,to:'/neu/pike'},
] as const

export function HomePage() {
  const { activeSession, latestSession } = useSessions()
  const { inventory } = useInventory()
  const featured = activeSession ?? latestSession
  const bites = featured?.feedback.filter(item=>item.outcome==='bite').length ?? 0
  const catches = featured?.feedback.filter(item=>item.outcome==='catch').length ?? 0
  const phase=featured&&activeSession?featured.recommendation.switchPlan.find(step=>step.phase===featured.progress)?.title??'Plan ausgeschöpft':undefined
  return <section className="home page-wide">
    <article className="terrain-hero">
      <picture className="hero-media" aria-hidden="true"><source srcSet={`${import.meta.env.BASE_URL}assets/terrain/lake-morning.avif`} type="image/avif"/><img src={`${import.meta.env.BASE_URL}assets/terrain/lake-morning.webp`} alt=""/></picture>
      <div className="hero-shade" aria-hidden="true"/>
      <div className="hero-copy"><p className="eyebrow">RAUBFISCH · SEE · VOM UFER</p><h1>Dein Plan für<br/> die ersten Würfe.</h1><p>Beobachte die Situation am See. Angelkompass übersetzt sie in einen klaren, nachvollziehbaren Angelplan.</p><Link className="primary hero-action" to={activeSession?`/session/${activeSession.id}/karte`:'/neu'}>{activeSession?'Zum aktiven Angelplan':'Session starten'} <Icon name="arrow-right"/></Link><span className="hero-caption">Deine Beobachtung. Deine Köder. Dein nächster Schritt.</span></div>
      <nav className="species-rail" aria-label="Zielfische">
        {species.map(item=><Link key={item.id} to={item.to} className="species-chip"><img src={item.image} alt=""/><span>{item.label}</span></Link>)}
        <div className="species-chip coming-soon" aria-disabled="true"><img src={`${import.meta.env.BASE_URL}assets/terrain/zander.webp`} alt=""/><span>Zander<small>Bald verfügbar</small></span></div>
      </nav>
    </article>
    {featured&&<article className={`home-session ${activeSession?'active-session':''}`}><div><span className="overline">{activeSession?'AKTIVE SESSION':'LETZTE SESSION'}</span><h2>{featured.conditions.targetFish==='pike'?'Hecht':'Barsch'} · {featured.recommendation.setup.lure.label}</h2><p>{featured.recommendation.spot.spot.label}{activeSession?` · ${phase}`:` · ${bites} Bisse · ${catches} Fänge`}</p></div><Link className="session-resume" to={`/session/${featured.id}`}>{activeSession?'Session fortsetzen':'Ergebnis ansehen'}<Icon name="arrow-right"/></Link></article>}
    <div className="home-shortcuts"><Link to="/bestand"><span className="shortcut-icon"><Icon name="inventory"/></span><div><span className="overline">DEINE KÖDERBOX</span><h2>{inventory.length?`${inventory.length} Köderprofile bereit`:'Was hast du dabei?'}</h2><p>{inventory.length?'Bestand prüfen und Größen ergänzen.':'Markiere deine Köder für einen passenden Plan.'}</p></div><Icon name="arrow-right"/></Link><Link to="/verlauf"><span className="shortcut-icon"><Icon name="history"/></span><div><span className="overline">DEIN LOGBUCH</span><h2>Jeder Versuch zählt.</h2><p>Angelpläne, Bisse und Fänge im Überblick.</p></div><Icon name="arrow-right"/></Link></div>
    <article className="notice home-notice"><strong>Entscheidungshilfe, keine Fanggarantie.</strong><p>Beachte lokale Gewässerordnungen, Schonzeiten und sichere Uferbereiche.</p></article>
  </section>
}
