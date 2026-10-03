import { type ReactNode, useEffect, useRef } from 'react'
import { fishLabel } from '../../domain/species/profiles'
import type { Recommendation, SessionProgress, TargetFish } from '../../domain/models/types'
import { presentationForDisplay } from '../../domain/engine/presentation'
import { SwitchSetupDetails } from './SwitchSetupDetails'

const phaseLabels = { initial: 'Start', refine: 'Anpassen', move: 'Spotwechsel' }

export function CompactRecommendation({
  recommendation,
  fish,
  progress = 'initial',
  completed = false,
  stepAddon,
}: {
  recommendation: Recommendation
  fish: TargetFish
  progress?: SessionProgress
  completed?: boolean
  /** Rendered directly below the current step, e.g. the step clock. */
  stepAddon?: ReactNode
}) {
  const current = recommendation.switchPlan.find(step => step.phase === progress)
  const stepIndex = recommendation.switchPlan.findIndex(step => step.phase === progress)
  const presentation = presentationForDisplay(recommendation.setup)
  const currentRef = useRef<HTMLElement>(null)
  const previousProgress = useRef(progress)
  const starting = progress === 'initial' && !completed
  const currentSetup = !completed
    ? (current?.setup ?? (progress === 'exhausted' ? recommendation.switchPlan.at(-1)?.setup : undefined))
    : undefined

  useEffect(() => {
    if (previousProgress.current === progress) return
    previousProgress.current = progress
    currentRef.current?.focus({ preventScroll: true })
    currentRef.current?.scrollIntoView?.({ block: 'start', behavior: 'instant' })
  }, [progress])

  return (
    <article className="water-card focused-plan">
      <img className="water-fish" src={`${import.meta.env.BASE_URL}assets/terrain/${fish}.webp`} alt="" />
      <header className="water-heading">
        <span className="overline">
          {fishLabel[fish]} ·{' '}
          {completed ? 'Gespeicherter Angelplan' : current ? `Schritt ${stepIndex + 1} von 3` : 'Plan ausprobiert'}
        </span>
        <h1>
          {starting
            ? recommendation.setup.lure.label
            : completed
              ? 'Dein Angelplan im Rückblick'
              : current
                ? 'Dein nächster Schritt'
                : 'Deine Session läuft weiter'}
        </h1>
        {starting && (
          <p className="water-spot">
            {recommendation.spot.spot.label} · {presentation.sizeLabel}
          </p>
        )}
      </header>

      <section
        className="current-step"
        ref={currentRef}
        tabIndex={-1}
        aria-label="Aktueller Handlungsschritt"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="overline">
          {completed ? 'Session abgeschlossen' : current ? 'Jetzt' : 'Alle Schritte ausprobiert'}
        </span>
        <h2>{completed ? 'Dein gespeicherter Angelplan' : (current?.title ?? 'Weiterangeln oder abschließen')}</h2>
        <p>
          {completed
            ? 'Dein Angelplan und deine Rückmeldungen bleiben im Logbuch erhalten.'
            : (current?.change ??
              'Du kannst weiterangeln und Bisse oder Fänge erfassen. Beende die Session, wenn du fertig bist.')}
        </p>
        {current && !completed && <small>{current.limit}</small>}
      </section>
      {stepAddon}

      <ol className="water-progress" aria-label="Wechselplan">
        {recommendation.switchPlan.map((step, index) => (
          <li
            key={step.phase}
            className={!completed && step.phase === progress ? 'current' : ''}
            aria-current={!completed && step.phase === progress ? 'step' : undefined}
          >
            <span>{index + 1}</span>
            {phaseLabels[step.phase]}
          </li>
        ))}
      </ol>

      {currentSetup && (
        <details className="step-setup" key={`setup-${progress}`} open>
          <summary>
            {starting
              ? 'Montage & Führung'
              : progress === 'exhausted'
                ? 'Zuletzt verwendete Montage & Führung'
                : 'Montage & Führung für diesen Schritt'}
          </summary>
          <SwitchSetupDetails setup={currentSetup} />
        </details>
      )}
      {!completed && current && !starting && !currentSetup && (
        <p className="legacy-step-note">
          Die Montage dieses Wechselschritts wurde in deinem damaligen Plan nicht gespeichert. Folge der Anweisung oben;
          die Angaben unten gehören zum ursprünglichen Startplan.
        </p>
      )}
      {(!starting || !currentSetup) && (
        <details className="starting-setup" key={`original-${progress}`} open={starting || completed}>
          <summary>{starting ? 'Montage & Führung' : 'Ursprünglicher Startplan'}</summary>
          {!starting && (
            <div className="original-plan-label">
              <strong>{recommendation.setup.lure.label}</strong>
              <p>{recommendation.spot.spot.label}</p>
              <small>
                Diese Angaben gehören zum gespeicherten Startplan.
                {!completed && ' Für den nächsten Versuch gilt die Anweisung oben.'}
              </small>
            </div>
          )}
          <div className="water-specs">
            <span>
              <small>Größe</small>
              {presentation.sizeLabel}
            </span>
            <span>
              <small>{presentation.weightKind === 'lure-total' ? 'Ködergewicht' : 'Beschwerung'}</small>
              {presentation.weightLabel.split(' · ')[0]}
            </span>
          </div>
          {presentation.weightLabel.includes(' · ') && (
            <p className="weight-hint">{presentation.weightLabel.split(' · ').slice(1).join(' · ')}</p>
          )}
          <section>
            <h2>Montage</h2>
            <p>{presentation.mounting}</p>
          </section>
          <section>
            <h2>Führung</h2>
            <p>{presentation.guidance}</p>
          </section>
          <section>
            <h2>Farbe</h2>
            <p>{recommendation.colorGuidance.baseLabel ?? recommendation.colorGuidance.familyLabel}</p>
          </section>
        </details>
      )}
    </article>
  )
}
