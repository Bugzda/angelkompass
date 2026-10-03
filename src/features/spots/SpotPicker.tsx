import { useState } from 'react'
import type { Conditions } from '../../domain/models/types'
import { Icon } from '../../ui/components/Icon'
import { showToast } from '../../ui/components/Toast'
import type { SpotRef } from './planningState'
import { MAX_SPOT_NAME, applySpotDefaults, sameSpotDefaults, spotDefaultsFrom, spotStore, useSpots } from './spotStore'

/** Saved spots prefill stable water features; today's observations stay a fresh choice. */
export function SpotPicker({
  conditions,
  spot,
  onChange,
}: {
  conditions: Conditions
  spot: SpotRef | undefined
  onChange: (conditions: Conditions, spot: SpotRef | undefined) => void
}) {
  const { spots, error } = useSpots()
  const [naming, setNaming] = useState(false)
  const [name, setName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string>()
  const selected = spots.find(item => item.id === spot?.id)
  const changed = selected ? !sameSpotDefaults(conditions, selected.defaults) : false
  const save = () => {
    const created = spotStore.create(name, spotDefaultsFrom(conditions))
    if (!created) return
    onChange(conditions, { id: created.id, name: created.name })
    setNaming(false)
    setName('')
    showToast(`Angelstelle „${created.name}“ gespeichert.`)
  }
  return (
    <section className="spot-picker" aria-labelledby="spot-picker-title">
      <header>
        <Icon name="pin" size={20} />
        <h2 id="spot-picker-title">Angelstelle</h2>
        <small>optional</small>
      </header>
      {spots.length > 0 && (
        <div className="chips" role="group" aria-label="Gespeicherte Angelstelle wählen">
          <button
            type="button"
            aria-pressed={!selected}
            className={!selected ? 'selected' : ''}
            onClick={() => onChange(conditions, undefined)}
          >
            Keine feste Stelle
          </button>
          {spots.map(item => (
            <button
              type="button"
              key={item.id}
              aria-pressed={selected?.id === item.id}
              className={selected?.id === item.id ? 'selected' : ''}
              onClick={() => onChange(applySpotDefaults(conditions, item.defaults), { id: item.id, name: item.name })}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
      {selected && changed && (
        <button
          type="button"
          className="secondary spot-update"
          onClick={() => {
            if (spotStore.update(selected.id, { defaults: spotDefaultsFrom(conditions) }))
              showToast(`„${selected.name}“ aktualisiert.`)
          }}
        >
          „{selected.name}“ mit diesen Angaben aktualisieren
        </button>
      )}
      {!selected &&
        (naming ? (
          <form
            className="spot-name-form"
            onSubmit={event => {
              event.preventDefault()
              save()
            }}
          >
            <label htmlFor="spot-name">Name der Angelstelle</label>
            <div>
              <input
                id="spot-name"
                value={name}
                maxLength={MAX_SPOT_NAME}
                placeholder="z. B. Schilfbucht Nordufer"
                onChange={event => setName(event.target.value)}
                autoFocus
              />
              <button type="submit" className="primary" disabled={!name.trim()}>
                Speichern
              </button>
            </div>
            <button type="button" className="text-button" onClick={() => setNaming(false)}>
              Abbrechen
            </button>
          </form>
        ) : (
          <button type="button" className="secondary spot-save" onClick={() => setNaming(true)}>
            <Icon name="plus" size={18} />
            Angaben als Angelstelle merken
          </button>
        ))}
      <p className="form-hint">
        Gemerkt werden Trübung, Tiefe, Kraut und Struktur. Zeit, Licht, Temperatur und Aktivität erfasst du jedes Mal
        neu.
      </p>
      {error && (
        <p className="storage-error" role="alert">
          {error}
        </p>
      )}
      {spots.length > 0 && (
        <details className="spot-manage">
          <summary>Angelstellen verwalten</summary>
          <ul>
            {spots.map(item => (
              <li key={item.id}>
                <span>{item.name}</span>
                {confirmDelete === item.id ? (
                  <span className="spot-delete-confirm">
                    <button type="button" className="text-button" onClick={() => setConfirmDelete(undefined)}>
                      Behalten
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => {
                        if (spotStore.delete(item.id)) {
                          if (spot?.id === item.id) onChange(conditions, undefined)
                          setConfirmDelete(undefined)
                        }
                      }}
                    >
                      Löschen
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Angelstelle ${item.name} löschen`}
                    onClick={() => setConfirmDelete(item.id)}
                  >
                    <Icon name="trash" size={18} />
                  </button>
                )}
              </li>
            ))}
          </ul>
          <small>Bereits gespeicherte Sessions behalten den Namen der Stelle.</small>
        </details>
      )}
    </section>
  )
}
