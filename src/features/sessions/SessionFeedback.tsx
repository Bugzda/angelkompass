import type { FishingSession } from '../../domain/models/types'
import { sessionStore } from './sessionStore'

export function SessionFeedback({ session, compact = false }: { session: FishingSession; compact?: boolean }) {
  const bites = session.feedback.filter(item => item.outcome === 'bite').length
  const catches = session.feedback.filter(item => item.outcome === 'catch').length
  const active = session.status === 'active'
  return <div className={`session-feedback${compact ? ' compact-feedback' : ''}`}>
    <div className="feedback-toolbar">
      <div className="feedback-summary" role="status">
        <span><strong>{bites}</strong> {bites === 1 ? 'Biss' : 'Bisse'}</span>
        <span><strong>{catches}</strong> {catches === 1 ? 'Fang' : 'Fänge'}</span>
      </div>
      {active && session.feedback.length > 0 && <button className="undo-feedback" aria-label="Letzte Rückmeldung rückgängig machen" onClick={() => sessionStore.undoFeedback(session.id)}>Rückgängig</button>}
    </div>
    {active && session.progress !== 'exhausted' && <fieldset className={compact ? 'water-feedback' : 'feedback'}>
      <legend className="sr-only">Rückmeldung erfassen</legend>
      <button onClick={() => sessionStore.addFeedback(session.id, 'bite')}>Biss</button>
      <button onClick={() => sessionStore.addFeedback(session.id, 'catch')}>Fang</button>
      <button className="advance-step" aria-label={session.progress === 'move' ? 'Ohne Kontakt → letzten Schritt beenden' : 'Ohne Kontakt → nächster Schritt'} onClick={() => sessionStore.addFeedback(session.id, 'no_success')}>
        <span>Ohne Kontakt</span><small>{session.progress === 'move' ? 'Schritt beenden →' : 'Nächster Schritt →'}</small>
      </button>
    </fieldset>}
  </div>
}
