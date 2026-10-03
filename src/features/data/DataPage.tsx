import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../ui/components/Icon'
import { useInventory } from '../inventory/useInventory'
import { useSessions } from '../sessions/useSessions'
import { downloadSessions } from '../sessions/sessionExport'
import { useSpots } from '../spots/spotStore'
import {
  downloadBackup,
  parseBackup,
  planRestore,
  restoreBackup,
  type BackupData,
  type RestorePlan,
} from './dataBackup'

export function DataPage() {
  const { inventory, error: inventoryError } = useInventory()
  const { sessions, error: sessionError } = useSessions()
  const { spots } = useSpots()
  const [preview, setPreview] = useState<{ name: string; backup: BackupData; plan: RestorePlan }>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const [message, setMessage] = useState<string>()
  const request = useRef(0)
  useEffect(
    () => () => {
      request.current++
    },
    [],
  )
  const failure = (cause: unknown) =>
    setError(cause instanceof Error ? cause.message : 'Die Datei konnte nicht verarbeitet werden.')
  async function inspect(file?: File) {
    const current = ++request.current
    setPreview(undefined)
    setError(undefined)
    setMessage(undefined)
    if (!file) {
      setBusy(false)
      return
    }
    setBusy(true)
    try {
      if (file.size > 10 * 1024 * 1024)
        throw new Error('Die Datei ist größer als 10 MB. Bitte eine Angelkompass-JSON-Sicherung auswählen.')
      const backup = parseBackup(await file.text())
      if (current === request.current) setPreview({ name: file.name, backup, plan: planRestore(backup) })
    } catch (cause) {
      if (current === request.current) failure(cause)
    } finally {
      if (current === request.current) setBusy(false)
    }
  }
  const restore = () => {
    if (!preview) return
    try {
      restoreBackup(preview.plan)
      setMessage(
        `${preview.plan.addedSessions} Sessions, ${preview.plan.addedSizes} Ködergrößen und ${preview.plan.addedSpots} Angelstellen ergänzt. Deine bisherigen Einträge bleiben erhalten.`,
      )
      setPreview(undefined)
      setError(undefined)
    } catch (cause) {
      failure(cause)
      // Re-read for a fresh, reviewable preview after changes in another tab.
      try {
        setPreview({ ...preview, plan: planRestore(preview.backup) })
      } catch {
        setPreview(undefined)
      }
    }
  }
  return (
    <section className="page-shell data-page">
      <Link className="back-link" to="/verlauf">
        <Icon name="arrow-left" size={18} /> Zum Logbuch
      </Link>
      <p className="eyebrow">DEINE DATEN GEHÖREN DIR</p>
      <h1>Gut gesichert.</h1>
      <p className="lead">
        Köderbox und Logbuch bleiben auf diesem Gerät. Mit einer Sicherung nimmst du sie auf ein anderes Gerät mit oder
        stellst sie später wieder her.
      </p>
      {(inventoryError || sessionError) && (
        <p className="storage-error" role="alert">
          {inventoryError ?? sessionError} Die vollständige Sicherung enthält auch die ursprünglichen Daten.
        </p>
      )}
      <div className="data-overview">
        <Icon name="inventory" />
        <span>
          <strong>{inventory.length}</strong> {inventory.length === 1 ? 'Ködertyp' : 'Ködertypen'}
        </span>
        <span>
          <strong>{sessions.length}</strong> {sessions.length === 1 ? 'Session' : 'Sessions'}
        </span>
        {spots.length > 0 && (
          <span>
            <strong>{spots.length}</strong> {spots.length === 1 ? 'Angelstelle' : 'Angelstellen'}
          </span>
        )}
        <span className="local-badge">Auf diesem Gerät</span>
      </div>
      <article className="data-card">
        <span className="overline">01 · SICHERN</span>
        <h2>Alles in einer Datei.</h2>
        <p>
          Speichere deine Ködergrößen, Angelstellen, Angelpläne und Rückmeldungen. Eine Kopie außerhalb des Browsers
          bleibt auch nach dem Löschen der Browserdaten erhalten.
        </p>
        <button
          className="primary"
          onClick={() => {
            try {
              downloadBackup()
              setError(undefined)
              setMessage('Der Download wurde gestartet. Bewahre die Sicherungsdatei außerhalb des Browsers auf.')
            } catch {
              setError(
                'Die Sicherung konnte nicht heruntergeladen werden. Bitte Browser-Speicher und Downloads prüfen.',
              )
            }
          }}
        >
          <Icon name="download" size={18} /> Vollständige Sicherung herunterladen
        </button>
        <small>JSON-Datei · ohne Konto · keine Übertragung an einen Server</small>
        {sessions.length > 0 && (
          <button
            className="secondary export-sessions"
            onClick={() => {
              try {
                downloadSessions(sessions)
                setError(undefined)
                setMessage('Der Logbuch-Export wurde gestartet. Er enthält alle Sessions, aber keine Köderbox.')
              } catch {
                setError(
                  'Der Export konnte nicht heruntergeladen werden. Versuche es erneut. Deine Sessions bleiben gespeichert.',
                )
              }
            }}
          >
            <Icon name="download" size={18} /> Nur Logbuch exportieren
          </button>
        )}
      </article>
      <article className="data-card">
        <span className="overline">02 · WIEDERHERSTELLEN</span>
        <h2>Deine Daten wieder dabei.</h2>
        <p>
          Wähle eine Sicherung oder einen bisherigen Session-Export. Du siehst vor dem Übernehmen, was ergänzt wird.
          Bereits vorhandene Sessions bleiben unverändert.
        </p>
        <label className="file-field">
          Sicherungsdatei auswählen
          <input
            type="file"
            accept=".json,application/json"
            onChange={event => {
              void inspect(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </label>
        {busy && <p role="status">Sicherung wird geprüft …</p>}
        {preview && (
          <div className="restore-preview">
            <strong>{preview.name}</strong>
            <p>Sicherung vom {new Date(preview.backup.exportedAt).toLocaleString('de-DE')}</p>
            <ul>
              <li>{preview.plan.addedSessions} neue Sessions</li>
              <li>{preview.plan.addedSizes} zusätzliche Ködergrößen</li>
              {preview.plan.addedSpots > 0 && <li>{preview.plan.addedSpots} neue Angelstellen</li>}
              <li>{preview.plan.skippedSessions} vorhandene Sessions bleiben unverändert</li>
            </ul>
            {preview.plan.archivedSessions > 0 && (
              <p className="notice">
                {preview.plan.archivedSessions} importierte aktive Sessions werden als abgeschlossen übernommen. Dein
                laufender Angelplan bleibt aktiv.
              </p>
            )}
            {preview.backup.hasRecoveryData && (
              <p className="notice">
                Unlesbare oder widersprüchliche Originaleinträge bleiben in der Sicherungsdatei erhalten. Sie werden
                nicht automatisch eingespielt. Bewahre die Datei für eine spätere Wiederherstellung auf.
              </p>
            )}
            <div className="action-row">
              <button
                className="primary"
                disabled={!preview.plan.addedSessions && !preview.plan.addedSizes && !preview.plan.addedSpots}
                onClick={restore}
              >
                Daten ergänzen
              </button>
              <button className="secondary" onClick={() => setPreview(undefined)}>
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </article>
      {error && (
        <p className="storage-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="save-confirmation" role="status">
          <Icon name="check" size={18} />
          {message}
        </p>
      )}
    </section>
  )
}
