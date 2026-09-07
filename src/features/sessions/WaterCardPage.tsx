import { Link, useParams } from 'react-router-dom'
import { CompactRecommendation } from '../recommendations/CompactRecommendation'
import { useSessions } from './useSessions'
import { sessionStore } from './sessionStore'
import { SessionCompletion } from './SessionCompletion'
import { SessionFeedback } from './SessionFeedback'

export function WaterCardPage() {
  const { id } = useParams()
  const { sessions, error } = useSessions()
  const session = sessions.find(item => item.id === id)
  if (!session) return <section className="page-shell empty-state"><h1>Session nicht gefunden</h1>{error&&<p className="storage-error" role="alert">{error} <Link to="/daten">Daten sichern →</Link></p>}<p>Die Session wurde möglicherweise gelöscht.</p><Link className="primary" to="/verlauf">Zum Verlauf</Link></section>
  return <section className="water-view">{error&&<p className="storage-error" role="alert">{error}</p>}<CompactRecommendation recommendation={session.recommendation} fish={session.conditions.targetFish} progress={session.progress} completed={session.status==='completed'}/>
    {session.status==='completed'?<SessionCompletion session={session}/>:<>
      {!error&&<p className="save-status">Angelplan auf diesem Gerät gespeichert · Rückmeldungen werden direkt gesichert.</p>}
      <SessionFeedback session={session} compact/>
      {session.progress==='exhausted'&&<aside className="notice"><strong>Alle Schritte ausprobiert.</strong><p>Schließe den Versuch ab und nutze deine Beobachtungen für den nächsten Plan.</p></aside>}
      <div className="water-actions"><button className="secondary" onClick={()=>sessionStore.complete(session.id)}>Session beenden</button></div>
    </>}
    <Link className="secondary full" to={`/session/${session.id}`}>← Zur Session</Link>
  </section>
}
