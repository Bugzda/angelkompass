import { Link, useParams } from 'react-router-dom'
import { CompactRecommendation } from '../recommendations/CompactRecommendation'
import { useSessions } from './useSessions'
import { SessionFeedback } from './SessionFeedback'

export function WaterCardPage() {
  const { id } = useParams()
  const { sessions, error } = useSessions()
  const session = sessions.find(item => item.id === id)
  if (!session) return <section className="page-shell empty-state"><h1>Session nicht gefunden</h1><p>Die Session wurde möglicherweise gelöscht.</p><Link className="primary" to="/verlauf">Zum Verlauf</Link></section>
  return <section className="water-view">{error&&<p className="storage-error" role="alert">{error}</p>}<CompactRecommendation recommendation={session.recommendation} fish={session.conditions.targetFish} progress={session.progress} completed={session.status==='completed'}/>
    <SessionFeedback session={session} compact/>
    <Link className="secondary full" to={`/session/${session.id}`}>← Zur Session</Link>
  </section>
}
