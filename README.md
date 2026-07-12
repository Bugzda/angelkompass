# Angelkompass

Vollständiger Übergabestand für neue Chats: [`PROJECT_CHECKPOINT.md`](PROJECT_CHECKPOINT.md)

Erster vertikaler MVP-Funktionsumfang einer mobilen Entscheidungshilfe für das Uferangeln auf Barsch am See.

## Entwicklung

```bash
pnpm install
pnpm dev
```

Qualitätsprüfung: `pnpm lint`, `pnpm test` und `pnpm build`.

Die Fachlogik liegt unabhängig von React unter `src/domain`. Der Umfang ist bewusst auf einen See, drei Spot-Typen und zehn Ködertypen begrenzt. Es gibt keine externe API und kein Backend.

Die Engine berechnet zuerst eine unveränderte fachliche Rangfolge. Der lokal gespeicherte persönliche Bestand wird erst anschließend ausgewertet: Die beste vorhandene Option wird praktisch hervorgehoben, die beste fehlende Option separat gezeigt und ein evidenzkalibrierter Eignungsabstand ab 8 Punkten transparent gewarnt.

## Fachliche Eingaben

Neben Jahreszeit, Tageszeit, Trübung und Tiefe verarbeitet das See-MVP manuell gewählte Wassertemperaturklassen, Licht, beobachtete Aktivität und das Krautbild. Unbekannte Angaben bleiben neutral.

Produktive Regeln sind deklarativ nach Evidenzklasse und Ursache gruppiert. Gruppen-Caps verhindern, dass korrelierte Angaben wie Saison und Temperatur mehrfach dominieren. Jede Empfehlung weist Eingabeabdeckung und Evidenzgüte getrennt aus und enthält eine dreistufige Wechselstrategie.

Das vollständige Wissensarchiv unter `research/` bleibt Referenzmaterial und wird nicht zur Laufzeit geladen.

## Lokale Sessions

Eine der fachlichen Top-3-Empfehlungen kann als aktive Session gespeichert werden. Biss und Fang werden protokolliert; „Kein Erfolg“ schaltet durch den dreistufigen Wechselplan. Sessions und Verlauf bleiben ausschließlich auf dem Gerät und verändern weder Ranking noch Regelgewichte. Details stehen in [`docs/meilenstein-session-feedback.md`](docs/meilenstein-session-feedback.md).

## Veröffentlichung

Der Produktions-Build ist für GitHub Pages unter `https://bugzda.github.io/angelkompass/` konfiguriert. Pushes auf `main` werden über `.github/workflows/pages.yml` geprüft, gebaut und veröffentlicht. Der lokale Entwicklungsserver bleibt unter `/` erreichbar.
