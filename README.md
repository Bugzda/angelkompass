# Angelkompass

Zentrale Arbeitsanleitung für Coding-Agenten: [`AGENTS.md`](AGENTS.md)

Vollständiger Übergabestand für neue Chats: [`PROJECT_CHECKPOINT.md`](PROJECT_CHECKPOINT.md)

Mobile, lokal speichernde Entscheidungshilfe für das Uferangeln auf Barsch, Hecht und Zander am See.

Aktuelle UI-/UX-Überarbeitung: [`docs/ux-fokus-2026-09-08.md`](docs/ux-fokus-2026-09-08.md). Kompakte Bedingungen und Köderbox, eindeutige Empfehlungskarten mit aufklappbaren Quellen, aktueller Handlungsschritt im Vordergrund und direkter Zugang zum aktiven Plan. Der [geführte Einstieg](docs/ux-angelplan-2026-09-05.md) umfasst auch Abschluss und Wiederholungsstart.

Aktuelles Code-, Daten- und UI-Review: [`docs/review-2026-09-07.md`](docs/review-2026-09-07.md). Frühere Prüfung: [`docs/review-2026-09-05.md`](docs/review-2026-09-05.md).

## Entwicklung

```bash
pnpm install
pnpm dev
```

Qualitätsprüfung: `pnpm lint`, `pnpm test` und `pnpm build`. Der Build prüft zusätzlich den erzeugten Service Worker auf Startfehler, widersprüchliche Cacheeinträge und fehlende Offline-Dateien. Für einen vorhandenen Build: `pnpm pwa:validate`.

Die Fachlogik liegt unabhängig von React unter `src/domain`. Das Barschprofil umfasst drei Spot-Typen und zehn Ködertypen, das Hechtprofil vier Spot-Typen und neun Ködertypen, das Zanderprofil vier Spot-Typen und vier Ködertypen. Das Zander-Regelwerk und seine Quellen sind in [`docs/zander-research-v1.0.0.md`](docs/zander-research-v1.0.0.md) dokumentiert. Optional ergänzt Open-Meteo aktuelle Wettervorschläge; es gibt kein Backend. `pnpm lint` prüft beide TypeScript-Projekte.

Die Engine berechnet zuerst eine unveränderte fachliche Rangfolge. Der lokal gespeicherte persönliche Bestand wird erst anschließend ausgewertet: Sichtbar und startbar sind maximal drei tiefenkompatible, vorhandene Köder; abweichende vorhandene Größen werden transparent als Kompromiss verwendet. Die beste fehlende Option erscheint separat als fachliche Ergänzung.

## Fachliche Eingaben

Jahreszeit und Tageszeit sind bei neuen Plänen automatisch aus der Gerätezeit vorausgewählt und bleiben änderbar. Die Tageszeit ist ohne Standort eine Näherung.

Neben Jahreszeit, Tageszeit, Trübung und Tiefe verarbeitet das See-MVP manuell gewählte Wassertemperaturklassen, Licht, beobachtete Aktivität und das Krautbild. Unbekannte Angaben bleiben neutral.

Produktive Regeln sind deklarativ nach Evidenzklasse und Ursache gruppiert. Gruppen-Caps verhindern, dass korrelierte Angaben wie Saison und Temperatur mehrfach dominieren. Jede Empfehlung weist Eingabeabdeckung und Evidenzgüte getrennt aus und enthält eine dreistufige Wechselstrategie.

Das vollständige Wissensarchiv unter `research/` bleibt Referenzmaterial und wird nicht zur Laufzeit geladen.

## Optionale Wetterübernahme

Auf der Bedingungsseite lassen sich über Standortfreigabe oder Ortssuche aktuelle Wetterdaten abrufen. Nach einer Vorschau ergänzt „Offene Angaben ergänzen“ unbekannte Tageszeit- und Lichtangaben. Eigene Angaben bleiben erhalten und jederzeit änderbar. Lufttemperatur ersetzt keine Wassertemperatur. Ohne Netz bleibt die manuelle Eingabe verfügbar. Details und Grenzen: [`docs/wetteruebernahme.md`](docs/wetteruebernahme.md).

## Lokale Sessions

Eine der maximal drei vorhandenen Empfehlungen kann als aktive Session gespeichert werden. Biss und Fang werden protokolliert; „Kein Erfolg“ schaltet durch den dreistufigen Wechselplan. Sessions und Verlauf bleiben ausschließlich auf dem Gerät und verändern weder Ranking noch Regelgewichte. Details stehen in [`docs/meilenstein-session-feedback.md`](docs/meilenstein-session-feedback.md).

Die letzte Rückmeldung einer aktiven Session lässt sich einschließlich des Phasenwechsels rückgängig machen. Das Logbuch bietet Filter nach Zielfisch, Biss-/Fangzähler und einen JSON-Export aller Session-Snapshots. Die Köderbox bietet Suche, Zielfischfilter und eine Bestandsübersicht. Beim Bearbeiten der Bedingungen und beim Browser-Zurück bleiben Eingaben im Verlauf des aktuellen Tabs erhalten.

## Datensicherung

„Datensicherung & Wiederherstellung“ ist über Köderbox und Logbuch erreichbar, auch ohne vorhandene Sessions. Eine vollständige JSON-Sicherung enthält Bestand, Sessions und die ursprünglichen Speicherwerte einschließlich nicht lesbarer Einträge. Der Import unterstützt auch bisherige reine Session-Exporte. Nach einer Vorschau ergänzt er Ködergrößen und neue Sessions; lokale Sessions mit gleicher ID bleiben unverändert. Ist bereits ein Plan aktiv, werden zusätzlich importierte aktive Pläne als abgeschlossen übernommen.

Die App nutzt weiterhin lokalen Browser-Speicher (Bestand v3, Sessions v1) ohne Konto oder Serverdatenbank. Die Wiederherstellung prüft Änderungen seit der Vorschau und verwendet eine Rücksicherung für Schreibfehler und unterbrochene Importe. Nicht lesbare Originaleinträge bleiben erhalten, werden aber nicht automatisch aus einer Sicherung aktiviert. Browserdaten können vom Nutzer oder Betriebssystem gelöscht werden; wichtige Sicherungen deshalb außerhalb des Browsers aufbewahren. Format, Konfliktverhalten und Grenzen stehen im [aktuellen Review](docs/review-2026-09-07.md).

## Veröffentlichung

Der Produktions-Build ist für GitHub Pages unter `https://bugzda.github.io/angelkompass/` konfiguriert. Pushes auf `main` werden über `.github/workflows/pages.yml` geprüft, gebaut und veröffentlicht. Der lokale Entwicklungsserver bleibt unter `/` erreichbar.
