import type { ReasonContribution } from '../models/types'

const texts: Record<string, string> = {
  OBSERVED_STRUCTURE: 'Die sichtbare Struktur ist ein direkter Hinweis auf diesen Spot.',
  SEASONAL_SPOT: 'Der Spot passt zum typischen saisonalen Aufenthaltsbereich von Barschen.',
  DEPTH_MATCH: 'Spot und geschätzte Angeltiefe passen zusammen.',
  FEEDING_WINDOW_SHALLOW: 'In der Dämmerung lohnt sich die Suche nach jagenden Barschen im Flachen.',
  WINTER_SHALLOW_PENALTY: 'Flaches Wasser ist im Winter oft nur kurzzeitig interessant.',
  CLEAR_WATER_FINESSE: 'Im klaren Wasser wirkt eine feine Präsentation besonders natürlich.',
  TURBID_WATER_SEARCH: 'Im trüben Wasser hilft ein aktiver Suchköder den Barschen bei der Ortung.',
  COLD_SEASON_SLOW: 'Im Winter ist eine langsame Präsentation mit langen Pausen sinnvoll.',
  DROPOFF_CONTROL: 'Dieses Setup hält kontrollierten Kontakt an der Tiefenkante.',
  VEGETATION_EDGE_SEARCH: 'Der Köder lässt sich parallel an der Krautkante führen und sucht Strecke ab.',
  SHALLOW_SEARCH: 'Ein bewegter Suchköder deckt die Flachwasserzone effizient ab.',
}

export const explain = (reason: ReasonContribution) => texts[reason.reasonCode] ?? 'Diese Kombination passt zu deinen Angaben.'
