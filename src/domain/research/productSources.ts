import type { EvidenceClass } from '../models/types'

export type SourceEvidenceType = Exclude<EvidenceClass, 'observation'> | 'official-guidance'
export interface ProductSource {
  id: string
  title: string
  authors: string
  year: number
  url: string
  evidenceType: SourceEvidenceType
  scope: string
  lastVerifiedAt: string
}

const verified='2026-07-12'
const entries:ProductSource[]=[
  {id:'S01',title:'A global review of the biology and ecology of the European perch',authors:'Ning et al.',year:2025,url:'https://researchoutput.csu.edu.au/ws/portalfiles/portal/609914679/579873124_published_article.pdf',evidenceType:'science',scope:'Biologie und Ökologie des Europäischen Barschs',lastVerifiedAt:verified},
  {id:'S02',title:'Habitat use and preference of adult perch in a deep reservoir',authors:'Westrelin et al.',year:2018,url:'https://hal.science/hal-01832981v1/document',evidenceType:'science',scope:'Habitatwahl adulter Barsche in einem tiefen Reservoir',lastVerifiedAt:verified},
  {id:'S03',title:'Quantifying activity and movement of perch',authors:'Zamora & Moreno-Amich',year:2002,url:'https://link.springer.com/article/10.1023/A%3A1021396016424',evidenceType:'science',scope:'Aktivität und Bewegung des Europäischen Barschs',lastVerifiedAt:verified},
  {id:'S04',title:'Activity and food choice of piscivorous perch',authors:'Jacobsen et al.',year:2002,url:'https://orbit.dtu.dk/en/publications/activity-and-food-choice-of-piscivorous-perch-perca-fluviatilis-i/',evidenceType:'science',scope:'Aktivität und Nahrung piscivorer Barsche',lastVerifiedAt:verified},
  {id:'S05',title:'Behavioural strategy of large perch varies between mesotrophic and hypereutrophic lakes',authors:'Jacobsen et al.',year:2015,url:'https://www.fiskepleje.dk/-/media/sites/fiskepleje/nyheder/2015/juni/behavioural-strategy-of-large-perch-perca-fluviatilis-varies-between-a-mesotrophic-and-a-hypereutrop.pdf',evidenceType:'science',scope:'Gewässerspezifisches Raum- und Aktivitätsverhalten großer Barsche',lastVerifiedAt:verified},
  {id:'S06',title:'Effects of habitat complexity and prey abundance on perch and pike',authors:'Eklöv',year:1997,url:'https://www.diva-portal.org/smash/get/diva2:158848/FULLTEXT01.pdf',evidenceType:'science',scope:'Habitatkomplexität, Beute und Vegetation',lastVerifiedAt:verified},
  {id:'S07',title:'Predation risk and competition affect habitat use of adult perch',authors:'Henseler et al.',year:2020,url:'https://www.researchgate.net/publication/338647141_Predation_risk_and_competition_affect_habitat_use_of_adult_perch_Perca_fluviatilis',evidenceType:'science',scope:'Habitatwahl adulter Barsche unter Prädation und Konkurrenz',lastVerifiedAt:verified},
  {id:'S10',title:'Effects of turbidity and light intensity on consumption of mysids',authors:'Granqvist & Mattila',year:2004,url:'https://ui.adsabs.harvard.edu/abs/2004HyBio.514...93G/abstract',evidenceType:'science',scope:'Trübung, Licht und visuelle Nahrungsaufnahme',lastVerifiedAt:verified},
  {id:'S11',title:'Explaining recreational angling catch rates of Eurasian perch',authors:'Heermann et al.',year:2013,url:'https://www.researchgate.net/publication/235327665_Explaining_recreational_angling_catch_rates_of_Eurasian_perch_Perca_fluviatilis_The_role_of_natural_and_fishing-related_environmental_factors',evidenceType:'science',scope:'Natürliche und anglerische Einflussfaktoren auf Barschfangraten',lastVerifiedAt:verified},
  {id:'S15',title:'Spinnfiske – metoder och riggar',authors:'Sportfiskarna',year:2025,url:'https://www.sportfiskarna.se/fiske/fakta-fisketips/fiskemetoder/spinnfiske/',evidenceType:'official-guidance',scope:'Praxiswissen zu Texas, Carolina, Dropshot und weiteren Montagen',lastVerifiedAt:verified},
  {id:'S16',title:'Lure fishing for perch',authors:'Thom Hunt / Westin Fishing',year:2026,url:'https://www.westin-fishing.com/en/articles-videos/articles/perch-fishing-with-lures',evidenceType:'experience',scope:'Praxiswissen zu Barschködern, Führung und Gewicht',lastVerifiedAt:verified},
  {id:'S18',title:'Abborre – art- och fiskeguide',authors:'Sportfiskarna',year:2025,url:'https://www.sportfiskarna.se/fiske/fakta-fisketips/fiskarter/abborre/',evidenceType:'official-guidance',scope:'Offizielle Arten- und Angelhinweise zum Europäischen Barsch',lastVerifiedAt:verified},
  {id:'S20',title:'Feeding behaviour of large perch in two lakes',authors:'Dörner et al.',year:2003,url:'https://hero.epa.gov/reference/6626595/',evidenceType:'science',scope:'Nahrungswahl großer Barsche in zwei Seen',lastVerifiedAt:verified},
  {id:'S24',title:'European Perch Ecological Risk Screening Summary',authors:'U.S. Fish and Wildlife Service',year:2021,url:'https://www.fws.gov/sites/default/files/documents/Ecological-Risk-Screening-Summary-European-Perch.pdf',evidenceType:'science',scope:'Offizielle ökologische Übersicht und Temperaturtoleranz',lastVerifiedAt:verified},
  {id:'P01',title:'Influence of reed beds and submerged vegetation on pike',authors:'Niemi et al.',year:2023,url:'https://doi.org/10.1016/j.fishres.2023.106621',evidenceType:'science',scope:'Adulte Hechte in Küstenbuchten während der Laichzeit; Vegetationshabitat, keine Köderwahl',lastVerifiedAt:verified},
  {id:'P02',title:'First-season growth and food of YOY pike are habitat specific within a lake',authors:'Nilsson et al.',year:2023,url:'https://doi.org/10.1016/j.fishres.2022.106563',evidenceType:'science',scope:'Juvenile Hechte und habitatspezifische Nahrung; nur vorsichtige Habitatübertragung',lastVerifiedAt:verified},
  {id:'P03',title:'Temperature dependence of predation depends on the relative performance of predators and prey',authors:'Öhlund et al.',year:2015,url:'https://pubmed.ncbi.nlm.nih.gov/25473013/',evidenceType:'science',scope:'Temperaturabhängige Angriffsleistung von Hecht und Beute',lastVerifiedAt:verified},
  {id:'P04',title:'Effects of temperature and browning on the functional response of a freshwater top predator',authors:'Nilsson-Örtman et al.',year:2026,url:'https://pubmed.ncbi.nlm.nih.gov/41840780/',evidenceType:'science',scope:'Hecht-Fraßraten unter Temperatur und Wasserfärbung; keine direkte Wohlfahrtsstudie',lastVerifiedAt:verified},
  {id:'P05',title:'A comprehensive pike fishing guide',authors:'Westin Fishing',year:2026,url:'https://www.westin-fishing.com/en/articles-videos/articles/a-comprehensive-pike-fishing-guide',evidenceType:'experience',scope:'Praxiswissen zu Softbaits, Spinnerbaits, Hardbaits, Führung und Farbe',lastVerifiedAt:verified},
  {id:'P06',title:'Så drar du vintergäddan på spinn',authors:'Sportfiskarna',year:2017,url:'https://www.sportfiskarna.se/om-oss/aktuellt/nyheter/nyhet/sa-drar-du-vintergaddan-pa-spinn/',evidenceType:'official-guidance',scope:'Praxiswissen zu kaltem Wasser, Tailbait, Offsetrig und langen Pausen',lastVerifiedAt:verified},
]

export const productSources=Object.fromEntries(entries.map(source=>[source.id,source])) as Record<string,ProductSource>
export const sourceSubset=(ids:string[])=>Object.fromEntries(ids.map(id=>[id,productSources[id]]).filter((entry):entry is [string,ProductSource]=>Boolean(entry[1])))
