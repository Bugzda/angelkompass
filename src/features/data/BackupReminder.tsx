import { Link } from 'react-router-dom'
import { Icon } from '../../ui/components/Icon'
import { useSessions } from '../sessions/useSessions'
import { useSpots } from '../spots/spotStore'
import { backupReminder, snoozeBackupReminder, useBackupStatus } from './backupStatus'

/** Gentle nudge to export a backup; local browser data can be cleared by the user or the operating system. */
export function BackupReminder() {
  const status = useBackupStatus()
  const { sessions } = useSessions()
  const { spots } = useSpots()
  const reminder = backupReminder(status, sessions, spots)
  if (!reminder) return null
  return (
    <aside className="notice backup-reminder" aria-label="Erinnerung an die Datensicherung">
      <strong>
        <Icon name="shield" size={18} />
        {reminder.neverBackedUp ? 'Noch keine Sicherung vorhanden' : 'Zeit für eine neue Sicherung'}
      </strong>
      <p>
        {reminder.unsaved} {reminder.unsaved === 1 ? 'Eintrag ist' : 'Einträge sind'} nur in diesem Browser gespeichert.
        Eine Sicherungsdatei schützt dein Logbuch, falls Browserdaten gelöscht werden.
      </p>
      <div className="action-row">
        <Link viewTransition className="primary" to="/daten">
          Jetzt sichern
        </Link>
        <button type="button" className="secondary" onClick={() => snoozeBackupReminder()}>
          In 7 Tagen erinnern
        </button>
      </div>
    </aside>
  )
}
