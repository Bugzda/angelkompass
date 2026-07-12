import type { ColorFamily,ColorGuidance,Conditions,LureMaterial,LureType } from '../models/types'

const materialExamples:Record<LureMaterial,Record<ColorFamily,string[]>>={
  soft:{natural:['Green Pumpkin','Oliv-Braun','Rotauge/Perlmutt','Krebsbraun'],transparent:['Smoke','Watermelon transluzent','Ghost Pearl','Transparent mit feinem Glitter'],contrast:['Schwarz','Dunkelviolett','Weiß mit dunklem Rücken','Schwarz mit kleinem Chartreuse-Akzent']},
  hard:{natural:['Barschdekor','Rotauge/Silber','Oliv-Perlmutt','Braun/Krebs'],transparent:['Ghost Minnow','Ghost Silber','Transparent Olive','Smoke mit feinem Flash'],contrast:['Schwarz','Dunkelviolett','Weiß mit dunklem Rücken','Schwarz-Chartreuse']},
  metal:{natural:['Silber','Gold','Kupfer','Schwarz-Nickel'],transparent:['Silber mit dezentem Flash','Mattes Nickel','Helles Gold','Kupfer'],contrast:['Schwarz','Kupfer dunkel','Weiß-Chartreuse','Schwarz mit hellem Blatt']},
  hybrid:{natural:['Barschdekor','Oliv-Perlmutt','Rotauge/Silber','Green Pumpkin Trailer'],transparent:['Ghost Trailer mit Silberblatt','Smoke Trailer','Transparent Olive','Perlmutt'],contrast:['Schwarz','Dunkelviolett','Weiß mit dunklem Rücken','Schwarz-Chartreuse']},
}
const labels:Record<ColorFamily,string>={natural:'Natürlich',transparent:'Transparent',contrast:'Kontrastreich'}

export function preferredColorFamily(conditions:Conditions,lure:LureType):ColorFamily{
  if(conditions.turbidity==='turbid'||conditions.light==='dark'||conditions.timeOfDay==='night')return'contrast'
  if(conditions.turbidity==='clear'&&(lure.material==='hard'||lure.id==='ned'))return'transparent'
  return'natural'
}

export function buildColorGuidance(family:ColorFamily,conditions:Conditions,lure?:LureType):ColorGuidance{
  const material=lure?.material??'soft'
  let baseLabel='Natürliche, gut erkennbare Grundfarbe'
  let finishLabel=material==='metal'?'Metallisches Finish':'Matt bis dezent glänzend'
  let accentLabel='Kein fester Akzent'
  let alternative='Als Einzelvariable eine deutlich hellere oder dunklere Silhouette testen.'
  let reason='Die Farbauswahl bleibt nach Standort, Tiefe, Führung und Größe eine nachgelagerte Testvariable.'
  if(conditions.light==='dark'||conditions.timeOfDay==='night'){
    baseLabel='Dunkle Silhouette'
    finishLabel=material==='metal'?'Dunkles Metall oder begrenzter Flash':'Deckend und ohne unnötigen Glitter'
    accentLabel='Kein universeller Fluoreszenzbonus'
    alternative='Eine helle Kontrastvariante nur als kontrollierte Gegenprobe testen.'
    reason='Bei wenig Licht ist eine klare Silhouette plausibler als eine starre Neon-Farbregel.'
  }else if(conditions.turbidity==='clear'){
    baseLabel=family==='transparent'?'Natürliche transluzente Silhouette':'Lokales Beutefisch- oder Krebsdekor'
    finishLabel=material==='metal'?'Dezenter Silber-, Gold- oder Kupferflash':'Ghost/transluzent oder natürlich matt'
    accentLabel='Optional kleiner Orange-/Rotakzent, kein Muss'
    alternative='Bei Nachläufern zwischen natürlichem Dekor und Ghost-Finish wechseln.'
    reason='Klares Wasser erlaubt eine genaue Prüfung des Köders; natürliche und transluzente Varianten vermeiden eine unnötig harte Silhouette.'
  }else if(conditions.turbidity==='turbid'){
    baseLabel='Dunkle, geschlossene Silhouette'
    finishLabel=material==='metal'?'Deutlicher Blatt- oder Metallflash als Test':'Deckend und kontrastreich'
    accentLabel='Optional kleiner Chartreuse- oder Weißakzent'
    alternative='Als Gegenprobe eine helle, deckende Kontrastvariante verwenden.'
    reason='Im trüben Wasser zählt der erkennbare Umriss. Dunkel und hell sind sinnvolle Gegenproben; Fluoreszenz erhält keinen pauschalen Bonus.'
  }else if(conditions.turbidity==='slightly_turbid'){
    baseLabel='Natürliche Basis mit klarer Silhouette'
    finishLabel=material==='metal'?'Kontrollierter Silber- oder Goldflash':'Matt bis leicht perlmuttschimmernd'
    accentLabel='Optional kleiner Chartreuse- oder Orange-Akzent'
    alternative='Bei fehlender Reaktion zuerst Führung oder Größe ändern, danach den Akzent testen.'
    reason='Leichte Trübung verlangt Erkennbarkeit, ohne das natürliche Beuteprofil vollständig aufzugeben.'
  }
  return{family,familyLabel:labels[family],baseLabel,finishLabel,accentLabel,alternative,examples:materialExamples[material][family],reason}
}
