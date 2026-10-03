import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { GapCandidate, InventoryGapAnalysis } from '../../domain/engine/inventoryGaps'
import { sizeLabelFor } from '../../domain/engine/presentation'
import type { SizeClass, TargetFish } from '../../domain/models/types'
import { isRecord } from '../../domain/models/validation'
import { fishLabel, profileFor } from '../../domain/species/profiles'
import { Icon } from '../../ui/components/Icon'
import { showToast } from '../../ui/components/Toast'
import { useGapAnalysis } from './useGapAnalysis'
import { useInventory } from './useInventory'

const sizeNames: Record<SizeClass, string> = { small: 'Klein', medium: 'Mittel', large: 'Groß' }
const fishes: TargetFish[] = ['perch', 'pike', 'zander']
const MAX_SUGGESTIONS = 5

const percent = (value: number, total: number) => (total ? Math.round((value / total) * 100) : 0)

function Suggestion({
  candidate,
  analysis,
  onAdd,
}: {
  candidate: GapCandidate
  analysis: InventoryGapAnalysis
  onAdd: () => void
}) {
  const lure = profileFor(analysis.targetFish).lures.find(item => item.id === candidate.lureId)
  const total = analysis.scenarioCount
  return (
    <li className="gap-suggestion">
      <div>
        <span className={`gap-kind ${candidate.kind}`}>
          {candidate.kind === 'newLure' ? 'Neuer Köder' : 'Weitere Größe'}
        </span>
        <strong>{candidate.lureLabel}</strong>
        <small>
          {sizeNames[candidate.size]}
          {lure ? ` · ${sizeLabelFor(lure, candidate.size)}` : ''}
        </small>
      </div>
      <ul className="gap-figures">
        {candidate.unlocks > 0 && analysis.covered > 0 && (
          <li>
            <strong>{percent(candidate.unlocks, total)} %</strong> erstmals planbar
          </li>
        )}
        {/* With an empty box every candidate would be the start lure, so the figure says nothing there. */}
        {analysis.covered > 0 && (
          <li>
            <strong>{percent(candidate.primary, total)} %</strong> würde dein Startköder
          </li>
        )}
        <li>
          <strong>{percent(candidate.bestFit, total)} %</strong> fachlich beste Wahl
        </li>
      </ul>
      <button
        type="button"
        className="secondary"
        aria-label={`${candidate.lureLabel} ${sizeNames[candidate.size]} zur Köderbox hinzufügen`}
        onClick={onAdd}
      >
        <Icon name="plus" size={16} /> Habe ich jetzt
      </button>
    </li>
  )
}

function Result({ analysis, onAdd }: { analysis: InventoryGapAnalysis; onAdd: (candidate: GapCandidate) => void }) {
  const total = analysis.scenarioCount
  // One entry per lure (its most useful size), so a single lure cannot fill the list with its sizes.
  const suggestions = analysis.candidates
    .filter(candidate => candidate.primary > 0 || candidate.unlocks > 0)
    .filter((candidate, index, all) => all.findIndex(item => item.lureId === candidate.lureId) === index)
    .slice(0, MAX_SUGGESTIONS)
  const empty = analysis.covered === 0
  return (
    <>
      <dl className="logbook-stats gap-stats" aria-label="Abdeckung deiner Köderbox">
        <div>
          <dt>Planbar</dt>
          <dd>
            {percent(analysis.covered, total)}
            <small>%</small>
          </dd>
        </div>
        <div>
          <dt>Beste Wahl dabei</dt>
          <dd>
            {percent(analysis.bestOwned, total)}
            <small>%</small>
          </dd>
        </div>
        <div>
          <dt>Größen&shy;kompromiss</dt>
          <dd>
            {percent(analysis.compromise, total)}
            <small>%</small>
          </dd>
        </div>
      </dl>
      <p className="gap-legend">
        <strong>Planbar:</strong> mindestens ein vorhandener, tiefenpassender Köder. <strong>Beste Wahl dabei:</strong>{' '}
        der fachlich vorn liegende Köder ist in passender Größe vorhanden. <strong>Größenkompromiss:</strong> die erste
        startbare Option nutzt eine Nachbargröße.
      </p>
      <h2 className="gap-heading">{empty ? 'Guter Start für deine Box' : 'Sinnvollste Ergänzungen'}</h2>
      {empty && (
        <p className="notice">
          Für {fishLabel[analysis.targetFish]} ist noch nichts in deiner Köderbox. Jede Ergänzung macht Pläne möglich.
          Die Liste zeigt, welche Köder das Regelwerk am häufigsten vorn sieht.
        </p>
      )}
      {suggestions.length ? (
        <ol className="gap-suggestions">
          {suggestions.map(candidate => (
            <Suggestion
              key={`${candidate.lureId}:${candidate.size}`}
              candidate={candidate}
              analysis={analysis}
              onAdd={() => onAdd(candidate)}
            />
          ))}
        </ol>
      ) : (
        <p className="notice">
          Keine Ergänzung würde deinen Startköder in einer der geprüften Situationen verändern. Deine Box deckt das
          Regelwerk für {fishLabel[analysis.targetFish]} gut ab.
        </p>
      )}
    </>
  )
}

export function InventoryGapPage() {
  const { inventory, toggleSize, error } = useInventory()
  const state: unknown = useLocation().state
  const requested = isRecord(state) && fishes.includes(state.targetFish as TargetFish) ? state.targetFish : undefined
  const [fish, setFish] = useState<TargetFish>(
    () => (requested as TargetFish | undefined) ?? inventory[0]?.targetFish ?? 'perch',
  )
  const analysis = useGapAnalysis(fish, inventory)
  // A result for another species is never shown, not even while the new one is calculated.
  const current = analysis.status !== 'error' && analysis.result?.targetFish === fish ? analysis.result : undefined
  return (
    <section className="page-shell inventory-gap-page">
      <Link viewTransition className="back-link" to="/bestand">
        <Icon name="arrow-left" size={18} /> Zur Köderbox
      </Link>
      <p className="eyebrow">KÖDERBOX-ANALYSE</p>
      <h1>Wo fehlt dir etwas?</h1>
      <p className="lead">
        Deine Köderbox wird durch viele typische Situationen am See gerechnet, mit denselben Regeln wie dein Angelplan.
        So siehst du, welche Ergänzung am meisten bringt.
      </p>
      <div className="chips" role="group" aria-label="Zielfisch der Analyse">
        {fishes.map(value => (
          <button
            key={value}
            type="button"
            className={fish === value ? 'selected' : ''}
            aria-pressed={fish === value}
            onClick={() => setFish(value)}
          >
            {fishLabel[value]}
          </button>
        ))}
      </div>
      {error && (
        <p className="storage-error" role="alert">
          {error}
        </p>
      )}
      <div className="gap-result" aria-busy={analysis.status === 'running'}>
        {analysis.status === 'running' && !current && (
          <p className="gap-loading" role="status">
            Situationen werden durchgerechnet …
          </p>
        )}
        {analysis.status === 'error' && (
          <p className="storage-error" role="alert">
            Die Analyse konnte nicht berechnet werden. Deine Köderbox bleibt unverändert.
          </p>
        )}
        {current && (
          <Result
            analysis={current}
            onAdd={candidate => {
              toggleSize(fish, candidate.lureId, candidate.size)
              showToast(`${candidate.lureLabel} (${sizeNames[candidate.size]}) ist jetzt in deiner Köderbox.`)
            }}
          />
        )}
      </div>
      <details className="gap-method">
        <summary>So wird gerechnet</summary>
        <p>
          Geprüft werden {current ? current.scenarioCount.toLocaleString('de-DE') : 'alle'} Kombinationen aus Jahreszeit
          mit dazu passender Wassertemperatur, Tageszeit und Licht, Trübung, Tiefe, Krautbild und beobachteter Struktur.
          Jede Situation zählt gleich viel. Fischaktivität bleibt unbekannt und damit neutral; beim Hecht wird die
          Sicherheitsausrüstung als bestätigt angenommen.
        </p>
        <p>
          Für jede Situation wird das unveränderte fachliche Ranking berechnet und wie im Angelplan auf höchstens drei
          vorhandene, tiefenpassende Köder beschränkt. Dann wird jede fehlende Ködergröße einzeln probeweise ergänzt.
          Farbe spielt keine Rolle.
        </p>
        <p>
          Die Prozentwerte beschreiben die Abdeckung nach dem Regelwerk ({profileFor(fish).rulesetVersion}), keine
          Fangwahrscheinlichkeit. An deinem Gewässer können manche Situationen häufiger sein als andere.
        </p>
      </details>
    </section>
  )
}
