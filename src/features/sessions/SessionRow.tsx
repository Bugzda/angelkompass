import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { FishingSession } from '../../domain/models/types'
import { fishLabel } from '../../domain/species/profiles'
import { Icon } from '../../ui/components/Icon'
import { sessionStore } from './sessionStore'

const date = (value: string) =>
  new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

const feedbackSummary = (session: FishingSession) => {
  const bites = session.feedback.filter(item => item.outcome === 'bite').length
  const catches = session.feedback.filter(item => item.outcome === 'catch').length
  return `${bites} ${bites === 1 ? 'Biss' : 'Bisse'} · ${catches} ${catches === 1 ? 'Fang' : 'Fänge'}`
}

/** Logbook entry with swipe-to-delete and an in-app confirmation. */
export function SessionRow({ session, index }: { session: FishingSession; index: number }) {
  const [confirming, setConfirming] = useState(false)
  const [deleteError, setDeleteError] = useState(false)
  const [offset, setOffset] = useState(0)
  const gesture = useRef<{ x: number; y: number; horizontal?: boolean } | null>(null)
  const suppressClick = useRef(false)
  const menu = useRef<HTMLButtonElement>(null)
  const cancel = () => {
    setConfirming(false)
    setDeleteError(false)
    menu.current?.focus()
  }
  return (
    <article
      className="session-row"
      onKeyDown={event => {
        if (event.key === 'Escape') cancel()
      }}
    >
      <div
        className="session-swipe-content"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={event => {
          suppressClick.current = false
          gesture.current =
            event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null
        }}
        onTouchMove={event => {
          const start = gesture.current
          if (!start || event.touches.length !== 1) {
            gesture.current = null
            setOffset(0)
            return
          }
          const dx = event.touches[0].clientX - start.x
          const dy = event.touches[0].clientY - start.y
          if (start.horizontal === undefined && Math.max(Math.abs(dx), Math.abs(dy)) > 10)
            start.horizontal = Math.abs(dx) > Math.abs(dy) * 1.5
          if (start.horizontal) {
            suppressClick.current = true
            setOffset(Math.max(-80, Math.min(0, dx)))
          }
        }}
        onTouchEnd={() => {
          if (offset <= -56) setConfirming(true)
          setOffset(0)
          gesture.current = null
        }}
        onTouchCancel={() => {
          setOffset(0)
          gesture.current = null
        }}
        onClickCapture={event => {
          if (suppressClick.current) {
            event.preventDefault()
            event.stopPropagation()
            suppressClick.current = false
          }
        }}
      >
        <span className="journal-index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <Link viewTransition to={`/session/${session.id}`}>
          <div>
            <strong>
              {fishLabel[session.conditions.targetFish]} · {session.recommendation.setup.lure.label}
            </strong>
            <p>
              {session.spot ? `${session.spot.name} · ` : ''}
              {session.recommendation.spot.spot.label}
            </p>
            <small>
              {date(session.createdAt)} · {feedbackSummary(session)}
            </small>
          </div>
          <span className={`session-status ${session.status}`}>
            {session.status === 'active' ? 'Aktiv' : 'Abgeschlossen'}
          </span>
          <Icon name="arrow-right" />
        </Link>
        <button
          ref={menu}
          className="session-menu"
          aria-label="Session-Aktionen"
          aria-expanded={confirming}
          onClick={() => setConfirming(value => !value)}
        >
          <span aria-hidden="true">···</span>
        </button>
      </div>
      {confirming && (
        <div className="session-delete-confirm" role="group" aria-label="Session löschen bestätigen">
          <p>
            {session.status === 'active' ? 'Aktive Session' : 'Diese Session'} mit allen Bissen und Fängen dauerhaft
            löschen?
          </p>
          {deleteError && (
            <p role="alert">Löschen fehlgeschlagen. Die Session bleibt gespeichert. Bitte erneut versuchen.</p>
          )}
          <div>
            <button className="secondary" onClick={cancel}>
              Abbrechen
            </button>
            <button
              className="session-delete-button"
              onClick={() => {
                if (!sessionStore.delete(session.id)) setDeleteError(true)
              }}
            >
              Endgültig löschen
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
