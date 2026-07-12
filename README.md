# Angelkompass

Erster vertikaler MVP-Funktionsumfang einer mobilen Entscheidungshilfe für das Uferangeln auf Barsch am See.

## Entwicklung

```bash
pnpm install
pnpm dev
```

Qualitätsprüfung: `pnpm lint`, `pnpm test` und `pnpm build`.

Die Fachlogik liegt unabhängig von React unter `src/domain`. Der Umfang ist bewusst auf einen See, drei Spot-Typen und fünf Ködertypen begrenzt. Es gibt keine externe API und kein Backend.

Die Engine berechnet zuerst eine unveränderte fachliche Rangfolge. Der lokal gespeicherte persönliche Bestand wird erst anschließend ausgewertet: Die beste vorhandene Option wird praktisch hervorgehoben, die beste fehlende Option separat gezeigt und ein Eignungsabstand ab 15 Punkten transparent gewarnt.
