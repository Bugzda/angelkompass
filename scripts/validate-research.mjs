import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const file = resolve('research/perch/v1.0.0/barsch_regelwerk.json')
const data = JSON.parse(await readFile(file, 'utf8'))
const errors = []
const requireArray = (value, label) => {
  if (!Array.isArray(value)) errors.push(`${label} muss ein Array sein.`)
  return Array.isArray(value) ? value : []
}
const duplicates = (values) => values.filter((value, index) => values.indexOf(value) !== index)
const rules = requireArray(data.rules, 'rules')
const sources = requireArray(data.sources, 'sources')
const scenarios = requireArray(data.test_scenarios, 'test_scenarios')
const sourceIds = new Set(sources.map((source) => source.id))

for (const id of new Set(duplicates(rules.map((rule) => rule.id)))) errors.push(`Doppelte Regel-ID: ${id}`)
for (const id of new Set(duplicates(sources.map((source) => source.id)))) errors.push(`Doppelte Quellen-ID: ${id}`)
for (const id of new Set(duplicates(scenarios.map((scenario) => scenario.id)))) errors.push(`Doppelte Szenario-ID: ${id}`)
for (const rule of rules) {
  if (!/^R\d{3}$/.test(rule.id ?? '')) errors.push(`Ungültige Regel-ID: ${String(rule.id)}`)
  if (!['SCIENCE', 'EXPERIENCE', 'WEAK'].includes(rule.evidence)) errors.push(`${rule.id}: ungültige Evidenzklasse ${String(rule.evidence)}`)
  if (!Number.isInteger(rule.effect) || rule.effect < -3 || rule.effect > 3) errors.push(`${rule.id}: effect außerhalb -3…3`)
  if (typeof rule.confidence !== 'number' || rule.confidence < 0 || rule.confidence > 1) errors.push(`${rule.id}: confidence außerhalb 0…1`)
  for (const sourceId of requireArray(rule.sources, `${rule.id}.sources`)) if (!sourceIds.has(sourceId)) errors.push(`${rule.id}: unbekannte Quelle ${sourceId}`)
}
for (const scenario of scenarios) {
  if (!/^T\d{2}$/.test(scenario.id ?? '')) errors.push(`Ungültige Szenario-ID: ${String(scenario.id)}`)
  if (!scenario.inputs || typeof scenario.inputs !== 'object') errors.push(`${scenario.id}: inputs fehlen`)
  if (!Array.isArray(scenario.expected_top3) || scenario.expected_top3.length !== 3) errors.push(`${scenario.id}: expected_top3 muss genau drei Einträge enthalten`)
}
if (errors.length) {
  console.error(`Research-Validierung fehlgeschlagen (${errors.length}):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}
console.log(`Research-Archiv gültig: ${rules.length} Regeln, ${scenarios.length} Szenarien, ${sources.length} Quellen.`)
