import type { Conditions } from '../../domain/models/types'

export const PHOTO_MODEL = 'Xenova/detr-resnet-50-panoptic'
export const PHOTO_REVISION = 'ea24b2d4e0bfae31f0a1299ba3fb892a2df064de'
export type RegionKind = 'water' | 'plants' | 'rocks' | 'wood' | 'structure'
export const regionInfo: Record<RegionKind, { label: string; color: string; hint: string }> = {
  water: { label: 'Wasserfläche', color: '#36b8ed', hint: 'Prüfe die Übergänge zum Ufer. Spiegelungen können die Erkennung täuschen.' },
  plants: { label: 'Pflanzen & Bäume', color: '#b4df54', hint: 'Ufergrün ist noch kein Wasser-Kraut. Prüfe, ob Pflanzen tatsächlich in deiner Angelzone stehen.' },
  rocks: { label: 'Steine & Felsen', color: '#f6b35c', hint: 'Prüfe, ob die markierten Steine bis in die Angelzone reichen.' },
  wood: { label: 'Holz & Äste', color: '#dc96ec', hint: 'Prüfe, ob das Holz im Wasser liegt. Äste an Land zählen nicht als Deckung.' },
  structure: { label: 'Bauwerke', color: '#ff8297', hint: 'Prüfe die Lage am Wasser. Ein Bauwerk im Hintergrund sagt nichts über deinen Platz aus.' },
}
const labels: Record<string, RegionKind> = {
  river:'water', sea:'water', 'water-other':'water',
  tree:'plants', bush:'plants', grass:'plants', leaves:'plants', 'plant-other':'plants', moss:'plants',
  rock:'rocks', stone:'rocks', gravel:'rocks',
  wood:'wood', branch:'wood',
  bridge:'structure', platform:'structure', 'wall-stone':'structure', 'wall-concrete':'structure',
  // This model's config leaves COCO Panoptic merged-category IDs unnamed.
  // Source: cocodataset/panopticapi, panoptic_coco_categories.json.
  LABEL_184:'plants', LABEL_193:'plants', LABEL_198:'rocks',
}
export type Segment = { label: string | null; mask: { data: Uint8Array | Uint8ClampedArray; width: number; height: number } }
export type PhotoRegion = { kind: RegionKind; pixels: Uint8ClampedArray; coverage: number }
export type PhotoResult = { width: number; height: number; regions: PhotoRegion[] }
export type PhotoProgress = { phase: 'loading' | 'analyzing'; percent?: number }
export type WorkerReply = { type: 'progress'; progress: PhotoProgress } | { type: 'result'; result: PhotoResult } | { type: 'error' }

// Group only explicit model classes. Pixel coverage is not a confidence score.
export function collectRegions(segments: Segment[]): PhotoResult {
  const width = segments[0]?.mask.width ?? 0
  const height = segments[0]?.mask.height ?? 0
  const groups = new Map<RegionKind, Uint8ClampedArray>()
  for (const segment of segments) {
    const kind = segment.label ? labels[segment.label] : undefined
    if (!kind || segment.mask.width !== width || segment.mask.height !== height) continue
    const pixels = groups.get(kind) ?? new Uint8ClampedArray(width * height)
    for (let i = 0; i < pixels.length; i++) if (segment.mask.data[i] > 127) pixels[i] = 255
    groups.set(kind, pixels)
  }
  const regions = [...groups].map(([kind, pixels]) => ({ kind, pixels, coverage: pixels.reduce((sum, pixel) => sum + (pixel ? 1 : 0), 0) / pixels.length }))
    .filter(region => region.coverage >= 0.005).sort((a,b) => b.coverage - a.coverage)
  return { width, height, regions }
}

export type PhotoReview = { vegetation: Conditions['vegetation'] | 'keep'; hardCover: boolean }
export function applyPhotoReview(conditions: Conditions, review: PhotoReview): Conditions {
  const hardCover = review.hardCover && conditions.targetFish !== 'perch'
  return {
    ...conditions,
    vegetation: review.vegetation === 'keep' ? conditions.vegetation : review.vegetation,
    observedStructure: hardCover ? [...new Set([...conditions.observedStructure, 'hardCover' as const])] : [...conditions.observedStructure],
    structureStatus: hardCover ? 'observed' : conditions.structureStatus,
  }
}

export function validatePhoto(file: File): void {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Bitte ein JPEG-, PNG- oder WebP-Foto wählen. HEIC bitte vorher als JPEG exportieren.')
  if (!file.size || file.size > 20 * 1024 * 1024) throw new Error('Das Foto muss zwischen 1 Byte und 20 MB groß sein.')
}

export async function preparePhoto(file: File): Promise<{ url: string; data: ImageData }> {
  validatePhoto(file)
  let bitmap: ImageBitmap
  try { bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }) }
  catch { throw new Error('Dieses Foto konnte nicht geöffnet werden. Bitte ein anderes JPEG-, PNG- oder WebP-Foto wählen.') }
  try {
    if (bitmap.width * bitmap.height > 50_000_000) throw new Error('Bitte das Foto auf höchstens 50 Megapixel verkleinern.')
    const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Dein Browser unterstützt die Bildvorbereitung nicht.')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const data = context.getImageData(0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Das Foto konnte nicht vorbereitet werden.')), 'image/jpeg', 0.9))
    return { url: URL.createObjectURL(blob), data }
  } finally { bitmap.close() }
}
