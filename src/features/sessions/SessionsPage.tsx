import { fishLabel } from '../../domain/species/profiles'
import { Link } from 'react-router-dom'
import { sessionStore } from './sessionStore'
import { useSessions } from './useSessions'
import { Icon } from '../../ui/components/Icon'
import { useState } from 'react'
import type { FishingSession, TargetFish } from '../../domain/models/types'
import { downloadSessions } from './sessionExport'

const date = (value: string) => new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

const feedbackSummary = (session: FishingSession) => {
  const bites = session.feedback.filter(item => item.outcome === 'bite').length
  const catches = session.feedback.filter(item => item.outcome === 'catch').length
  return `${bites} ${bites === 1 ? 'Biss' : 'Bisse'} · ${catches} ${catches === 1 ? 'Fang' : 'Fänge'}`
}

export function SessionsPage() {
  const { sessions, error } = useSessions()
  const [fish,setFish]=useState<TargetFish|'all'>('all')
  const [exportError,setExportError]=useState<string>()
  const filtered=sessions.filter(session=>fish==='all'||session.conditions.targetFish===fish)
  const bites=filtered.reduce((sum,session)=>sum+session.feedback.filter(item=>item.outcome==='bite').length,0)
  const catches=filtered.reduce((sum,session)=>sum+session.feedback.filter(item=>item.outcome==='catch').length,0)
  const exportAll=()=>{try{downloadSessions(sessions);setExportError(undefined)}catch{setExportError('Der Export konnte nicht heruntergeladen werden. Versuche es erneut. Deine Sessions bleiben gespeichert.')}}
  const remove = (id: string) => { if (window.confirm('Diese Session dauerhaft löschen?')) sessionStore.delete(id) }
  return <section className="page-shell sessions-page"><p className="eyebrow">DEIN LOGBUCH AM WASSER</p><h1>Deine Sessions.</h1><p className="lead">Jeder Versuch erzählt etwas. Hier bleiben deine Angelpläne, Bisse und Fänge auf diesem Gerät gespeichert.</p>
    {(error||exportError) && <p className="storage-error" role="alert">{error??exportError}</p>}
    {sessions.length>0&&<>
      <div className="collection-toolbar"><div className="chips" role="group" aria-label="Sessions nach Zielfisch filtern">{(['all','perch','pike','zander'] as const).map(value=><button key={value} aria-pressed={fish===value} className={fish===value?'selected':''} onClick={()=>setFish(value)}>{value==='all'?'Alle':fishLabel[value]}</button>)}</div><button className="secondary" onClick={exportAll}><Icon name="download" size={18}/>Alle Sessions exportieren</button></div>
      <dl className="logbook-stats" aria-label="Statistik der angezeigten Sessions"><div><dt>Sessions</dt><dd>{String(filtered.length).padStart(2,'0')}</dd></div><div><dt>Bisse</dt><dd>{String(bites).padStart(2,'0')}</dd></div><div><dt>Fänge</dt><dd>{String(catches).padStart(2,'0')}</dd></div></dl>
      <p className="collection-note">{filtered.length} {filtered.length===1?'Eintrag':'Einträge'} · Neueste zuerst <span>Export als JSON · alle Fischarten</span></p>
    </>}
    <div className="session-list">{sessions.length === 0 ? <div className="empty"><img src={`${import.meta.env.BASE_URL}assets/terrain/perch.webp`} alt=""/><h2>Noch kein Eintrag im Logbuch.</h2><p>Erstelle einen Angelplan und starte damit deine erste Session.</p><Link className="primary" to="/neu">Ersten Angelplan erstellen</Link></div> : filtered.length===0?<div className="empty"><h2>Noch keine {fishLabel[fish==='all'?'perch':fish]}-Session.</h2><p>Für diesen Zielfisch gibt es noch keinen Eintrag.</p><Link className="primary" to={`/neu/${fish}`}>Angelplan erstellen</Link></div>:filtered.map((session,index) => <article key={session.id}><span className="journal-index" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><Link to={`/session/${session.id}`}><div><strong>{fishLabel[session.conditions.targetFish]} · {session.recommendation.setup.lure.label}</strong><p>{session.recommendation.spot.spot.label}</p><small>{date(session.createdAt)} · {feedbackSummary(session)}</small></div><span className={`session-status ${session.status}`}>{session.status === 'active' ? 'Aktiv' : 'Abgeschlossen'}</span><Icon name="arrow-right"/></Link><button className="delete" aria-label="Session löschen" onClick={() => remove(session.id)}><Icon name="close"/></button></article>)}</div>
    <Link className="data-link" to="/daten"><Icon name="download" size={18}/><span>Köderbox und Logbuch sichern<small>Datensicherung & Wiederherstellung</small></span><Icon name="arrow-right" size={18}/></Link>
  </section>
}
