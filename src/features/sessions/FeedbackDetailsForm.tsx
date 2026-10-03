import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { SessionFeedback } from '../../domain/models/types'
import { MAX_NOTE_LENGTH, sessionStore } from './sessionStore'

/** Optional details right after a bite or catch; skipping keeps the feedback as it is. */
export function FeedbackDetailsForm({
  sessionId,
  feedback,
  onDone,
}: {
  sessionId: string
  feedback: SessionFeedback
  onDone: () => void
}) {
  const [length, setLength] = useState(feedback.lengthCm ? String(feedback.lengthCm) : '')
  const [note, setNote] = useState(feedback.note ?? '')
  const [error, setError] = useState<string>()
  const isCatch = feedback.outcome === 'catch'
  const firstField = useRef<HTMLInputElement>(null)
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    firstField.current?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') done.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const save = () => {
    const parsed = length.trim() ? Number(length.replace(',', '.')) : undefined
    if (parsed !== undefined && (!Number.isFinite(parsed) || parsed <= 0 || parsed > 200)) {
      setError('Bitte eine Länge zwischen 1 und 200 cm eingeben oder das Feld leer lassen.')
      return
    }
    if (sessionStore.updateFeedbackDetails(sessionId, feedback.id, { lengthCm: parsed, note })) onDone()
    else setError('Die Details konnten nicht gespeichert werden. Deine Rückmeldung bleibt erhalten.')
  }
  // Rendered at the document root so sticky bars and the navigation cannot cover it.
  return createPortal(
    <div
      className="sheet-backdrop"
      onClick={event => {
        if (event.target === event.currentTarget) onDone()
      }}
    >
      <form
        className="feedback-details sheet"
        role="dialog"
        aria-modal="true"
        aria-label={isCatch ? 'Fang-Details' : 'Biss-Details'}
        onSubmit={event => {
          event.preventDefault()
          save()
        }}
      >
        <strong>{isCatch ? 'Fang gespeichert.' : 'Biss gespeichert.'}</strong>
        <span>Details sind optional.</span>
        {isCatch && (
          <label>
            Länge in cm
            <input
              ref={firstField}
              inputMode="decimal"
              value={length}
              onChange={event => setLength(event.target.value)}
              placeholder="z. B. 32"
              maxLength={5}
            />
          </label>
        )}
        <label>
          Notiz
          <input
            ref={isCatch ? undefined : firstField}
            value={note}
            onChange={event => setNote(event.target.value)}
            placeholder={isCatch ? 'z. B. an der Krautkante' : 'z. B. Nachläufer'}
            maxLength={MAX_NOTE_LENGTH}
          />
        </label>
        {error && <p role="alert">{error}</p>}
        <div>
          <button type="submit" className="primary">
            Details speichern
          </button>
          <button type="button" className="secondary" onClick={onDone}>
            Überspringen
          </button>
        </div>
      </form>
    </div>,
    document.body,
  )
}
