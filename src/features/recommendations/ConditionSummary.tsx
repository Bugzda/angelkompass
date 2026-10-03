import { Link } from 'react-router-dom'
import { Icon } from '../../ui/components/Icon'
import { conditionChips } from '../situation/conditionOptions'
import type { PlanningState } from '../spots/planningState'

/** Compact recap of the entered conditions; each chip jumps to its field on the conditions page. */
export function ConditionSummary({ state }: { state: PlanningState }) {
  return (
    <nav className="condition-chips" aria-label="Deine Bedingungen – zum Ändern antippen">
      {conditionChips(state).map(chip => (
        <Link
          viewTransition
          key={chip.field}
          to={{ pathname: `/neu/${state.targetFish}`, hash: chip.field }}
          state={state}
          className={chip.unknown ? 'unknown' : undefined}
        >
          {chip.label}
        </Link>
      ))}
      <Link
        viewTransition
        to={`/neu/${state.targetFish}`}
        state={state}
        className="condition-edit"
        aria-label="Alle Bedingungen bearbeiten"
      >
        <Icon name="arrow-right" size={16} />
      </Link>
    </nav>
  )
}
