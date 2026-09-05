import { Link } from 'react-router-dom'
import { Icon } from '../../ui/components/Icon'
import { profileFor } from '../../domain/species/profiles'

const base=import.meta.env.BASE_URL
export function SpeciesPage(){return <section className="page-shell species-page"><p className="eyebrow">NEUE SEE-SESSION</p><h1>Welchen Räuber suchst du?</h1><p className="lead">Die Fischart bestimmt Regelwerk, Spots und Köderprofile.</p><div className="species-grid">
  {(['perch','pike','zander'] as const).map(fish=>{const profile=profileFor(fish);return <Link key={fish} className="species-card" to={`/neu/${fish}`}><div className="species-art"><img src={`${base}assets/terrain/${fish}.webp`} alt=""/></div><div><span className="overline">VERFÜGBAR</span><strong>{profile.label}</strong><span>{profile.spots.length} Spots · {profile.lures.length} Ködertypen</span></div><Icon name="arrow-right"/></Link>})}
</div></section>}
