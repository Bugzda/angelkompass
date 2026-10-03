import type {
  Conditions,
  GuidanceMode,
  LureType,
  NumericRange,
  RankedSpot,
  ResolvedPresentation,
  SizeClass,
  WeightClass,
} from '../models/types'

const numberFormat = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 })
const rangeLabel = (range: NumericRange | undefined, unit: string) => {
  if (!range) return undefined
  if (range.max === undefined) return `ab ${numberFormat.format(range.min)} ${unit}`
  return `${numberFormat.format(range.min)}–${numberFormat.format(range.max)}${range.openEnded ? '+' : ''} ${unit}`
}

export function sizeLabelFor(lure: LureType, size: SizeClass) {
  return (
    rangeLabel(lure.sizeRangesCm?.[size], 'cm') ??
    ({ small: '3–5 cm', medium: '5–8 cm', large: '8–12 cm' } as const)[size]
  )
}

function selectProfile(conditions: Conditions, lure: LureType, spot: RankedSpot) {
  // A vegetation preference must not select a rig outside its supported depth.
  const profiles = (lure.presentations ?? []).filter(
    profile => conditions.depth === 'unknown' || profile.depths.includes(conditions.depth),
  )
  if (lure.id === 'jig' && conditions.targetFish === 'perch') {
    if (['edgeOrGaps', 'dense'].includes(conditions.vegetation))
      return profiles.find(item => item.id === 'texas-offset') ?? profiles[0]
    // Stones and wood snag open hooks; the offset rig keeps the point covered.
    if (spot.spot.id === 'hardCover') return profiles.find(item => item.id === 'texas-offset') ?? profiles[0]
    if (spot.spot.id === 'dropoff' && conditions.vegetation === 'none')
      return profiles.find(item => item.id === 'carolina') ?? profiles[0]
  }
  if (lure.id === 'jig' && conditions.targetFish === 'zander' && conditions.vegetation === 'dense')
    return profiles.find(item => item.id === 'zander-texas') ?? profiles[0]
  if (lure.id === 'jig' && conditions.targetFish === 'pike') {
    if (conditions.vegetation === 'dense')
      return profiles.find(item => item.id === 'pike-weedless-offset') ?? profiles[0]
    if (conditions.depth === 'shallow') return profiles.find(item => item.id === 'pike-shallow-screw') ?? profiles[0]
  }
  // Profiles are already depth-filtered; prefer one that is meant for the observed weed situation.
  return profiles.find(item => item.vegetation.includes(conditions.vegetation)) ?? profiles[0]
}

function guidanceMode(conditions: Conditions): GuidanceMode {
  if (
    ['cold', 'cool'].includes(conditions.waterTemperature) ||
    (conditions.waterTemperature === 'unknown' && conditions.season === 'winter') ||
    conditions.activity.status === 'none'
  )
    return 'slow'
  if (conditions.activity.status === 'observed' && ['mild', 'warm'].includes(conditions.waterTemperature))
    return 'active'
  return 'controlled'
}

function resolvedWeightLabel(
  profile: NonNullable<LureType['presentations']>[number],
  conditions: Conditions,
  size: SizeClass,
) {
  if (profile.weightKind === 'none') return 'Keine Zusatzbeschwerung · Ködergewicht nutzen'
  if (profile.weightKind === 'lure-total') {
    const value = rangeLabel(profile.lureWeightBySize?.[size], 'g')
    return value
      ? `${value} Ködergesamtgewicht · keine Zusatzbeschwerung`
      : 'Ködergesamtgewicht passend zur Größe · keine Zusatzbeschwerung'
  }
  if (conditions.depth === 'unknown')
    return 'Keine feste Grammzahl · Tiefe unbekannt; die leichteste kontrollierbare Beschwerung wählen'
  const value = rangeLabel(profile.terminalWeightByDepth?.[conditions.depth], 'g')
  return value
    ? `${value} Beschwerung · mit der leichtesten kontrollierbaren Stufe beginnen`
    : 'Leichteste kontrollierbare Beschwerung verwenden; keine pauschale Grammzahl'
}

function legacyWeightClass(
  profile: NonNullable<LureType['presentations']>[number],
  conditions: Conditions,
  size: SizeClass,
): WeightClass {
  if (profile.weightKind === 'none') return 'ultralight'
  if (profile.weightKind === 'lure-total') return size === 'small' ? 'light' : size === 'medium' ? 'medium' : 'heavy'
  if (conditions.depth === 'unknown') return 'unknown'
  const max =
    profile.terminalWeightByDepth?.[conditions.depth]?.max ?? profile.terminalWeightByDepth?.[conditions.depth]?.min
  return max === undefined ? 'medium' : max <= 4 ? 'ultralight' : max <= 8 ? 'light' : max <= 15 ? 'medium' : 'heavy'
}

export function resolvePresentation(
  conditions: Conditions,
  lure: LureType,
  spot: RankedSpot,
  size: SizeClass,
  modeOverride?: GuidanceMode,
): { presentation: ResolvedPresentation; weight: WeightClass } {
  const profile = selectProfile(conditions, lure, spot)
  const mode = modeOverride ?? guidanceMode(conditions)
  if (!profile) {
    return {
      presentation: {
        profileId: 'legacy',
        profileLabel: 'Standardmontage',
        mounting: lure.mounting,
        sizeLabel: sizeLabelFor(lure, size),
        weightLabel:
          conditions.depth === 'unknown'
            ? 'Keine feste Grammzahl · Tiefe unbekannt; die leichteste kontrollierbare Beschwerung wählen'
            : 'Beschwerung passend zum Zielhorizont',
        weightKind: 'terminal',
        guidance: lure.guidance,
        mode,
      },
      weight:
        conditions.depth === 'unknown'
          ? 'unknown'
          : conditions.depth === 'deep'
            ? 'heavy'
            : conditions.depth === 'shallow'
              ? 'light'
              : 'medium',
    }
  }
  let guidance = profile.guidance[mode]
  if (conditions.depth === 'deep')
    guidance += ` Sinkzeit messen und den ${profile.style === 'bottom' ? 'Grundkontakt' : 'Zielhorizont'} reproduzierbar halten.`
  return {
    presentation: {
      profileId: profile.id,
      profileLabel: profile.label,
      mounting: profile.mounting,
      sizeLabel: sizeLabelFor(lure, size),
      weightLabel: resolvedWeightLabel(profile, conditions, size),
      weightKind: profile.weightKind,
      guidance,
      mode,
    },
    weight: legacyWeightClass(profile, conditions, size),
  }
}

export function presentationForDisplay(setup: {
  lure: LureType
  size: SizeClass
  weight: WeightClass
  resolvedPresentation?: ResolvedPresentation
}) {
  return (
    setup.resolvedPresentation ?? {
      profileId: 'legacy',
      profileLabel: 'Standardmontage',
      mounting: setup.lure.mounting,
      sizeLabel: sizeLabelFor(setup.lure, setup.size),
      weightLabel: (
        {
          ultralight: 'Ultraleicht',
          light: 'Leicht',
          medium: 'Mittel',
          heavy: 'Schwer',
          unknown: 'Keine feste Grammzahl',
        } as const
      )[setup.weight],
      weightKind: 'terminal' as const,
      guidance: setup.lure.guidance,
      mode: 'controlled' as const,
    }
  )
}
