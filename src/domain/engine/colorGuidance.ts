import type { ColorFamily,ColorGuidance,Conditions } from '../models/types'

const examples:Record<ColorFamily,string[]>={
  natural:['Barschdekor','Rotauge/Silber','Oliv-Braun','Green Pumpkin'],
  transparent:['Ghost/Silber','Smoke','Transparent mit Glitter','Watermelon transluzent'],
  contrast:['Schwarz','Dunkelviolett','Schwarz-Chartreuse','Weiß mit dunklem Rücken'],
}
const labels:Record<ColorFamily,string>={natural:'Natürlich',transparent:'Transparent',contrast:'Kontrastreich'}

export function buildColorGuidance(family:ColorFamily,conditions:Conditions):ColorGuidance{
  let reason='Die Farbfamilie bietet einen ausgewogenen Kompromiss aus Natürlichkeit und Erkennbarkeit.'
  if(conditions.turbidity==='clear')reason=family==='transparent'?'Klares Wasser und gute Sicht sprechen für eine unauffällige, lichtdurchlässige Silhouette.':'Bei klarem Wasser wirkt ein natürliches Beutefischdekor glaubwürdig und unaufdringlich.'
  else if(conditions.turbidity==='turbid')reason='Im trüben Wasser ist eine klar erkennbare Silhouette wichtiger als ein bestimmter Farbname.'
  else if(conditions.light==='dark'||conditions.timeOfDay==='night')reason='Bei wenig Licht hilft eine deutliche Silhouette; ein pauschaler Fluoreszenzbonus wird nicht angenommen.'
  else if(conditions.turbidity==='slightly_turbid')reason='Bei leichter Trübung bleibt der Köder natürlich, soll sich aber noch erkennbar vom Hintergrund abheben.'
  return{family,familyLabel:labels[family],examples:examples[family],reason}
}
