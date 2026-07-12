import { Link } from 'react-router-dom'
import { sessionStore } from './sessionStore'
import { useSessions } from './useSessions'
import { Icon } from '../../ui/components/Icon'

const date = (value: string) => new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

export function SessionsPage() {
  const { sessions, error } = useSessions()
  const remove = (id: string) => { if (window.confirm('Diese Session dauerhaft löschen?')) sessionStore.delete(id) }
  return <section className="page-shell sessions-page"><p className="eyebrow">LOKALES PROTOKOLL</p><h1>Deine Sessions.</h1><p className="lead">Nur auf diesem Gerät gespeichert. Neueste Sessions stehen oben.</p>
    {error && <p className="storage-error">{error}</p>}
    <div className="session-list">{sessions.length === 0 ? <div className="empty"><img src={`${import.meta.env.BASE_URL}assets/terrain/perch.webp`} alt=""/><h2>Noch kein Eintrag im Logbuch.</h2><p>Starte deine erste Session und speichere den gewählten Angelplan.</p><Link className="primary" to="/neu">Erste Session starten</Link></div> : sessions.map((session,index) => <article key={session.id}><span className="journal-index" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><Link to={`/session/${session.id}`}><div><strong>{session.conditions.targetFish==='pike'?'Hecht':'Barsch'} · {session.recommendation.setup.lure.label}</strong><p>{session.recommendation.spot.spot.label} · {date(session.createdAt)} · {session.feedback.length} Rückmeldungen</p></div><span className={`session-status ${session.status}`}>{session.status === 'active' ? 'Aktiv' : 'Abgeschlossen'}</span><Icon name="arrow-right"/></Link><button className="delete" aria-label="Session löschen" onClick={() => remove(session.id)}><Icon name="close"/></button></article>)}</div>
  </section>
}
