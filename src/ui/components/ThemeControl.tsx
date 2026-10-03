import { type ThemePreference, useTheme } from '../hooks/useTheme'
import { Icon, type IconName } from './Icon'

const options: Array<{ value: ThemePreference; label: string; icon: IconName }> = [
  { value: 'system', label: 'System', icon: 'theme-system' },
  { value: 'light', label: 'Hell', icon: 'theme-light' },
  { value: 'dark', label: 'Dunkel', icon: 'theme-dark' },
]

/** Icon-sized trigger; the native select keeps keyboard and screen reader support. */
export function ThemeControl() {
  const { preference, setPreference } = useTheme()
  const current = options.find(option => option.value === preference) ?? options[0]
  return (
    <label className="theme-control" title={`Farbschema: ${current.label}`}>
      <Icon name={current.icon} size={20} />
      <select
        value={preference}
        onChange={event => setPreference(event.target.value as ThemePreference)}
        aria-label="Farbschema"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
