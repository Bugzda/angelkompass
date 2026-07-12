import { Link } from 'react-router-dom'

export function HomePage() {
  return <section className="home">
    <div className="hero">
      <p className="eyebrow">BARSCH & HECHT · SEE · VOM UFER</p>
      <h1>Ein klarer Plan für deine ersten Würfe.</h1>
      <p>Wähle Barsch oder Hecht und beschreibe die Situation am See. Angelkompass erstellt einen festen, nachvollziehbaren Plan.</p>
      <Link className="primary big" to="/neu">Session starten <span>→</span></Link>
    </div>
    <article className="notice"><strong>Entscheidungshilfe, keine Fanggarantie.</strong><p>Beachte lokale Gewässerordnungen, Schonzeiten und sichere Uferbereiche.</p></article>
  </section>
}
