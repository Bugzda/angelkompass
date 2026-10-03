import { useEffect, useRef, useState } from 'react'
import type { FeedbackOutcome, FishingSession } from '../../domain/models/types'
import { vibrate } from '../water/waterPreferences'
import { FeedbackDetailsForm } from './FeedbackDetailsForm'
import { sessionStore } from './sessionStore'

const haptics: Record<FeedbackOutcome, number | number[]> = { bite: 40, catch: [60, 40, 60], no_success: 25 }

export function SessionFeedback({ session, compact = false }: { session: FishingSession; compact?: boolean }) {
  const bites = session.feedback.filter(item => item.outcome === 'bite').length
  const catches = session.feedback.filter(item => item.outcome === 'catch').length
  const active = session.status === 'active'
  const [detailsId, setDetailsId] = useState<string>()
  // Only counters that changed since the last render get the short pop animation.
  const previous = useRef({ bites, catches })
  const pop = { bites: bites !== previous.current.bites, catches: catches !== previous.current.catches }
  useEffect(() => {
    previous.current = { bites, catches }
  }, [bites, catches])
  const details = session.feedback.find(item => item.id === detailsId)
  const record = (outcome: FeedbackOutcome) => {
    if (!sessionStore.addFeedback(session.id, outcome)) return
    vibrate(haptics[outcome])
    if (outcome === 'no_success') return
    const saved = sessionStore
      .getSnapshot()
      .find(item => item.id === session.id)
      ?.feedback.at(-1)
    setDetailsId(saved?.id)
  }
  return (
    <div className={`session-feedback${compact ? ' compact-feedback' : ''}`}>
      <div className="feedback-toolbar">
        <div className="feedback-summary" role="status">
          <span>
            <strong key={`b${bites}`} className={pop.bites ? 'pop' : undefined}>
              {bites}
            </strong>{' '}
            {bites === 1 ? 'Biss' : 'Bisse'}
          </span>
          <span>
            <strong key={`c${catches}`} className={pop.catches ? 'pop' : undefined}>
              {catches}
            </strong>{' '}
            {catches === 1 ? 'Fang' : 'Fänge'}
          </span>
        </div>
        {active && session.feedback.length > 0 && (
          <button
            className="undo-feedback"
            aria-label="Letzte Rückmeldung rückgängig machen"
            onClick={() => sessionStore.undoFeedback(session.id)}
          >
            Rückgängig
          </button>
        )}
      </div>
      {active && (
        <fieldset
          className={`${compact ? 'water-feedback' : 'feedback'}${session.progress === 'exhausted' ? ' ongoing-feedback' : ''}`}
        >
          <legend className="sr-only">Rückmeldung erfassen</legend>
          <button onClick={() => record('bite')}>Biss</button>
          <button onClick={() => record('catch')}>Fang</button>
          {session.progress !== 'exhausted' && (
            <button
              className="advance-step"
              aria-label={
                session.progress === 'move'
                  ? 'Ohne Kontakt → letzten Schritt beenden'
                  : 'Ohne Kontakt → nächster Schritt'
              }
              onClick={() => record('no_success')}
            >
              <span>Ohne Kontakt</span>
              <small>{session.progress === 'move' ? 'Schritt beenden →' : 'Nächster Schritt →'}</small>
            </button>
          )}
        </fieldset>
      )}
      {details && (
        <FeedbackDetailsForm sessionId={session.id} feedback={details} onDone={() => setDetailsId(undefined)} />
      )}
    </div>
  )
}
