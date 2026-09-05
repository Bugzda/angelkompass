import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { isConditions } from '../../domain/models/validation'
import type { Conditions } from '../../domain/models/types'
import { Icon } from '../../ui/components/Icon'
import { analyzePhoto } from './photoClient'
import { applyPhotoReview, preparePhoto, regionInfo, type PhotoProgress, type PhotoResult, type PhotoReview, type RegionKind } from './photoAnalysis'
import './photo.css'
import { beginPhotoAttempt, clearPhotoAttempt, readPhotoAttempt } from './photoRecovery'

export function PhotoAnalysisPage() {
  const { fish } = useParams()
  const { state } = useLocation()
  const [interrupted] = useState(readPhotoAttempt)
  const conditions = isConditions(state) && state.targetFish === fish ? state : interrupted?.targetFish === fish ? interrupted : undefined
  if (!conditions) return <Navigate to={['perch','pike','zander'].includes(fish ?? '') ? `/neu/${fish}` : '/neu'} replace/>
  return <PhotoAnalysis conditions={conditions} interrupted={interrupted?.targetFish === fish}/>
}

function PhotoAnalysis({ conditions, interrupted }: { conditions: Conditions; interrupted: boolean }) {
  const navigate = useNavigate()
  const [photo, setPhoto] = useState<Awaited<ReturnType<typeof preparePhoto>>>()
  const [preparing, setPreparing] = useState(false)
  const [progress, setProgress] = useState<PhotoProgress>()
  const [result, setResult] = useState<PhotoResult>()
  const [error, setError] = useState('')
  const [review, setReview] = useState<PhotoReview>({ vegetation:'keep', hardCover:false })
  const [visible, setVisible] = useState<RegionKind[]>([])
  const [opacity, setOpacity] = useState(45)
  const generation = useRef(0)
  const operation = useRef<ReturnType<typeof analyzePhoto> | undefined>(undefined)
  const overlay = useRef<HTMLCanvasElement>(null)
  const picker = useRef<HTMLInputElement>(null)
  const camera = useRef<HTMLInputElement>(null)
  const back = `/neu/${conditions.targetFish}`
  const busy = preparing || !!progress

  useEffect(() => () => { generation.current++; operation.current?.cancel(); clearPhotoAttempt() }, [])
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.url) }, [photo])
  useEffect(() => {
    const canvas = overlay.current
    if (!canvas || !result || !result.width || !result.height) return
    canvas.width = result.width
    canvas.height = result.height
    const context = canvas.getContext('2d')
    if (!context) return
    const pixels = context.createImageData(result.width, result.height)
    for (const region of result.regions) {
      if (!visible.includes(region.kind)) continue
      const hex = regionInfo[region.kind].color.slice(1)
      const rgb = [0,2,4].map(offset => parseInt(hex.slice(offset,offset+2),16))
      for (let i=0; i<region.pixels.length; i++) if (region.pixels[i]) {
        pixels.data[i*4] = rgb[0]
        pixels.data[i*4+1] = rgb[1]
        pixels.data[i*4+2] = rgb[2]
        pixels.data[i*4+3] = 255
      }
    }
    context.putImageData(pixels, 0, 0)
  }, [result, visible])

  async function choose(file?: File) {
    if (!file) return
    const id = ++generation.current
    operation.current?.cancel()
    clearPhotoAttempt()
    setPhoto(undefined); setResult(undefined); setProgress(undefined); setError(''); setPreparing(true)
    setReview({ vegetation:'keep', hardCover:false })
    try {
      const prepared = await preparePhoto(file)
      if (id !== generation.current) { URL.revokeObjectURL(prepared.url); return }
      setPhoto(prepared)
    } catch (cause) {
      if (id === generation.current) setError(cause instanceof Error ? cause.message : 'Das Foto konnte nicht geöffnet werden.')
    } finally { if (id === generation.current) setPreparing(false) }
  }

  async function start() {
    if (!photo || busy) return
    const id = ++generation.current
    setError(''); setResult(undefined); setProgress({ phase:'loading' })
    setReview({ vegetation:'keep', hardCover:false })
    try {
      beginPhotoAttempt(conditions)
      operation.current = analyzePhoto(photo.data, update => { if (id === generation.current) setProgress(update) })
      const output = await operation.current.result
      if (id !== generation.current) return
      setResult(output); setVisible(output.regions.map(region => region.kind))
    } catch (cause) {
      if (id === generation.current && !(cause instanceof DOMException && cause.name === 'AbortError')) {
        setError(cause instanceof Error ? cause.message : 'Die lokale Analyse ist auf diesem Gerät nicht verfügbar.')
      }
    } finally { if (id === generation.current) { clearPhotoAttempt(); setProgress(undefined); operation.current = undefined } }
  }

  function cancel() {
    generation.current++; operation.current?.cancel(); operation.current = undefined
    clearPhotoAttempt()
    setProgress(undefined); setPreparing(false)
  }
  const kinds = result?.regions.map(region => region.kind) ?? []
  const canTransfer = review.vegetation !== 'keep' || review.hardCover
  const canReview = kinds.includes('plants') || (conditions.targetFish !== 'perch' && kinds.some(kind => ['rocks','wood','structure'].includes(kind)))

  return <section className="page-shell photo-page">
    <Link to={back} state={conditions} className="photo-back"><Icon name="arrow-left" size={18}/> Zurück zu deinen Angaben</Link>
    <p className="eyebrow">UFER-SCANNER · LOKALE KI · BETA</p>
    <h1>Dein Foto. Ein neuer Blick aufs Wasser.</h1>
    <p className="lead">Lass sichtbare Bereiche markieren und prüfe, was davon für deinen Angelplatz zählt.</p>
    {interrupted && <aside className="notice" role="status"><strong>Die letzte Fotoanalyse wurde unterbrochen.</strong><p>Deine Angaben sind wieder da. Der Browser wurde möglicherweise wegen hohen Speicherbedarfs neu geladen. Wähle dein Foto erneut; es wurde nicht gespeichert. Die Analyse startet erst auf deinen Klick.</p><Link className="photo-back" to={back} state={conditions} onClick={clearPhotoAttempt}>Mit meinen Angaben ohne Fotoanalyse weiter</Link></aside>}
    <div className="photo-privacy"><Icon name="check" size={19}/><span>Dein Foto bleibt auf deinem Gerät. Kein Konto. Keine API-Gebühren.</span></div>
    <div className="photo-workspace">
      <div>
        <div className={`photo-stage ${photo ? 'has-photo' : ''}`} aria-busy={busy}>
          {photo ? <><img src={photo.url} alt="Dein ausgewähltes Uferfoto"/>{result && <canvas ref={overlay} style={{ opacity:opacity/100 }} aria-label="Farbige Modellvorschläge; Erläuterungen stehen unter dem Foto" role="img"/>}</> : <div className="photo-empty"><Icon name="camera" size={48}/><h2>Was liegt vor dir?</h2><p>Fotografiere das Ufer mit Wasser und angrenzenden Strukturen. Eine gute Übersicht hilft mehr als digitaler Zoom.</p></div>}
        </div>
        <input ref={picker} className="photo-file" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Uferfoto auswählen" onChange={event => { void choose(event.target.files?.[0]); event.target.value = '' }}/>
        <input ref={camera} className="photo-file" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" aria-label="Uferfoto aufnehmen" onChange={event => { void choose(event.target.files?.[0]); event.target.value = '' }}/>
        <div className="photo-buttons"><button type="button" className="secondary" onClick={() => picker.current?.click()}><Icon name="plus" size={18}/>{photo ? 'Anderes Foto wählen' : 'Foto auswählen'}</button><button type="button" className="secondary" onClick={() => camera.current?.click()}><Icon name="camera" size={18}/>Kamera öffnen</button></div>
        <p className="photo-small">JPEG, PNG oder WebP · bis 20 MB. Das Foto wird nur für diese Ansicht gehalten und beim Verlassen verworfen.</p>
        {result && result.regions.length > 0 && <div className="photo-legend">
          <label className="photo-opacity">Markierungen <input type="range" min="0" max="75" value={opacity} aria-label="Stärke der Markierungen" onChange={event => setOpacity(Number(event.target.value))}/></label>
          <p className="photo-small">Tippe auf einen Bereich, um seine Markierung ein- oder auszublenden. Prozentwerte zeigen den Bildanteil, nicht die Sicherheit der Erkennung.</p>
          {result.regions.map(region => <button key={region.kind} type="button" aria-pressed={visible.includes(region.kind)} onClick={() => setVisible(current => current.includes(region.kind) ? current.filter(kind => kind !== region.kind) : [...current, region.kind])}><span className="photo-dot" style={{ background:regionInfo[region.kind].color }}/><span>{regionInfo[region.kind].label}</span><small>{Math.max(1,Math.round(region.coverage*100))} %</small>{visible.includes(region.kind) && <Icon name="check" size={16}/>}</button>)}
        </div>}
      </div>
      <div className="photo-panel">
        {!result && <><p className="eyebrow">01 · FOTO ANALYSIEREN</p><h2>Einmal laden. Lokal erkennen.</h2><p>Beim ersten Analysieren werden Modell und Rechenmodul heruntergeladen. Plane ungefähr 200 MB ein, am besten im WLAN. Dabei wird dein Foto nicht übertragen.</p><p>Danach kann die Analyse auch offline laufen, solange dein Browser die benötigten Dateien im Cache behält. Auf älteren Handys kann sie länger dauern.</p>
          {busy ? <div className="photo-progress" role="status" aria-live="polite"><strong>{preparing ? 'Foto wird vorbereitet …' : progress?.phase === 'analyzing' ? 'Sichtbare Bereiche werden auf deinem Gerät erkannt …' : 'Erkennungsmodell wird geladen …'}</strong><progress aria-label="Fortschritt der Fotoanalyse" max="100" value={progress?.phase === 'loading' ? progress.percent : undefined}/>{progress?.percent !== undefined && progress.phase === 'loading' && <span>Modelldatei: {progress.percent} %</span>}<button type="button" className="secondary" onClick={cancel}>Abbrechen</button></div> : <button type="button" className="primary" disabled={!photo} onClick={() => void start()}><Icon name="search" size={19}/>{error && photo ? 'Erneut lokal analysieren' : 'Lokal analysieren'}</button>}
        </>}
        {error && <p role="alert" className="storage-error">{error}</p>}
        {result && <div aria-live="polite"><p className="eyebrow">02 · SELBST PRÜFEN</p><h2>{result.regions.length ? 'Was trifft vor Ort zu?' : 'Keine passenden Bereiche erkannt.'}</h2>
          {!result.regions.length ? <p>Das Modell hat keine verwertbaren Wasser- oder Uferbereiche gefunden. Probiere ein helleres Übersichtsbild oder trage deine Beobachtungen selbst ein.</p> : <>
            {!kinds.includes('water') && <p className="photo-notice">Keine Wasserfläche zuverlässig markiert. Prüfe besonders genau, ob dieses Bild deine Angelzone zeigt.</p>}
            <ul className="photo-hints">{result.regions.map(region => <li key={region.kind}><strong>{regionInfo[region.kind].label}</strong><p>{regionInfo[region.kind].hint}</p></li>)}</ul>
            {kinds.includes('plants') && <fieldset className="photo-review"><legend>Kraut in deiner Angelzone</legend><p>Nur ändern, wenn du die Wasserpflanzen selbst erkennst.</p>{([['keep','Bisherige Angabe behalten'],['edgeOrGaps','Ich sehe eine Krautkante oder Lücken im Wasser'],['dense','Ich sehe sehr dichtes Kraut im Wasser']] as const).map(([value,label]) => <label key={value}><input type="radio" name="photo-vegetation" checked={review.vegetation === value} onChange={() => setReview(current => ({ ...current, vegetation:value }))}/><span>{label}</span></label>)}</fieldset>}
            {conditions.targetFish !== 'perch' && kinds.some(kind => ['rocks','wood','structure'].includes(kind)) && <fieldset className="photo-review"><legend>Harte Struktur in deiner Angelzone</legend><label><input type="checkbox" checked={review.hardCover} onChange={event => setReview(current => ({ ...current, hardCover:event.target.checked }))}/><span>{conditions.targetFish === 'zander' ? 'Ich bestätige Steine oder harten Grund im Wasser' : 'Ich bestätige Holz, einen Steg oder harte Deckung im Wasser'}</span></label></fieldset>}
            {canReview ? <><button type="button" className="primary" disabled={!canTransfer} onClick={() => navigate(back, { state:applyPhotoReview(conditions,review), replace:true })}>Geprüfte Beobachtungen übernehmen <Icon name="arrow-right" size={18}/></button>
            {!canTransfer && <p className="photo-small">Erst eine Beobachtung bestätigen. Deine bisherigen Angaben bleiben bis dahin erhalten.</p>}</> : <p>Diese Markierungen ergänzen keine Bedingungen für deinen Zielfisch. Weitere Beobachtungen kannst du selbst in deinen Angaben eintragen.</p>}
          </>}
          <Link className="photo-back" to={back} state={conditions}>Ohne Änderungen zurück</Link>
        </div>}
        <aside className="photo-limits"><strong>Sichtbares erkennen, Unbekanntes offenlassen.</strong><p>Die KI kann sich irren. Sie bestimmt keine Fischbestände, Wassertiefe, Unterwasser-Tiefenkanten, Temperatur oder Fangchancen. Kleine und verdeckte Strukturen können fehlen.</p></aside>
        <details className="photo-about"><summary>Wie funktioniert das?</summary><p>DETR erkennt allgemeine Bildbereiche. Die Berechnung läuft mit Transformers.js und WebAssembly auf deinem Gerät. Das ist noch kein speziell trainiertes Angelmodell.</p><p>Der erste Download kommt von Hugging Face; dorthin gehen übliche Verbindungsdaten, aber keine Fotos. Es werden keine Bild- oder Standortdaten gespeichert.</p><a href="https://huggingface.co/facebook/detr-resnet-50-panoptic" target="_blank" rel="noreferrer">Modell & Lizenz (Apache 2.0)</a><p><a href={`${import.meta.env.BASE_URL}licenses/photo-analysis.txt`} target="_blank" rel="noreferrer">Software- und Lizenzhinweise</a></p></details>
      </div>
    </div>
  </section>
}
