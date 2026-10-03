import type { GuidanceSet, LureType, PresentationProfile } from '../models/types'

// Editorial starting ranges for bank fishing in lakes, not measured catch optima.
const sizes = { small: { min: 7, max: 10 }, medium: { min: 10, max: 13 }, large: { min: 13, max: 16 } }
const weights = { shallow: { min: 3, max: 7 }, medium: { min: 7, max: 14 }, deep: { min: 14, max: 21 } }
const leader = 'Abriebfestes Vorfach; bei Hechtvorkommen ein bissfestes Stahl- oder Titanvorfach verwenden'
const guidance = (slow: string, controlled: string, active: string): GuidanceSet => ({ slow, controlled, active })
const rig = (
  id: string,
  label: string,
  mounting: string,
  style: PresentationProfile['style'],
  instructions: GuidanceSet,
): PresentationProfile => ({
  id,
  label,
  mounting: `${mounting}. ${leader}`,
  depths: ['shallow', 'medium', 'deep'],
  vegetation: ['none', 'edgeOrGaps', 'unknown'],
  style,
  weightKind: 'terminal',
  terminalWeightByDepth: weights,
  guidance: instructions,
})
const jig = rig(
  'zander-jig',
  'Jigkopf / Faulenzen',
  'Jigkopf und Einzelhaken auf Körperhöhe und Länge des Gummifischs abstimmen',
  'bottom',
  guidance(
    'Mit kurzen Kurbelzügen flach anheben und kontrolliert absinken lassen; Pausen verlängern.',
    'Mit ein bis zwei Kurbelumdrehungen anheben, Absinken über die Schnur verfolgen und Grundkontakt prüfen.',
    'Mit variierenden kurzen Sprüngen suchen; Absinkphasen immer kontrollieren.',
  ),
)
const texas = {
  ...rig(
    'zander-texas',
    'Texas Rig / Offset',
    'Gleitendes Bulletgewicht und passender Offsethaken; Hakenspitze krautgeschützt montieren',
    'bottom',
    guidance(
      'Langsam durch freie Krautbahnen ziehen und in Lücken pausieren.',
      'Mit kurzen Zügen durch Krautlücken arbeiten und Kontakt kontrollieren.',
      'Freie Bahnen fächerförmig absuchen; bei Widerstand lösen statt durchreißen.',
    ),
  ),
  vegetation: ['dense', 'edgeOrGaps'] as PresentationProfile['vegetation'],
}
const dropshot = rig(
  'zander-dropshot',
  'Drop Shot',
  'Einzelhaken oberhalb des Endbleis; Köder frei beweglich und waagerecht montieren',
  'finesse',
  guidance(
    'Blei möglichst ruhig halten, Köder mit kleinen Impulsen bewegen und lange pausieren.',
    'Montage langsam versetzen und den Köder über Grund mit kleinen Impulsen spielen lassen.',
    'Kurze aktive Impulse mit Ruhephasen abwechseln und mehrere Wurfwinkel testen.',
  ),
)
const carolina = rig(
  'zander-carolina',
  'Carolina Rig',
  'Gleitendes Bulletgewicht vor Wirbel und nachgeschaltetem Vorfach mit Offsethaken',
  'bottom',
  guidance(
    'Langsam über freien Grund ziehen; nach jedem Zug lange pausieren.',
    'In kurzen Zügen über freien Grund schleifen und den Köder nachsinken lassen.',
    'Mit wechselnden Zuglängen suchen und in jeder Pause die Schnur beobachten.',
  ),
)
const soft = (id: LureType['id'], label: string, priority: number, profiles: PresentationProfile[]): LureType => ({
  id,
  label,
  priority,
  mounting: profiles[0].mounting,
  guidance: profiles[0].guidance.controlled,
  sizes: ['small', 'medium', 'large'],
  sizeRangesCm: sizes,
  depths: ['shallow', 'medium', 'deep'],
  style: profiles[0].style,
  material: 'soft',
  presentations: profiles,
})
const wobbler: PresentationProfile = {
  id: 'zander-wobbler',
  label: 'Flach laufender Zander-Wobbler',
  mounting: `Passender Rundbogen-Karabiner, keine Zusatzbeschwerung. ${leader}`,
  depths: ['shallow'],
  vegetation: ['none', 'edgeOrGaps', 'unknown'],
  style: 'search',
  weightKind: 'lure-total',
  lureWeightBySize: { small: { min: 5, max: 10 }, medium: { min: 10, max: 18 }, large: { min: 18, max: 25 } },
  guidance: guidance(
    'Sehr langsam gleichmäßig einkurbeln und kurze Stopps setzen.',
    'Parallel zur Uferkante ruhig einkurbeln; Lauftiefe und Hindernisse beachten.',
    'Mehrere Winkel abfächern und Tempo behutsam variieren; keine hektischen Schlagserien.',
  ),
}
export const zanderLures: LureType[] = [
  soft('jig', 'Zander-Gummifisch', 1, [jig, texas]),
  soft('dropshot', 'Drop Shot', 2, [dropshot]),
  soft('carolina', 'Carolina Rig', 3, [carolina]),
  {
    id: 'twitchbait',
    label: 'Zander-Wobbler',
    priority: 4,
    mounting: wobbler.mounting,
    guidance: wobbler.guidance.controlled,
    sizes: ['small', 'medium', 'large'],
    sizeRangesCm: sizes,
    depths: ['shallow'],
    style: 'search',
    material: 'hard',
    presentations: [wobbler],
  },
]
