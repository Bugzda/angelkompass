import type {
  Conditions,
  InventoryItem,
  LureType,
  ObservableStructure,
  Season,
  SizeClass,
  TargetFish,
  WaterTemperature,
} from '../models/types'
import { profileFor } from '../species/profiles'
import { applicableLureOrder, inventorySizeFor } from './scoring'

/**
 * Descriptive lure box analysis. It replays the unchanged practical selection (max. three owned,
 * depth-compatible lures) over a fixed grid of lake situations. It never changes rankings or rule weights
 * and its shares are coverage figures, not catch probabilities.
 */
export const GAP_ANALYSIS_VERSION = 1

/** Plausible water temperature classes per season for central European lakes (analysis grid only). */
export const seasonTemperatures: Record<Season, WaterTemperature[]> = {
  winter: ['cold', 'cool'],
  spring: ['cold', 'cool', 'mild'],
  summer: ['mild', 'warm', 'hot'],
  autumn: ['cool', 'mild', 'warm'],
}
const timeAndLight: Array<Pick<Conditions, 'timeOfDay' | 'light'>> = [
  { timeOfDay: 'dawn', light: 'diffuse' },
  { timeOfDay: 'day', light: 'bright' },
  { timeOfDay: 'day', light: 'diffuse' },
  { timeOfDay: 'dusk', light: 'diffuse' },
  { timeOfDay: 'night', light: 'dark' },
]
const turbidities = ['clear', 'slightly_turbid', 'turbid'] as const
const depths = ['shallow', 'medium', 'deep'] as const
const vegetations = ['none', 'edgeOrGaps', 'dense'] as const

/** Observed structures offered by the planning form; the perch form has no hard cover. */
const structureOptions = (fish: TargetFish): ObservableStructure[][] => [
  [],
  ['dropoff'],
  ...(fish === 'perch' ? [] : [['hardCover'] as ObservableStructure[]]),
]

export function analysisScenarios(fish: TargetFish): Conditions[] {
  const scenarios: Conditions[] = []
  for (const [season, temperatures] of Object.entries(seasonTemperatures) as Array<[Season, WaterTemperature[]]>)
    for (const waterTemperature of temperatures)
      for (const time of timeAndLight)
        for (const turbidity of turbidities)
          for (const depth of depths)
            for (const vegetation of vegetations)
              for (const observedStructure of structureOptions(fish))
                scenarios.push({
                  targetFish: fish,
                  waterType: 'lake',
                  season,
                  ...time,
                  turbidity,
                  depth,
                  waterTemperature,
                  activity: { status: 'unknown', signs: [] },
                  vegetation,
                  observedStructure,
                  structureStatus: observedStructure.length ? 'observed' : 'unknown',
                  ...(fish === 'pike' ? { pikeSafetyConfirmed: true } : {}),
                })
  return scenarios
}

export interface GapCandidate {
  lureId: LureType['id']
  lureLabel: string
  size: SizeClass
  /** A lure type not yet in the box, or an additional size of an owned lure. */
  kind: 'newLure' | 'newSize'
  /** Situations in which it would be among the (max. three) startable options. */
  practical: number
  /** Situations in which it would become the first startable option. */
  primary: number
  /** Situations without any startable option that it would cover. */
  unlocks: number
  /** Situations in which exactly this lure and size is the first applicable choice of the rules. */
  bestFit: number
}

export interface InventoryGapAnalysis {
  version: typeof GAP_ANALYSIS_VERSION
  targetFish: TargetFish
  rulesetVersion: string
  scenarioCount: number
  /** Situations with at least one startable option. */
  covered: number
  /** Situations in which the first applicable lure is owned in its preferred size. */
  bestOwned: number
  /** Situations whose first startable option uses a neighbouring size. */
  compromise: number
  candidates: GapCandidate[]
}

type Pick3 = Array<{ lureId: LureType['id']; size: SizeClass; exact: boolean }>

function practicalPick(conditions: Conditions, order: ReturnType<typeof applicableLureOrder>, box: InventoryItem[]) {
  const picked: Pick3 = []
  for (const { lure, size } of order) {
    const owned = inventorySizeFor(conditions, box, lure, size)
    if (owned) picked.push({ lureId: lure.id, size: owned, exact: owned === size })
    if (picked.length === 3) break
  }
  return picked
}

function withCandidate(inventory: InventoryItem[], fish: TargetFish, lureId: LureType['id'], size: SizeClass) {
  const existing = inventory.find(item => item.targetFish === fish && item.lureTypeId === lureId)
  return existing
    ? inventory.map(item => (item === existing ? { ...item, sizes: [...item.sizes, size] } : item))
    : [...inventory, { targetFish: fish, lureTypeId: lureId, sizes: [size] }]
}

export function analyzeInventoryGaps(
  fish: TargetFish,
  inventory: InventoryItem[],
  scenarios: Conditions[] = analysisScenarios(fish),
): InventoryGapAnalysis {
  const profile = profileFor(fish)
  const box = inventory.filter(item => item.targetFish === fish)
  const candidates = profile.lures.flatMap(lure =>
    lure.sizes
      .filter(size => !box.some(item => item.lureTypeId === lure.id && item.sizes.includes(size)))
      .map(size => ({
        lure,
        size,
        box: withCandidate(box, fish, lure.id, size),
        tally: { practical: 0, primary: 0, unlocks: 0, bestFit: 0 },
      })),
  )
  let covered = 0,
    bestOwned = 0,
    compromise = 0
  for (const conditions of scenarios) {
    const order = applicableLureOrder(conditions)
    const base = practicalPick(conditions, order, box)
    if (base.length) covered++
    if (base[0] && !base[0].exact) compromise++
    if (order[0] && inventorySizeFor(conditions, box, order[0].lure, order[0].size) === order[0].size) bestOwned++
    for (const candidate of candidates) {
      if (order[0]?.lure.id === candidate.lure.id && order[0].size === candidate.size) candidate.tally.bestFit++
      const picked = practicalPick(conditions, order, candidate.box)
      const index = picked.findIndex(item => item.lureId === candidate.lure.id && item.size === candidate.size)
      if (index < 0) continue
      candidate.tally.practical++
      if (index === 0) candidate.tally.primary++
      if (!base.length) candidate.tally.unlocks++
    }
  }
  return {
    version: GAP_ANALYSIS_VERSION,
    targetFish: fish,
    rulesetVersion: profile.rulesetVersion,
    scenarioCount: scenarios.length,
    covered,
    bestOwned,
    compromise,
    candidates: candidates
      .filter(candidate => candidate.tally.practical > 0)
      .map(candidate => ({
        lureId: candidate.lure.id,
        lureLabel: candidate.lure.label,
        size: candidate.size,
        kind: box.some(item => item.lureTypeId === candidate.lure.id) ? ('newSize' as const) : ('newLure' as const),
        ...candidate.tally,
      }))
      // An empty box makes every candidate the start lure, so rank by the rules' own first choice there.
      .sort(
        (a, b) =>
          (box.length ? b.unlocks - a.unlocks || b.primary - a.primary : 0) ||
          b.bestFit - a.bestFit ||
          b.primary - a.primary ||
          b.practical - a.practical ||
          a.lureLabel.localeCompare(b.lureLabel, 'de'),
      ),
  }
}
