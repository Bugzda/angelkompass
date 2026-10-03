import { zanderLures } from '../catalogs/zanderLures'
import { zanderSpots } from '../catalogs/zanderSpots'
import { zanderAllRules, zanderSetupRules, zanderSpotRules } from '../rules/zanderLakeRules'
import { lures } from '../catalogs/lures'
import { pikeLures } from '../catalogs/pikeLures'
import { pikeSpots } from '../catalogs/pikeSpots'
import { spots } from '../catalogs/spots'
import type { LureType, SpotType, TargetFish } from '../models/types'
import { allRules, groupCaps, setupRules, spotRules, type ScoringRule } from '../rules/perchLakeRules'
import { pikeAllRules, pikeSetupRules, pikeSpotRules } from '../rules/pikeLakeRules'

export interface SpeciesProfile {
  targetFish: TargetFish
  label: string
  rulesetVersion: string
  lures: LureType[]
  spots: SpotType[]
  spotRules: ScoringRule[]
  setupRules: ScoringRule[]
  allRules: ScoringRule[]
  groupCaps: typeof groupCaps
}
export const fishLabel: Record<TargetFish, string> = { perch: 'Barsch', pike: 'Hecht', zander: 'Zander' }
export const speciesProfiles: Record<TargetFish, SpeciesProfile> = {
  perch: {
    targetFish: 'perch',
    label: 'Barsch',
    rulesetVersion: 'perch-lake-2.0.0',
    lures,
    spots,
    spotRules,
    setupRules,
    allRules,
    groupCaps,
  },
  zander: {
    targetFish: 'zander',
    label: 'Zander',
    rulesetVersion: 'zander-lake-1.0.0',
    lures: zanderLures,
    spots: zanderSpots,
    spotRules: zanderSpotRules,
    setupRules: zanderSetupRules,
    allRules: zanderAllRules,
    groupCaps,
  },
  pike: {
    targetFish: 'pike',
    label: 'Hecht',
    rulesetVersion: 'pike-lake-2.0.2',
    lures: pikeLures,
    spots: pikeSpots,
    spotRules: pikeSpotRules,
    setupRules: pikeSetupRules,
    allRules: pikeAllRules,
    groupCaps,
  },
}
export const profileFor = (fish: TargetFish) => speciesProfiles[fish]
