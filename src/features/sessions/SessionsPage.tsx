import { fishLabel } from '../../domain/species/profiles'
import { Link } from 'react-router-dom'
import { sessionStore } from './sessionStore'
import { useSessions } from './useSessions'
import { Icon } from '../../ui/components/Icon'
import { useRef, useState } from 'react'
import type { FishingSession, TargetFish } from '../../domain/models/types'
import { downloadSessions } from './sessionExport'

const date = (value: string) =>
  new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

const feedbackSummary = (session: FishingSession) => {
  const bites = session.feedback.filter(item => item.outcome === 'bite').length
  const catches = session.feedback.filter(item => item.outcome === 'catch').length
  return `${bites} ${bites === 1 ? 'Biss' : 'Bisse'} · ${catches} ${catches === 1 ? 'Fang' : 'Fänge'}`
}

export function SessionsPage() {
  const { sessions, error } = useSessions()
  const [fish, setFish] = useState<TargetFish | 'all'>('all')
  const [exportError, setExportError] = useState<string>()
  const filtered = sessions.filter(session => fish === 'all' || session.conditions.targetFish === fish)
  const bites = filtered.reduce(
    (sum, session) => sum + session.feedback.filter(item => item.outcome === 'bite').length,
    0,
  )
  const catches = filtered.reduce(
    (sum, session) => sum + session.feedback.filter(item => item.outcome === 'catch').length,
    0,
  )
  const exportAll = () => {
    try {
      downloadSessions(sessions)
      setExportError(undefined)
    } catch {
      setExportError(
        'Der Export konnte nicht heruntergeladen werden. Versuche es erneut. Deine Sessions bleiben gespeichert.',
      )
    }
  }

  return (
    <section className="page-shell sessions-page">
      <p className="eyebrow">DEIN LOGBUCH AM WASSER</p>
      <h1>Deine Sessions.</h1>
      <p className="lead">
        Jeder Versuch erzählt etwas. Hier bleiben deine Angelpläne, Bisse und Fänge auf diesem Gerät gespeichert.
      </p>
      {(error || exportError) && (
        <p className="storage-error" role="alert">
          {error ?? exportError}
        </p>
      )}
      {sessions.length > 0 && (
        <>
          <div className="collection-toolbar">
            <div className="chips" role="group" aria-label="Sessions nach Zielfisch filtern">
              {(['all', 'perch', 'pike', 'zander'] as const).map(value => (
                <button
                  key={value}
                  aria-pressed={fish === value}
                  className={fish === value ? 'selected' : ''}
                  onClick={() => setFish(value)}
                >
                  {value === 'all' ? 'Alle' : fishLabel[value]}
                </button>
              ))}
            </div>
            <button className="secondary" onClick={exportAll}>
              <Icon name="download" size={18} />
              Alle Sessions exportieren
            </button>
          </div>
          <dl className="logbook-stats" aria-label="Statistik der angezeigten Sessions">
            <div>
              <dt>Sessions</dt>
              <dd>{String(filtered.length).padStart(2, '0')}</dd>
            </div>
            <div>
              <dt>Bisse</dt>
              <dd>{String(bites).padStart(2, '0')}</dd>
            </div>
            <div>
              <dt>Fänge</dt>
              <dd>{String(catches).padStart(2, '0')}</dd>
            </div>
          </dl>
          <p className="collection-note">
            {filtered.length} {filtered.length === 1 ? 'Eintrag' : 'Einträge'} · Neueste zuerst{' '}
            <span>Export als JSON · alle Fischarten</span>
          </p>
        </>
      )}
      {filtered.length > 0 && <p className="swipe-hint">Zum Löschen nach links wischen oder das Menü öffnen.</p>}
      <div className="session-list">
        {sessions.length === 0 ? (
          <div className="empty">
            <img src={`${import.meta.env.BASE_URL}assets/terrain/perch.webp`} alt="" />
            <h2>Noch kein Eintrag im Logbuch.</h2>
            <p>Erstelle einen Angelplan und starte damit deine erste Session.</p>
            <Link className="primary" to="/neu">
              Ersten Angelplan erstellen
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <h2>Noch keine {fishLabel[fish === 'all' ? 'perch' : fish]}-Session.</h2>
            <p>Für diesen Zielfisch gibt es noch keinen Eintrag.</p>
            <Link className="primary" to={`/neu/${fish}`}>
              Angelplan erstellen
            </Link>
          </div>
        ) : (
          filtered.map((session, index) => <SessionRow key={session.id} session={session} index={index} />)
        )}
      </div>
      <Link className="data-link" to="/daten">
        <Icon name="download" size={18} />
        <span>
          Köderbox und Logbuch sichern<small>Datensicherung & Wiederherstellung</small>
        </span>
        <Icon name="arrow-right" size={18} />
      </Link>
    </section>
  )
}

function SessionRow({ session, index }: { session: FishingSession; index: number }) {
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
        <Link to={`/session/${session.id}`}>
          <div>
            <strong>
              {fishLabel[session.conditions.targetFish]} · {session.recommendation.setup.lure.label}
            </strong>
            <p>{session.recommendation.spot.spot.label}</p>
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
