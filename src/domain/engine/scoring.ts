import { lures } from '../catalogs/lures'
import { spots } from '../catalogs/spots'
import type {
  Conditions,
  Confidence,
  RankedSetup,
  RankedSpot,
  ReasonContribution,
  Recommendation,
  RecommendationDecision,
  InventoryItem,
} from '../models/types'
import { explain } from './explanations'
import { evidencePoints, evidenceRules } from '../rules/perchLakeRules'

const clamp = (value: number) => Math.max(0, Math.min(100, value))
const contribution = (ruleId: string, reasonCode: string, scoreDelta: number): ReasonContribution => ({ ruleId, reasonCode, scoreDelta })

export function evaluateSpots(conditions: Conditions): RankedSpot[] {
  return spots.map((spot) => {
    const reasons: ReasonContribution[] = []
    if (conditions.observedStructure.includes(spot.id)) reasons.push(contribution('spot.observed', 'OBSERVED_STRUCTURE', 20))
    if (spot.id === 'vegetation' && ['spring', 'summer'].includes(conditions.season)) reasons.push(contribution(evidenceRules.springSummerVegetation.id, evidenceRules.springSummerVegetation.reasonCode, evidencePoints(evidenceRules.springSummerVegetation)))
    if (spot.id === 'dropoff' && conditions.season === 'autumn') reasons.push(contribution(evidenceRules.autumnDropoff.id, evidenceRules.autumnDropoff.reasonCode, evidencePoints(evidenceRules.autumnDropoff)))
    if (spot.id === 'dropoff' && conditions.season === 'winter') reasons.push(contribution(evidenceRules.winterDropoff.id, evidenceRules.winterDropoff.reasonCode, evidencePoints(evidenceRules.winterDropoff)))
    if (conditions.depth !== 'unknown' && spot.depthAffinity.includes(conditions.depth)) reasons.push(contribution('spot.depth', 'DEPTH_MATCH', 12))
    if (conditions.season !== 'summer' && ['dawn', 'dusk'].includes(conditions.timeOfDay) && spot.id === 'shallow') reasons.push(contribution(evidenceRules.twilightShallow.id, evidenceRules.twilightShallow.reasonCode, evidencePoints(evidenceRules.twilightShallow)))
    if (conditions.turbidity === 'clear' && conditions.timeOfDay === 'day' && spot.id === 'dropoff') reasons.push(contribution(evidenceRules.clearBrightDepth.id, evidenceRules.clearBrightDepth.reasonCode, evidencePoints(evidenceRules.clearBrightDepth)))
    if (conditions.season === 'winter' && spot.id === 'shallow') reasons.push(contribution('spot.winter-shallow', 'WINTER_SHALLOW_PENALTY', -12))
    return { spot, score: clamp(50 + reasons.reduce((sum, item) => sum + item.scoreDelta, 0)), reasons }
  }).sort((a, b) => b.score - a.score || a.spot.priority - b.spot.priority || a.spot.id.localeCompare(b.spot.id))
}

function setupProperties(conditions: Conditions, lure: (typeof lures)[number]) {
  const color = conditions.turbidity === 'clear' ? 'natural' : conditions.turbidity === 'turbid' || conditions.timeOfDay === 'night' ? 'contrast' : 'transparent'
  const size = conditions.season === 'winter' ? 'small' : 'medium'
  const weight = conditions.depth === 'deep' ? 'heavy' : conditions.depth === 'shallow' ? 'light' : 'medium'
  return {
    color: lure.id === 'ned' && conditions.turbidity === 'clear' ? 'transparent' : color,
    size: lure.sizes.includes(size) ? size : lure.sizes[0],
    weight,
  } as const
}

export function evaluateSetups(conditions: Conditions, spot: RankedSpot): RankedSetup[] {
  return lures
    .filter((lure) => conditions.depth === 'unknown' || lure.depths.includes(conditions.depth))
    .map((lure) => {
      const reasons: ReasonContribution[] = []
      if (conditions.turbidity === 'clear' && lure.style === 'finesse') reasons.push(contribution('PL010', 'CLEAR_WATER_NATURAL', 4))
      if (conditions.turbidity === 'turbid' && lure.style === 'search') reasons.push(contribution(evidenceRules.turbidSearch.id, evidenceRules.turbidSearch.reasonCode, evidencePoints(evidenceRules.turbidSearch)))
      if (conditions.season === 'winter' && lure.style === 'finesse') reasons.push(contribution(evidenceRules.winterFinesse.id, evidenceRules.winterFinesse.reasonCode, evidencePoints(evidenceRules.winterFinesse)))
      if (spot.spot.id === 'dropoff' && ['jig', 'drop-shot'].includes(lure.id)) reasons.push(contribution('lure.dropoff', 'DROPOFF_CONTROL', 14))
      if (spot.spot.id === 'vegetation' && ['twitchbait', 'spinner'].includes(lure.id)) reasons.push(contribution(evidenceRules.vegetationEdge.id, evidenceRules.vegetationEdge.reasonCode, evidencePoints(evidenceRules.vegetationEdge)))
      if (spot.spot.id === 'shallow' && lure.style === 'search') reasons.push(contribution('lure.shallow', 'SHALLOW_SEARCH', 12))
      const properties = setupProperties(conditions, lure)
      return { lure, score: clamp(50 + reasons.reduce((sum, item) => sum + item.scoreDelta, 0)), ...properties, reasons } as RankedSetup
    })
    .sort((a, b) => b.score - a.score || a.lure.priority - b.lure.priority || a.lure.id.localeCompare(b.lure.id))
}

function confidence(conditions: Conditions, scoreGap: number): Confidence {
  const known = [conditions.timeOfDay, conditions.turbidity, conditions.depth].filter((value) => value !== 'unknown').length + (conditions.observedStructure.length ? 1 : 0)
  if (known === 4 && scoreGap >= 8) return 'high'
  if (known >= 2) return 'medium'
  return 'low'
}

function alternativeFor(setup: RankedSetup): string {
  if (setup.lure.style === 'search') return 'Nach 12–15 Würfen auf Ned Rig wechseln und deutlich langsamer führen.'
  if (setup.lure.id === 'drop-shot') return 'Nach 8 Minuten ohne Kontakt einen Gummifisch am Jigkopf eine Gewichtsklasse schwerer anbieten.'
  return 'Nach 10–12 Würfen Führung verlangsamen; bleibt der Kontakt aus, mit Twitchbait mehr Wasser absuchen.'
}

function rankCandidates(conditions: Conditions): Array<Recommendation & { totalScore: number }> {
  const rankedSpots = evaluateSpots(conditions)
  const candidates = rankedSpots.flatMap((spot) => evaluateSetups(conditions, spot).map((setup) => ({ spot, setup })))
  const selected: typeof candidates = []
  for (const candidate of candidates.sort((a, b) => (b.spot.score + b.setup.score) - (a.spot.score + a.setup.score) || a.spot.spot.priority - b.spot.spot.priority || a.setup.lure.priority - b.setup.lure.priority)) {
    if (!selected.some((item) => item.setup.lure.id === candidate.setup.lure.id)) selected.push(candidate)
    if (selected.length === lures.length) break
  }
  const topScore = selected[0].spot.score + selected[0].setup.score
  const nextScore = selected[1].spot.score + selected[1].setup.score
  return selected.map(({ spot, setup }, index) => ({
    rank: index + 1,
    spot,
    setup,
    confidence: confidence(conditions, topScore - nextScore),
    reasons: [...spot.reasons, ...setup.reasons].filter((item) => item.scoreDelta > 0).sort((a, b) => b.scoreDelta - a.scoreDelta).slice(0, 3).map(explain),
    attemptLimit: index === 0 ? '12 Würfe oder 8 Minuten' : index === 1 ? '10–12 Würfe' : '15 Würfe, dann Spot neu bewerten',
    noBiteAlternative: alternativeFor(setup),
    totalScore: spot.score + setup.score,
  }))
}

export function createRecommendations(conditions: Conditions): Recommendation[] {
  return rankCandidates(conditions).slice(0, 3)
}

export function createRecommendationDecision(conditions: Conditions, inventory: InventoryItem[]): RecommendationDecision {
  const completeRanking = rankCandidates(conditions)
  const available = new Set(inventory.map((item) => item.lureTypeId))
  const practicalPrimary = completeRanking.find((item) => available.has(item.setup.lure.id))
  const bestMissing = completeRanking.find((item) => !available.has(item.setup.lure.id))
  const suitabilityGap = practicalPrimary ? completeRanking[0].totalScore - practicalPrimary.totalScore : 0
  return {
    expertRanking: completeRanking.slice(0, 3),
    practicalPrimary,
    bestMissing,
    suitabilityGap,
    suitabilityWarning: suitabilityGap >= 8 ? `Dein bester vorhandener Köder liegt ${suitabilityGap} Eignungspunkte hinter der fachlich besten Option.` : undefined,
  }
}
