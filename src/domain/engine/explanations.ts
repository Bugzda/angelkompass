import type { ReasonContribution } from '../models/types'

const texts: Record<string, string> = {
  OBSERVED_STRUCTURE: 'Die sichtbare Struktur ist ein direkter Hinweis auf diesen Spot.',
  SEASONAL_VEGETATION: 'Im Frühjahr und Frühsommer nutzen Barsche strukturreiche Uferbereiche besonders häufig.',
  AUTUMN_DROPOFF: 'Im abkühlenden Herbst gewinnen Flach-Tief-Übergänge an Bedeutung.',
  WINTER_DROPOFF: 'In kalten Phasen verteilen sich Barsche häufig tiefer.',
  DEPTH_MATCH: 'Spot und geschätzte Angeltiefe passen zusammen.',
  TWILIGHT_SHALLOW: 'Außerhalb des Hochsommers kann die Dämmerung flache Jagdzonen begünstigen.',
  CLEAR_DAY_DEPTH: 'Bei klarer Sicht am Tag bietet die Tiefenkante erreichbare Deckung.',
  WINTER_SHALLOW_PENALTY: 'Flaches Wasser ist im Winter oft nur kurzzeitig interessant.',
  CLEAR_WATER_NATURAL: 'Im klaren Wasser wird eine natürliche, unaufdringliche Präsentation leicht bevorzugt.',
  TURBID_SEARCH: 'Bei starker Trübung kann ein deutlicher Suchköder die Begegnungsrate erhöhen.',
  WINTER_FINESSE: 'Im Winter verlängert eine langsame Präsentation die Zeit im Sichtfeld.',
  DROPOFF_CONTROL: 'Dieses Setup hält kontrollierten Kontakt an der Tiefenkante.',
  VEGETATION_EDGE: 'Krautkanten und Lücken verbinden Deckung mit guter Jagdmöglichkeit.',
  SHALLOW_SEARCH: 'Ein bewegter Suchköder deckt die Flachwasserzone effizient ab.',
}

export const explain = (reason: ReasonContribution) => texts[reason.reasonCode] ?? 'Diese Kombination passt zu deinen Angaben.'
