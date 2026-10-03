import { Link } from 'react-router-dom'
import type { FishingSession } from '../../domain/models/types'
import { fishLabel } from '../../domain/species/profiles'

export function repeatConditions(session: FishingSession) {
  return { ...session.conditions, pikeSafetyConfirmed: session.conditions.targetFish === 'pike' ? false : undefined }
}

export function SessionCompletion({ session }: { session: FishingSession }) {
  const catches = session.feedback.filter(item => item.outcome === 'catch').length
  const bites = session.feedback.filter(item => item.outcome === 'bite').length
  return (
    <section className="completion-card" aria-labelledby="completion-heading">
      <span className="overline">DEIN RÜCKBLICK</span>
      <h2 id="completion-heading">Session abgeschlossen.</h2>
      <p>
        {fishLabel[session.conditions.targetFish]} · {bites} {bites === 1 ? 'Biss' : 'Bisse'} · {catches}{' '}
        {catches === 1 ? 'Fang' : 'Fänge'}. Dein Angelplan und die Rückmeldungen sind auf diesem Gerät gespeichert.
      </p>
      <div className="action-row">
        <Link className="primary" to="/verlauf">
          Zum Logbuch
        </Link>
        <Link className="secondary" to={`/neu/${session.conditions.targetFish}`} state={repeatConditions(session)}>
          Mit diesen Bedingungen neu planen
        </Link>
      </div>
      <small>Prüfe vor dem nächsten Start, was sich am Wasser verändert hat.</small>
    </section>
  )
}
