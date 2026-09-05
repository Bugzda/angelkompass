import type { FishingSession } from '../../domain/models/types'
import { sessionStore } from './sessionStore'

export function SessionFeedback({ session, compact = false }: { session: FishingSession; compact?: boolean }) {
  const bites = session.feedback.filter(item => item.outcome === 'bite').length
  const catches = session.feedback.filter(item => item.outcome === 'catch').length
  const active = session.status === 'active'
  return <div className="session-feedback">
    <div className="feedback-summary" role="status"><span><strong>{bites}</strong> Bisse</span><span><strong>{catches}</strong> Fänge</span><span>{session.feedback.length} Rückmeldungen</span></div>
    {active && session.progress !== 'exhausted' && <fieldset className={compact ? 'water-feedback' : 'feedback'}><legend className="sr-only">Rückmeldung erfassen</legend><button onClick={() => sessionStore.addFeedback(session.id, 'bite')}>Biss</button><button onClick={() => sessionStore.addFeedback(session.id, 'catch')}>Fang</button><button onClick={() => sessionStore.addFeedback(session.id, 'no_success')}>Kein Erfolg →</button></fieldset>}
    {active && session.feedback.length > 0 && <button className="undo-feedback" onClick={() => sessionStore.undoFeedback(session.id)}>Letzte Rückmeldung rückgängig machen</button>}
  </div>
}
