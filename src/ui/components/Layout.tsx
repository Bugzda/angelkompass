import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSessions } from '../../features/sessions/useSessions'
import { usePwaStatus } from '../hooks/usePwaStatus'
import { ConnectionStatus } from './ConnectionStatus'
import { BrandMark, Icon, type IconName } from './Icon'
import { ThemeControl } from './ThemeControl'
import { ToastViewport } from './Toast'

export function Layout() {
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const [updateError, setUpdateError] = useState<string>()
  const { activeSession } = useSessions()
  const { updateAvailable, applyUpdate, dismissUpdate } = usePwaStatus()
  const isSectionActive = (section: 'home' | 'new' | 'inventory' | 'history') => {
    const path = location.pathname
    const activePlan =
      activeSession && (path === `/session/${activeSession.id}` || path === `/session/${activeSession.id}/karte`)
    return section === 'home'
      ? path === '/'
      : section === 'new'
        ? path.startsWith('/neu') || path === '/empfehlung' || Boolean(activePlan)
        : section === 'inventory'
          ? path.startsWith('/bestand')
          : path.startsWith('/verlauf') || (path.startsWith('/session') && !activePlan) || path === '/daten'
  }
  const navItems: Array<{
    section: 'home' | 'new' | 'inventory' | 'history'
    to: string
    icon: IconName
    label: string
  }> = [
    { section: 'home', to: '/', icon: 'home', label: 'Start' },
    {
      section: 'new',
      to: activeSession ? `/session/${activeSession.id}/karte` : '/neu',
      icon: 'new-session',
      label: activeSession ? 'Aktiver Plan' : 'Planen',
    },
    { section: 'inventory', to: '/bestand', icon: 'inventory', label: 'Köderbox' },
    { section: 'history', to: '/verlauf', icon: 'history', label: 'Logbuch' },
  ]
  useEffect(() => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    mainRef.current?.focus({ preventScroll: true })
  }, [location.pathname])
  useEffect(() => {
    const path = location.pathname
    const title =
      path === '/'
        ? 'Dein Plan am See'
        : path === '/daten'
          ? 'Datensicherung'
          : path === '/bestand'
            ? 'Köderbox'
            : path === '/verlauf'
              ? 'Logbuch'
              : path.endsWith('/karte')
                ? 'Am Wasser'
                : path.startsWith('/session/')
                  ? 'Deine Session'
                  : path === '/empfehlung'
                    ? 'Dein Angelplan'
                    : path === '/neu'
                      ? 'Zielfisch wählen'
                      : path.startsWith('/neu/')
                        ? 'Bedingungen am See'
                        : 'Seite nicht gefunden'
    document.title = `${title} · Angelkompass`
  }, [location.pathname])
  const update = async () => {
    try {
      await applyUpdate()
      setUpdateError(undefined)
    } catch {
      setUpdateError('Die Aktualisierung ist fehlgeschlagen. Bitte versuche es erneut, sobald du online bist.')
    }
  }
  return (
    <div className="app">
      <a className="skip-link" href="#main-content">
        Zum Inhalt springen
      </a>
      <header className="app-header">
        <NavLink viewTransition to="/" className="brand" aria-label="Angelkompass Start">
          <BrandMark className="brand-mark" />
          <span>ANGELKOMPASS</span>
        </NavLink>
        <div className="header-tools">
          <ThemeControl />
        </div>
      </header>
      <ConnectionStatus />
      {updateAvailable && (
        <aside className="update-banner" aria-live="polite">
          <Icon name="update" />
          <span>
            <strong>Neue Version verfügbar.</strong> Jetzt sicher aktualisieren.
          </span>
          <div>
            <button className="secondary" onClick={dismissUpdate}>
              Später
            </button>
            <button
              className="primary"
              onClick={update}
              disabled={Boolean(activeSession)}
              title={activeSession ? 'Beende zuerst die aktive Session.' : undefined}
            >
              Jetzt aktualisieren
            </button>
          </div>
          {activeSession && <small>Während deiner aktiven Session wird nicht neu geladen.</small>}
          {updateError && <small role="alert">{updateError}</small>}
        </aside>
      )}
      <main className="app-main" id="main-content" tabIndex={-1} ref={mainRef}>
        <Outlet />
      </main>
      <ToastViewport />
      <nav className="bottom" aria-label="Hauptnavigation">
        {navItems.map(item => {
          const active = isSectionActive(item.section)
          return (
            <Link
              viewTransition
              key={item.section}
              to={item.to}
              className={active ? 'active' : undefined}
              aria-current={active ? 'page' : undefined}
            >
              {item.section === 'home' ? <BrandMark /> : <Icon name={item.icon} />}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
