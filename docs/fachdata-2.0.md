# Angelkompass-Fachdaten 2.0

Stand: 12. Juli 2026. Scope: Europäischer Barsch und Hecht, See, Uferangeln, Kunstköder.

## Datenverträge

- Die sichtbaren Kataloge enthalten zehn Barsch- und neun Hecht-Kategorien. Drop Shot wurde aus dem aktiven Barsch-Katalog entfernt; neu in Fachdata 2.0 sind `tail-spinner` und `tailbait`.
- `LureType` enthält artspezifische Zentimeterbereiche, Material und mehrere Präsentationsprofile. Texas/Offset und Carolina sind Profile des Barsch-Softbaits; Shallow Screw und weedless Offset sind Profile des Hecht-Softbaits.
- Offene Hecht-Großköderbereiche werden ausdrücklich als `20–25+ cm` bei Softbait/Tailbait und `16–22+ cm` bei Hardbaits ausgegeben. Bei Metallködern steht das Ködergesamtgewicht vor der nur ergänzenden Längenangabe.
- `ResolvedPresentation` friert Profil-ID, Montage, Größe, Beschwerungsart, Beschwerung und Führung in der Empfehlung ein. Alte Sessions ohne dieses Feld verwenden ausschließlich ihre gespeicherten Legacy-Texte.
- Terminalgewicht, Ködergesamtgewicht und unbeschwerte Montage sind getrennte Begriffe. Wo keine belastbare Grammspanne vorliegt, wird keine Zahl erzeugt.
- Farbe bleibt eine reine, material- und situationsabhängige Projektion. Sie verändert weder Spot- noch Köderscore.

## Rulesets und Quellen

- Barsch: `perch-lake-2.0.0`
- Hecht: `pike-lake-2.0.0`
- Das produktive Quellenregister liegt unter `src/domain/research/productSources.ts`. Jede Quelle enthält Autoren, Jahr, URL, Evidenztyp, Scope und Prüfdatum.
- P01 wurde auf Niemi et al. (2023), DOI `10.1016/j.fishres.2023.106621`, korrigiert. P02 ist Nilsson et al. (2023) und wird nur vorsichtig für juvenile Habitate verwendet. Praxiswissen von Westin und Sportfiskarna bleibt `experience` beziehungsweise `official-guidance`.
- `pnpm research:validate` prüft neben dem breiteren Research-Archiv auch das produktive Register, alle Regelreferenzen und Science-Regeln auf wissenschaftliche Quellen.

## Bestandsmigration

Aktueller Schlüssel ist `angelkompass.inventory.v3` mit dem strikten Vertrag `{ targetFish, lureTypeId, sizes, migratedNeedsReview? }`. Die praktische Verfügbarkeit verlangt immer die passende Fischart, Köder-ID und Größe; artslose Altobjekte werden nicht direkt ausgewertet.

- v1 wird als Barschbestand mit allen vom jeweiligen Köder unterstützten Größen übernommen.
- v2 wird für passende Fischarten übernommen; Hecht nur bei explizitem `medium` oder `large`.
- Migrierte Größen bleiben praktisch nutzbar, werden aber bis zur ersten Änderung als prüfpflichtig markiert.
- v1/v2-Schlüssel werden nicht gelöscht.

## Grenzen

Die Ausgabe ist keine Fangwahrscheinlichkeit. Lokale Beute, Sauerstoff, konkrete Produktgewichte und gewässerspezifische Regeln können nicht vollständig aus den vorhandenen manuellen Eingaben abgeleitet werden. Standort, Zielhorizont, Führung und direkte Beobachtung bleiben wichtiger als Farbe.
