import { Fragment, type CSSProperties } from 'react'
import { Icon } from '../../ui/components/Icon'
import { type ChoiceKey, choiceIcons, choices, labels } from './conditionOptions'

/** Single-choice field as an even segmented grid; "Unbekannt" is a regular, neutral option. */
export function ChoiceField({
  field,
  value,
  onSelect,
}: {
  field: ChoiceKey
  value: string
  onSelect: (value: string) => void
}) {
  const options = choices[field]
  const icons = choiceIcons[field]
  const style = { '--segments': options.length <= 4 ? options.length : 2 } as CSSProperties
  return (
    <fieldset id={`field-${field}`} tabIndex={-1}>
      <legend>{labels[field]}</legend>
      <div className={`chips segmented${icons ? ' with-icons' : ''}`} style={style}>
        {options.map(([option, label]) => {
          const selected = value === option
          const icon = icons?.[option]
          return (
            <button
              type="button"
              key={option}
              aria-pressed={selected}
              aria-label={label}
              className={`${selected ? 'selected' : ''}${option === 'unknown' ? ' unknown-option' : ''}`}
              onClick={() => onSelect(option)}
            >
              {icon ? <Icon name={icon} size={20} /> : selected && <Icon name="check" size={15} />}
              <span>{breakAfterSlash(label)}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Allows narrow segments to wrap after a slash instead of splitting a word. */
function breakAfterSlash(label: string) {
  const parts = label.split('/')
  return parts.map((part, index) => (
    <Fragment key={index}>
      {part}
      {index < parts.length - 1 && (
        <>
          /<wbr />
        </>
      )}
    </Fragment>
  ))
}
