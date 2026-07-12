import { NavLink, Outlet } from 'react-router-dom'

export function Layout() {
  return <div className="app">
    <header>
      <NavLink to="/" className="brand" aria-label="Angelkompass Start"><span className="mark">✦</span><span>ANGELKOMPASS</span></NavLink>
      <span className="offline">Ohne API</span>
    </header>
    <main><Outlet /></main>
    <nav className="bottom" aria-label="Hauptnavigation">
      <NavLink to="/">⌂<span>Start</span></NavLink>
      <NavLink to="/neu">⌁<span>Neue Session</span></NavLink>
      <NavLink to="/bestand">▣<span>Bestand</span></NavLink>
    </nav>
  </div>
}
