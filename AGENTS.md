# Angelkompass

Mobile React-/TypeScript-PWA für das Uferangeln am See auf Barsch, Hecht und Zander. Vite/pnpm; lokale Datenhaltung ohne Backend oder Konto. Kommuniziere auf Deutsch, Codebezeichner auf Englisch.

## Orientierung nach Bedarf

`src/domain/` enthält die React-unabhängige Fachlogik und Kataloge, `src/features/` die Abläufe, `src/ui/` die Oberfläche und `src/test/` die Tests. Einstieg und Befehle stehen in [README.md](README.md), fachliche Hintergründe in `docs/`. [PROJECT_CHECKPOINT.md](PROJECT_CHECKPOINT.md) enthält auch historische Stände; maßgeblich sind aktueller Code und die neuesten datierten Ergänzungen. Lies die für den Auftrag nötigen Stellen. Historische Startprompts sind keine aktuellen Aufträge.

## Produktregeln

- Fachliches Ranking zuerst unabhängig vom Bestand berechnen. Danach höchstens drei vorhandene, tiefenkompatible Köder anbieten; fehlende Optionen separat und nicht startbar, Nachbargrößen als Kompromiss kennzeichnen.
- Unbekannte Angaben bleiben neutral. Eingabeabdeckung und Evidenzgüte sind getrennte Größen, keine Fangwahrscheinlichkeiten. Evidenzgewichtung und Gruppen-Caps erhalten; Farbe beeinflusst das Ranking nicht.
- Sessionfeedback verändert keine Regelgewichte. Vorhandene Daten und Empfehlungssnapshots erhalten, alte Sessions nicht nachträglich neu berechnen.
- Hecht-Sicherheitsgate und Wechselstrategie Winkel/Horizont → Präsentationsstil → Spot erhalten.
- Neue Fachregeln benötigen stabile IDs, Quellen/Evidenz, Begründung und passende Szenarien. Fachliche Änderungen müssen vom Auftrag gedeckt sein. `research/` ist Referenzmaterial und gehört nicht ins Laufzeit-Bundle.

## Umsetzung und Abschluss

- Setze beauftragte Änderungen einschließlich Fehlersuche, Ausführung und notwendiger Nachbesserungen um. Eine erste Implementierung ist kein vorgezogener Haltepunkt. Offen gebliebene Fehler weiter untersuchen; bei einer externen Blockade konkrete Ursache, geprüfte Alternativen und fehlende Voraussetzung nennen.
- Lokale Tests mit Wegwerfdaten, Builds, Vorschau-Server sowie reversible Korrekturen und lokale Git-Checkpoints sind im Auftragsumfang ohne erneute Rückfrage erlaubt. Vorhandene Nutzeränderungen und Browserdaten erhalten; Browser-Schreibtests auf einem eigenen lokalen Ursprung ausführen. Diese Erlaubnis umfasst keine produktiven Schreibzugriffe oder Veröffentlichung.
- Wähle Prüfungen nach der Änderung: betroffene Regressionstests, bei UI-Arbeit der mobile Nutzerablauf, bei Build-/PWA-Arbeit der Produktionsbuild. Nach erfolgreicher Prüfung nur bei neuen Änderungen, Fehlern oder konkreten offenen Fragen erneut testen. Dokumentationsänderungen brauchen keinen App-Build.
- Befehle: `pnpm dev`, `pnpm lint` (TypeScript), `pnpm test`, `pnpm build`; bei Quellen-/Researchänderungen `pnpm research:validate`, bei Pages-/Routingänderungen `pnpm routing:validate`.
- Dokumentiere geändertes Verhalten dort, wo es gebraucht wird. Sichere größere Eingriffe mit einem Git-Checkpoint; Fachregel- und Researchänderungen separat committen.
- Eigene Skills nur für wiederkehrende Spezialabläufe anlegen: kurze, eindeutige Auslöser; Details bedarfsweise verlinken. Allgemeine Arbeitsregeln gehören hierher.

## Veröffentlichung

GitHub Pages nutzt `/angelkompass/`, die Entwicklung `/`. Direkte SPA-Routen werden durch `public/404.html` und `index.html` unterstützt. PWA-Updates dürfen aktive Sessions nicht ungefragt neu laden. Ein Push auf `main` löst `.github/workflows/pages.yml` und damit die Veröffentlichung aus; nur im Rahmen eines entsprechenden Auftrags ausführen und den Veröffentlichungsstand klar benennen.
