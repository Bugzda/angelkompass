import { Link, useParams } from 'react-router-dom'
import { CompactRecommendation } from '../recommendations/CompactRecommendation'
import { useSessions } from './useSessions'
import { sessionStore } from './sessionStore'
import { SessionCompletion } from './SessionCompletion'
import { SessionFeedback } from './SessionFeedback'
import { StepClock } from '../water/StepClock'
import { WaterTools } from '../water/WaterTools'
import { useWaterPreferences } from '../water/waterPreferences'

export function WaterCardPage() {
  const { id } = useParams()
  const { sessions, error } = useSessions()
  const session = sessions.find(item => item.id === id)
  const { largeButtons } = useWaterPreferences()
  if (!session)
    return (
      <section className="page-shell empty-state">
        <h1>Session nicht gefunden</h1>
        {error && (
          <p className="storage-error" role="alert">
            {error} <Link to="/daten">Daten sichern →</Link>
          </p>
        )}
        <p>Die Session wurde möglicherweise gelöscht.</p>
        <Link className="primary" to="/verlauf">
          Zum Logbuch
        </Link>
      </section>
    )
  return (
    <section className={`water-view${largeButtons && session.status === 'active' ? ' large-feedback' : ''}`}>
      {error && (
        <p className="storage-error" role="alert">
          {error}
        </p>
      )}
      <CompactRecommendation
        recommendation={session.recommendation}
        fish={session.conditions.targetFish}
        progress={session.progress}
        completed={session.status === 'completed'}
        stepAddon={session.status === 'active' ? <StepClock session={session} /> : undefined}
      />
      {session.status === 'completed' ? (
        <SessionCompletion session={session} />
      ) : (
        <>
          {!error && (
            <p className="save-status">
              Angelplan auf diesem Gerät gespeichert · Rückmeldungen werden direkt gesichert.
            </p>
          )}
          <WaterTools active />
          <SessionFeedback session={session} compact />
          <div className="water-actions">
            <button className="secondary" onClick={() => sessionStore.complete(session.id)}>
              Session beenden
            </button>
          </div>
        </>
      )}
      <Link className="secondary full" to={`/session/${session.id}`}>
        Sessiondetails & Rückmeldungen
      </Link>
    </section>
  )
}
