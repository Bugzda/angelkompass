import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSessions } from '../../features/sessions/useSessions'
import { usePwaStatus } from '../hooks/usePwaStatus'
import { type ThemePreference, useTheme } from '../hooks/useTheme'

export function Layout() {
  const location = useLocation()
  const { activeSession } = useSessions()
  const { online, offlineReady, updateAvailable, applyUpdate, dismissUpdate } = usePwaStatus()
  const { preference, setPreference } = useTheme()
  const status = online ? (offlineReady ? 'Online · offline nutzbar' : 'Online') : 'Offline'
  const navClass = (section: 'home'|'new'|'inventory'|'history') => {
    const path = location.pathname
    const active = section === 'home' ? path === '/' : section === 'new' ? path.startsWith('/neu') || path === '/empfehlung' : section === 'inventory' ? path.startsWith('/bestand') : path.startsWith('/verlauf') || path.startsWith('/session')
    return active ? 'active' : undefined
  }
  const cycleTheme = () => { const values: ThemePreference[] = ['system','light','dark']; setPreference(values[(values.indexOf(preference)+1)%values.length]) }
  return <div className="app">
    <header>
      <NavLink to="/" className="brand" aria-label="Angelkompass Start"><span className="mark">✦</span><span>ANGELKOMPASS</span></NavLink>
      <div className="header-tools"><span className={`connection ${online?'online':'offline-state'}`} aria-live="polite">{status}</span><button className="theme-toggle" onClick={cycleTheme} aria-label={`Farbschema: ${preference}. Farbschema wechseln`}>{preference==='system'?'◐':preference==='dark'?'☾':'☀'}</button></div>
    </header>
    {updateAvailable&&<aside className="update-banner" aria-live="polite"><span><strong>Neue Version verfügbar.</strong> Jetzt sicher aktualisieren.</span><div><button className="secondary" onClick={dismissUpdate}>Später</button><button className="primary" onClick={applyUpdate} disabled={Boolean(activeSession)} title={activeSession?'Beende zuerst die aktive Session.':undefined}>Jetzt aktualisieren</button></div>{activeSession&&<small>Während deiner aktiven Session wird nicht neu geladen.</small>}</aside>}
    <main><Outlet /></main>
    <nav className="bottom" aria-label="Hauptnavigation">
      <NavLink to="/" className={navClass('home')}><span aria-hidden="true">⌂</span><span>Start</span></NavLink>
      <NavLink to="/neu" className={navClass('new')}><span aria-hidden="true">⌁</span><span>Neue Session</span></NavLink>
      <NavLink to="/bestand" className={navClass('inventory')}><span aria-hidden="true">▣</span><span>Bestand</span></NavLink>
      <NavLink to="/verlauf" className={navClass('history')}><span aria-hidden="true">≡</span><span>Verlauf</span></NavLink>
    </nav>
  </div>
}
