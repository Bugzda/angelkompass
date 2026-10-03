# Prüfung der Fischarten-Datenbank · 3. Oktober 2026

Ausgangsstand: `main` bei `2073bbb`. Geprüft wurden die drei Artenprofile (Kataloge, Spots, Regeln, Erklärtexte, Quellenregister) statisch und mit einem Durchlauf über rund 123.000 Bedingungskombinationen je Art. Eindeutige IDs, Erklärtexte, Quellenauflösung, Größen- und Gewichtsangaben waren vollständig. Jede Regel feuert und jeder Köder erreicht die Top 3. Die folgenden Lücken wurden behoben.

## Behobene Lücken

1. **`pnpm research:validate` prüfte keine Regel.** Das Skript suchte `sourceIds:[` ohne Leerzeichen; formatiert steht `sourceIds: [`. Regeln werden jetzt objektweise gelesen. Erfahrungs-, Schwach- und Science-Regeln brauchen mindestens eine registrierte Quelle; Science-Regeln nur wissenschaftliche. Ausgabe nennt die Zahl der geprüften Regeln.
2. **FIT001/FIT002 ohne Quelle.** FIT001 (Jig an der Tiefenkante) zitiert S15, FIT002 (Suchköder in der Flachzone) S16. Ranking unverändert.
3. **Krautangaben der Montagen wurden kaum genutzt.** In dichtem Kraut standen Köder auf Platz 1, deren Montage laut Katalog nicht dafür vorgesehen ist.
   - Neue Regeln FIT003 (Barsch, S15) und PKL022 (Hecht, P06): −3, wenn keine tiefenkompatible Präsentation die beobachtete Krautlage listet. Unbekanntes Kraut bleibt neutral. Wo OBS014/OBS016 (Barsch, Krautspot) oder PKL012 (Hecht) bereits greifen, wird nicht doppelt abgewertet. Zander ist durch ZLK015 schon abgedeckt.
   - Spinnerbait-Profile listen jetzt auch krautfreies Wasser.
   - Die Profilwahl bevorzugt unter den tiefenkompatiblen Profilen eines, das zur Krautlage passt.
   - Wirkung im Prüfraster: unpassende Platz-1-Empfehlungen beim Barsch von rund 2.700 auf 810, beim Hecht von rund 4.600 auf 1.440. Der Rest betrifft überwiegend große Tiefe mit dichtem Kraut, für die der Katalog keine krauttaugliche Montage enthält.
4. **Harte Deckung fehlte beim Barsch**, obwohl die Recherche sie stützt (R015, R016, R050). Neuer Spot „Steine, Totholz oder harter Grund“ im Formular, in gemerkten Angelstellen und in der Köderbox-Analyse (jetzt 4.455 Situationen auch für Barsch).
   - PL025 (Spot, science, R015, S02/S20, +2) nur bei bestätigter harter Deckung. Unbestätigt bleibt der Spot neutral und erscheint im Prüfraster nie auf Platz 1 oder als Spot-Tipp.
   - PL052 (Setup, experience, R030, S15/S16, +2) für Jig und Ned; der Barsch-Jig nutzt dort die hängerarme Texas-/Offsetmontage.
   - S09 (Probst et al. 2008) war nicht abrufbar und wurde nicht ins Register übernommen.
5. **Freier Wasserbereich beim Zander nur als neutraler Ersatz.** Bei sichtbarem Kleinfisch ist der Katalog-Spot „Freier Wasserbereich“ jetzt ein praktischer Suchbereich mit Begründung ZANDER_PREY und nach bestätigter Kante das Ziel des Spotwechsels. Ohne Kleinfisch bleibt der neutrale Wasserbereich unverändert. Keine neue Regel.
6. **Zander ohne eigene Szenariotests.** Neu: `src/test/scenarios/zanderGoldenScenarios.test.ts`. Kraut-Regressionen: `src/test/scenarios/vegetationFit.test.ts`.

## Regelversionen

`perch-lake-2.1.0`, `pike-lake-2.1.0`, `zander-lake-1.1.0`. Bestehende Sessions behalten ihre Snapshots und werden nicht neu berechnet.

## Bewusst nicht übernommen

Von 53 Barsch-Recherche-Regeln sind 24 produktiv abgebildet. Die übrigen betreffen Fluss, Kanal, Boot, Wind, Luftdruck, Angeldruck oder Zielgröße und liegen außerhalb des Uferangel-MVPs am See.

Prüfung: 373 Tests, TypeScript, Prettier und `pnpm research:validate` (88 Regeln) erfolgreich. Barsch-Formular mit harter Deckung mobil (375 px) auf eigenem lokalen Ursprung geprüft. Nicht veröffentlicht.
