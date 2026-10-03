# Datenabsicherung und Köderbox-Analyse · 3. Oktober 2026

Ausgangsstand: `main` bei `4efc7f2`. Zwei Funktionen aus der Feature-Liste vom selben Tag: bessere Absicherung der rein lokalen Daten und eine beschreibende Analyse der Köderbox. Fachregeln, Regelgewichte, das fachliche Ranking und bestehende Empfehlungssnapshots bleiben unverändert.

## Datenabsicherung

Ohne Backend liegen alle Daten nur im Browser. Safari kann Websitedaten nicht installierter Seiten nach längerer Nichtnutzung löschen, und jeder Browser darf bei knappem Speicher ohne Speicherschutz aufräumen.

- **Speicherschutz:** `navigator.storage.persist()` wird einmalig nach dem ersten gestarteten Angelplan angefordert. Chrome und Safari entscheiden still, Firefox fragt eventuell nach. Auf der Seite Datensicherung zeigt „03 · Speicherschutz“ den Zustand (`persisted()`) und bietet „Speicherschutz anfordern“ an. Ohne API-Unterstützung wird der Bereich ausgeblendet.
- **Teilen statt nur Download:** Unterstützt das Gerät das Teilen von Dateien (`navigator.canShare({ files })`, z. B. iOS und Android), öffnet „Sicherung teilen oder in Dateien sichern“ das Teilen-Menü mit der vollständigen JSON-Sicherung. So landet sie direkt in Dateien, iCloud Drive oder einem anderen Speicher. Der Download bleibt als zweite Option erhalten. Wird das Teilen-Menü geschlossen (`AbortError`), gilt das nicht als Sicherung.
- **Letzte Sicherung:** Ein erfolgreicher Download oder ein erfolgreiches Teilen der Vollsicherung speichert den Zeitpunkt. Die Seite zeigt ihn an. Der reine Logbuch-Export zählt nicht.
- **Erinnerung:** Im Logbuch und nach dem Abschluss einer Session erscheint ein Hinweis, wenn seit der letzten Vollsicherung mindestens drei Sessions oder Angelstellen neu sind oder geändert wurden (`updatedAt`), oder wenn die letzte Sicherung über 30 Tage zurückliegt und mindestens ein Eintrag ungesichert ist. „In 7 Tagen erinnern“ pausiert den Hinweis.
- **Speicher:** `angelkompass.backup-status.v1` mit `lastBackupAt`, `snoozedUntil` und `persistRequestedAt`. Wie andere UI-Einstellungen ist dieser Schlüssel nicht Teil der Sicherung. Unlesbare Werte gelten als leer.

Code: `src/features/data/backupStatus.ts`, `storagePersistence.ts`, `BackupReminder.tsx`, `dataBackup.ts` (`canShareBackup`, `shareBackup`).

## Köderbox-Analyse (`/bestand/analyse`)

Erreichbar über „Lücken in der Köderbox finden“ in der Köderbox. Die Analyse beantwortet, welche fehlende Ködergröße die eigene Box am meisten verbessern würde.

### Verfahren

1. **Situationsraster:** Jahreszeit mit plausibler Wassertemperatur (Winter: kalt/kühl, Frühling: kalt/kühl/mild, Sommer: mild/warm/heiß, Herbst: kühl/mild/warm) × fünf Paare aus Tageszeit und Licht × drei Trübungen × drei Tiefen × drei Krautbilder × beobachtete Struktur (keine, Tiefenkante, beim Hecht und Zander zusätzlich harte Deckung). Das ergibt 2.970 Situationen für Barsch und 4.455 für Hecht und Zander. Aktivität bleibt unbekannt und damit neutral. Beim Hecht wird das Sicherheitsgate als bestätigt angenommen. Jede Situation zählt gleich viel. Das Raster ist eine Annahme der Analyse und keine Fachregel.
2. **Unverändertes Ranking:** `applicableLureOrder` liefert je Situation genau die Köderreihenfolge, die `createRecommendationDecision` vor dem Bestandsfilter verwendet: bestätigte Spots oder neutraler Wasserbereich, Tiefenfilter, beste Kombination je Köder. Engine-intern teilen sich Ranking und Analyse dafür `orderCandidates` und `inventorySizeFor`. Die Ergebnisse der Engine sind identisch (alle Szenario- und Goldentests unverändert grün).
3. **Praktische Auswahl:** Wie im Angelplan höchstens drei vorhandene Köder, bei fehlender Wunschgröße die nächste vorhandene Nachbargröße.
4. **Probeweise Ergänzung:** Jede fehlende Kombination aus Köder und Größe wird einzeln zur Box hinzugefügt und die Auswahl neu bestimmt.

### Kennzahlen

- **Planbar:** Anteil der Situationen mit mindestens einem startbaren Köder.
- **Beste Wahl dabei:** Der fachlich vorn liegende Köder ist in seiner Wunschgröße vorhanden.
- **Größenkompromiss:** Die erste startbare Option nutzt eine Nachbargröße.
- Je Vorschlag: **erstmals planbar** (nur wenn die Box nicht leer ist), **würde dein Startköder** (die Ergänzung wäre erste startbare Option) und **fachlich beste Wahl** (genau dieser Köder in dieser Größe liegt fachlich vorn).

Sortierung: zuerst erstmals planbare Situationen, dann Startköder, dann fachlich beste Wahl. Bei leerer Box macht jede Ergänzung jeden Plan möglich, deshalb wird dort nach fachlich bester Wahl sortiert. Angezeigt werden bis zu fünf Vorschläge, je Köder nur die nützlichste Größe. „Habe ich jetzt“ markiert die Größe in der Köderbox, danach wird neu gerechnet.

Alle Werte sind Abdeckung nach dem Regelwerk, keine Fangwahrscheinlichkeit. Farbe spielt keine Rolle. Die Seite erklärt das unter „So wird gerechnet“.

### Technik

- Domänenlogik ohne React: `src/domain/engine/inventoryGaps.ts`.
- Die Berechnung läuft in einem Web Worker (`src/features/inventory/gapAnalysis.worker.ts`). Ohne Worker-Unterstützung (z. B. jsdom) läuft sie einmal nach dem Rendern auf dem Hauptthread. Während einer Neuberechnung bleibt das vorige Ergebnis sichtbar. Ein Ergebnis für eine andere Fischart wird nie angezeigt.
- Laufzeit in Node: etwa 50–150 ms je Fischart. Der Worker-Chunk (rund 64 kB) liegt im Offline-Cache.

## Prüfungen

- `pnpm lint`, `pnpm test` (352 Tests in 26 Dateien), `pnpm build` inklusive PWA-Validierung (Worker im Precache) und `pnpm routing:validate` erfolgreich.
- Neue Tests in `src/test/ux/backupAndGaps.test.tsx`: Raster, Übereinstimmung der Analyse mit `createRecommendationDecision` für alle drei Fischarten (Startköder und Größenkompromiss, auch nach probeweiser Ergänzung), unverändertes Ranking, vollständige und leere Box, Seite ohne Worker inklusive „Habe ich jetzt“, Erinnerungslogik, robuster Status, Teilen inklusive Abbruch, Speicherschutz und einmalige automatische Anforderung.
- Mobil (375 px) im integrierten Browser auf eigenem lokalem Ursprung mit Wegwerfdaten: Köderbox → Analyse, Übernahme von Vorschlägen mit Neuberechnung, Datensicherung mit Speicherschutz (Chromium verweigert ihn ohne Installation still, der Hinweis erscheint), Erinnerung im Logbuch, helles und dunkles Farbschema.

## Offen

- Abnahme auf echten Geräten: Teilen-Menü mit JSON-Datei unter iOS Safari und als installierte PWA, Speicherschutz unter Safari und Firefox.
- Ob das Situationsraster für einzelne Gewässer gewichtet werden soll (z. B. nach eigenen Sessions), ist offen. Eine solche Gewichtung dürfte das fachliche Ranking nicht verändern.
