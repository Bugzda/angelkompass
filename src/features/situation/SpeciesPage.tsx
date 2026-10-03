import { PlanProgress } from '../../ui/components/PlanProgress'
import { SpeciesList } from '../../ui/components/SpeciesList'

export function SpeciesPage() {
  return (
    <section className="page-shell species-page compact-species">
      <PlanProgress step={0} />
      <p className="eyebrow">Neuer Angelplan · See · vom Ufer</p>
      <h1>Welchen Räuber suchst du?</h1>
      <p className="lead">Wähle deinen Zielfisch.</p>
      <SpeciesList />
    </section>
  )
}
