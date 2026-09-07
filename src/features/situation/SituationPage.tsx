import { timeDefaults } from './timeDefaults'
import { WeatherAssist } from './WeatherAssist'
import { applyWeather } from './weather'
import { PlanProgress } from '../../ui/components/PlanProgress'
import { useInventory } from '../inventory/useInventory'
import { fishLabel } from '../../domain/species/profiles'
import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import type { ActivitySign, Conditions, ObservableStructure, TargetFish } from '../../domain/models/types'
import { Icon } from '../../ui/components/Icon'
import { isConditions } from '../../domain/models/validation'

const choices={
  season:[['spring','Frühling'],['summer','Sommer'],['autumn','Herbst'],['winter','Winter']],
  timeOfDay:[['dawn','Morgen'],['day','Tag'],['dusk','Abend'],['night','Nacht'],['unknown','Unbekannt']],
  turbidity:[['clear','Klar'],['slightly_turbid','Leicht trüb'],['turbid','Trüb'],['unknown','Unbekannt']],
  depth:[['shallow','Flach'],['medium','Mittel'],['deep','Tief'],['unknown','Unbekannt']],
  waterTemperature:[['cold','Kalt · bis 8 °C'],['cool','Kühl · 9–12 °C'],['mild','Mild · 13–18 °C'],['warm','Warm · 19–23 °C'],['hot','Heiß · über 23 °C'],['unknown','Unbekannt']],
  light:[['bright','Hell'],['diffuse','Diffus/bewölkt'],['dark','Dunkel'],['unknown','Unbekannt']],
  vegetation:[['none','Kein Kraut'],['edgeOrGaps','Lockere Kante/Lücken'],['dense','Sehr dicht'],['unknown','Unbekannt']],
} as const
const structures=(fish:TargetFish):Array<[ObservableStructure,string]>=>[['shallow','Flachzone'],['dropoff','Tiefenkante'],...(fish!=='perch'?[['hardCover',fish==='zander'?'Steinpackung oder harter Grund':'Holz, Steg oder harte Deckung'] as [ObservableStructure,string]]:[])]
const activityOptions=(fish:TargetFish):Array<[ActivitySign,string]>=>[['baitfish','Kleinfisch sichtbar'],[fish==='pike'?'pikeContact':fish==='zander'?'zanderContact':'huntingPerch',fish==='pike'?'Hecht/Raubfischkontakt':fish==='zander'?'Zanderkontakt':'Jagende Barsche'],['surfaceActivity','Oberflächenaktivität']]
const initial=(fish:TargetFish):Conditions=>({targetFish:fish,waterType:'lake',...timeDefaults(),turbidity:'unknown',depth:'unknown',waterTemperature:'unknown',light:'unknown',activity:{status:'unknown',signs:[]},vegetation:'unknown',observedStructure:[],structureStatus:'unknown',pikeSafetyConfirmed:fish==='pike'?false:undefined})
const labels={season:'Jahreszeit',timeOfDay:'Tageszeit',turbidity:'Wassertrübung',depth:'Angeltiefe',waterTemperature:'Wassertemperatur',light:'Lichtverhältnis',vegetation:'Krautbild'} as const
const groups:Array<{number:string;title:string;description:string;keys:Array<keyof typeof choices>}>= [
  {number:'01',title:'Rahmenbedingungen',description:'Was den Angeltag zeitlich und thermisch einordnet.',keys:['season','timeOfDay','waterTemperature']},
  {number:'02',title:'Wasser und Angelzone',description:'Was du unmittelbar am gewählten Uferbereich erkennst.',keys:['turbidity','depth','light','vegetation']},
]

export function SituationPage(){const params=useParams();const fish=params.fish as TargetFish;if(fish!=='perch'&&fish!=='pike'&&fish!=='zander')return <Navigate to="/neu" replace/>;return <SituationForm key={fish} fish={fish}/>}
function SituationForm({fish}:{fish:TargetFish}){
  const location=useLocation()
  const {inventory,error:inventoryError}=useInventory()
  const fishInventory=inventory.filter(item=>item.targetFish===fish)
  const[conditions,setConditions]=useState(()=>isConditions(location.state)&&location.state.targetFish===fish?location.state:initial(fish))
  const [automaticTime, setAutomaticTime] = useState(() => !(isConditions(location.state) && location.state.targetFish === fish))
  const navigate=useNavigate()
  useEffect(()=>{navigate(location.pathname,{replace:true,state:conditions})},[conditions,location.pathname,navigate])
  const select=(key:keyof typeof choices,value:string)=>{if(key==='timeOfDay')setAutomaticTime(false);setConditions(current=>({...current,[key]:value}))};const toggleStructure=(value:ObservableStructure)=>setConditions(current=>{const observedStructure=current.observedStructure.includes(value)?current.observedStructure.filter(item=>item!==value):[...current.observedStructure,value];return{...current,observedStructure,structureStatus:observedStructure.length?'observed':'unknown'}});const setNoStructure=()=>setConditions(current=>({...current,observedStructure:[],structureStatus:current.structureStatus==='none'?'unknown':'none'}));const setActivityStatus=(status:'unknown'|'none')=>setConditions(current=>({...current,activity:{status,signs:[]}}));const toggleActivity=(value:ActivitySign)=>setConditions(current=>{const signs=current.activity.signs.includes(value)?current.activity.signs.filter(item=>item!==value):[...current.activity.signs,value];return{...current,activity:{status:signs.length?'observed':'unknown',signs}}});return <section className="page-shell situation-page">
  <PlanProgress step={1}/><p className="eyebrow">DEIN {fishLabel[fish].toUpperCase()}-PLAN</p><h1>Was siehst du am Wasser?</h1><p className="lead">Was du nicht weißt, bleibt offen.</p>
  <div className="fixed-context"><img src={`${import.meta.env.BASE_URL}assets/terrain/${fish}.webp`} alt=""/><div><span>Zielfisch</span><strong>{fishLabel[fish]}</strong></div><div><span>Gewässer</span><strong>See · vom Ufer</strong></div></div>
  <aside className="inventory-context"><div><strong>{fishInventory.length?`${fishInventory.length} ${fishInventory.length===1?'Köderprofil':'Köderprofile'} für ${fishLabel[fish]} bereit`:`Noch keine Köder für ${fishLabel[fish]} ausgewählt`}</strong><p>{fishInventory.length?'Prüfe kurz, ob diese Köder heute dabei sind.':'Markiere deine Köder, damit dein Plan direkt nutzbar ist. Deine bisherigen Angaben bleiben erhalten.'}</p></div><Link className="secondary" to="/bestand" state={{draftConditions:conditions}}>{fishInventory.length?'Köder prüfen':'Köder auswählen'} <Icon name="arrow-right"/></Link></aside>
  {inventoryError&&<p className="storage-error" role="alert">{inventoryError}</p>}
  <WeatherAssist onApply={suggestion => {
    setConditions(current => applyWeather(automaticTime && suggestion.timeOfDay !== 'unknown' ? {...current, timeOfDay:'unknown'} : current, suggestion))
    if(suggestion.timeOfDay !== 'unknown')setAutomaticTime(false)
  }}/>
  <div className="form-grid">
    {groups.map(group=><section className="observation-group" key={group.number}><header><span>{group.number}</span><div><h2>{group.title}</h2><p>{group.description}</p></div></header>{group.keys.map(key=><fieldset key={key}><legend>{labels[key]}</legend><div className="chips">{choices[key].map(([value,label])=>{const selected=conditions[key as keyof Conditions]===value;return <button type="button" key={value} aria-pressed={selected} className={selected?'selected':''} onClick={()=>select(key,value)}>{selected&&<Icon name="check" size={15}/>}<span>{label}</span></button>})}</div></fieldset>)}{group.number==='01'&&<p className="form-hint"><Icon name="check" size={16}/><span>Jahreszeit und Tageszeit sind vorausgewählt. Keine Eingabe nötig – bei Bedarf ändern. Die Tageszeit ist eine Näherung nach deiner Gerätezeit.</span></p>}</section>)}
    <section className="observation-group"><header><span>03</span><div><h2>Direkte Beobachtungen</h2><p>Was du tatsächlich siehst, darf Annahmen überstimmen.</p></div></header><fieldset><legend>Aktivitätsanzeichen <small>mehrfach möglich</small></legend><div className="chips"><button type="button" aria-pressed={conditions.activity.status==='unknown'} className={conditions.activity.status==='unknown'?'selected':''} onClick={()=>setActivityStatus('unknown')}>{conditions.activity.status==='unknown'&&<Icon name="check" size={15}/>}<span>Nicht geprüft</span></button><button type="button" aria-pressed={conditions.activity.status==='none'} className={conditions.activity.status==='none'?'selected':''} onClick={()=>setActivityStatus('none')}>{conditions.activity.status==='none'&&<Icon name="check" size={15}/>}<span>Nichts sichtbar</span></button>{activityOptions(fish).map(([value,label])=>{const selected=conditions.activity.signs.includes(value);return <button type="button" key={value} aria-pressed={selected} className={selected?'selected':''} onClick={()=>toggleActivity(value)}>{selected&&<Icon name="check" size={15}/>}<span>{label}</span></button>})}</div></fieldset>
    <fieldset><legend>Weitere sichtbare Struktur <small>optional, mehrfach</small></legend><div className="chips"><button type="button" aria-pressed={conditions.structureStatus==='none'} className={conditions.structureStatus==='none'?'selected':''} onClick={setNoStructure}>{conditions.structureStatus==='none'&&<Icon name="check" size={15}/>}<span>Keine weitere Struktur vorhanden</span></button>{structures(fish).map(([value,label])=>{const selected=conditions.observedStructure.includes(value);return <button type="button" key={value} aria-pressed={selected} className={selected?'selected':''} onClick={()=>toggleStructure(value)}>{selected&&<Icon name="check" size={15}/>}<span>{label}</span></button>})}</div></fieldset>
    {fish==='pike'&&<fieldset className="safety-check"><legend>Hechtsicher vorbereitet</legend><p>Erforderlich: hechtsicheres Vorfach, geeigneter Kescher, lange Lösezange und Abhakmöglichkeit. Schonzeit, Mindestmaß und Gewässerordnung vor Ort prüfen.</p><label><input type="checkbox" checked={conditions.pikeSafetyConfirmed===true} onChange={event=>setConditions(current=>({...current,pikeSafetyConfirmed:event.target.checked}))}/> Ich habe Ausrüstung und örtliche Regeln geprüft.</label></fieldset>}</section>
  </div><button className="primary sticky-action" disabled={fish==='pike'&&!conditions.pikeSafetyConfirmed} onClick={()=>navigate('/empfehlung',{state:conditions})}>Empfehlungen berechnen →</button>
</section>}
