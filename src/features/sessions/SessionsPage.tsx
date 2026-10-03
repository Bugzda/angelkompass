import { fishLabel } from '../../domain/species/profiles'
import { Link } from 'react-router-dom'
import { useSessions } from './useSessions'
import { Icon } from '../../ui/components/Icon'
import { useState } from 'react'
import type { TargetFish } from '../../domain/models/types'
import { LogbookInsights } from './LogbookInsights'
import { SessionRow } from './SessionRow'

export function SessionsPage() {
  const { sessions, error } = useSessions()
  const [fish, setFish] = useState<TargetFish | 'all'>('all')
  const filtered = sessions.filter(session => fish === 'all' || session.conditions.targetFish === fish)
  const bites = filtered.reduce(
    (sum, session) => sum + session.feedback.filter(item => item.outcome === 'bite').length,
    0,
  )
  const catches = filtered.reduce(
    (sum, session) => sum + session.feedback.filter(item => item.outcome === 'catch').length,
    0,
  )

  return (
    <section className="page-shell sessions-page">
      <p className="eyebrow">DEIN LOGBUCH AM WASSER</p>
      <h1>Deine Sessions.</h1>
      <p className="lead">
        Jeder Versuch erzählt etwas. Hier bleiben deine Angelpläne, Bisse und Fänge auf diesem Gerät gespeichert.
      </p>
      {error && (
        <p className="storage-error" role="alert">
          {error}
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
          <LogbookInsights sessions={filtered} />
          <p className="collection-note">
            {filtered.length} {filtered.length === 1 ? 'Eintrag' : 'Einträge'} · Neueste zuerst
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
