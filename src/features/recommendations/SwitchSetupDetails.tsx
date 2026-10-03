import type { SwitchSetup } from '../../domain/models/types'

const sizeNames = { small: 'Klein', medium: 'Mittel', large: 'Groß' } as const

export function SwitchSetupDetails({ setup }: { setup: SwitchSetup }) {
  const { presentation, inventoryFit } = setup
  return (
    <div className="switch-setup">
      <strong className="switch-lure">{setup.lureLabel}</strong>
      <p className="switch-spot">
        {setup.spotLabel} · {presentation.profileLabel}
      </p>
      {inventoryFit && !inventoryFit.exact && (
        <p className="brief-compromise">
          <strong>Größenkompromiss:</strong> Deine vorhandene Größe {sizeNames[setup.size]}; bevorzugt wäre{' '}
          {sizeNames[inventoryFit.preferredSize]}.
        </p>
      )}
      <dl className="switch-specs">
        <div>
          <dt>Größe</dt>
          <dd>{presentation.sizeLabel}</dd>
        </div>
        <div>
          <dt>{presentation.weightKind === 'lure-total' ? 'Ködergewicht' : 'Beschwerung'}</dt>
          <dd>{presentation.weightLabel}</dd>
        </div>
      </dl>
      <h3>Montage</h3>
      <p>{presentation.mounting}</p>
      <h3>Führung</h3>
      <p>{presentation.guidance}</p>
      {setup.colorLabel && (
        <>
          <h3>Farbe</h3>
          <p>{setup.colorLabel}</p>
        </>
      )}
    </div>
  )
}
