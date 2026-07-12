import type { LureType } from '../models/types'
const allDepths:LureType['depths']=['shallow','medium','deep']; const allCurrents:LureType['currents']=['none','weak','medium','strong']
const lure=(id:string,label:string,mounting:string,guidance:string[],opts:Partial<LureType>={}):LureType=>({id,label,mounting,guidance,sizes:['small','medium','large'],colors:['natural','contrast','bright_uv','transparent','shock'],weights:['ultralight','light','medium','heavy'],depths:allDepths,currents:allCurrents,replacementIds:[],priority:5,...opts})
export const lures:LureType[]=[
 lure('jig','Gummifisch am Jigkopf','Jigkopf',['Jiggen mit Grundkontakt','gleichmäßig knapp über Grund'],{replacementIds:['cheburashka','ned'],priority:1}),
 lure('creature-jig','Creature Bait am Jigkopf','Jigkopf',['kurze Sprünge mit langen Pausen'],{replacementIds:['texas','jika']}),
 lure('ned','Ned Rig','leichter Pilzkopf',['langsam schleifen und stehen lassen'],{weights:['ultralight','light','medium'],replacementIds:['drop-shot','jig'],priority:2}),
 lure('carolina','Carolina Rig','Carolina Rig',['langsam schleifen, regelmäßig pausieren'],{replacementIds:['texas','free']}),
 lure('texas','Texas Rig','Offsethaken mit Bullet Weight',['durch Deckung zupfen'],{replacementIds:['jika','creature-jig']}),
 lure('drop-shot','Drop Shot','Drop-Shot-Montage',['am Platz zittern und lange pausieren'],{weights:['light','medium','heavy'],replacementIds:['ned'],priority:2}),
 lure('cheburashka','Cheburashka/Flex Head','beweglicher Flex Head',['faulenzen mit Grundkontakt'],{replacementIds:['jig']}),
 lure('jika','Jika Rig','Jika Rig',['präzise in Deckung hüpfen'],{replacementIds:['texas']}),
 lure('wacky','Wacky Rig','Wacky Hook',['absinken lassen, fein anzupfen'],{weights:['ultralight','light'],depths:['shallow','medium'],currents:['none','weak'],replacementIds:['ned']}),
 lure('free','Free Rig','frei laufendes Gewicht',['anheben und frei absinken lassen'],{replacementIds:['carolina','texas']}),
 lure('twitchbait','Twitchbait','direkt am Karabiner',['zwei Twitches, dann Pause'],{weights:['light','medium'],depths:['shallow','medium'],replacementIds:['crankbait'],priority:2}),
 lure('crankbait','Crankbait','direkt am Karabiner',['gleichmäßig mit kurzen Stopps'],{weights:['light','medium','heavy'],replacementIds:['spinner']}),
 lure('spinner','Spinner','direkt am Karabiner',['gleichmäßig, so langsam wie möglich'],{depths:['shallow','medium'],replacementIds:['chatterbait'],priority:3}),
 lure('chatterbait','Chatterbait','direkt oder mit Trailer',['gleichmäßig mit Tempowechseln'],{depths:['shallow','medium'],replacementIds:['spinner','crankbait']}),
 lure('blade-bait','Blade Bait','direkt am Karabiner',['kurz anheben und kontrolliert absinken'],{weights:['medium','heavy'],depths:['medium','deep'],replacementIds:['jig']})
]
