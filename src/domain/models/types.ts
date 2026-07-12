export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night' | 'unknown'
export type Turbidity = 'clear' | 'slightly_turbid' | 'turbid' | 'unknown'
export type Depth = 'shallow' | 'medium' | 'deep' | 'unknown'
export type WaterTemperature = 'cold' | 'cool' | 'mild' | 'warm' | 'hot' | 'unknown'
export type Light = 'bright' | 'diffuse' | 'dark' | 'unknown'
export type TargetFish = 'perch' | 'pike'
export type ActivitySign = 'baitfish' | 'huntingPerch' | 'surfaceActivity' | 'pikeContact'
export type ActivityObservation = { status: 'unknown' | 'none' | 'observed'; signs: ActivitySign[] }
export type Vegetation = 'none' | 'edgeOrGaps' | 'dense' | 'unknown'
export type SpotFeature = 'vegetation' | 'shallow' | 'dropoff' | 'hardCover' | 'openWater'
export type ObservableStructure = Exclude<SpotFeature, 'vegetation' | 'openWater'>
export type SizeClass = 'small' | 'medium' | 'large'
export type ColorFamily = 'natural' | 'contrast' | 'transparent'
export type WeightClass = 'ultralight' | 'light' | 'medium' | 'heavy'
export type WeightKind = 'terminal' | 'lure-total' | 'none'
export type GuidanceMode = 'slow' | 'controlled' | 'active'
export type LureMaterial = 'soft' | 'hard' | 'metal' | 'hybrid'
export type ConfidenceLevel = 'low' | 'medium' | 'high'
export type EvidenceClass = 'science' | 'experience' | 'weak' | 'observation'
export type RuleGroup = 'thermalPhase' | 'visibility' | 'habitatObservation' | 'activityObservation' | 'presentation' | 'control'

export interface Conditions {
  targetFish: TargetFish
  waterType: 'lake'
  season: Season
  timeOfDay: TimeOfDay
  turbidity: Turbidity
  depth: Depth
  waterTemperature: WaterTemperature
  light: Light
  activity: ActivityObservation
  vegetation: Vegetation
  observedStructure: ObservableStructure[]
  structureStatus?: 'unknown' | 'none' | 'observed'
  pikeSafetyConfirmed?: boolean
}

export interface SpotType { id: SpotFeature; label: string; description: string; seasonalAffinity: Season[]; depthAffinity: Array<Exclude<Depth, 'unknown'>>; priority: number }
export type LureId = 'jig' | 'ned' | 'twitchbait' | 'spinner' | 'crankbait' | 'chatterbait' | 'blade-bait' | 'spinnerbait' | 'popper' | 'tail-spinner' | 'jerkbait' | 'spoon' | 'swimbait' | 'tailbait'
export interface NumericRange { min: number; max?: number; openEnded?: boolean }
export interface GuidanceSet { slow: string; controlled: string; active: string }
export interface PresentationProfile {
  id: string
  label: string
  mounting: string
  depths: Array<Exclude<Depth, 'unknown'>>
  vegetation: Vegetation[]
  style: 'finesse' | 'bottom' | 'search'
  weightKind: WeightKind
  terminalWeightByDepth?: Partial<Record<Exclude<Depth, 'unknown'>, NumericRange>>
  lureWeightBySize?: Partial<Record<SizeClass, NumericRange>>
  guidance: GuidanceSet
}
export interface LureType {
  id: LureId
  label: string
  mounting: string
  guidance: string
  sizes: SizeClass[]
  depths: Array<Exclude<Depth, 'unknown'>>
  style: 'finesse' | 'bottom' | 'search'
  priority: number
  material?: LureMaterial
  sizeRangesCm?: Partial<Record<SizeClass, NumericRange>>
  presentations?: PresentationProfile[]
}

export interface ReasonContribution {
  ruleId: string
  reasonCode: string
  group: RuleGroup
  evidenceClass: EvidenceClass
  evidenceConfidence: number
  rawDelta: number
  appliedDelta: number
}

export interface RankedSpot { spot: SpotType; score: number; reasons: ReasonContribution[] }
export interface ResolvedPresentation { profileId: string; profileLabel: string; mounting: string; sizeLabel: string; weightLabel: string; weightKind: WeightKind; guidance: string; mode: GuidanceMode }
export interface RankedSetup { lure: LureType; score: number; size: SizeClass; color: ColorFamily; weight: WeightClass; resolvedPresentation?: ResolvedPresentation; reasons: ReasonContribution[] }
export interface ConfidenceMetric { value: number; level: ConfidenceLevel; explanation: string; missingFields?: string[]; contributingRules?: number }
export interface SwitchStep { phase: 'initial' | 'refine' | 'move'; title: string; change: string; limit: string; reason: string }
export interface ColorGuidance { family: ColorFamily; familyLabel: string; baseLabel?: string; finishLabel?: string; accentLabel?: string; alternative?: string; examples: string[]; reason: string }

export interface Recommendation {
  rank: number
  spot: RankedSpot
  setup: RankedSetup
  inputCoverage: ConfidenceMetric
  evidenceQuality: ConfidenceMetric
  colorGuidance: ColorGuidance
  reasons: string[]
  switchPlan: SwitchStep[]
  inventoryFit?: { preferredSize: SizeClass; selectedSize: SizeClass; exact: boolean }
}

export interface InventoryItem { targetFish: TargetFish; lureTypeId: LureType['id']; sizes: SizeClass[]; migratedNeedsReview?: boolean }
export interface RecommendationDecision {
  expertRanking: Recommendation[]
  practicalRanking: Recommendation[]
  practicalPrimary?: Recommendation
  practicalAlternatives: Recommendation[]
  optionalSpotTip?: Recommendation
  optionalLureTip?: Recommendation
  optionalLureAdvantage?: number
  hotWaterWarning?: string
}

export type SessionStatus = 'active' | 'completed'
export type SessionProgress = SwitchStep['phase'] | 'exhausted'
export type FeedbackOutcome = 'bite' | 'catch' | 'no_success'

export interface SessionFeedback {
  id: string
  outcome: FeedbackOutcome
  phase: Exclude<SessionProgress, 'exhausted'>
  createdAt: string
}

export interface FishingSession {
  id: string
  schemaVersion: 1
  rulesetVersion: string
  conditions: Conditions
  recommendation: Recommendation
  progress: SessionProgress
  feedback: SessionFeedback[]
  status: SessionStatus
  createdAt: string
  updatedAt: string
  completedAt?: string
}
