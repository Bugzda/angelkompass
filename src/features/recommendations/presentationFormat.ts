/** Compact weight for tiles: "3–6 g Ködergesamtgewicht · keine Zusatzbeschwerung" → "3–6 g". */
export function shortWeight(label: string) {
  return label.split(' · ')[0].replace(/\s*Ködergesamtgewicht$/, '')
}
