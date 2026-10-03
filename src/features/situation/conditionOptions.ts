import type { ActivitySign, Conditions, ObservableStructure, TargetFish } from '../../domain/models/types'
import type { IconName } from '../../ui/components/Icon'

export const choices = {
  season: [
    ['spring', 'Frühling'],
    ['summer', 'Sommer'],
    ['autumn', 'Herbst'],
    ['winter', 'Winter'],
  ],
  timeOfDay: [
    ['dawn', 'Morgen'],
    ['day', 'Tag'],
    ['dusk', 'Abend'],
    ['night', 'Nacht'],
    ['unknown', 'Unbekannt'],
  ],
  turbidity: [
    ['clear', 'Klar'],
    ['slightly_turbid', 'Leicht trüb'],
    ['turbid', 'Trüb'],
    ['unknown', 'Unbekannt'],
  ],
  depth: [
    ['shallow', 'Flach'],
    ['medium', 'Mittel'],
    ['deep', 'Tief'],
    ['unknown', 'Unbekannt'],
  ],
  waterTemperature: [
    ['cold', 'Kalt · bis 8 °C'],
    ['cool', 'Kühl · 9–12 °C'],
    ['mild', 'Mild · 13–18 °C'],
    ['warm', 'Warm · 19–23 °C'],
    ['hot', 'Heiß · über 23 °C'],
    ['unknown', 'Unbekannt'],
  ],
  light: [
    ['bright', 'Hell'],
    ['diffuse', 'Diffus/bewölkt'],
    ['dark', 'Dunkel'],
    ['unknown', 'Unbekannt'],
  ],
  vegetation: [
    ['none', 'Kein Kraut'],
    ['edgeOrGaps', 'Lockere Kante/Lücken'],
    ['dense', 'Sehr dicht'],
    ['unknown', 'Unbekannt'],
  ],
} as const
export type ChoiceKey = keyof typeof choices

export const labels: Record<ChoiceKey, string> = {
  season: 'Jahreszeit',
  timeOfDay: 'Tageszeit',
  turbidity: 'Wassertrübung',
  depth: 'Angeltiefe',
  waterTemperature: 'Wassertemperatur',
  light: 'Lichtverhältnis',
  vegetation: 'Krautbild',
}

/** Visual cues only; every option keeps its text label as accessible name. */
export const choiceIcons: Partial<Record<ChoiceKey, Record<string, IconName>>> = {
  turbidity: { clear: 'drop', slightly_turbid: 'drop-half', turbid: 'drop-full', unknown: 'help' },
  depth: { shallow: 'depth-shallow', medium: 'depth-medium', deep: 'depth-deep', unknown: 'help' },
  vegetation: { none: 'close', edgeOrGaps: 'weed', dense: 'weed', unknown: 'help' },
  light: { bright: 'theme-light', diffuse: 'cloud', dark: 'theme-dark', unknown: 'help' },
}

const hardCoverLabels: Record<TargetFish, string> = {
  perch: 'Steine, Totholz oder harter Grund',
  pike: 'Holz, Steg oder harte Deckung',
  zander: 'Steinpackung oder harter Grund',
}

export const structures = (fish: TargetFish): Array<[ObservableStructure, string]> => [
  ['shallow', 'Flachzone'],
  ['dropoff', 'Tiefenkante'],
  ['hardCover', hardCoverLabels[fish]],
]

export const activityOptions = (fish: TargetFish): Array<[ActivitySign, string]> => [
  ['baitfish', 'Kleinfisch sichtbar'],
  [
    fish === 'pike' ? 'pikeContact' : fish === 'zander' ? 'zanderContact' : 'huntingPerch',
    fish === 'pike' ? 'Hecht/Raubfischkontakt' : fish === 'zander' ? 'Zanderkontakt' : 'Jagende Barsche',
  ],
  ['surfaceActivity', 'Oberflächenaktivität'],
]

export const choiceLabel = (key: ChoiceKey, value: string) =>
  (choices[key] as ReadonlyArray<readonly [string, string]>).find(([option]) => option === value)?.[1] ?? value

/** Short summary chips for the recommendation header; each links back to its field. */
export function conditionChips(conditions: Conditions): Array<{ field: string; label: string; unknown: boolean }> {
  const fields: ChoiceKey[] = ['turbidity', 'depth', 'vegetation', 'waterTemperature', 'light']
  const chips = fields.map(field => {
    const value = conditions[field]
    const label = choiceLabel(field, value)
    return {
      field,
      label:
        value === 'unknown' ? `${labels[field]} offen` : field === 'waterTemperature' ? label.split(' · ')[1] : label,
      unknown: value === 'unknown',
    }
  })
  const activity =
    conditions.activity.status === 'observed'
      ? activityOptions(conditions.targetFish)
          .filter(([value]) => conditions.activity.signs.includes(value))
          .map(([, label]) => label)
          .join(', ')
      : conditions.activity.status === 'none'
        ? 'Keine Aktivität'
        : 'Aktivität offen'
  return [
    {
      field: 'timeOfDay',
      label: `${choiceLabel('season', conditions.season)} · ${choiceLabel('timeOfDay', conditions.timeOfDay)}`,
      unknown: false,
    },
    ...chips,
    { field: 'activity', label: activity, unknown: conditions.activity.status === 'unknown' },
  ]
}
