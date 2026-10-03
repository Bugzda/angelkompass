import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page-shell empty-state">
      <p className="eyebrow">Kurz vom Kurs abgekommen</p>
      <h1>Seite nicht gefunden</h1>
      <p>Dieser Link führt zu keiner Seite in Angelkompass.</p>
      <Link viewTransition className="primary" to="/">
        Zur Startseite
      </Link>
    </section>
  )
}

export function RouteError() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />
  return (
    <section className="page-shell empty-state" role="alert">
      <h1>Das hat nicht geklappt</h1>
      <p>Die Ansicht konnte nicht geladen werden. Versuche es bitte erneut.</p>
      <button className="primary" onClick={() => window.location.reload()}>
        Erneut laden
      </button>
      <Link viewTransition className="secondary full" to="/">
        Zur Startseite
      </Link>
    </section>
  )
}
