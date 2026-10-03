import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { fishLabel } from '../../domain/species/profiles'
import { zanderLures } from '../../domain/catalogs/zanderLures'
import { lures } from '../../domain/catalogs/lures'
import { pikeLures } from '../../domain/catalogs/pikeLures'
import type { LureType, TargetFish } from '../../domain/models/types'
import { Icon } from '../../ui/components/Icon'
import { useInventory } from './useInventory'
import { LureCard } from './LureCard'
import { canRecommend, isConditions, isRecord } from '../../domain/models/validation'

export function InventoryPage() {
  const { inventory, toggleSize, toggleAllSizes, error } = useInventory()
  const state: unknown = useLocation().state
  const returnConditions = isRecord(state) && canRecommend(state.returnConditions) ? state.returnConditions : undefined
  const draftConditions = isRecord(state) && isConditions(state.draftConditions) ? state.draftConditions : undefined
  const context = returnConditions ?? draftConditions
  const [fishFilter, setFishFilter] = useState<TargetFish | 'all'>(context?.targetFish ?? 'all')
  const [query, setQuery] = useState('')
  const groups: Array<{ fish: TargetFish; label: string; lures: LureType[] }> = [
    { fish: 'perch', label: 'Barsch', lures },
    { fish: 'zander', label: 'Zander', lures: zanderLures },
    { fish: 'pike', label: 'Hecht', lures: pikeLures },
  ]
  // Lures already in the box come first; the order is fixed per visit so cards do not jump while toggling.
  const [initialSelection] = useState(() => new Set(inventory.map(item => `${item.targetFish}:${item.lureTypeId}`)))
  const orderedLures = (group: { fish: TargetFish; lures: LureType[] }) => [
    ...group.lures.filter(lure => initialSelection.has(`${group.fish}:${lure.id}`)),
    ...group.lures.filter(lure => !initialSelection.has(`${group.fish}:${lure.id}`)),
  ]
  const selectedForContext = context
    ? inventory.filter(item => item.targetFish === context.targetFish).length
    : inventory.length
  const visibleGroups = groups.filter(group => fishFilter === 'all' || fishFilter === group.fish)
  const matchesQuery = (lure: LureType) =>
    lure.label.toLocaleLowerCase('de').includes(query.trim().toLocaleLowerCase('de'))
  const hasResults = visibleGroups.some(group => group.lures.some(matchesQuery))

  return (
    <section className={`page-shell inventory-page compact-inventory${context ? ' inventory-in-plan' : ''}`}>
      <p className="eyebrow">{context ? `${fishLabel[context.targetFish]}-PLAN` : 'DEINE AUSRÜSTUNG'}</p>
      <h1>{context ? 'Köder auswählen.' : 'Deine Köderbox.'}</h1>
      <p className="lead">Markiere die Ködergrößen, die du dabei hast.</p>
      {error ? (
        <p className="storage-error" role="alert">
          {error}
        </p>
      ) : (
        <p className="save-status" role="status">
          <Icon name="check" size={16} /> {selectedForContext} {selectedForContext === 1 ? 'Ködertyp' : 'Ködertypen'}{' '}
          ausgewählt · auf diesem Gerät gespeichert
        </p>
      )}
      <div className="collection-toolbar">
        {!context && (
          <div className="chips" role="group" aria-label="Köderbox nach Zielfisch filtern">
            {(['all', 'perch', 'pike', 'zander'] as const).map(value => (
              <button
                key={value}
                type="button"
                className={fishFilter === value ? 'selected' : ''}
                aria-pressed={fishFilter === value}
                onClick={() => setFishFilter(value)}
              >
                {value === 'all' ? 'Alle' : fishLabel[value]}
              </button>
            ))}
          </div>
        )}
        <label className="search-field">
          <Icon name="search" size={18} />
          <span className="sr-only">Köder suchen</span>
          <input
            type="search"
            placeholder="Köder suchen …"
            value={query}
            onChange={event => setQuery(event.target.value)}
          />
        </label>
      </div>
      {visibleGroups.map(group => (
        <section className="inventory-species" aria-labelledby={`inventory-${group.fish}`} key={group.fish}>
          <h2 className={context ? 'sr-only' : ''} id={`inventory-${group.fish}`}>
            {group.label}
          </h2>
          <div className="inventory-options">
            {orderedLures(group)
              .filter(matchesQuery)
              .map(lure => (
                <LureCard
                  key={lure.id}
                  fish={group.fish}
                  fishName={group.label}
                  lure={lure}
                  item={inventory.find(entry => entry.targetFish === group.fish && entry.lureTypeId === lure.id)}
                  onToggleSize={toggleSize}
                  onToggleAll={toggleAllSizes}
                />
              ))}
          </div>
          {!group.lures.some(matchesQuery) && <p className="filter-empty">Keine Köder für „{query}“ gefunden.</p>}
        </section>
      ))}
      {!hasResults && (
        <button className="secondary" onClick={() => setQuery('')}>
          Suche zurücksetzen
        </button>
      )}
      <Link viewTransition className="data-link" to="/daten">
        <Icon name="download" size={18} />
        <span>
          Köderbox und Logbuch sichern<small>Datensicherung & Wiederherstellung</small>
        </span>
        <Icon name="arrow-right" size={18} />
      </Link>
      {context && (
        <div className="flow-action">
          <span>
            {selectedForContext}
            <small>ausgewählt</small>
          </span>
          <Link
            viewTransition
            className="primary"
            to={returnConditions ? '/empfehlung' : `/neu/${context.targetFish}`}
            state={context}
          >
            {returnConditions ? 'Zurück zum Angelplan' : 'Weiter zu den Bedingungen'}
            <Icon name="arrow-right" size={18} />
          </Link>
        </div>
      )}
    </section>
  )
}
