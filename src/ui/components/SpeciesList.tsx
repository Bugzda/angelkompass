import { Link } from 'react-router-dom'
import { fishLabel } from '../../domain/species/profiles'
import { Icon } from './Icon'

const species = [
  { id: 'perch', latin: 'Perca fluviatilis' },
  { id: 'pike', latin: 'Esox lucius' },
  { id: 'zander', latin: 'Sander lucioperca' },
] as const

/** Target fish as field-guide rows: engraving, common name and scientific name. */
export function SpeciesList({ label = 'Zielfische' }: { label?: string }) {
  return (
    <nav className="species-list" aria-label={label}>
      {species.map(item => (
        <Link viewTransition key={item.id} to={`/neu/${item.id}`} className="species-row">
          <img src={`${import.meta.env.BASE_URL}assets/terrain/${item.id}.webp`} alt="" />
          <span>
            <strong>{fishLabel[item.id]}</strong>
            <em lang="la">{item.latin}</em>
          </span>
          <Icon name="arrow-right" />
        </Link>
      ))}
    </nav>
  )
}
