# Audit der Barsch-Wissensgrundlage vom 12. Juli 2026

Geprüft wurden `barsch_regelwerk.json` (53 Regeln, 32 Szenarien, 23 Quellen) und `barsch_wissensgrundlage.md` aus dem abgeschlossenen Work-Lauf.

## Bewertung

- Das JSON ist syntaktisch gültig, versioniert und trennt Regeln, Szenarien, Quellen und Engine-Hinweise sinnvoll.
- Der Gesamtumfang ist nicht direkt mit dem aktuellen MVP kompatibel: Er umfasst zusätzlich Fluss, Kanal, Boot, Sonar, Temperatur, Wind und deutlich mehr Spot- und Ködertypen.
- Wissenschaftliche Habitat- und Aktivitätsaussagen sind überwiegend nachvollziehbar referenziert. Konkrete Köder-, Farb- und Wechselanweisungen beruhen teilweise auf Erfahrungswissen und werden daher geringer gewichtet.
- Fehlende Eingaben bleiben neutral. Korrelierte Regeln dürfen später nicht ungebremst addiert werden.
- Konfidenz bezeichnet Evidenz beziehungsweise Eingabeabdeckung, nicht Fangwahrscheinlichkeit.

## Für den See-Vertikalschnitt übernommen

- Saisonale Präferenz für strukturreiche Uferbereiche sowie Herbst-/Wintergewichtung von Tiefenkanten.
- Dämmerungsbonus mit expliziter Hochsommer-Gegenbedingung.
- Leichte Tiefengewichtung bei klarem Wasser am Tag.
- Moderate, evidenzreduzierte Gewichtung aktiver Suchköder bei starker Trübung.
- Krautkante statt dichtem Krautkern als praktisch befischbarer Zielbereich.
- Langsame Finesse-Präsentation im Winter.
- Wechselprinzip: Tiefe und Präsentationsstil vor bloßer Farbrotation ändern.

Die übernommenen Regeln und Quellenreferenzen stehen in `src/domain/rules/perchLakeRules.ts`. Nicht übernommen wurden neue Eingabefelder, Gewässertypen, Boots-/Sonarlogik und zusätzliche Katalogeinträge.
