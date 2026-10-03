import { useState } from 'react'
import type { FishingSession } from '../../domain/models/types'
import { Icon } from '../../ui/components/Icon'
import { logbookInsights } from './insights'

const dateLabel = (value: string) => new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(new Date(value))

/** Collapsible personal statistics; purely descriptive and without influence on recommendations. */
export function LogbookInsights({ sessions }: { sessions: readonly FishingSession[] }) {
  const data = logbookInsights(sessions)
  const [groupId, setGroupId] = useState(data.groups[0]?.id)
  if (!sessions.length) return null
  const active = data.groups.find(item => item.id === groupId) ?? data.groups[0]
  const max = Math.max(1, ...(active?.rows.map(row => row.bites + row.catches) ?? [1]))
  return (
    <details className="logbook-insights">
      <summary>
        <Icon name="chart" size={20} />
        <span>
          Deine Auswertung
          <small>
            {data.contacts
              ? `${data.contacts} ${data.contacts === 1 ? 'Kontakt' : 'Kontakte'} nach Köder, Stelle und Bedingungen`
              : 'Noch keine Bisse oder Fänge erfasst'}
          </small>
        </span>
        <Icon name="chevron-down" size={18} />
      </summary>
      {data.longestCatch && (
        <p className="insight-highlight">
          Längster Fang: <strong>{String(data.longestCatch.lengthCm).replace('.', ',')} cm</strong> mit{' '}
          {data.longestCatch.lure} · {dateLabel(data.longestCatch.date)}
        </p>
      )}
      {active && (
        <>
          <div className="chips" role="group" aria-label="Auswertung gruppieren nach">
            {data.groups.map(item => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === active.id}
                className={item.id === active.id ? 'selected' : ''}
                onClick={() => setGroupId(item.id)}
              >
                {item.title}
              </button>
            ))}
          </div>
          <table className="insight-table">
            <caption className="sr-only">Bisse und Fänge nach {active.title}</caption>
            <thead>
              <tr>
                <th scope="col">{active.title}</th>
                <th scope="col">Sessions</th>
                <th scope="col">Bisse</th>
                <th scope="col">Fänge</th>
              </tr>
            </thead>
            <tbody>
              {active.rows.map(row => (
                <tr key={row.label}>
                  <th scope="row">
                    {row.label}
                    <span className="insight-bar" aria-hidden="true">
                      <span className="catches" style={{ width: `${(row.catches / max) * 100}%` }} />
                      <span className="bites" style={{ width: `${(row.bites / max) * 100}%` }} />
                    </span>
                  </th>
                  <td>{row.sessions}</td>
                  <td>{row.bites}</td>
                  <td>{row.catches}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <small className="insight-note">
        Deine persönliche Statistik. Sie zeigt nur, was du erfasst hast, und verändert keine Empfehlungen. Wenige
        Sessions sind kein Beleg dafür, dass ein Köder besser fängt.
      </small>
    </details>
  )
}
