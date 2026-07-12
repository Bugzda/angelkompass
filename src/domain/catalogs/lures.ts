import type { LureType } from '../models/types'

export const lures: LureType[] = [
  { id: 'jig', label: 'Gummifisch am Jigkopf', mounting: 'Jigkopf', guidance: 'Mit Grundkontakt in kurzen Sprüngen führen.', sizes: ['small', 'medium', 'large'], depths: ['shallow', 'medium', 'deep'], style: 'bottom', priority: 1 },
  { id: 'ned', label: 'Ned Rig', mounting: 'Pilzkopf, Gewicht an Tiefe angepasst', guidance: 'Langsam schleifen und wiederholt stehen lassen.', sizes: ['small', 'medium'], depths: ['shallow', 'medium', 'deep'], style: 'finesse', priority: 2 },
  { id: 'drop-shot', label: 'Drop Shot', mounting: 'Drop-Shot-Montage', guidance: 'Am Platz fein zittern und lange pausieren.', sizes: ['small', 'medium'], depths: ['medium', 'deep'], style: 'finesse', priority: 3 },
  { id: 'twitchbait', label: 'Twitchbait', mounting: 'Direkt am Karabiner', guidance: 'Zweimal twitchen, dann deutlich pausieren.', sizes: ['small', 'medium'], depths: ['shallow', 'medium'], style: 'search', priority: 4 },
  { id: 'spinner', label: 'Spinner', mounting: 'Direkt am Karabiner', guidance: 'Gleichmäßig und so langsam wie möglich einkurbeln.', sizes: ['small', 'medium'], depths: ['shallow', 'medium'], style: 'search', priority: 5 },
]
