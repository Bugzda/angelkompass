import { Link } from 'react-router-dom'
import { Icon } from '../../ui/components/Icon'
import { profileFor } from '../../domain/species/profiles'

const base=import.meta.env.BASE_URL
const perch=profileFor('perch')
const pike=profileFor('pike')

export function SpeciesPage(){return <section className="page-shell species-page"><p className="eyebrow">NEUE SEE-SESSION</p><h1>Welchen Räuber suchst du?</h1><p className="lead">Die Fischart bestimmt Regelwerk, Spots und Köderprofile. Zander wird als Nächstes ergänzt.</p><div className="species-grid">
  <Link className="species-card" to="/neu/perch"><div className="species-art"><img src={`${base}assets/terrain/perch.webp`} alt=""/></div><div><span className="overline">VERFÜGBAR</span><strong>Barsch</strong><span>{perch.spots.length} Spots · {perch.lures.length} Ködertypen</span></div><Icon name="arrow-right"/></Link>
  <Link className="species-card" to="/neu/pike"><div className="species-art"><img src={`${base}assets/terrain/pike.webp`} alt=""/></div><div><span className="overline">VERFÜGBAR</span><strong>Hecht</strong><span>{pike.spots.length} Spots · {pike.lures.length} Ködertypen</span></div><Icon name="arrow-right"/></Link>
  <article className="species-card disabled" aria-disabled="true"><div className="species-art"><img src={`${base}assets/terrain/zander.webp`} alt=""/></div><div><span className="coming-label">BALD VERFÜGBAR</span><strong>Zander</strong><span>Regelwerk in Vorbereitung</span></div></article>
</div></section>}
