import { Icon, type IconName } from '../../ui/components/Icon'
import { useWakeLock } from '../../ui/hooks/useWakeLock'
import { type WaterPreferences, useWaterPreferences, waterPreferences } from './waterPreferences'

const toggles: Array<{ key: keyof WaterPreferences; label: string; icon: IconName }> = [
  { key: 'keepAwake', label: 'Bildschirm an', icon: 'screen' },
  { key: 'vibration', label: 'Vibration', icon: 'vibrate' },
  { key: 'largeButtons', label: 'Große Tasten', icon: 'touch' },
]

/** Small on-water switches; the wake lock only runs while this card is open. */
export function WaterTools({ active }: { active: boolean }) {
  const preferences = useWaterPreferences()
  const wakeLock = useWakeLock(active && preferences.keepAwake)
  const vibrationSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator
  const hint =
    preferences.keepAwake && wakeLock === 'unsupported'
      ? 'Dieser Browser kann den Bildschirm nicht wach halten.'
      : preferences.keepAwake && wakeLock === 'blocked'
        ? 'Bildschirm wach halten ist gerade nicht möglich, z. B. im Stromsparmodus.'
        : preferences.vibration && !vibrationSupported
          ? 'Vibration wird von diesem Gerät nicht unterstützt.'
          : undefined
  return (
    <section className="water-tools" aria-label="Einstellungen am Wasser">
      <div className="water-tool-toggles" role="group" aria-label="Am-Wasser-Einstellungen">
        {toggles.map(toggle => (
          <button
            key={toggle.key}
            type="button"
            aria-pressed={preferences[toggle.key]}
            className={preferences[toggle.key] ? 'selected' : ''}
            onClick={() => waterPreferences.set({ [toggle.key]: !preferences[toggle.key] })}
          >
            <Icon name={toggle.icon} size={17} />
            <span>{toggle.label}</span>
          </button>
        ))}
      </div>
      {hint && <small className="water-tools-hint">{hint}</small>}
    </section>
  )
}
