# Barsch-Wissensarchiv v1.0.0

Status: **Research / nicht produktiv freigegeben**

Diese Ablage enthält die vollständigen Ergebnisse des separaten Work-Recherchelaufs vom 12. Juli 2026. Ihr Geltungsbereich umfasst Barsch in Seen, Flüssen und Kanälen sowie Ufer- und Bootsangeln. Damit ist sie bewusst breiter als das aktuelle Angelkompass-MVP.

## Enthaltene Dateien

- `barsch_regelwerk.json`: 53 recherchierte Regeln, 32 Referenzszenarien, Engine-Hinweise und Quellenkatalog.
- `barsch_wissensgrundlage.md`: lesbare Erläuterung der recherchierten Regeln und Unsicherheiten.

Originale SHA-256-Prüfsummen beim Import:

```text
03bdcfea5ae6c5ca66244ba8050624ca763a59b63b447aa38821f4c19d064998  barsch_regelwerk.json
fcce3862dbbb5bee4e747976878779eb43fca3be3f9103596a736b91cb1803a9  barsch_wissensgrundlage.md
```

## Verwendungsregeln

- Dateien unter `research/` sind Wissensarchiv und keine ausführbare Produktkonfiguration.
- Die Anwendung importiert diese Dateien nicht. Sie gelangen daher weder in das Browser-Bundle noch in den PWA-Precache.
- Produktive Regeln müssen einzeln geprüft, auf den aktuellen Scope zugeschnitten und nach `src/domain/rules/` überführt werden.
- Jede Übernahme benötigt passende Golden-Szenarien und darf den persönlichen Bestand nicht in das fachliche Ranking einrechnen.
- Quellenlinks belegen nicht automatisch jede konkrete Köderanweisung; wissenschaftliche Aussage und anglerische Ableitung bleiben getrennt zu bewerten.

## Bereits kuratiert übernommen

Die für Barsch, See und Ufer geeignete Teilmenge ist in `src/domain/rules/perchLakeRules.ts` dokumentiert. Die Auswahlentscheidung steht in `docs/recherche-audit.md`.

## Validierung

```bash
pnpm research:validate
```

Der Validator prüft JSON-Struktur, eindeutige IDs, Quellenreferenzen, Effektbereich, Konfidenzbereich und Szenario-IDs. Er bewertet nicht die fachliche Richtigkeit einzelner Regeln.
