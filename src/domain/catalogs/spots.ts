import type { SpotType } from '../models/types'

export const spots: SpotType[] = [
  {
    id: 'vegetation',
    label: 'Schilf- oder Krautkante',
    description: 'Deckung, Nahrung und ein klarer Übergang zwischen Kraut und freiem Wasser.',
    seasonalAffinity: ['spring', 'summer', 'autumn'],
    depthAffinity: ['shallow', 'medium'],
    priority: 1,
  },
  {
    id: 'dropoff',
    label: 'Abbruchkante oder Tiefenübergang',
    description: 'Kurzer Weg zwischen flacher Jagdzone und tieferem Rückzugsbereich.',
    seasonalAffinity: ['summer', 'autumn', 'winter'],
    depthAffinity: ['medium', 'deep'],
    priority: 2,
  },
  {
    id: 'shallow',
    label: 'Flachwasserzone',
    description: 'Schnell erwärmtes Wasser, in dem Barsche zeitweise Kleinfisch verfolgen.',
    seasonalAffinity: ['spring', 'summer'],
    depthAffinity: ['shallow'],
    priority: 3,
  },
  {
    id: 'hardCover',
    label: 'Steine, Totholz oder harter Grund',
    description:
      'Bestätigte Steinpackung, Totholz oder Kies-/Muschelgrund mit benthischer Beute und klaren Übergängen.',
    seasonalAffinity: ['spring', 'summer', 'autumn', 'winter'],
    depthAffinity: ['shallow', 'medium', 'deep'],
    priority: 4,
  },
]
