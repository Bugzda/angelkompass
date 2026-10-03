import type { CSSProperties } from 'react'
import { sizeLabelFor } from '../../domain/engine/presentation'
import type { InventoryItem, LureType, SizeClass, TargetFish } from '../../domain/models/types'
import { Icon } from '../../ui/components/Icon'

const sizeNames: Record<SizeClass, string> = { small: 'Klein', medium: 'Mittel', large: 'Groß' }

/** One lure with its sizes as a single row of two-line toggles. */
export function LureCard({
  fish,
  fishName,
  lure,
  item,
  onToggleSize,
  onToggleAll,
}: {
  fish: TargetFish
  fishName: string
  lure: LureType
  item: InventoryItem | undefined
  onToggleSize: (fish: TargetFish, lure: LureType['id'], size: SizeClass) => void
  onToggleAll: (fish: TargetFish, lure: LureType['id']) => void
}) {
  const selectedSizes = lure.sizes.filter(size => item?.sizes.includes(size))
  const hasAll = Boolean(item) && selectedSizes.length === lure.sizes.length
  const style = { '--segments': lure.sizes.length + 1 } as CSSProperties
  return (
    <article className={item ? 'selected inventory-sized' : ''}>
      <div className="inventory-title">
        <div>
          <strong>{lure.label}</strong>
          <small className="inventory-size-summary">
            {item ? `Gespeichert: ${selectedSizes.map(size => sizeNames[size]).join(', ')}` : 'Keine Größe ausgewählt'}
          </small>
          {item?.migratedNeedsReview && <small>Aus Altbestand übernommen · Größen prüfen</small>}
        </div>
        <span className={`inventory-count${item ? ' has-items' : ''}`} aria-hidden="true">
          {selectedSizes.length}/{lure.sizes.length}
        </span>
      </div>
      <div className="inventory-size-choices" style={style}>
        {lure.sizes.map(size => {
          const selected = item?.sizes.includes(size) ?? false
          const range = sizeLabelFor(lure, size)
          return (
            <button
              type="button"
              className={selected ? 'selected' : ''}
              aria-label={`${fishName} ${lure.label}: ${sizeNames[size]} · ${range}`}
              aria-pressed={selected}
              onClick={() => onToggleSize(fish, lure.id, size)}
              key={size}
            >
              <strong>
                {selected && <Icon name="check" size={13} />}
                {sizeNames[size]}
              </strong>
              <small>{range}</small>
            </button>
          )
        })}
        <button
          type="button"
          className={`all-sizes${hasAll ? ' selected' : ''}`}
          aria-label={`${fishName} ${lure.label}: Alle Größen`}
          aria-pressed={hasAll}
          onClick={() => onToggleAll(fish, lure.id)}
        >
          <strong>
            {hasAll && <Icon name="check" size={13} />}
            Alle
          </strong>
          <small>Größen</small>
        </button>
      </div>
    </article>
  )
}
