import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSessions } from '../../features/sessions/useSessions'
import { usePwaStatus } from '../hooks/usePwaStatus'
import { type ThemePreference, useTheme } from '../hooks/useTheme'
import { BrandMark, Icon, type IconName } from './Icon'

export function Layout() {
  const location = useLocation()
  const { activeSession } = useSessions()
  const { online, offlineReady, updateAvailable, applyUpdate, dismissUpdate } = usePwaStatus()
  const { preference, setPreference } = useTheme()
  const status = online ? (offlineReady ? 'Online · offline nutzbar' : 'Online') : 'Offline'
  const isSectionActive = (section: 'home'|'new'|'inventory'|'history') => {
    const path = location.pathname
    return section === 'home' ? path === '/' : section === 'new' ? path.startsWith('/neu') || path === '/empfehlung' : section === 'inventory' ? path.startsWith('/bestand') : path.startsWith('/verlauf') || path.startsWith('/session')
  }
  const navItems: Array<{ section:'home'|'new'|'inventory'|'history'; to:string; icon:IconName; label:string }> = [
    { section:'home', to:'/', icon:'home', label:'Start' },
    { section:'new', to:'/neu', icon:'new-session', label:'Neue Session' },
    { section:'inventory', to:'/bestand', icon:'inventory', label:'Bestand' },
    { section:'history', to:'/verlauf', icon:'history', label:'Verlauf' },
  ]
  const themeIcon:IconName=preference==='system'?'theme-system':preference==='dark'?'theme-dark':'theme-light'
  useEffect(()=>{document.documentElement.scrollTop=0;document.body.scrollTop=0},[location.pathname])
  return <div className="app">
    <header className="app-header">
      <NavLink to="/" className="brand" aria-label="Angelkompass Start"><BrandMark className="brand-mark"/><span>ANGELKOMPASS</span></NavLink>
      <div className="header-tools"><span className={`connection ${online?'online':'offline-state'}`} aria-live="polite"><Icon name={online?'status-online':'status-offline'} size={17}/>{status}</span><label className="theme-control"><span className="sr-only">Farbschema</span><Icon name={themeIcon} size={18}/><select value={preference} onChange={event=>setPreference(event.target.value as ThemePreference)} aria-label="Farbschema"><option value="system">System</option><option value="light">Hell</option><option value="dark">Dunkel</option></select></label></div>
    </header>
    {updateAvailable&&<aside className="update-banner" aria-live="polite"><Icon name="update"/><span><strong>Neue Version verfügbar.</strong> Jetzt sicher aktualisieren.</span><div><button className="secondary" onClick={dismissUpdate}>Später</button><button className="primary" onClick={applyUpdate} disabled={Boolean(activeSession)} title={activeSession?'Beende zuerst die aktive Session.':undefined}>Jetzt aktualisieren</button></div>{activeSession&&<small>Während deiner aktiven Session wird nicht neu geladen.</small>}</aside>}
    <main className="app-main"><Outlet /></main>
    <nav className="bottom" aria-label="Hauptnavigation">
      {navItems.map(item=>{const active=isSectionActive(item.section);return <Link key={item.section} to={item.to} className={active?'active':undefined} aria-current={active?'page':undefined}>{item.section==='home'?<BrandMark/>:<Icon name={item.icon}/>}<span>{item.label}</span></Link>})}
    </nav>
  </div>
}
