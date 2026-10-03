import { Navigate } from 'react-router-dom'
import { useSessions } from './useSessions'

/** Stable entry point for the app shortcut: open the running plan or start a new one. */
export function ActivePlanRedirect() {
  const { activeSession } = useSessions()
  return <Navigate to={activeSession ? `/session/${activeSession.id}/karte` : '/neu'} replace />
}
