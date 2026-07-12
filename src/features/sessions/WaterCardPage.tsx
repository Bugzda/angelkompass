import { Link, useParams } from 'react-router-dom'
import type { FeedbackOutcome } from '../../domain/models/types'
import { CompactRecommendation } from '../recommendations/CompactRecommendation'
import { sessionStore } from './sessionStore'
import { useSessions } from './useSessions'

export function WaterCardPage() {
  const { id } = useParams()
  const { sessions } = useSessions()
  const session = sessions.find(item => item.id === id)
  if (!session) return <section className="page-shell empty-state"><h1>Session nicht gefunden</h1><p>Die Session wurde möglicherweise gelöscht.</p><Link className="primary" to="/verlauf">Zum Verlauf</Link></section>
  const feedback = (outcome: FeedbackOutcome) => sessionStore.addFeedback(session.id, outcome)
  const canFeedback = session.status === 'active' && session.progress !== 'exhausted'
  return <section className="water-view"><CompactRecommendation recommendation={session.recommendation} fish={session.conditions.targetFish} progress={session.progress}/>
    {canFeedback&&<fieldset className="water-feedback"><legend>Rückmeldung erfassen</legend><button onClick={()=>feedback('bite')}>Biss</button><button onClick={()=>feedback('catch')}>Fang</button><button onClick={()=>feedback('no_success')}>Kein Erfolg →</button></fieldset>}
    <Link className="secondary full" to={`/session/${session.id}`}>← Zur Session</Link>
  </section>
}
