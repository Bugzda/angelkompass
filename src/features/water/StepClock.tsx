import { useEffect, useState } from 'react'
import type { FishingSession } from '../../domain/models/types'
import { Icon } from '../../ui/components/Icon'
import { showToast } from '../../ui/components/Toast'
import { formatElapsed, minuteRange, restartStepClock, stepStartedAt } from './stepTiming'
import { vibrate } from './waterPreferences'

const remindedSteps = new Set<string>()

/** Shows the time spent in the current step and reminds once when the planned minimum is reached. */
export function StepClock({ session }: { session: FishingSession }) {
  const step = session.recommendation.switchPlan.find(item => item.phase === session.progress)
  const range = minuteRange(step?.limit)
  const [now, setNow] = useState(() => Date.now())
  const startedAt = stepStartedAt(session)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const elapsed = now - Date.parse(startedAt)
  const reminderKey = `${session.id}:${session.progress}:${startedAt}`
  const reached = range ? elapsed >= range.min * 60_000 : false
  useEffect(() => {
    if (!reached || remindedSteps.has(reminderKey)) return
    remindedSteps.add(reminderKey)
    vibrate([90, 60, 90])
    showToast(`${range?.min} Minuten erreicht. Kein Kontakt? Dann „Ohne Kontakt“ für den nächsten Schritt.`, 6000)
  }, [reached, reminderKey, range?.min])
  if (session.status !== 'active') return null
  const progress = range ? Math.min(1, elapsed / (range.max * 60_000)) : undefined
  return (
    <section className={`step-clock${reached ? ' reached' : ''}`} aria-label="Zeit in diesem Schritt">
      <Icon name="timer" size={20} />
      <div>
        <strong>{formatElapsed(elapsed)}</strong>
        <small>
          {range
            ? reached
              ? `Geplante ${range.min}–${range.max} Minuten erreicht`
              : `in diesem Schritt · geplant ${range.min}–${range.max} Minuten`
            : 'in diesem Schritt'}
        </small>
        {progress !== undefined && (
          <span className="step-clock-bar" aria-hidden="true">
            <span style={{ width: `${Math.round(progress * 100)}%` }} />
          </span>
        )}
      </div>
      <button
        type="button"
        className="step-clock-restart"
        onClick={() => {
          restartStepClock(session)
          setNow(Date.now())
        }}
      >
        Neu starten
      </button>
    </section>
  )
}
