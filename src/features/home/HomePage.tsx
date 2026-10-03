import { repeatConditions } from '../sessions/SessionCompletion'
import { fishLabel } from '../../domain/species/profiles'
import { Link } from 'react-router-dom'
import { Icon } from '../../ui/components/Icon'
import { useSessions } from '../sessions/useSessions'
import { useInventory } from '../inventory/useInventory'
import { SpeciesList } from '../../ui/components/SpeciesList'

export function HomePage() {
  const { activeSession, latestSession, error: sessionError } = useSessions()
  const { inventory, error: inventoryError } = useInventory()
  const featured = activeSession ?? latestSession
  const bites = featured?.feedback.filter(item => item.outcome === 'bite').length ?? 0
  const catches = featured?.feedback.filter(item => item.outcome === 'catch').length ?? 0
  const phase =
    featured && activeSession
      ? (featured.recommendation.switchPlan.find(step => step.phase === featured.progress)?.title ??
        'Plan ausgeschöpft')
      : undefined
  const sessionBlock = featured && (
    <article className={`home-session ${activeSession ? 'active-session' : ''}`}>
      <div>
        <span className="overline">{activeSession ? 'Aktive Session' : 'Letzte Session'}</span>
        <h2>
          {fishLabel[featured.conditions.targetFish]} · {featured.recommendation.setup.lure.label}
        </h2>
        <p>
          {featured.recommendation.spot.spot.label}
          {activeSession
            ? ` · ${phase}`
            : ` · ${bites} ${bites === 1 ? 'Biss' : 'Bisse'} · ${catches} ${catches === 1 ? 'Fang' : 'Fänge'}`}
        </p>
      </div>
      <Link
        viewTransition
        className={activeSession ? 'primary session-resume' : 'session-resume'}
        to={activeSession ? `/session/${featured.id}/karte` : `/session/${featured.id}`}
      >
        {activeSession ? 'Session fortsetzen' : 'Ergebnis ansehen'}
        <Icon name="arrow-right" />
      </Link>
    </article>
  )
  return (
    <section className="home page-shell">
      <header className="home-hero">
        <picture className="home-hero-media" aria-hidden="true">
          <source srcSet={`${import.meta.env.BASE_URL}assets/terrain/lake-morning.avif`} type="image/avif" />
          <img src={`${import.meta.env.BASE_URL}assets/terrain/lake-morning.webp`} alt="" />
        </picture>
        <div className="home-hero-copy">
          <p className="eyebrow">Raubfisch vom Ufer · See</p>
          <h1>{activeSession ? 'Du bist am Wasser' : 'Was befischst du heute?'}</h1>
        </div>
      </header>
      {!activeSession && (
        <p className="lead home-lead">
          Beschreibe, was du am See siehst. Angelkompass schlägt dir einen passenden Köder aus deiner Box vor und gibt
          dir einen Plan für die nächsten Würfe.
        </p>
      )}
      {(inventoryError || sessionError) && (
        <p className="storage-error" role="alert">
          {inventoryError ?? sessionError}{' '}
          <Link viewTransition to="/daten">
            Daten sichern →
          </Link>
        </p>
      )}
      {activeSession && sessionBlock}
      {activeSession && <h2 className="home-section-title">Neuen Plan beginnen</h2>}
      <SpeciesList />
      {!featured && (
        <section className="first-plan" aria-labelledby="first-plan-heading">
          <h2 id="first-plan-heading">So entsteht dein Angelplan</h2>
          <ol role="list">
            <li>
              <span>1</span>
              <div>
                <strong>Zielfisch wählen</strong>
                <p>Barsch, Hecht oder Zander am See.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <strong>Beobachten und Köder markieren</strong>
                <p>Was du nicht weißt, bleibt offen. Vollständige Messwerte brauchst du nicht.</p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <strong>Plan am Wasser abarbeiten</strong>
                <p>Montage, Führung und wann du wechselst – auf einer Karte.</p>
              </div>
            </li>
          </ol>
        </section>
      )}
      {!activeSession && sessionBlock}
      {!activeSession && latestSession && (
        <section className="repeat-plan">
          <div>
            <strong>Noch einmal auf {fishLabel[latestSession.conditions.targetFish]}?</strong>
            <p>Letzte Bedingungen übernehmen, kurz prüfen und neu planen.</p>
          </div>
          <Link
            viewTransition
            className="secondary"
            to={`/neu/${latestSession.conditions.targetFish}`}
            state={repeatConditions(latestSession)}
          >
            Letzten Plan als Vorlage nutzen <Icon name="arrow-right" />
          </Link>
        </section>
      )}
      <nav className="home-links" aria-label="Weitere Bereiche">
        <Link viewTransition to="/bestand">
          <Icon name="inventory" />
          <span>
            <strong>Köderbox</strong>
            <small>
              {inventory.length
                ? `${inventory.length} ${inventory.length === 1 ? 'Ködertyp' : 'Ködertypen'} gespeichert`
                : 'Noch leer – markiere, was du dabei hast'}
            </small>
          </span>
          <Icon name="arrow-right" />
        </Link>
        <Link viewTransition to="/verlauf">
          <Icon name="history" />
          <span>
            <strong>Logbuch</strong>
            <small>Angelpläne, Bisse und Fänge</small>
          </span>
          <Icon name="arrow-right" />
        </Link>
      </nav>
      <p className="home-notice">
        <strong>Entscheidungshilfe, keine Fanggarantie.</strong> Beachte lokale Gewässerordnungen, Schonzeiten und
        sichere Uferbereiche.
      </p>
    </section>
  )
}
