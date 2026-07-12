import { Link } from 'react-router-dom'
import { sessionStore } from './sessionStore'
import { useSessions } from './useSessions'

const date = (value: string) => new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

export function SessionsPage() {
  const { sessions, error } = useSessions()
  const remove = (id: string) => { if (window.confirm('Diese Session dauerhaft löschen?')) sessionStore.delete(id) }
  return <section><p className="eyebrow">LOKALES PROTOKOLL</p><h1>Deine Sessions.</h1><p className="lead">Nur auf diesem Gerät gespeichert. Neueste Sessions stehen oben.</p>
    {error && <p className="storage-error">{error}</p>}
    <div className="session-list">{sessions.length === 0 ? <p className="empty">Noch keine Session gespeichert.</p> : sessions.map((session) => <article key={session.id}><Link to={`/session/${session.id}`}><div><strong>{session.conditions.targetFish==='pike'?'Hecht':'Barsch'} · {session.recommendation.setup.lure.label} · {session.recommendation.spot.spot.label}</strong><p>{date(session.createdAt)} · {session.feedback.length} Rückmeldungen</p></div><span>{session.status === 'active' ? 'Aktiv' : 'Abgeschlossen'} →</span></Link><button className="delete" aria-label="Session löschen" onClick={() => remove(session.id)}>×</button></article>)}</div>
  </section>
}
