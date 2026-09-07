import { repeatConditions } from '../sessions/SessionCompletion'
import { fishLabel } from '../../domain/species/profiles'
import { Link } from 'react-router-dom'
import { Icon } from '../../ui/components/Icon'
import { useSessions } from '../sessions/useSessions'
import { useInventory } from '../inventory/useInventory'

const species=[
  {id:'perch',label:'Barsch',image:`${import.meta.env.BASE_URL}assets/terrain/perch.webp`,to:'/neu/perch'},
  {id:'pike',label:'Hecht',image:`${import.meta.env.BASE_URL}assets/terrain/pike.webp`,to:'/neu/pike'},
  {id:'zander',label:'Zander',image:`${import.meta.env.BASE_URL}assets/terrain/zander.webp`,to:'/neu/zander'},
] as const

export function HomePage() {
  const { activeSession, latestSession, error: sessionError } = useSessions()
  const { inventory, error:inventoryError } = useInventory()
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
      </nav>
    </article>
    {!featured&&<section className="first-plan" aria-labelledby="first-plan-heading"><div><span className="overline">DEIN ERSTER ANGELPLAN</span><h2 id="first-plan-heading">In drei Schritten ans Wasser.</h2><p>Du brauchst keine vollständigen Messwerte. Was du nicht weißt, bleibt offen.</p></div><ol role="list"><li><span>01</span><div><strong>Zielfisch wählen</strong><p>Barsch, Hecht oder Zander am See.</p></div></li><li><span>02</span><div><strong>Beobachten & Köder wählen</strong><p>Situation einordnen und markieren, was du dabei hast.</p></div></li><li><span>03</span><div><strong>Angelplan starten</strong><p>Montage, Führung und nächster Schritt auf einer Karte.</p></div></li></ol></section>}
    {(inventoryError||sessionError)&&<p className="storage-error" role="alert">{inventoryError??sessionError} <Link to="/daten">Daten sichern →</Link></p>}
    {featured&&<article className={`home-session ${activeSession?'active-session':''}`}><div><span className="overline">{activeSession?'AKTIVE SESSION':'LETZTE SESSION'}</span><h2>{fishLabel[featured.conditions.targetFish]} · {featured.recommendation.setup.lure.label}</h2><p>{featured.recommendation.spot.spot.label}{activeSession?` · ${phase}`:` · ${bites} ${bites===1?'Biss':'Bisse'} · ${catches} ${catches===1?'Fang':'Fänge'}`}</p></div><Link className="session-resume" to={activeSession?`/session/${featured.id}/karte`:`/session/${featured.id}`}>{activeSession?'Session fortsetzen':'Ergebnis ansehen'}<Icon name="arrow-right"/></Link></article>}
    {!activeSession&&latestSession&&<section className="repeat-plan"><div><strong>Noch einmal auf {fishLabel[latestSession.conditions.targetFish]}?</strong><p>Letzte Bedingungen übernehmen, kurz prüfen und neu planen.</p></div><Link className="secondary" to={`/neu/${latestSession.conditions.targetFish}`} state={repeatConditions(latestSession)}>Letzten Plan als Vorlage nutzen <Icon name="arrow-right"/></Link></section>}
    <div className="home-shortcuts"><Link to="/bestand"><span className="shortcut-icon"><Icon name="inventory"/></span><div><span className="overline">DEINE KÖDERBOX</span><h2>{inventory.length?`${inventory.length} ${inventory.length===1?'Köderprofil':'Köderprofile'} bereit`:'Was hast du dabei?'}</h2><p>{inventory.length?'Bestand prüfen und Größen ergänzen.':'Markiere deine Köder für einen passenden Plan.'}</p></div><Icon name="arrow-right"/></Link><Link to="/verlauf"><span className="shortcut-icon"><Icon name="history"/></span><div><span className="overline">DEIN LOGBUCH</span><h2>Jeder Versuch zählt.</h2><p>Angelpläne, Bisse und Fänge im Überblick.</p></div><Icon name="arrow-right"/></Link></div>
    <article className="notice home-notice"><strong>Entscheidungshilfe, keine Fanggarantie.</strong><p>Beachte lokale Gewässerordnungen, Schonzeiten und sichere Uferbereiche.</p></article>
  </section>
}
