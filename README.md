# Angelkompass

Vollständiger Übergabestand für neue Chats: [`PROJECT_CHECKPOINT.md`](PROJECT_CHECKPOINT.md)

Mobile, lokal speichernde Entscheidungshilfe für das Uferangeln auf Barsch und Hecht am See.

Aktuelles Code- und UI-Review: [`docs/review-2026-09-05.md`](docs/review-2026-09-05.md).

## Entwicklung

```bash
pnpm install
pnpm dev
```

Qualitätsprüfung: `pnpm lint`, `pnpm test` und `pnpm build`.

Die Fachlogik liegt unabhängig von React unter `src/domain`. Das Barschprofil umfasst drei Spot-Typen und zehn Ködertypen, das Hechtprofil vier Spot-Typen und neun Ködertypen. Es gibt keine externe API und kein Backend. `pnpm lint` prüft beide TypeScript-Projekte.

Die Engine berechnet zuerst eine unveränderte fachliche Rangfolge. Der lokal gespeicherte persönliche Bestand wird erst anschließend ausgewertet: Sichtbar und startbar sind maximal drei tiefenkompatible, vorhandene Köder; abweichende vorhandene Größen werden transparent als Kompromiss verwendet. Die beste fehlende Option erscheint separat als fachliche Ergänzung.

## Fachliche Eingaben

Neben Jahreszeit, Tageszeit, Trübung und Tiefe verarbeitet das See-MVP manuell gewählte Wassertemperaturklassen, Licht, beobachtete Aktivität und das Krautbild. Unbekannte Angaben bleiben neutral.

Produktive Regeln sind deklarativ nach Evidenzklasse und Ursache gruppiert. Gruppen-Caps verhindern, dass korrelierte Angaben wie Saison und Temperatur mehrfach dominieren. Jede Empfehlung weist Eingabeabdeckung und Evidenzgüte getrennt aus und enthält eine dreistufige Wechselstrategie.

Das vollständige Wissensarchiv unter `research/` bleibt Referenzmaterial und wird nicht zur Laufzeit geladen.

## Lokale Sessions

Eine der maximal drei vorhandenen Empfehlungen kann als aktive Session gespeichert werden. Biss und Fang werden protokolliert; „Kein Erfolg“ schaltet durch den dreistufigen Wechselplan. Sessions und Verlauf bleiben ausschließlich auf dem Gerät und verändern weder Ranking noch Regelgewichte. Details stehen in [`docs/meilenstein-session-feedback.md`](docs/meilenstein-session-feedback.md).

Die letzte Rückmeldung einer aktiven Session lässt sich einschließlich des Phasenwechsels rückgängig machen. Das Logbuch bietet Filter nach Zielfisch, Biss-/Fangzähler und einen JSON-Export aller Session-Snapshots. Ein Import ist noch nicht enthalten. Die Köderbox bietet Suche, Zielfischfilter und eine Bestandsübersicht. Beim Bearbeiten der Bedingungen und beim Browser-Zurück bleiben Eingaben im Verlauf des aktuellen Tabs erhalten.

## Veröffentlichung

Der Produktions-Build ist für GitHub Pages unter `https://bugzda.github.io/angelkompass/` konfiguriert. Pushes auf `main` werden über `.github/workflows/pages.yml` geprüft, gebaut und veröffentlicht. Der lokale Entwicklungsserver bleibt unter `/` erreichbar.
