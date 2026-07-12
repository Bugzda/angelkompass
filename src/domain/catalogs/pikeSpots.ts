import type { SpotType } from '../models/types'

export const pikeSpots: SpotType[] = [
  {id:'vegetation',label:'Schilf- oder Krautkante',description:'Deckung mit freien Jagdbahnen entlang der Außenkante.',seasonalAffinity:['spring','summer','autumn'],depthAffinity:['shallow','medium'],priority:1},
  {id:'hardCover',label:'Holz, Steg oder harte Deckung',description:'Ein klarer Unterstand oder Übergang, der vom Ufer erreichbar ist.',seasonalAffinity:['spring','summer','autumn','winter'],depthAffinity:['shallow','medium'],priority:2},
  {id:'dropoff',label:'Abbruchkante oder Tiefenübergang',description:'Verbindet erreichbares Freiwasser mit tieferem Rückzugsraum.',seasonalAffinity:['summer','autumn','winter'],depthAffinity:['medium','deep'],priority:3},
  {id:'shallow',label:'Flachwasser oder Bucht',description:'Flache, schnell erwärmte Zone mit möglichem Beutefischkontakt.',seasonalAffinity:['spring','summer'],depthAffinity:['shallow'],priority:4},
]
