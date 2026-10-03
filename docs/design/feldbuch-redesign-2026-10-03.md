# Feldbuch-Redesign

Stand: 3. Oktober 2026 · Branch `design/feldbuch`

## Anlass

Die Oberfläche wirkte generisch („AI-Look“): Neon-Lime-Pillenknöpfe mit Pfeil, Versalien-Kicker über jeder Überschrift, große Condensed-Headlines mit Schlusspunkt, weich verschattete Rundkarten (oft verschachtelt), schwebende Pillen-Navigation, Dashboard-Zahlen „01 / 00 / 00“ und Werbe-Dreiklänge. Ziel war eine eigenständige Gestaltung, die zum Thema passt.

## Gestaltungsprinzip

Angelkompass sieht aus wie ein gut gemachtes Angel-Feldbuch: Papier, Tinte, Schilfgrün und genau ein Akzent in Posen-Orange. Die monochromen Fischstiche sind das zentrale Bildelement und stehen ohne Rahmen auf dem Papier, ergänzt um den wissenschaftlichen Namen.

- **Flächen:** flach, 1-px-Linien statt Schatten, Radien 4–8 px. Abschnitte werden durch Linien getrennt, nicht durch verschachtelte Karten.
- **Akzent:** Orange nur für die eine Hauptaktion einer Ansicht sowie für schmale Markierungen (aktiver Reiter, aktive Session, aktueller Schritt). Auswahlzustände sind schilfgrün gefüllt.
- **Typografie:** Überschriften in Source Serif 4 (normal gesetzt, ohne Schlusspunkt), Oberfläche in IBM Plex Sans, Zahlen und Uhrzeiten in IBM Plex Mono. Kicker über Überschriften sind kursive Serifenzeilen in normaler Schreibweise.
- **Am-Wasser-Karte:** bleibt als dunkle Fokusfläche (`--green-deep`) mit eigenen Tokens für Text und Linien; die Schrittuhr liegt jetzt lesbar auf der dunklen Karte.
- **Navigation:** mobil eine feste Reiterleiste am unteren Rand mit orangem Strich über dem aktiven Reiter; ab 1100 px Textreiter im Kopfbereich.
- **Texte:** sachlich und knapp. Fach- und Sicherheitshinweise sind unverändert.

## Design-Tokens

| Rolle | Hell | Dunkel |
| --- | --- | --- |
| Hintergrund `--bg` | `#F3EFE6` Papier | `#141714` |
| Fläche `--surface` | `#FBF9F4` | `#1C201C` |
| Text `--ink` | `#1C1F1D` | `#ECE6D9` |
| Text gedämpft `--ink-soft` | `#5B5F58` | `#A9A596` |
| Schilfgrün `--green` (Symbole) | `#2F4A3A` | `#9DBF9E` |
| Auswahl `--selected-bg` | `#2F4A3A` | `#3F5C48` |
| Akzent `--accent` | `#B83C17` (Text weiß) | `#E8693C` (Text dunkel) |
| Linie `--line` / Bedienrand `--line-strong` | `#D8D0BF` / `#958C79` | `#333832` / `#6A7068` |
| Fokusfläche `--green-deep` | `#1F2B24` | `#1F2B24` |

Alle Textpaare erreichen mindestens 4,9:1 (WCAG AA), der Akzentknopf 5,7:1 (hell) bzw. 5,9:1 (dunkel). Bedienränder (`--line-strong`) erreichen rund 3:1 gegenüber Papier.

Die früheren Variablen wurden umbenannt: `--lime` → `--accent`, `--lime-ink` → `--accent-ink`, `--mint` → `--accent-light`, `--forest` → `--green`, `--forest-deep` → `--green-deep`. Schriften stehen als `--font-display`, `--font-ui`, `--font-mono` bereit.

## Änderungen im Markup

- Startseite: ohne Hero-Foto; Frage als Überschrift, Fischliste (`SpeciesList`, auch auf „Zielfisch wählen“), aktive Session mit der Hauptaktion, Köderbox und Logbuch als Indexzeilen.
- Kicker, Statusbezeichnungen und Kartenlabels in normaler Schreibweise statt Versalien; Überschriften ohne Schlusspunkt.
- Logbuch-Zahlen ohne führende Nullen.
- Segmentfelder brechen lange Beschriftungen nach einem Schrägstrich um (`<wbr>`); der zugängliche Name ist per `aria-label` unverändert.
- Neues App-Icon in der Palette (Kompassnadel mit orangem Nordteil, Wasserlinien in Papier und Schilfgrün); Icon-Cache-Parameter auf `v=3`.
- Entfernt: Hero-Bild `lake-morning.avif/webp`, Schriften Barlow Condensed und Manrope.

Keine Änderung an Fachregeln, Ranking, Datenformaten oder gespeicherten Snapshots.

## Offen

- Die Installations-Screenshots unter `public/screenshots/` zeigen noch das alte Design und sollten bei Gelegenheit neu aufgenommen werden.
- Abnahme auf echten Geräten in Sonnenlicht (Papierton, Kontrast der Bedienränder).
