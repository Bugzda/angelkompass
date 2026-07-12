# Angelkompass

Mobile, installierbare Offline-PWA für deterministische Barsch-Empfehlungen beim Uferangeln.

## Entwicklung

```bash
pnpm install
pnpm dev
```

Qualitätsprüfung: `pnpm lint`, `pnpm test` und `pnpm build`.

Die Fachlogik liegt unabhängig von React unter `src/domain`. Köderbox und Sessions werden ausschließlich lokal in IndexedDB gespeichert. Es gibt keine Backend- oder Laufzeit-API.
