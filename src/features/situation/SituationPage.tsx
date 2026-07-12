import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Conditions, SpotFeature } from '../../domain/models/types'

const choices = {
  season: [['spring', 'Frühling'], ['summer', 'Sommer'], ['autumn', 'Herbst'], ['winter', 'Winter']],
  timeOfDay: [['dawn', 'Morgen'], ['day', 'Tag'], ['dusk', 'Abend'], ['night', 'Nacht'], ['unknown', 'Unbekannt']],
  turbidity: [['clear', 'Klar'], ['slightly_turbid', 'Leicht trüb'], ['turbid', 'Trüb'], ['unknown', 'Unbekannt']],
  depth: [['shallow', 'Flach'], ['medium', 'Mittel'], ['deep', 'Tief'], ['unknown', 'Unbekannt']],
} as const

const structures: Array<[SpotFeature, string]> = [['vegetation', 'Kraut/Schilf'], ['shallow', 'Flachzone'], ['dropoff', 'Tiefenkante']]
const initial: Conditions = { targetFish: 'perch', waterType: 'lake', season: 'summer', timeOfDay: 'day', turbidity: 'slightly_turbid', depth: 'medium', observedStructure: [] }

export function SituationPage() {
  const [conditions, setConditions] = useState(initial)
  const navigate = useNavigate()
  const select = (key: keyof typeof choices, value: string) => setConditions((current) => ({ ...current, [key]: value }))
  const toggle = (value: SpotFeature) => setConditions((current) => ({ ...current, observedStructure: current.observedStructure.includes(value) ? current.observedStructure.filter((item) => item !== value) : [...current.observedStructure, value] }))
  const submit = () => navigate('/empfehlung', { state: conditions })

  return <section>
    <p className="eyebrow">NEUE SEE-SESSION</p>
    <h1>Was siehst du am Wasser?</h1>
    <p className="lead">Barsch und See sind für diesen ersten Funktionsumfang fest eingestellt.</p>
    <div className="fixed-context"><span>Zielfisch</span><strong>Barsch</strong><span>Gewässer</span><strong>See</strong></div>
    <div className="form-grid">
      {Object.entries(choices).map(([key, values]) => <fieldset key={key}>
        <legend>{({ season: 'Jahreszeit', timeOfDay: 'Tageszeit', turbidity: 'Wassertrübung', depth: 'Angeltiefe' } as Record<string, string>)[key]}</legend>
        <div className="chips">{values.map(([value, label]) => <button type="button" key={value} className={conditions[key as keyof Conditions] === value ? 'selected' : ''} onClick={() => select(key as keyof typeof choices, value)}>{label}</button>)}</div>
      </fieldset>)}
      <fieldset><legend>Sichtbare Struktur <small>optional, mehrfach</small></legend><div className="chips">{structures.map(([value, label]) => <button type="button" key={value} className={conditions.observedStructure.includes(value) ? 'selected' : ''} onClick={() => toggle(value)}>{label}</button>)}</div></fieldset>
    </div>
    <button className="primary sticky-action" onClick={submit}>Drei Empfehlungen berechnen →</button>
  </section>
}
