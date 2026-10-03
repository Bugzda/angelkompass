import type {
  Conditions,
  ConfidenceLevel,
  ConfidenceMetric,
  GuidanceMode,
  InventoryItem,
  LureType,
  RankedSetup,
  RankedSpot,
  ReasonContribution,
  Recommendation,
  RecommendationDecision,
  RuleGroup,
  SizeClass,
  SwitchSetup,
  SwitchStep,
} from '../models/types'
import { evidencePoints, type ScoringContext, type ScoringRule } from '../rules/perchLakeRules'
import { profileFor } from '../species/profiles'
import { buildColorGuidance, preferredColorFamily } from './colorGuidance'
import { explain } from './explanations'
import { resolvePresentation } from './presentation'

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))
const level = (value: number, high: number, medium: number): ConfidenceLevel =>
  value >= high ? 'high' : value >= medium ? 'medium' : 'low'

export function applyRuleGroups(
  rules: ScoringRule[],
  context: ScoringContext,
  previous: ReasonContribution[] = [],
): ReasonContribution[] {
  const groupCaps = profileFor(context.conditions.targetFish).groupCaps
  const running = new Map<RuleGroup, number>()
  for (const item of previous) running.set(item.group, (running.get(item.group) ?? 0) + item.appliedDelta)
  return rules
    .filter(rule => rule.matches(context))
    .map(rule => {
      const rawDelta = evidencePoints(rule)
      const used = running.get(rule.group) ?? 0
      const cap = groupCaps[rule.group]
      const appliedDelta = clamp(rawDelta, cap.min - used, cap.max - used)
      running.set(rule.group, used + appliedDelta)
      return {
        ruleId: rule.id,
        reasonCode: rule.reasonCode,
        group: rule.group,
        evidenceClass: rule.evidenceClass,
        evidenceConfidence: rule.confidence,
        rawDelta,
        appliedDelta,
      }
    })
}

export function evaluateSpots(conditions: Conditions): RankedSpot[] {
  const profile = profileFor(conditions.targetFish)
  return profile.spots
    .map(spot => {
      const reasons = applyRuleGroups(profile.spotRules, { conditions, candidateId: spot.id })
      return { spot, score: clamp(50 + reasons.reduce((sum, item) => sum + item.appliedDelta, 0)), reasons }
    })
    .sort((a, b) => b.score - a.score || a.spot.priority - b.spot.priority || a.spot.id.localeCompare(b.spot.id))
}

function preferredSizeFor(conditions: Conditions) {
  if (conditions.targetFish === 'zander') return 'medium'
  return conditions.targetFish === 'pike'
    ? ['cold', 'cool'].includes(conditions.waterTemperature)
      ? 'medium'
      : 'large'
    : ['cold', 'cool'].includes(conditions.waterTemperature) ||
        (conditions.waterTemperature === 'unknown' && conditions.season === 'winter')
      ? 'small'
      : 'medium'
}

function setupProperties(
  conditions: Conditions,
  lure: LureType,
  spot: RankedSpot,
  requestedSize?: RankedSetup['size'],
) {
  const preferred = preferredSizeFor(conditions)
  const size = requestedSize ?? (lure.sizes.includes(preferred) ? preferred : lure.sizes[0])
  const { presentation, weight } = resolvePresentation(conditions, lure, spot, size)
  return { color: preferredColorFamily(conditions, lure), size, weight, resolvedPresentation: presentation } as const
}

export function evaluateSetups(conditions: Conditions, spot: RankedSpot): RankedSetup[] {
  const profile = profileFor(conditions.targetFish)
  return profile.lures
    .filter(lure => conditions.depth === 'unknown' || lure.depths.includes(conditions.depth))
    .map(lure => {
      const reasons = applyRuleGroups(
        profile.setupRules,
        { conditions, candidateId: lure.id, spotId: spot.spot.id },
        spot.reasons,
      )
      return {
        lure,
        score: clamp(50 + reasons.reduce((sum, item) => sum + item.appliedDelta, 0)),
        ...setupProperties(conditions, lure, spot),
        reasons,
      } as RankedSetup
    })
    .sort((a, b) => b.score - a.score || a.lure.priority - b.lure.priority || a.lure.id.localeCompare(b.lure.id))
}

export function calculateInputCoverage(c: Conditions): ConfidenceMetric {
  const fields: Array<[string, boolean]> = [
    ['Jahreszeit', true],
    ['Tageszeit', c.timeOfDay !== 'unknown'],
    ['Wassertrübung', c.turbidity !== 'unknown'],
    ['Tiefe', c.depth !== 'unknown'],
    ['Wassertemperatur', c.waterTemperature !== 'unknown'],
    ['Licht', c.light !== 'unknown'],
    ['Aktivitätsanzeichen', c.activity.status !== 'unknown'],
    ['Krautbild', c.vegetation !== 'unknown'],
  ]
  const missingFields = fields.filter(([, known]) => !known).map(([name]) => name)
  const value = Math.round(((fields.length - missingFields.length) / fields.length) * 100)
  return {
    value,
    level: level(value, 75, 50),
    missingFields,
    explanation: missingFields.length
      ? `Offen: ${missingFields.join(', ')}.`
      : 'Alle relevanten Beobachtungen wurden eingeordnet.',
  }
}

export function calculateEvidenceQuality(contributions: ReasonContribution[]): ConfidenceMetric {
  const applied = contributions.filter(item => item.appliedDelta !== 0)
  const weight = applied.reduce((sum, item) => sum + Math.abs(item.appliedDelta), 0)
  if (!weight)
    return {
      value: 50,
      level: 'low',
      contributingRules: 0,
      explanation: 'Nur schwach differenziert: Keine bewertbare Regel trägt zum Ergebnis bei.',
    }
  const value = Math.round(
    (applied.reduce((sum, item) => sum + item.evidenceConfidence * Math.abs(item.appliedDelta), 0) / weight) * 100,
  )
  return {
    value,
    level: level(value, 80, 65),
    contributingRules: applied.length,
    explanation: `${applied.length} angewandte ${applied.length === 1 ? 'Regel' : 'Regeln'}; Evidenz und Beobachtungen gewichtet.`,
  }
}

function buildSwitchPlan(setup: RankedSetup, alternative: string, nextSpot: string, active: boolean): SwitchStep[] {
  const refine =
    setup.lure.style === 'search'
      ? `Wechsle am selben Horizont auf ${alternative} und führe kontrollierter.`
      : `Wechsle am selben Spot auf ${alternative} und suche den Horizont fächerförmig ab.`
  return [
    {
      phase: 'initial',
      title: 'Ausgangsversuch',
      change: 'Setup konstant halten; nur Winkel und Zielhorizont systematisch variieren.',
      limit: '15–25 gute Würfe oder 10–15 Minuten',
      reason: 'So bleibt erkennbar, ob Spot und Tiefenband tragen.',
    },
    {
      phase: 'refine',
      title: 'Präzisieren',
      change: active ? `Aktivität bestätigt: ${refine}` : refine,
      limit: 'Ein zweiter Präsentationsstil am selben Mikrospot',
      reason: 'Führung zuerst ändern; danach Größe, Silhouette/Farbe und erst zuletzt Montage.',
    },
    {
      phase: 'move',
      title: 'Spot wechseln',
      change: `Ohne Kontakt zum nächsten gerankten Strukturtyp wechseln: ${nextSpot}.`,
      limit: 'Nach zwei Präsentationsstilen ohne Kontakt',
      reason: 'Standort und Begegnung wiegen stärker als endlose Farbrotation.',
    },
  ]
}

function isSwitchAlternative(conditions: Conditions, setup: RankedSetup, candidate: RankedSetup) {
  if (candidate.lure.id === setup.lure.id) return false
  const specialIds: LureType['id'][] =
    setup.lure.id === 'popper'
      ? conditions.targetFish === 'pike'
        ? ['jerkbait', 'spinnerbait', 'crankbait']
        : ['twitchbait', 'spinnerbait', 'crankbait']
      : setup.lure.id === 'blade-bait' || setup.lure.id === 'tail-spinner'
        ? ['jig']
        : setup.lure.id === 'tailbait'
          ? ['jig', 'jerkbait']
          : []
  return specialIds.length
    ? specialIds.includes(candidate.lure.id)
    : setup.lure.style === 'search'
      ? candidate.lure.style !== 'search'
      : candidate.lure.style === 'search'
}

function snapshotSetup(
  conditions: Conditions,
  recommendation: Recommendation,
  spot: RankedSpot,
  mode?: GuidanceMode,
): SwitchSetup {
  const color = buildColorGuidance(recommendation.setup.color, conditions, recommendation.setup.lure)
  return {
    lureId: recommendation.setup.lure.id,
    lureLabel: recommendation.setup.lure.label,
    spotLabel: spot.spot.label,
    size: recommendation.setup.size,
    presentation: resolvePresentation(conditions, recommendation.setup.lure, spot, recommendation.setup.size, mode)
      .presentation,
    colorLabel: color.baseLabel ?? color.familyLabel,
    ...(recommendation.inventoryFit ? { inventoryFit: { ...recommendation.inventoryFit } } : {}),
  }
}

function buildInventorySwitchPlan(
  conditions: Conditions,
  recommendation: Recommendation,
  alternative: Recommendation | undefined,
  nextSpot: RankedSpot | undefined,
): SwitchStep[] {
  const initial = snapshotSetup(conditions, recommendation, recommendation.spot)
  const refineMode = initial.presentation.mode === 'slow' ? 'slow' : 'controlled'
  const refine = snapshotSetup(conditions, alternative ?? recommendation, recommendation.spot, refineMode)
  const move = {
    ...refine,
    presentation: { ...refine.presentation },
    spotLabel: nextSpot?.spot.label ?? 'Anderer erreichbarer Wasserbereich',
  }
  const steps = buildSwitchPlan(
    recommendation.setup,
    alternative?.setup.lure.label ?? recommendation.setup.lure.label,
    nextSpot?.spot.label ?? 'einen anderen erreichbaren Wasserbereich',
    conditions.activity.status === 'observed',
  )
  return steps.map(step => {
    if (step.phase === 'initial') return { ...step, setup: initial }
    if (step.phase === 'move')
      return { ...step, ...(!alternative ? { limit: 'Nach zwei Versuchen ohne Kontakt' } : {}), setup: move }
    return {
      ...step,
      ...(!alternative
        ? {
            change: `Bleibe beim vorhandenen ${recommendation.setup.lure.label}; variiere Führung, Tempo und Pausen, bevor du den Bereich wechselst.`,
            limit: 'Führung, Tempo und Pausen am selben Mikrospot variieren',
            reason:
              'Kein passender anderer Präsentationsstil unter deinen vorhandenen Optionen. Nutze die Führung unten für den zweiten Versuch.',
          }
        : {}),
      setup: refine,
    }
  })
}

/** Best spot/setup pair per lure, ordered by total score. Shared by the ranking and the inventory analysis. */
function orderCandidates(conditions: Conditions, eligibleSpots: RankedSpot[]) {
  const profile = profileFor(conditions.targetFish)
  const candidates = eligibleSpots
    .flatMap(spot => evaluateSetups(conditions, spot).map(setup => ({ spot, setup })))
    .sort(
      (a, b) =>
        b.spot.score + b.setup.score - (a.spot.score + a.setup.score) ||
        a.spot.spot.priority - b.spot.spot.priority ||
        a.setup.lure.priority - b.setup.lure.priority,
    )
  const selected: typeof candidates = []
  for (const candidate of candidates) {
    if (!selected.some(item => item.setup.lure.id === candidate.setup.lure.id)) selected.push(candidate)
    if (selected.length === profile.lures.length) break
  }
  return { candidates, selected }
}

function rankCandidates(
  conditions: Conditions,
  spotAllowed: (spot: RankedSpot) => boolean = () => true,
  spotOverride?: RankedSpot[],
): Array<Recommendation & { totalScore: number }> {
  const eligibleSpots = (spotOverride ?? evaluateSpots(conditions)).filter(spotAllowed)
  const { candidates, selected } = orderCandidates(conditions, eligibleSpots)
  const coverage = calculateInputCoverage(conditions)
  return selected.map(({ spot, setup }, index) => {
    const alternative =
      candidates.find(item => item.spot.spot.id === spot.spot.id && isSwitchAlternative(conditions, setup, item.setup))
        ?.setup.lure.label ??
      (conditions.targetFish === 'zander'
        ? setup.lure.id === 'dropshot'
          ? 'Zander-Gummifisch'
          : 'Drop Shot'
        : conditions.targetFish === 'pike'
          ? 'Hecht-Softbait / Gummifisch'
          : setup.lure.style === 'search'
            ? 'Ned Rig'
            : 'Twitchbait')
    const allApplied = [...spot.reasons, ...setup.reasons].filter(item => item.appliedDelta !== 0)
    const positive = allApplied.filter(item => item.appliedDelta > 0).sort((a, b) => b.appliedDelta - a.appliedDelta)
    const explained = (
      positive.length ? positive : allApplied.sort((a, b) => Math.abs(b.appliedDelta) - Math.abs(a.appliedDelta))
    ).slice(0, 4)
    const reasons = explained.map(explain)
    if (spot.spot.id === 'openWater' && spot.spot.priority === 99)
      reasons.unshift(
        'Keine konkrete Struktur bestätigt: Der Plan nutzt deshalb einen neutralen, zur gewählten Tiefe passenden Wasser- oder Grundbereich.',
      )
    return {
      rank: index + 1,
      spot,
      setup,
      inputCoverage: coverage,
      evidenceQuality: calculateEvidenceQuality([...spot.reasons, ...setup.reasons]),
      colorGuidance: buildColorGuidance(setup.color, conditions, setup.lure),
      reasons: reasons.slice(0, 4),
      switchPlan: buildSwitchPlan(
        setup,
        alternative,
        eligibleSpots.find(item => item.spot.id !== spot.spot.id)?.spot.label ??
          'einen anderen erreichbaren Wasserbereich',
        conditions.activity.status === 'observed',
      ),
      totalScore: spot.score + setup.score,
    }
  })
}

export function createRecommendations(conditions: Conditions): Recommendation[] {
  return rankCandidates(conditions).slice(0, 3)
}

export function isRecommendationAvailable(
  conditions: Conditions,
  inventory: InventoryItem[],
  recommendation: Recommendation,
) {
  return inventory.some(
    item =>
      item.targetFish === conditions.targetFish &&
      item.lureTypeId === recommendation.setup.lure.id &&
      item.sizes.includes(recommendation.setup.size),
  )
}

const sizeFallbacks: Record<SizeClass, SizeClass[]> = {
  small: ['small', 'medium', 'large'],
  medium: ['medium', 'small', 'large'],
  large: ['large', 'medium', 'small'],
}

/** The owned size used for a lure: the preferred size, otherwise the nearest owned neighbour size. */
export function inventorySizeFor(
  conditions: Conditions,
  inventory: InventoryItem[],
  lure: LureType,
  preferredSize: SizeClass,
): SizeClass | undefined {
  const item = inventory.find(entry => entry.targetFish === conditions.targetFish && entry.lureTypeId === lure.id)
  return sizeFallbacks[preferredSize].find(size => item?.sizes.includes(size) && lure.sizes.includes(size))
}

function adaptToInventory(
  conditions: Conditions,
  inventory: InventoryItem[],
  recommendation: Recommendation & { totalScore: number },
) {
  const selectedSize = inventorySizeFor(conditions, inventory, recommendation.setup.lure, recommendation.setup.size)
  if (!selectedSize) return undefined
  const properties = setupProperties(conditions, recommendation.setup.lure, recommendation.spot, selectedSize)
  return {
    ...recommendation,
    setup: { ...recommendation.setup, ...properties },
    colorGuidance: buildColorGuidance(properties.color, conditions, recommendation.setup.lure),
    inventoryFit: {
      preferredSize: recommendation.setup.size,
      selectedSize,
      exact: selectedSize === recommendation.setup.size,
    },
  }
}

function isPracticalSpot(conditions: Conditions, spot: RankedSpot) {
  const id = spot.spot.id
  if (conditions.observedStructure.includes(id as never)) return true
  if (id === 'vegetation') return conditions.vegetation === 'edgeOrGaps' || conditions.vegetation === 'dense'
  if (id === 'shallow') return conditions.depth === 'shallow'
  // Visible prey makes the reachable free horizon a concrete search area.
  if (id === 'openWater')
    return conditions.activity.status === 'observed' && conditions.activity.signs.includes('baitfish')
  return false
}

function neutralSpot(conditions: Conditions): RankedSpot {
  const label =
    conditions.depth === 'deep'
      ? 'Tiefer Wasser- oder Grundbereich'
      : conditions.depth === 'medium'
        ? 'Freier Bereich mittlerer Tiefe'
        : conditions.depth === 'shallow'
          ? 'Freier Flachwasserbereich'
          : 'Erreichbarer freier Wasserbereich'
  const depths = conditions.depth === 'unknown' ? (['shallow', 'medium', 'deep'] as const) : [conditions.depth]
  return {
    spot: {
      id: 'openWater',
      label,
      description: 'Neutraler Angelbereich ohne bestätigte Kante, Deckung oder andere sichtbare Struktur.',
      seasonalAffinity: ['spring', 'summer', 'autumn', 'winter'],
      depthAffinity: [...depths],
      priority: 99,
    },
    score: 50,
    reasons: [],
  }
}

/** Confirmed practical spots, or a neutral water area when no structure is confirmed. */
function applicableSpots(
  conditions: Conditions,
  confirmedSpots = evaluateSpots(conditions).filter(spot => isPracticalSpot(conditions, spot)),
) {
  return confirmedSpots.length ? confirmedSpots : [neutralSpot(conditions)]
}

/**
 * Inventory-independent order of applicable lures with their preferred size, exactly as the practical
 * ranking sees them before the inventory filter. Used for the descriptive lure box analysis.
 */
export function applicableLureOrder(conditions: Conditions): Array<{ lure: LureType; size: SizeClass }> {
  return orderCandidates(conditions, applicableSpots(conditions)).selected.map(({ setup }) => ({
    lure: setup.lure,
    size: setup.size,
  }))
}

export function createRecommendationDecision(
  conditions: Conditions,
  inventory: InventoryItem[],
): RecommendationDecision {
  const completeRanking = rankCandidates(conditions)
  const confirmedSpots = evaluateSpots(conditions).filter(spot => isPracticalSpot(conditions, spot))
  const applicableRanking = rankCandidates(conditions, () => true, applicableSpots(conditions, confirmedSpots))
  const inventoryCandidates = applicableRanking.map(expert => ({
    expert,
    practical: adaptToInventory(conditions, inventory, expert),
  }))
  const practicalBase = inventoryCandidates
    .map(item => item.practical)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 3)
  const practicalRanking = practicalBase.map((item, index) => {
    const alternative = practicalBase.find(other => isSwitchAlternative(conditions, item.setup, other.setup))
    const nextSpot = confirmedSpots.find(spot => spot.spot.id !== item.spot.spot.id)
    return { ...item, rank: index + 1, switchPlan: buildInventorySwitchPlan(conditions, item, alternative, nextSpot) }
  })
  const practicalPrimary = practicalRanking[0]
  const practicalAlternatives = practicalRanking.slice(1)
  const optionalLureTip = inventoryCandidates.find(item => !item.practical)?.expert
  const optionalLureAdvantage =
    optionalLureTip && practicalPrimary
      ? Math.max(0, optionalLureTip.totalScore - practicalPrimary.totalScore)
      : undefined
  const optionalSpotTip =
    conditions.structureStatus === 'none'
      ? undefined
      : completeRanking.find(item => !isPracticalSpot(conditions, item.spot))
  return {
    expertRanking: completeRanking.slice(0, 3),
    practicalRanking,
    practicalPrimary,
    practicalAlternatives,
    optionalSpotTip,
    optionalLureTip,
    optionalLureAdvantage,
    hotWaterWarning:
      conditions.waterTemperature === 'hot'
        ? conditions.targetFish === 'pike'
          ? 'Sehr warmes Wasser kann Hechte zusätzlich belasten. Drill und Versorgung kurz halten und bei erkennbar gestressten Fischen nicht gezielt weiterangeln.'
          : 'Sehr warmes Wasser kann Temperatur- und Sauerstoffstress bedeuten. Drills kurz halten und bei erkennbar gestressten Fischen nicht gezielt weiterangeln.'
        : undefined,
  }
}
