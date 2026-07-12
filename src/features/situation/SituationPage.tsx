import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ActivitySign, Conditions, ObservableStructure } from '../../domain/models/types'

const choices={
  season:[['spring','Frühling'],['summer','Sommer'],['autumn','Herbst'],['winter','Winter']],
  timeOfDay:[['dawn','Morgen'],['day','Tag'],['dusk','Abend'],['night','Nacht'],['unknown','Unbekannt']],
  turbidity:[['clear','Klar'],['slightly_turbid','Leicht trüb'],['turbid','Trüb'],['unknown','Unbekannt']],
  depth:[['shallow','Flach'],['medium','Mittel'],['deep','Tief'],['unknown','Unbekannt']],
  waterTemperature:[['cold','Kalt · bis 8 °C'],['cool','Kühl · 9–12 °C'],['mild','Mild · 13–18 °C'],['warm','Warm · 19–23 °C'],['hot','Heiß · über 23 °C'],['unknown','Unbekannt']],
  light:[['bright','Hell'],['diffuse','Diffus/bewölkt'],['dark','Dunkel'],['unknown','Unbekannt']],
  vegetation:[['none','Kein Kraut'],['edgeOrGaps','Lockere Kante/Lücken'],['dense','Sehr dicht'],['unknown','Unbekannt']],
} as const
const structures:Array<[ObservableStructure,string]>=[['shallow','Flachzone'],['dropoff','Tiefenkante']]
const activityOptions:Array<[ActivitySign,string]>=[['baitfish','Kleinfisch sichtbar'],['huntingPerch','Jagende Barsche'],['surfaceActivity','Oberflächenaktivität']]
const initial:Conditions={targetFish:'perch',waterType:'lake',season:'summer',timeOfDay:'day',turbidity:'slightly_turbid',depth:'medium',waterTemperature:'unknown',light:'unknown',activity:{status:'unknown',signs:[]},vegetation:'unknown',observedStructure:[]}

export function SituationPage(){const[conditions,setConditions]=useState(initial);const navigate=useNavigate();const select=(key:keyof typeof choices,value:string)=>setConditions(current=>({...current,[key]:value}));const toggleStructure=(value:ObservableStructure)=>setConditions(current=>({...current,observedStructure:current.observedStructure.includes(value)?current.observedStructure.filter(item=>item!==value):[...current.observedStructure,value]}));const setActivityStatus=(status:'unknown'|'none')=>setConditions(current=>({...current,activity:{status,signs:[]}}));const toggleActivity=(value:ActivitySign)=>setConditions(current=>{const signs=current.activity.signs.includes(value)?current.activity.signs.filter(item=>item!==value):[...current.activity.signs,value];return{...current,activity:{status:signs.length?'observed':'none',signs}}});return <section>
  <p className="eyebrow">NEUE SEE-SESSION</p><h1>Was siehst du am Wasser?</h1><p className="lead">Barsch und See sind fest eingestellt. Unbekannte Angaben bleiben fachlich neutral.</p>
  <div className="fixed-context"><span>Zielfisch</span><strong>Barsch</strong><span>Gewässer</span><strong>See</strong></div>
  <div className="form-grid">
    {Object.entries(choices).map(([key,values])=><fieldset key={key}><legend>{({season:'Jahreszeit',timeOfDay:'Tageszeit',turbidity:'Wassertrübung',depth:'Angeltiefe',waterTemperature:'Wassertemperatur',light:'Lichtverhältnis',vegetation:'Krautbild'} as Record<string,string>)[key]}</legend><div className="chips">{values.map(([value,label])=><button type="button" key={value} className={conditions[key as keyof Conditions]===value?'selected':''} onClick={()=>select(key as keyof typeof choices,value)}>{label}</button>)}</div></fieldset>)}
    <fieldset><legend>Aktivitätsanzeichen <small>mehrfach möglich</small></legend><div className="chips"><button type="button" className={conditions.activity.status==='unknown'?'selected':''} onClick={()=>setActivityStatus('unknown')}>Nicht geprüft</button><button type="button" className={conditions.activity.status==='none'?'selected':''} onClick={()=>setActivityStatus('none')}>Nichts sichtbar</button>{activityOptions.map(([value,label])=><button type="button" key={value} className={conditions.activity.signs.includes(value)?'selected':''} onClick={()=>toggleActivity(value)}>{label}</button>)}</div></fieldset>
    <fieldset><legend>Weitere sichtbare Struktur <small>optional, mehrfach</small></legend><div className="chips">{structures.map(([value,label])=><button type="button" key={value} className={conditions.observedStructure.includes(value)?'selected':''} onClick={()=>toggleStructure(value)}>{label}</button>)}</div></fieldset>
  </div><button className="primary sticky-action" onClick={()=>navigate('/empfehlung',{state:conditions})}>Drei Empfehlungen berechnen →</button>
</section>}
