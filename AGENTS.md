# Arbeitsanleitung für Angelkompass

Diese Datei ist der zentrale Einstieg für Coding-Agenten und gilt für das gesamte Repository.

## Einstieg und Projektstand

- Lies zuerst `README.md`, prüfe `git status` und lies die zum Auftrag passenden Dokumente unter `docs/`.
- `PROJECT_CHECKPOINT.md` enthält die ausführliche Übergabe und fachliche Entscheidungen. Beachte die datierten Ergänzungen: ältere Abschnitte beschreiben historische Stände. Aktuelle Implementierung und Tests prüfen, bevor du Versionsnummern, Testzahlen oder offene Aufgaben daraus übernimmst.
- Arbeite am aktuellen Checkout. Historische Commit-Referenzen und Startprompts im Checkpoint sind keine Aufforderung zum Zurücksetzen oder zum Ausführen alter Aufgaben.
- Kommuniziere auf Deutsch; verwende die vorhandenen deutschen Produkttexte und englischen Codebezeichner konsistent.

## Produkt und Architektur

Angelkompass ist eine mobile React-/TypeScript-PWA für das Uferangeln am See auf Barsch, Hecht und Zander. Vite baut die App; pnpm verwaltet die Abhängigkeiten. Bestand und Sessions werden lokal gespeichert. Es gibt kein Backend und kein Benutzerkonto.

- `src/domain/`: React-unabhängige Fachlogik, Typen, Artenprofile, Kataloge und deklarative Regeln.
- `src/features/`: Benutzerabläufe für Bedingungen, Bestand, Empfehlungen und Sessions.
- `src/ui/`: gemeinsame Komponenten, Hooks und Gestaltung.
- `src/test/`: Vitest-Szenarien und UI-/Persistenztests.
- `research/`: Referenzarchiv, keine Laufzeitkonfiguration; nicht in das Produktions-Bundle aufnehmen.
- `docs/`: fachliche Begründungen, Quellen, Reviews und Funktionsdokumentation.

## Fachliche Leitplanken

- Berechne das fachliche Ranking unabhängig vom persönlichen Bestand. Wende den Bestand erst anschließend an; Scores und fachliche Reihenfolge bleiben unverändert.
- Zeige höchstens drei tatsächlich vorhandene, tiefenkompatible und startbare Köder. Fehlende Optionen bleiben separate, nicht startbare Hinweise. Vorhandene Nachbargrößen müssen als Kompromiss erkennbar sein.
- Unbekannte Eingaben bleiben fachlich neutral. Eingabeabdeckung und Evidenzgüte sind getrennte Größen und keine Fangwahrscheinlichkeiten.
- Erhalte Evidenzgewichtung und Gruppen-Caps gegen die Mehrfachgewichtung korrelierter Eingaben. Farbe bleibt eine nachgelagerte Präsentationshilfe ohne Rankingeinfluss.
- Neue Fachregeln brauchen stabile IDs, Evidenz-/Quellenangaben, Begründungen und fachliche Testszenarien. Ändere Fachregeln, Artenprofile und Produktumfang nur im Rahmen eines entsprechenden Nutzerauftrags.
- Sessionfeedback verändert weder Ranking noch Regelgewichte. Bestehende Session-Snapshots bleiben lesbar und werden nicht nachträglich neu berechnet; lokale Bestands- und Sessiondaten bei Änderungen erhalten.
- Erhalte das Hecht-Sicherheitsgate und die dreistufige Wechselstrategie: Winkel/Horizont, Präsentationsstil, Spot.

## Arbeiten und Prüfen

- Halte Änderungen auf den Auftrag begrenzt und bewahre vorhandene Änderungen anderer Arbeiten.
- Nutze die Skripte aus `package.json`: `pnpm dev` für Entwicklung, `pnpm lint` für TypeScript-Prüfung, `pnpm test` für Tests und `pnpm build` für den Produktions-Build.
- Führe bei Codeänderungen passende bestehende Tests vorab sowie relevante Tests, TypeScript-Prüfung und Build nach der Änderung aus. Ergänze aussagekräftige Regressionstests bei Fehlerkorrekturen und Testszenarien bei neuen Fachregeln.
- Prüfe bei Änderungen an Research oder Quellen zusätzlich `pnpm research:validate`, bei Routing-/Pages-Änderungen `pnpm routing:validate`.
- Prüfe UI-Änderungen auch im mobilen Layout und im betroffenen Benutzerablauf. Reine Dokumentationsänderungen benötigen keinen App-Build; prüfe stattdessen Inhalt, Pfade und Diff.
- Erstelle vor größeren Änderungen einen Git-Checkpoint, ohne fremde Änderungen ungefragt einzuschließen. Halte Fachregel- und Research-Archivänderungen in getrennten Commits.
- Aktualisiere betroffene Dokumentation bei Verhaltensänderungen. Halte diese Datei kompakt; ausführliche Projektstände gehören in den Checkpoint oder nach `docs/`.

## Veröffentlichung

GitHub Pages verwendet den Basispfad `/angelkompass/`; lokal läuft die Entwicklung unter `/`. Direkte SPA-Routen werden über `public/404.html` und `index.html` unterstützt. PWA-Updates dürfen aktive Sessions nicht ungefragt neu laden.

Pushes auf `main` lösen über `.github/workflows/pages.yml` Prüfung, Build und Veröffentlichung aus. Beachte diese Wirkung bei einem beauftragten Push und unterscheide im Abschlussbericht zwischen lokal umgesetzt, geprüft und veröffentlicht.
