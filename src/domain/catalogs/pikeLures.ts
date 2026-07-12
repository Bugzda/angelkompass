import type { LureType } from '../models/types'

export const pikeLures: LureType[] = [
  { id:'jig',label:'Gummifisch am Jigkopf',mounting:'Hechtsicheres Vorfach, stabiler Jigkopf',guidance:'Kontrolliert mit Pausen durch das gewählte Tiefenband führen.',sizes:['medium','large'],depths:['shallow','medium','deep'],style:'bottom',priority:1 },
  { id:'jerkbait',label:'Jerkbait',mounting:'Hechtsicheres Vorfach, stabiler Karabiner',guidance:'Mit Schlägen und deutlichen Pausen über und neben Deckung führen.',sizes:['medium','large'],depths:['shallow','medium'],style:'search',priority:2 },
  { id:'crankbait',label:'Wobbler / Crankbait',mounting:'Hechtsicheres Vorfach, stabiler Karabiner',guidance:'In passender Lauftiefe gleichmäßig oder Stop-and-go führen.',sizes:['medium','large'],depths:['shallow','medium'],style:'search',priority:3 },
  { id:'spinnerbait',label:'Spinnerbait',mounting:'Hechtsicheres Vorfach, direkt anbinden',guidance:'Parallel zu Kraut, Holz und freien Bahnen kontrolliert einkurbeln.',sizes:['medium','large'],depths:['shallow','medium'],style:'search',priority:4 },
  { id:'spoon',label:'Blinker',mounting:'Hechtsicheres Vorfach mit Wirbel',guidance:'Gleichmäßig mit Tempowechseln und kurzen Absinkphasen führen.',sizes:['medium','large'],depths:['shallow','medium','deep'],style:'search',priority:5 },
  { id:'spinner',label:'Spinner',mounting:'Hechtsicheres Vorfach mit Wirbel',guidance:'So langsam wie möglich mit sicher arbeitendem Blatt führen.',sizes:['medium','large'],depths:['shallow','medium'],style:'search',priority:6 },
  { id:'swimbait',label:'Swimbait',mounting:'Hechtsicheres Vorfach, zur Tiefe passende Montage',guidance:'Ruhig und geradlinig durch den Zielhorizont führen.',sizes:['medium','large'],depths:['shallow','medium','deep'],style:'search',priority:7 },
  { id:'popper',label:'Topwater',mounting:'Hechtsicheres Vorfach, stabiler Karabiner',guidance:'Mit Pausen über freiem Flachwasser und Krautbahnen führen.',sizes:['medium','large'],depths:['shallow'],style:'search',priority:8 },
]
