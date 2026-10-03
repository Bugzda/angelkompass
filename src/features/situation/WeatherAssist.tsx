import { useEffect, useRef, useState } from 'react'
import { loadWeather, searchPlaces, type WeatherPlace, type WeatherSuggestion } from './weather'
import { Icon } from '../../ui/components/Icon'

export function WeatherAssist({ onApply }: { onApply: (suggestion: WeatherSuggestion) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState<WeatherPlace[]>([])
  const [result, setResult] = useState<{ place: WeatherPlace; weather: WeatherSuggestion } | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const active = useRef<AbortController | null>(null)
  useEffect(
    () => () => {
      active.current?.abort()
      active.current = null
    },
    [],
  )

  async function run(action: (signal: AbortSignal) => Promise<void>) {
    active.current?.abort()
    const controller = new AbortController()
    active.current = controller
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    setBusy(true)
    setError('')
    setMessage('')
    setResult(null)
    setPlaces([])
    let onAbort: () => void = () => {}
    const cancelled = new Promise<never>((_resolve, reject) => {
      onAbort = () => reject(new DOMException('Aborted', 'AbortError'))
      controller.signal.addEventListener('abort', onAbort, { once: true })
    })
    try {
      await Promise.race([action(controller.signal), cancelled])
    } catch (cause) {
      if (active.current === controller) {
        if (controller.signal.reason === 'cancelled') setMessage('Abruf abgebrochen. Du kannst manuell weiterarbeiten.')
        else
          setError(
            controller.signal.aborted
              ? 'Der Abruf hat zu lange gedauert. Bitte erneut versuchen oder manuell ausfüllen.'
              : cause instanceof Error
                ? cause.message
                : 'Wetter nicht verfügbar. Du kannst manuell weiterarbeiten.',
          )
      }
    } finally {
      window.clearTimeout(timeout)
      controller.signal.removeEventListener('abort', onAbort)
      if (active.current === controller) setBusy(false)
    }
  }
  async function weatherAt(place: WeatherPlace, signal: AbortSignal) {
    const weather = await loadWeather(place, signal)
    if (!signal.aborted) setResult({ place, weather })
  }
  function locate() {
    void run(async signal => {
      if (!navigator.geolocation) throw new Error('Standort ist hier nicht verfügbar. Nutze die Ortssuche.')
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(
          resolve,
          () =>
            reject(
              new Error('Standort konnte nicht ermittelt werden. Nutze die Ortssuche oder prüfe die Standortfreigabe.'),
            ),
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
        ),
      )
      if (!signal.aborted)
        await weatherAt(
          { name: 'Dein Standort', latitude: position.coords.latitude, longitude: position.coords.longitude },
          signal,
        )
    })
  }
  const labels = {
    dawn: 'Morgen',
    day: 'Tag',
    dusk: 'Abend',
    night: 'Nacht',
    bright: 'Hell',
    diffuse: 'Diffus/bewölkt',
    dark: 'Dunkel',
    unknown: 'Unbekannt',
  }
  return (
    <aside className="weather-assist" aria-labelledby="weather-title">
      <h2 id="weather-title">
        <button
          className="weather-toggle"
          type="button"
          aria-expanded={expanded}
          aria-controls="weather-content"
          onClick={() => setExpanded(value => !value)}
        >
          <Icon name="theme-light" />
          <span>
            Wetter am Angelort <small>optional · Tageszeit und Licht ergänzen</small>
          </span>
          <Icon name="chevron-down" size={18} />
        </button>
      </h2>
      <div id="weather-content" hidden={!expanded}>
        <p>Für jetzt: Tageszeit und Licht vorschlagen lassen. Deine Beobachtung vor Ort hat Vorrang.</p>
        <p className="weather-privacy">
          Erst beim Abruf werden dein Suchtext oder die auf zwei Nachkommastellen gerundeten Koordinaten an Open-Meteo
          gesendet. Der Standort wird nicht gespeichert.
        </p>
        <button type="button" className="secondary" disabled={busy} onClick={locate}>
          Meinen Standort verwenden
        </button>
        <form
          className="weather-search"
          onSubmit={event => {
            event.preventDefault()
            if (query.trim().length < 2 || busy) return
            void run(async signal => {
              const found = await searchPlaces(query, signal)
              if (!signal.aborted) {
                setPlaces(found)
                if (!found.length)
                  setMessage('Kein Ort gefunden. Versuche einen nahegelegenen Ort oder eine Postleitzahl.')
              }
            })
          }}
        >
          <label htmlFor="weather-place">Ort oder Postleitzahl am See</label>
          <div>
            <input
              id="weather-place"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="z. B. Potsdam"
              maxLength={100}
            />
            <button type="submit" className="secondary" disabled={busy || query.trim().length < 2}>
              Ort suchen
            </button>
          </div>
        </form>
        {places.length > 0 && (
          <ul className="weather-places">
            {places.map((place, index) => (
              <li key={index}>
                <button
                  type="button"
                  className="secondary"
                  disabled={busy}
                  onClick={() => void run(signal => weatherAt(place, signal))}
                >
                  {place.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {busy && (
          <div className="weather-loading">
            <p role="status">Wetterdaten werden geladen …</p>
            <button className="secondary" type="button" onClick={() => active.current?.abort('cancelled')}>
              Abruf abbrechen
            </button>
          </div>
        )}
        {error && <p role="alert">{error} Deine Angaben bleiben erhalten.</p>}
        {message && <p role="status">{message}</p>}
        {result && (
          <div className="weather-result">
            <strong>{result.place.name}</strong>
            <p>
              Wettermodell · Stand {new Date(result.weather.timestamp * 1000).toLocaleString('de-DE')} (deine
              Gerätezeit)
            </p>
            <p>
              {result.weather.temperature !== null && `Luft ${result.weather.temperature} °C · `}
              {result.weather.wind !== null && `Wind ${result.weather.wind} km/h · `}
              {result.weather.precipitation !== null && `Niederschlag ${result.weather.precipitation} mm`}
            </p>
            <p>
              Vorschlag: {labels[result.weather.timeOfDay]} · {labels[result.weather.light]}
            </p>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                if (Math.abs(Date.now() / 1000 - result.weather.timestamp) > 7200) {
                  setError('Die Wetterdaten sind inzwischen veraltet. Bitte neu abrufen.')
                  return
                }
                onApply(result.weather)
                setMessage(
                  'Wettervorschläge für offene Angaben übernommen. Bereits gewählte Werte bleiben erhalten. Du kannst jede Auswahl unten ändern.',
                )
              }}
            >
              Offene Angaben ergänzen
            </button>
          </div>
        )}
        <p className="weather-privacy">
          Wassertemperatur, Trübung und Fischaktivität bleiben eigene Angaben. Wetterdaten:{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </a>{' '}
          ·{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
            CC BY 4.0
          </a>
          . Ortssuche:{' '}
          <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">
            GeoNames
          </a>
          .
        </p>
      </div>
    </aside>
  )
}
