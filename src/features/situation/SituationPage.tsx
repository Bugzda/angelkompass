import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { timeDefaults } from './timeDefaults'
import { WeatherAssist } from './WeatherAssist'
import { applyWeather } from './weather'
import { PlanProgress } from '../../ui/components/PlanProgress'
import { useInventory } from '../inventory/useInventory'
import { fishLabel } from '../../domain/species/profiles'
import type { ActivitySign, Conditions, ObservableStructure, TargetFish } from '../../domain/models/types'
import { Icon } from '../../ui/components/Icon'
import { isConditions } from '../../domain/models/validation'
import { ChoiceField } from './ChoiceField'
import { type ChoiceKey, activityOptions, choices, structures } from './conditionOptions'
import { conditionsOnly, readSpotRef, withSpot } from '../spots/planningState'
import { SpotPicker } from '../spots/SpotPicker'

const initial = (fish: TargetFish): Conditions => ({
  targetFish: fish,
  waterType: 'lake',
  ...timeDefaults(),
  turbidity: 'unknown',
  depth: 'unknown',
  waterTemperature: 'unknown',
  light: 'unknown',
  activity: { status: 'unknown', signs: [] },
  vegetation: 'unknown',
  observedStructure: [],
  structureStatus: 'unknown',
  pikeSafetyConfirmed: fish === 'pike' ? false : undefined,
})

export function SituationPage() {
  const fish = useParams().fish as TargetFish
  if (fish !== 'perch' && fish !== 'pike' && fish !== 'zander') return <Navigate to="/neu" replace />
  return <SituationForm key={fish} fish={fish} />
}

function SituationForm({ fish }: { fish: TargetFish }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { inventory, error: inventoryError } = useInventory()
  const fishInventory = inventory.filter(item => item.targetFish === fish)
  const [conditions, setConditions] = useState<Conditions>(() =>
    isConditions(location.state) && location.state.targetFish === fish ? conditionsOnly(location.state) : initial(fish),
  )
  const [spot, setSpot] = useState(() =>
    isConditions(location.state) && location.state.targetFish === fish ? readSpotRef(location.state) : undefined,
  )
  const initialHash = useRef(location.hash.slice(1))
  const [automaticTime, setAutomaticTime] = useState(
    () => !(isConditions(location.state) && location.state.targetFish === fish),
  )
  const [timeExpanded, setTimeExpanded] = useState(() => ['season', 'timeOfDay'].includes(initialHash.current))
  const planningState = withSpot(conditions, spot)
  useEffect(() => {
    navigate(location.pathname, { replace: true, state: withSpot(conditions, spot) })
  }, [conditions, spot, location.pathname, navigate])
  // Deep links from the plan summary (e.g. #turbidity) open the matching field directly.
  useEffect(() => {
    const target = initialHash.current && document.getElementById(`field-${initialHash.current}`)
    if (!target) return
    target.scrollIntoView?.({ block: 'center' })
    const focusTarget =
      target.querySelector<HTMLElement>('button[aria-pressed="true"]') ?? target.querySelector<HTMLElement>('button')
    focusTarget?.focus({ preventScroll: true })
  }, [])

  const select = (key: ChoiceKey, value: string) => {
    if (key === 'timeOfDay') setAutomaticTime(false)
    setConditions(current => ({ ...current, [key]: value }))
  }
  const choiceField = (key: ChoiceKey) => (
    <ChoiceField key={key} field={key} value={conditions[key]} onSelect={value => select(key, value)} />
  )
  const toggleStructure = (value: ObservableStructure) =>
    setConditions(current => {
      const observedStructure = current.observedStructure.includes(value)
        ? current.observedStructure.filter(item => item !== value)
        : [...current.observedStructure, value]
      return { ...current, observedStructure, structureStatus: observedStructure.length ? 'observed' : 'unknown' }
    })
  const setNoStructure = () =>
    setConditions(current => ({
      ...current,
      observedStructure: [],
      structureStatus: current.structureStatus === 'none' ? 'unknown' : 'none',
    }))
  const setActivityStatus = (status: 'unknown' | 'none') =>
    setConditions(current => ({ ...current, activity: { status, signs: [] } }))
  const toggleActivity = (value: ActivitySign) =>
    setConditions(current => {
      const signs = current.activity.signs.includes(value)
        ? current.activity.signs.filter(item => item !== value)
        : [...current.activity.signs, value]
      return { ...current, activity: { status: signs.length ? 'observed' : 'unknown', signs } }
    })
  const timeSummary = `${choices.season.find(([value]) => value === conditions.season)?.[1]} · ${choices.timeOfDay.find(([value]) => value === conditions.timeOfDay)?.[1]}`

  return (
    <section className="page-shell situation-page compact-situation">
      <PlanProgress step={1} />
      <p className="eyebrow">{fishLabel[fish]} · SEE · VOM UFER</p>
      <h1>Was siehst du am Wasser?</h1>
      <p className="lead">Was du nicht weißt, bleibt offen.</p>
      <div className="planning-context">
        <span>
          {fishInventory.length
            ? `${fishInventory.length} ${fishInventory.length === 1 ? 'Ködertyp' : 'Ködertypen'} bereit`
            : 'Noch keine Köder ausgewählt'}
        </span>
        <Link to="/bestand" state={{ draftConditions: planningState }}>
          {fishInventory.length ? 'Köder prüfen' : 'Köder auswählen'}
          <Icon name="arrow-right" size={18} />
        </Link>
      </div>
      {inventoryError && (
        <p className="storage-error" role="alert">
          {inventoryError}
        </p>
      )}
      <section className="time-settings">
        <button
          className="time-toggle"
          type="button"
          aria-expanded={timeExpanded}
          aria-controls="time-settings-content"
          aria-label={`Zeit ändern: ${timeSummary}`}
          onClick={() => setTimeExpanded(!timeExpanded)}
        >
          <span>{timeSummary}</span>
          <span>
            {timeExpanded ? 'Schließen' : 'Zeit ändern'}
            <Icon name="chevron-down" size={18} />
          </span>
        </button>
        <div id="time-settings-content" className="time-fields" hidden={!timeExpanded}>
          {choiceField('season')}
          {choiceField('timeOfDay')}
          <p className="form-hint">
            Jahreszeit und Tageszeit sind vorausgewählt. Keine Eingabe nötig – bei Bedarf ändern. Die Tageszeit ist eine
            Näherung nach deiner Gerätezeit.
          </p>
        </div>
      </section>
      <SpotPicker
        conditions={conditions}
        spot={spot}
        onChange={(next, nextSpot) => {
          setConditions(next)
          setSpot(nextSpot)
        }}
      />
      <div className="form-grid">
        <section className="observation-group">
          <header>
            <h2>Wasser und Angelzone</h2>
          </header>
          {(['turbidity', 'depth', 'vegetation', 'waterTemperature', 'light'] as const).map(choiceField)}
        </section>
        <section className="observation-group">
          <header>
            <h2>Direkte Beobachtungen</h2>
          </header>
          <fieldset id="field-activity" tabIndex={-1}>
            <legend>
              Aktivitätsanzeichen <small>mehrfach möglich</small>
            </legend>
            <div className="chips">
              <button
                type="button"
                aria-pressed={conditions.activity.status === 'unknown'}
                className={conditions.activity.status === 'unknown' ? 'selected' : ''}
                onClick={() => setActivityStatus('unknown')}
              >
                {conditions.activity.status === 'unknown' && <Icon name="check" size={15} />}
                <span>Nicht geprüft</span>
              </button>
              <button
                type="button"
                aria-pressed={conditions.activity.status === 'none'}
                className={conditions.activity.status === 'none' ? 'selected' : ''}
                onClick={() => setActivityStatus('none')}
              >
                {conditions.activity.status === 'none' && <Icon name="check" size={15} />}
                <span>Nichts sichtbar</span>
              </button>
              {activityOptions(fish).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={conditions.activity.signs.includes(value)}
                  className={conditions.activity.signs.includes(value) ? 'selected' : ''}
                  onClick={() => toggleActivity(value)}
                >
                  {conditions.activity.signs.includes(value) && <Icon name="check" size={15} />}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset id="field-structure" tabIndex={-1}>
            <legend>
              Weitere sichtbare Struktur <small>optional, mehrfach</small>
            </legend>
            <div className="chips">
              <button
                type="button"
                aria-pressed={conditions.structureStatus === 'none'}
                className={conditions.structureStatus === 'none' ? 'selected' : ''}
                onClick={setNoStructure}
              >
                {conditions.structureStatus === 'none' && <Icon name="check" size={15} />}
                <span>Keine weitere Struktur vorhanden</span>
              </button>
              {structures(fish).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  aria-pressed={conditions.observedStructure.includes(value)}
                  className={conditions.observedStructure.includes(value) ? 'selected' : ''}
                  onClick={() => toggleStructure(value)}
                >
                  {conditions.observedStructure.includes(value) && <Icon name="check" size={15} />}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </fieldset>
        </section>
      </div>
      <WeatherAssist
        onApply={suggestion => {
          setConditions(current =>
            applyWeather(
              automaticTime && suggestion.timeOfDay !== 'unknown' ? { ...current, timeOfDay: 'unknown' } : current,
              suggestion,
            ),
          )
          if (suggestion.timeOfDay !== 'unknown') setAutomaticTime(false)
        }}
      />
      {fish === 'pike' && (
        <fieldset className="safety-check">
          <legend>Hechtsicher vorbereitet</legend>
          <p>
            Erforderlich: hechtsicheres Vorfach, geeigneter Kescher, lange Lösezange und Abhakmöglichkeit. Schonzeit,
            Mindestmaß und Gewässerordnung vor Ort prüfen.
          </p>
          <label>
            <input
              type="checkbox"
              checked={conditions.pikeSafetyConfirmed === true}
              onChange={event => setConditions(current => ({ ...current, pikeSafetyConfirmed: event.target.checked }))}
            />{' '}
            Ich habe Ausrüstung und örtliche Regeln geprüft.
          </label>
        </fieldset>
      )}
      <button
        className="primary sticky-action"
        disabled={fish === 'pike' && !conditions.pikeSafetyConfirmed}
        onClick={() => navigate('/empfehlung', { state: planningState })}
      >
        Empfehlungen berechnen →
      </button>
    </section>
  )
}
