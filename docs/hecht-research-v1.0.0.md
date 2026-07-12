# Hecht-Wissensgrundlage v1.0.0

Geltungsbereich: Europäischer Hecht (`Esox lucius`), See, Uferangeln, manuelle Beobachtungen. Die produktiven Regeln stehen in `pikeLakeRules.ts`; diese Datei dokumentiert Herkunft und Grenzen.

## Quellen und Ableitungen

- P01: Nilsson et al. (2023), *Influence of reed beds and submerged vegetation on pike*. Schilf und submerse Vegetation werden als Habitat gewertet, ohne daraus pauschal einen Fangbonus abzuleiten.
- P02: Skov et al. (2023), *First-season growth and food of YOY pike are habitat specific within a lake*. Unterstützt die Relevanz unterschiedlicher Vegetationstypen, nicht konkrete Köderwahl.
- P03: Öhlund et al. (2015), *Temperature dependence of predation depends on relative performance*. Unterstützt vorsichtige Temperatur-/Präsentationsregeln; keine Fangwahrscheinlichkeit.
- P04: aktuelle Temperatur-/Browning-Experimente werden nur als vorsichtige Wohlfahrtsgrenze genutzt. Ohne Sauerstoffmessung wird keine physiologische Diagnose behauptet.
- P05: Köderführung, Hängerrisiko und Kontrollierbarkeit sind Erfahrungswissen und deshalb niedriger gewichtet.

## Regelgrenzen

- Direkte Beobachtung überstimmt Saison-Fallbacks.
- Temperatur wird nicht zusätzlich mit einem gleichgerichteten Saisonbonus verdoppelt.
- Dichtes Kraut bedeutet Habitat, aber nicht automatisch gute Befischbarkeit im Krautkern.
- Farbe ist nachgelagerte Darstellung und verändert keinen Score.
- Bestand, Sicherheitsbestätigung und örtliche Regeln verändern das Fachranking nicht.
- Wind, Luftdruck, Mond, exakte Schonzeiten, Boot, Sonar, Fluss und GPS sind nicht Bestandteil dieser Version.

## Abnahmeszenarien

Die 24 produktiven Golden-Szenarien liegen unter `src/test/scenarios/pikeGoldenScenarios.test.ts`. Sie decken Jahreszeit, Temperatur, Tiefe, Trübung, Vegetation, harte Deckung, Beutefisch, Oberflächenaktivität und bestätigten Hechtkontakt ab.
