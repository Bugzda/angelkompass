import { PlanProgress } from '../../ui/components/PlanProgress'
import { Link } from 'react-router-dom'
import { Icon } from '../../ui/components/Icon'
import { fishLabel } from '../../domain/species/profiles'

export function SpeciesPage() {
  return <section className="page-shell species-page compact-species">
    <PlanProgress step={0}/><p className="eyebrow">NEUER ANGELPLAN · SEE · VOM UFER</p><h1>Welchen Räuber suchst du?</h1><p className="lead">Wähle deinen Zielfisch.</p>
    <div className="species-grid">{(['perch', 'pike', 'zander'] as const).map(fish => <Link key={fish} className="species-card" to={`/neu/${fish}`}>
      <div className="species-art"><img src={`${import.meta.env.BASE_URL}assets/terrain/${fish}.webp`} alt=""/></div><strong>{fishLabel[fish]}</strong><Icon name="arrow-right"/>
    </Link>)}</div>
  </section>
}
