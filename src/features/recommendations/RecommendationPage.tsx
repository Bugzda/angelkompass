import { requestPersistenceOnce } from '../data/storagePersistence'
import { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PlanProgress } from '../../ui/components/PlanProgress'
import { Icon } from '../../ui/components/Icon'
import { fishLabel } from '../../domain/species/profiles'
import { createRecommendationDecision } from '../../domain/engine/scoring'
import { presentationForDisplay } from '../../domain/engine/presentation'
import type { Recommendation } from '../../domain/models/types'
import { canRecommend } from '../../domain/models/validation'
import { useInventory } from '../inventory/useInventory'
import { sessionStore } from '../sessions/sessionStore'
import { useSessions } from '../sessions/useSessions'
import { conditionsOnly, readSpotRef, withSpot } from '../spots/planningState'
import { ConditionSummary } from './ConditionSummary'
import { RecommendationOption } from './RecommendationOption'

export function RecommendationPage() {
  const state: unknown = useLocation().state
  // The spot reference travels with the conditions but never reaches the engine or the stored conditions.
  const conditions = useMemo(() => (canRecommend(state) ? conditionsOnly(state) : null), [state])
  const spot = readSpotRef(state)
  const { inventory, error: inventoryError } = useInventory()
  const { activeSession, error } = useSessions()
  const navigate = useNavigate()
  const decision = useMemo(
    () => (conditions ? createRecommendationDecision(conditions, inventory) : undefined),
    [conditions, inventory],
  )
  if (!conditions || !decision)
    return (
      <section className="page-shell empty-state">
        <h1>Keine Berechnung vorhanden</h1>
        <p>Erfasse zuerst die Bedingungen am See.</p>
        <Link viewTransition className="primary" to="/neu">
          Bedingungen erfassen
        </Link>
      </section>
    )
  const start = (recommendation: Recommendation) => {
    const session = sessionStore.create(conditions, recommendation, spot)
    if (!session) return
    // The first saved session is real user data: ask the browser not to evict it under storage pressure.
    requestPersistenceOnce()
    navigate(`/session/${session.id}/karte`, { viewTransition: true })
  }
  const planningState = withSpot(conditions, spot)
  return (
    <section className="page-shell recommendation-page">
      <PlanProgress step={2} />
      <p className="eyebrow">
        {fishLabel[conditions.targetFish]} · {spot ? spot.name : 'See · vom Ufer'}
      </p>
      <h1>{decision.practicalPrimary ? 'Dein Angelplan' : 'Wähle noch deine Köder'}</h1>
      <p className="lead">
        {decision.practicalPrimary
          ? 'Passende Optionen aus deiner Köderbox. Wähle deinen Start.'
          : 'Deine Bedingungen sind erfasst. Ergänze passende Köder, um deinen Angelplan zu starten.'}
      </p>
      <ConditionSummary state={planningState} />
      {decision.hotWaterWarning && (
        <aside className="heat-warning">
          <strong>Hinweis bei sehr warmem Wasser</strong>
          <p>{decision.hotWaterWarning}</p>
        </aside>
      )}
      {(error || inventoryError) && (
        <p className="storage-error" role="alert">
          {error ?? inventoryError}
        </p>
      )}
      {activeSession && (
        <aside className="active-session-notice">
          <strong>Eine Session ist bereits aktiv.</strong>
          <p>Beende sie, bevor du einen neuen Angelplan startest.</p>
          <Link viewTransition to={`/session/${activeSession.id}/karte`}>
            Aktive Session fortsetzen →
          </Link>
        </aside>
      )}
      {decision.practicalPrimary ? (
        <div className="recommendation-options">
          {decision.practicalRanking.map((recommendation, index) => (
            <RecommendationOption
              key={`${recommendation.spot.spot.id}-${recommendation.setup.lure.id}`}
              recommendation={recommendation}
              fish={conditions.targetFish}
              primary={index === 0}
              disabled={Boolean(activeSession)}
              onStart={() => start(recommendation)}
            />
          ))}
        </div>
      ) : (
        <article className="notice no-inventory">
          <h2>Kein geeigneter vorhandener Köder</h2>
          <p>Für Tiefe und Bedingungen ist aktuell kein passender Köder in deiner Köderbox markiert.</p>
          <Link viewTransition className="primary" to="/bestand" state={{ returnConditions: planningState }}>
            Passende Köder auswählen
            <Icon name="arrow-right" />
          </Link>
        </article>
      )}
      <div className="plan-edit-links">
        <Link viewTransition className="secondary" to={`/neu/${conditions.targetFish}`} state={planningState}>
          Bedingungen ändern
        </Link>
        <Link viewTransition className="secondary" to="/bestand" state={{ returnConditions: planningState }}>
          Köderbox bearbeiten
        </Link>
      </div>
      {decision.optionalLureTip && (
        <section className="optional-tips">
          <h2>Fachlich beste Ergänzung</h2>
          <p>Diese Option fehlt in deiner Köderbox und kann hier nicht gestartet werden.</p>
          <article className="optional-option">
            <span className="overline">Nicht in deiner Köderbox</span>
            <h3>{decision.optionalLureTip.setup.lure.label}</h3>
            <p>
              {decision.optionalLureTip.spot.spot.label} ·{' '}
              {presentationForDisplay(decision.optionalLureTip.setup).sizeLabel}
            </p>
            {decision.optionalLureAdvantage && decision.optionalLureAdvantage > 0 ? (
              <small>
                Passt in dieser Situation fachlich besser als deine beste vorhandene Wahl – eine Überlegung für deine
                nächste Köderbox.
              </small>
            ) : (
              <small>Eine zusätzliche fachliche Alternative für diese Situation.</small>
            )}
          </article>
        </section>
      )}
      {decision.optionalSpotTip && (
        <section className="optional-tips">
          <h2>Optionaler Spot-Tipp</h2>
          <article className="optional-option">
            <span className="overline">Falls am Gewässer vorhanden</span>
            <h3>{decision.optionalSpotTip.spot.spot.label}</h3>
            <p>Diesen Bereich hast du nicht bestätigt. Prüfe ihn nur, wenn er tatsächlich erreichbar vorhanden ist.</p>
          </article>
        </section>
      )}
    </section>
  )
}
