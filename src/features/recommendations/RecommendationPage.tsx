import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PlanProgress } from '../../ui/components/PlanProgress'
import { Icon } from '../../ui/components/Icon'
import { fishLabel, profileFor } from '../../domain/species/profiles'
import { productSources } from '../../domain/research/productSources'
import { createRecommendationDecision } from '../../domain/engine/scoring'
import { presentationForDisplay } from '../../domain/engine/presentation'
import type { ConfidenceMetric, Recommendation, TargetFish } from '../../domain/models/types'
import { canRecommend } from '../../domain/models/validation'
import { useInventory } from '../inventory/useInventory'
import { sessionStore } from '../sessions/sessionStore'
import { useSessions } from '../sessions/useSessions'
import { SwitchSetupDetails } from './SwitchSetupDetails'
import { shortWeight } from './presentationFormat'

const confidenceLabel = (level: ConfidenceMetric['level']) =>
  level === 'high' ? 'Hohe Evidenz' : level === 'medium' ? 'Mittlere Evidenz' : 'Geringe Evidenz'
const sizeName = { small: 'Klein', medium: 'Mittel', large: 'Groß' } as const

function RecommendationDetails({ recommendation, fish }: { recommendation: Recommendation; fish: TargetFish }) {
  const presentation = presentationForDisplay(recommendation.setup)
  const missing = recommendation.inputCoverage.missingFields?.length ?? 0
  const profile = profileFor(fish)
  const appliedIds = new Set(
    [...recommendation.spot.reasons, ...recommendation.setup.reasons].map(reason => reason.ruleId),
  )
  const sources = [...new Set(profile.allRules.filter(rule => appliedIds.has(rule.id)).flatMap(rule => rule.sourceIds))]
    .map(id => productSources[id])
    .filter(Boolean)
  return (
    <div className="plan-details">
      <section className="presentation-details" aria-label="Montage und Führung">
        <dl>
          <div>
            <dt>Größe</dt>
            <dd>{presentation.sizeLabel}</dd>
          </div>
          <div>
            <dt>{presentation.weightKind === 'lure-total' ? 'Ködergewicht' : 'Beschwerung'}</dt>
            <dd>{presentation.weightLabel}</dd>
          </div>
        </dl>
        <h3>Montage</h3>
        <p>{presentation.mounting}</p>
        <h3>Führung</h3>
        <p>{presentation.guidance}</p>
      </section>
      <div className="reason-box">
        <strong>Warum dieser Plan?</strong>
        <ul>
          {recommendation.reasons.map(reason => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>
      <dl className="plain-confidence">
        <div>
          <dt>Deine Angaben</dt>
          <dd>
            {missing
              ? `${missing} ${missing === 1 ? 'Angabe noch offen' : 'Angaben noch offen'}`
              : 'Beobachtungen vollständig'}
          </dd>
        </div>
        <div>
          <dt>Regel-Evidenz</dt>
          <dd>{confidenceLabel(recommendation.evidenceQuality.level)}</dd>
        </div>
      </dl>
      <details className="metric-help">
        <summary>Datenlage im Detail</summary>
        <p>
          <strong>Eingabeabdeckung · {recommendation.inputCoverage.value}%:</strong> Wie vollständig du die beobachtbare
          Situation beschrieben hast. {recommendation.inputCoverage.explanation}
        </p>
        <p>
          <strong>Regel-Evidenz · {recommendation.evidenceQuality.value}%:</strong> Wie belastbar und passend die
          angewendeten Fachregeln sind. {recommendation.evidenceQuality.explanation}
        </p>
        <p>Diese Werte sind keine Fangwahrscheinlichkeiten. Unbekannte Angaben bleiben fachlich neutral.</p>
        <p>Regelwerk: {profile.rulesetVersion}</p>
        {sources.length > 0 && (
          <>
            <h3>Quellen der angewendeten Regeln</h3>
            <ul className="rule-sources">
              {sources.map(source => (
                <li key={source.id}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.title}
                  </a>
                  <small>
                    {source.authors} · {source.year}
                  </small>
                  <p>{source.scope}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </details>
      <details className="plan-disclosure">
        <summary>Wechselplan bei ausbleibendem Kontakt</summary>
        <ol className="switch-plan">
          {recommendation.switchPlan.map(step => (
            <li key={step.phase}>
              <h3>{step.title}</h3>
              <p>{step.change}</p>
              <small>
                {step.limit} · {step.reason}
              </small>
              {step.setup && (
                <details className="switch-setup-details">
                  <summary>Montage & Führung</summary>
                  <SwitchSetupDetails setup={step.setup} />
                </details>
              )}
            </li>
          ))}
        </ol>
      </details>
      <details className="plan-disclosure color-guidance">
        <summary>Farbe · {recommendation.colorGuidance.familyLabel}</summary>
        <p>
          <strong>Grundton:</strong>{' '}
          {recommendation.colorGuidance.baseLabel ?? recommendation.colorGuidance.familyLabel}
          <br />
          <strong>Finish:</strong> {recommendation.colorGuidance.finishLabel ?? 'Passend zum Ködermaterial'}
          <br />
          <strong>Akzent:</strong> {recommendation.colorGuidance.accentLabel ?? 'Kein fester Akzent'}
        </p>
        <div className="color-examples">
          {recommendation.colorGuidance.examples.map(example => (
            <span key={example}>{example}</span>
          ))}
        </div>
        <p>{recommendation.colorGuidance.reason}</p>
        {recommendation.colorGuidance.alternative && <small>{recommendation.colorGuidance.alternative}</small>}
      </details>
    </div>
  )
}

function RecommendationOption({
  recommendation,
  fish,
  primary,
  disabled,
  onStart,
}: {
  recommendation: Recommendation
  fish: TargetFish
  primary: boolean
  disabled: boolean
  onStart: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const presentation = presentationForDisplay(recommendation.setup)
  const panelId = `recommendation-panel-${recommendation.rank}`
  return (
    <article
      className={`recommendation-option${primary ? ' recommended-option' : ''}`}
      aria-labelledby={`option-${recommendation.rank}`}
    >
      <header className="option-heading">
        <span className="overline">{primary ? 'EMPFOHLENER START' : `ALTERNATIVE ${recommendation.rank - 1}`}</span>
        <h2 id={`option-${recommendation.rank}`}>{recommendation.setup.lure.label}</h2>
        <p>{recommendation.spot.spot.label}</p>
        <dl className="option-specs">
          <div>
            <dt>Größe</dt>
            <dd>{presentation.sizeLabel}</dd>
          </div>
          {presentation.weightKind !== 'none' && (
            <div>
              <dt>{presentation.weightKind === 'lure-total' ? 'Gewicht' : 'Beschwerung'}</dt>
              <dd>{shortWeight(presentation.weightLabel)}</dd>
            </div>
          )}
          <div className="option-type">
            <dt>Typ</dt>
            <dd>{presentation.profileLabel}</dd>
          </div>
        </dl>
        <span className="inventory-status available">In deiner Köderbox</span>
      </header>
      {primary && (
        <p className="option-guidance">
          <strong>So führen</strong>
          {presentation.guidance}
        </p>
      )}
      {recommendation.inventoryFit && !recommendation.inventoryFit.exact && (
        <p className="brief-compromise">
          <strong>Größenkompromiss:</strong> Verwendet wird deine vorhandene Größe {sizeName[recommendation.setup.size]}
          ; bevorzugt wäre {sizeName[recommendation.inventoryFit.preferredSize]}.
        </p>
      )}
      <div className="option-actions">
        <button className={primary ? 'primary quick-start' : 'secondary'} disabled={disabled} onClick={onStart}>
          {primary ? 'Mit diesem Plan ans Wasser' : 'Alternative starten'}
          <Icon name="arrow-right" size={20} />
        </button>
        <button
          className="accordion-toggle"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Details schließen' : 'Details anzeigen'}
          <Icon name="chevron-down" size={18} />
        </button>
      </div>
      <div id={panelId} hidden={!expanded}>
        <RecommendationDetails recommendation={recommendation} fish={fish} />
      </div>
    </article>
  )
}

export function RecommendationPage() {
  const state: unknown = useLocation().state
  const conditions = canRecommend(state) ? state : null
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
        <Link className="primary" to="/neu">
          Bedingungen erfassen
        </Link>
      </section>
    )
  const start = (recommendation: Recommendation) => {
    const session = sessionStore.create(conditions, recommendation)
    if (session) navigate(`/session/${session.id}/karte`)
  }
  return (
    <section className="page-shell recommendation-page">
      <PlanProgress step={2} />
      <p className="eyebrow">{fishLabel[conditions.targetFish]} · SEE · VOM UFER</p>
      <h1>{decision.practicalPrimary ? 'Dein Angelplan.' : 'Wähle noch deine Köder.'}</h1>
      <p className="lead">
        {decision.practicalPrimary
          ? 'Passende Optionen aus deiner Köderbox. Wähle deinen Start.'
          : 'Deine Bedingungen sind erfasst. Ergänze passende Köder, um deinen Angelplan zu starten.'}
      </p>
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
          <Link to={`/session/${activeSession.id}/karte`}>Aktive Session fortsetzen →</Link>
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
          <Link className="primary" to="/bestand" state={{ returnConditions: conditions }}>
            Passende Köder auswählen
            <Icon name="arrow-right" />
          </Link>
        </article>
      )}
      <div className="plan-edit-links">
        <Link className="secondary" to={`/neu/${conditions.targetFish}`} state={conditions}>
          Bedingungen ändern
        </Link>
        <Link className="secondary" to="/bestand" state={{ returnConditions: conditions }}>
          Köderbox bearbeiten
        </Link>
      </div>
      {decision.optionalLureTip && (
        <section className="optional-tips">
          <h2>Fachlich beste Ergänzung</h2>
          <p>Diese Option fehlt in deiner Köderbox und kann hier nicht gestartet werden.</p>
          <article className="optional-option">
            <span className="overline">NICHT IN DEINER KÖDERBOX</span>
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
            <span className="overline">FALLS AM GEWÄSSER VORHANDEN</span>
            <h3>{decision.optionalSpotTip.spot.spot.label}</h3>
            <p>Diesen Bereich hast du nicht bestätigt. Prüfe ihn nur, wenn er tatsächlich erreichbar vorhanden ist.</p>
          </article>
        </section>
      )}
    </section>
  )
}
