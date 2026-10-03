import type { Conditions } from '../../domain/models/types'
import { isRecord } from '../../domain/models/validation'

/** Reference to the chosen spot, carried next to the conditions through the planning flow. */
export interface SpotRef {
  id: string
  name: string
}
export type PlanningState = Conditions & { spotRef?: SpotRef }

export function isSpotRef(value: unknown): value is SpotRef {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    value.name.length > 0 &&
    value.name.length <= 60
  )
}

export function readSpotRef(state: unknown): SpotRef | undefined {
  return isRecord(state) && isSpotRef(state.spotRef) ? { id: state.spotRef.id, name: state.spotRef.name } : undefined
}

/** The engine and stored conditions never see the spot reference. */
export function conditionsOnly<T extends Conditions>(state: T): Conditions {
  const { spotRef: _spotRef, ...conditions } = state as T & { spotRef?: unknown }
  return conditions
}

export function withSpot(conditions: Conditions, spot: SpotRef | undefined): PlanningState {
  return spot ? { ...conditions, spotRef: spot } : conditionsOnly(conditions)
}
