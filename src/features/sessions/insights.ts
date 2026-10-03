import type { FishingSession, SessionFeedback } from '../../domain/models/types'
import { choiceLabel } from '../situation/conditionOptions'

export interface InsightRow {
  label: string
  sessions: number
  bites: number
  catches: number
}
export interface InsightGroup {
  id: 'lure' | 'spot' | 'turbidity' | 'timeOfDay'
  title: string
  rows: InsightRow[]
}
export interface LogbookInsightData {
  groups: InsightGroup[]
  longestCatch?: { lengthCm: number; lure: string; date: string }
  contacts: number
}

/** The lure actually in use when the feedback was given (switch steps may change the lure). */
export function lureForFeedback(session: FishingSession, feedback: SessionFeedback) {
  const step = session.recommendation.switchPlan.find(item => item.phase === feedback.phase)
  return step?.setup?.lureLabel ?? session.recommendation.setup.lure.label
}

function group(
  id: InsightGroup['id'],
  title: string,
  sessions: readonly FishingSession[],
  keysFor: (session: FishingSession) => string[],
  keyForFeedback: (session: FishingSession, feedback: SessionFeedback) => string | undefined,
): InsightGroup {
  const rows = new Map<string, InsightRow>()
  const row = (label: string) =>
    rows.get(label) ?? rows.set(label, { label, sessions: 0, bites: 0, catches: 0 }).get(label)!
  for (const session of sessions) {
    for (const key of new Set(keysFor(session))) row(key).sessions++
    for (const feedback of session.feedback) {
      if (feedback.outcome === 'no_success') continue
      const key = keyForFeedback(session, feedback)
      if (!key) continue
      if (feedback.outcome === 'bite') row(key).bites++
      else row(key).catches++
    }
  }
  return {
    id,
    title,
    rows: [...rows.values()].sort(
      (a, b) =>
        b.catches - a.catches || b.bites - a.bites || b.sessions - a.sessions || a.label.localeCompare(b.label, 'de'),
    ),
  }
}

/**
 * Personal look-back over the logbook. Descriptive only: it never feeds back into rule weights or rankings.
 */
export function logbookInsights(sessions: readonly FishingSession[]): LogbookInsightData {
  const lureKeys = (session: FishingSession) => [
    session.recommendation.setup.lure.label,
    ...session.feedback.filter(item => item.outcome !== 'no_success').map(item => lureForFeedback(session, item)),
  ]
  const groups: InsightGroup[] = [
    group('lure', 'Köder', sessions, lureKeys, lureForFeedback),
    group(
      'spot',
      'Angelstelle',
      sessions.filter(session => session.spot),
      session => [session.spot!.name],
      session => session.spot?.name,
    ),
    group(
      'turbidity',
      'Wassertrübung',
      sessions,
      session => [choiceLabel('turbidity', session.conditions.turbidity)],
      session => choiceLabel('turbidity', session.conditions.turbidity),
    ),
    group(
      'timeOfDay',
      'Tageszeit',
      sessions,
      session => [choiceLabel('timeOfDay', session.conditions.timeOfDay)],
      session => choiceLabel('timeOfDay', session.conditions.timeOfDay),
    ),
  ].filter(item => item.rows.length > 0)
  let longestCatch: LogbookInsightData['longestCatch']
  let contacts = 0
  for (const session of sessions)
    for (const feedback of session.feedback) {
      if (feedback.outcome !== 'no_success') contacts++
      if (feedback.lengthCm !== undefined && (!longestCatch || feedback.lengthCm > longestCatch.lengthCm))
        longestCatch = {
          lengthCm: feedback.lengthCm,
          lure: lureForFeedback(session, feedback),
          date: feedback.createdAt,
        }
    }
  return { groups, longestCatch, contacts }
}
