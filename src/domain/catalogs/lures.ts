import type { LureType } from '../models/types'

export const lures: LureType[] = [
  { id: 'jig', label: 'Gummifisch am Jigkopf', mounting: 'Jigkopf', guidance: 'Mit Grundkontakt in kurzen Sprüngen führen.', sizes: ['small', 'medium', 'large'], depths: ['shallow', 'medium', 'deep'], style: 'bottom', priority: 1 },
  { id: 'ned', label: 'Ned Rig', mounting: 'Pilzkopf, Gewicht an Tiefe angepasst', guidance: 'Langsam schleifen und wiederholt stehen lassen.', sizes: ['small', 'medium'], depths: ['shallow', 'medium', 'deep'], style: 'finesse', priority: 2 },
  { id: 'drop-shot', label: 'Drop Shot', mounting: 'Drop-Shot-Montage', guidance: 'Am Platz fein zittern und lange pausieren.', sizes: ['small', 'medium'], depths: ['medium', 'deep'], style: 'finesse', priority: 3 },
  { id: 'twitchbait', label: 'Twitchbait', mounting: 'Direkt am Karabiner', guidance: 'Zweimal twitchen, dann deutlich pausieren.', sizes: ['small', 'medium'], depths: ['shallow', 'medium'], style: 'search', priority: 4 },
  { id: 'spinner', label: 'Spinner', mounting: 'Direkt am Karabiner', guidance: 'Gleichmäßig und so langsam wie möglich einkurbeln.', sizes: ['small', 'medium'], depths: ['shallow', 'medium'], style: 'search', priority: 5 },
  { id: 'crankbait', label: 'Crankbait', mounting: 'Direkt am Karabiner', guidance: 'Gleichmäßig oder Stop-and-go in passender Lauftiefe führen.', sizes: ['small', 'medium'], depths: ['shallow', 'medium'], style: 'search', priority: 6 },
  { id: 'chatterbait', label: 'Chatterbait', mounting: 'Direkt, optional mit Softbait-Trailer', guidance: 'Gleichmäßig mit kurzen Tempowechseln führen.', sizes: ['small', 'medium'], depths: ['shallow', 'medium'], style: 'search', priority: 7 },
  { id: 'blade-bait', label: 'Blade Bait', mounting: 'Direkt am Karabiner', guidance: 'Kurz anheben und kontrolliert in den Zielhorizont absinken lassen.', sizes: ['small', 'medium'], depths: ['medium', 'deep'], style: 'search', priority: 8 },
  { id: 'spinnerbait', label: 'Spinnerbait', mounting: 'Direkt am Karabiner', guidance: 'Parallel zur Struktur gleichmäßig und kontrolliert führen.', sizes: ['small', 'medium'], depths: ['shallow', 'medium'], style: 'search', priority: 9 },
  { id: 'popper', label: 'Popper', mounting: 'Direkt am Karabiner', guidance: 'Kurze Pop-Serien mit deutlichen Pausen an der Oberfläche.', sizes: ['small', 'medium'], depths: ['shallow'], style: 'search', priority: 10 },
]
