export type EvidenceClass = 'science' | 'experience' | 'weak'

export interface EvidenceRule {
  id: string
  sourceRuleId: string
  group: 'season' | 'light' | 'visibility' | 'cover' | 'retrieve' | 'switch'
  evidence: EvidenceClass
  effect: -3 | -2 | -1 | 0 | 1 | 2 | 3
  confidence: number
  reasonCode: string
  summary: string
  counterconditions: string[]
  sourceIds: string[]
}

export const evidenceRules = {
  springSummerVegetation: { id: 'PL001', sourceRuleId: 'R002', group: 'season', evidence: 'science', effect: 3, confidence: 0.86, reasonCode: 'SEASONAL_VEGETATION', summary: 'Frühjahr und Frühsommer begünstigen strukturreiche Litoralbereiche.', counterconditions: ['sehr klares und helles Wasser', 'fehlende Beute'], sourceIds: ['S02'] },
  autumnDropoff: { id: 'PL002', sourceRuleId: 'R004', group: 'season', evidence: 'science', effect: 3, confidence: 0.88, reasonCode: 'AUTUMN_DROPOFF', summary: 'Im abkühlenden Herbst gewinnen Flach-Tief-Übergänge an Bedeutung.', counterconditions: ['noch sommerlich geschichteter See'], sourceIds: ['S11'] },
  winterDropoff: { id: 'PL003', sourceRuleId: 'R005', group: 'season', evidence: 'science', effect: 3, confidence: 0.9, reasonCode: 'WINTER_DROPOFF', summary: 'In kalten Phasen verteilen sich Barsche häufig tiefer.', counterconditions: ['flacher durchmischter See', 'kurzes mildes Sonnenfenster'], sourceIds: ['S04'] },
  twilightShallow: { id: 'PL004', sourceRuleId: 'R007', group: 'light', evidence: 'science', effect: 3, confidence: 0.9, reasonCode: 'TWILIGHT_SHALLOW', summary: 'Dämmerungsaktivität kann flache Jagdzonen begünstigen.', counterconditions: ['Hochsommer', 'stark trüber See'], sourceIds: ['S03', 'S04'] },
  clearBrightDepth: { id: 'PL005', sourceRuleId: 'R009', group: 'visibility', evidence: 'science', effect: 2, confidence: 0.7, reasonCode: 'CLEAR_DAY_DEPTH', summary: 'Bei hoher Sicht und Tageslicht sind Tiefe und Deckung plausible Rückzugsbereiche.', counterconditions: ['Dämmerung', 'aktive Flachwasserjagd'], sourceIds: ['S07'] },
  turbidSearch: { id: 'PL006', sourceRuleId: 'R011', group: 'visibility', evidence: 'experience', effect: 2, confidence: 0.68, reasonCode: 'TURBID_SEARCH', summary: 'Bei starker Trübung können deutliche Suchköder die Begegnungsrate erhöhen.', counterconditions: ['sehr kaltes Wasser', 'hoher Angeldruck'], sourceIds: ['S16'] },
  vegetationEdge: { id: 'PL007', sourceRuleId: 'R013', group: 'cover', evidence: 'science', effect: 3, confidence: 0.86, reasonCode: 'VEGETATION_EDGE', summary: 'Krautkanten und Lücken verbinden Deckung mit besserer Jagdeffizienz.', counterconditions: ['extrem dichter Krautkern'], sourceIds: ['S06'] },
  winterFinesse: { id: 'PL008', sourceRuleId: 'R033', group: 'retrieve', evidence: 'experience', effect: 2, confidence: 0.82, reasonCode: 'WINTER_FINESSE', summary: 'Langsame Präsentationen verlängern in kalten Phasen die Aufenthaltszeit im Sichtfeld.', counterconditions: ['sichtbar aggressives Beißfenster'], sourceIds: [] },
  noContactSwitch: { id: 'PL009', sourceRuleId: 'R047', group: 'switch', evidence: 'experience', effect: 3, confidence: 0.9, reasonCode: 'NO_CONTACT_SWITCH', summary: 'Ohne Kontakt sollten Tiefe und Präsentationsstil vor einer Farbrotation geändert werden.', counterconditions: ['noch nicht systematisch abgefischter Mikrospot'], sourceIds: ['S11', 'S16'] },
} satisfies Record<string, EvidenceRule>

export const researchSources = {
  S02: { citation: 'Westrelin et al. (2018), Habitat use and preference of adult perch in a deep reservoir', url: 'https://hal.science/hal-01832981v1' },
  S04: { citation: 'Jacobsen et al. (2002), Activity and food choice of piscivorous perch', url: 'https://orbit.dtu.dk/en/publications/activity-and-food-choice-of-piscivorous-perch-perca-fluviatilis-i/' },
  S06: { citation: 'Eklöv (1997), Effects of habitat complexity and prey abundance on perch and pike', url: 'https://www.diva-portal.org/smash/get/diva2:158848/FULLTEXT01.pdf' },
  S11: { citation: 'Heermann et al. (2013), Environmental factors and recreational perch catch rates', url: 'https://doi.org/10.1111/fme.12000' },
} as const

export function evidencePoints(rule: EvidenceRule): number {
  const classFactor = rule.evidence === 'science' ? 1 : rule.evidence === 'experience' ? 0.75 : 0.35
  return Math.round(rule.effect * 4 * rule.confidence * classFactor)
}
