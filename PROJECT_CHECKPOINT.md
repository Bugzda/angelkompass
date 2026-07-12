# Projekt-Checkpoint Angelkompass

Stand: 12. Juli 2026  
Git-Referenz vor diesem Dokumentations-Checkpoint: `9f56af6` (`main`)  
Produktstatus: lokal lauffähiger, installierbarer See-/Barsch-Vertikalschnitt

Dieses Dokument ist der Einstiegspunkt für einen neuen Codex-Chat. Es beschreibt ausschließlich den vorhandenen Projektstand; es erweitert oder verändert keine Fachregeln.

## 1. Ziel und aktueller Umfang

Angelkompass ist eine mobile React-/TypeScript-PWA, die für das Uferangeln auf Barsch an einem See deterministische Empfehlungen erzeugt.

Aktuell enthalten:

- Zielfisch ausschließlich Barsch.
- Gewässer ausschließlich See.
- Schwerpunkt ausschließlich Uferangeln.
- Drei Spot-Typen: Krautkante, Flachwasserzone und Tiefenkante.
- Fünf Ködertypen: Jig, Ned Rig, Drop Shot, Twitchbait und Spinner.
- Manuelle Eingaben für Jahreszeit, Tageszeit, Trübung, Tiefe, Wassertemperaturklasse, Licht, Aktivitätsanzeichen, Krautbild und weitere sichtbare Struktur.
- Drei fachlich priorisierte Empfehlungen mit Spot, Köder, Größe, Gewicht, Montage, Führung, Begründungen und Wechselstrategie.
- Getrennte Anzeigen für Eingabeabdeckung und Regel-Evidenz.
- Lokaler persönlicher Köderbestand mit bester vorhandener und bester fehlender Option.
- Farbfamilie, vier generische Farbbeispiele und situationsbezogene Farbbegründung pro Empfehlung.
- Heißwasserhinweis ohne Behauptung nicht gemessener Sauerstoffwerte.
- PWA-Manifest, Service Worker und Offline-Precache.

Nicht enthalten:

- Fluss, Kanal, Boot oder weitere Fischarten.
- Sessionhistorie, Biss-/Fangfeedback oder automatische Fortschaltung der Wechselstrategie.
- Wetter-, GPS-, Karten-, Tiefenkarten- oder sonstige externe APIs.
- Backend, Konto, Cloud-Synchronisation oder automatische Regelanpassung.

## 2. Verbindliche fachliche Entscheidungen

Diese Entscheidungen dürfen nicht beiläufig geändert werden:

1. Die Engine berechnet zuerst das vollständige fachliche Ranking. Der persönliche Bestand wird ausschließlich danach projiziert und darf Scores oder Reihenfolge niemals verändern.
2. Unbekannte Angaben sind neutral und erzeugen keinen fachlichen Malus. Sie reduzieren nur die Eingabeabdeckung.
3. Temperatur hat Vorrang vor dem Kalender-Fallback. Saison und Temperatur liegen in derselben begrenzten Regelgruppe, damit sie nicht doppelt dominieren.
4. Korrelierte Regelbeiträge werden je Kandidat und Regelgruppe begrenzt. Standard-Cap ist `−12…+12`; direkte Habitat- und Aktivitätsbeobachtungen dürfen bis `+20` beitragen.
5. Evidenzklassen werden unterschiedlich gewichtet: Wissenschaft `1,0`, Erfahrungswissen `0,75`, schwache Regeln höchstens `0,35`. Direkte Beobachtungen verwenden `0,95` Konfidenz.
6. Eingabeabdeckung und Evidenzgüte sind getrennte Werte und keine Fangwahrscheinlichkeiten.
7. Direkte Beobachtungen wie Kleinfisch oder jagende Barsche dürfen Modellannahmen überstimmen.
8. Die Wechselstrategie ändert zunächst Winkel/Horizont, danach den Präsentationsstil und erst dann den Spot. Reine Farbrotation ist nicht der erste Wechsel.
9. Farbe bleibt eine nachgelagerte Präsentationshilfe. Farbbeispiele erzeugen keine Punkte und verändern das Ranking nicht.
10. Bei Farbe werden generische Beispiele verwendet, keine Marken oder konkreten Produkte. Fluoreszenz erhält keinen pauschalen Bonus.
11. Das Research-Archiv ist Referenzmaterial und keine Laufzeitkonfiguration. Produktive Regeln werden einzeln kuratiert und getestet.
12. Sehr warmes Wasser löst einen Vorsichtshinweis aus; ohne Sauerstoffmessung wird keine sichere Wasserschicht behauptet.

## 3. Datenmodell und Engine

Zentrale Typen stehen in `src/domain/models/types.ts`.

Wassertemperaturklassen:

- `cold`: bis 8 °C
- `cool`: 9–12 °C
- `mild`: 13–18 °C
- `warm`: 19–23 °C
- `hot`: über 23 °C
- `unknown`

Produktive Regeln stehen ausschließlich in `src/domain/rules/perchLakeRules.ts`. Jede neue Regel benötigt:

- stabile ID
- optionale Research-Regel-ID
- Zielbereich Spot oder Setup
- Regelgruppe
- Evidenzklasse und Konfidenz
- Effektstärke
- Reason Code
- Quellen-IDs
- typisiertes Prädikat
- mindestens ein fachliches Testszenario

Die generische Pipeline in `src/domain/engine/scoring.ts`:

1. ermittelt passende Regeln,
2. berechnet evidenzgewichtete Rohbeiträge,
3. begrenzt Beiträge pro Gruppe,
4. bewertet Spots und Setups getrennt,
5. kombiniert und sortiert Kandidaten deterministisch,
6. erzeugt Begründungen, Konfidenzen und Wechselplan,
7. wendet erst anschließend den persönlichen Bestand an.

Die Farbdarstellung liegt getrennt in `src/domain/engine/colorGuidance.ts`. Sie darf nicht in die Regelpipeline verschoben werden, solange keine neue fachliche Entscheidung getroffen wurde.

## 4. Benutzerablauf

1. Startseite → „Session starten“.
2. Nutzer erfasst die See-Situation über Chips; Barsch und See sind fest eingestellt.
3. Ergebnis zeigt zunächst beste vorhandene und beste fehlende Option.
4. Darunter erscheinen die unveränderten fachlichen Top 3.
5. Jede Karte enthält Datenlage, Evidenz, Größe, Gewicht, Farbe, Montage, Führung, Gründe und drei Wechselphasen.
6. Der Bestand wird unter `/bestand` lokal in `localStorage` gespeichert.

Die Bedingungen selbst werden nur als React-Router-State an `/empfehlung` übergeben. Es existiert noch keine Sessionpersistenz oder Datenmigration dafür.

## 5. Wichtige Dateien

- `README.md`: kurze Projektübersicht und Entwicklungsbefehle.
- `src/domain/models/types.ts`: fachliche Typen und Ergebnisverträge.
- `src/domain/rules/perchLakeRules.ts`: aktive, kuratierte Regeln und Regelgruppen.
- `src/domain/engine/scoring.ts`: generische Scoring-, Konfidenz- und Bestandslogik.
- `src/domain/engine/colorGuidance.ts`: Farbfamilien, Beispiele und Farbbegründungen.
- `src/domain/engine/explanations.ts`: deutsche Reason-Code-Texte.
- `src/domain/catalogs/spots.ts`: drei Spot-Typen.
- `src/domain/catalogs/lures.ts`: fünf Ködertypen.
- `src/features/situation/SituationPage.tsx`: mobile Eingabemaske.
- `src/features/recommendations/RecommendationPage.tsx`: Ergebnisdarstellung.
- `src/features/inventory/`: lokaler Bestand.
- `src/test/scenarios/goldenScenarios.test.ts`: 24 Golden-Szenarien und Invarianten.
- `docs/recherche-audit.md`: Bewertung der recherchierten Wissensgrundlage.
- `docs/meilenstein-fachliche-praezisierung.md`: dokumentierter Fachmeilenstein.
- `research/perch/v1.0.0/`: vollständiges, nicht produktives Wissensarchiv.
- `scripts/validate-research.mjs`: Strukturvalidator für das Research-JSON.

## 6. Quellen und Herkunft

Der separate Research-Lauf lieferte:

- `research/perch/v1.0.0/barsch_regelwerk.json`: 53 Regeln, 32 Referenzszenarien und 23 Quellen.
- `research/perch/v1.0.0/barsch_wissensgrundlage.md`: lesbare Wissensgrundlage.
- `research/perch/v1.0.0/README.md`: Herkunft, Prüfsummen, Status und Verwendungsregeln.

Wichtige produktiv referenzierte Quellen sind unter anderem Westrelin et al. zur Habitatnutzung, Jacobsen et al. zu Aktivität und Nahrung sowie Eklöv zur Habitatkomplexität. Die konkreten Quellen-IDs und URLs stehen in `src/domain/rules/perchLakeRules.ts`; der vollständige Quellenkatalog steht im Research-JSON.

Die 2026 referenzierte Studie zu fluoreszierenden Ködern konnte beim Audit technisch nicht direkt abgerufen werden. Deshalb wurde daraus keine produktive Bonusregel abgeleitet. Diese Unsicherheit darf nicht stillschweigend als geklärt markiert werden.

## 7. Prüfstatus

Zuletzt erfolgreich geprüft nach Commit `9f56af6`:

- TypeScript: erfolgreich.
- 36 automatisierte Tests: erfolgreich.
- Davon 24 fachliche See-/Ufer-Golden-Szenarien.
- Produktions- und PWA-Build: erfolgreich.
- Research-Validator: 53 Regeln, 32 Szenarien und 23 Quellen valide.
- Research-Archiv nicht im Produktions-Bundle.
- Keine externen Laufzeitaufrufe im Produktcode.
- Lokaler HTTP-Smoke-Test: `200 OK`.

Standardbefehle:

```bash
pnpm dev
pnpm test
pnpm build
pnpm research:validate
```

Auf der zuletzt verwendeten Codex-Umgebung war kein systemweites Node vorhanden. Die gebündelten Pfade waren:

```bash
PATH=/Users/chriz/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH \
/Users/chriz/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm dev
```

## 8. Git-Historie und Checkpoints

- `ecdd959`: initialer Checkpoint.
- `1519286`: erster See-/Barsch-Vertikalschnitt.
- `5f34f61`: erste Kalibrierung aus der Recherche.
- `becaa5b`: vollständiges Research-Archiv; Tag `checkpoint-before-professional-rules-becaa5b`.
- `7177b50`: fachliche Präzisierung mit deklarativen Regeln und neuen Eingaben.
- `9f56af6`: verbesserte Farbanzeige ohne Rankingeinfluss.

Vor größeren Änderungen soll erneut ein Git-Checkpoint erstellt werden. Änderungen an Fachregeln und Research-Archiv sollten getrennte Commits bleiben.

## 9. Offene Fragen

Noch nicht entschieden oder nachgewiesen:

- Fachliche Freigabe der Regeln durch einen erfahrenen Barschangler.
- Ergebnisse eines realen Feldtests am Wasser.
- Ob und wann weitere Spot-, Köder- oder Gewässertypen produktiv aktiviert werden.
- Genaues Datenmodell für Sessions, Versuchsschritte und Feedback.
- Ob Sessiondaten exportiert oder nur lokal gespeichert werden sollen.
- Hostinganbieter und Deploymentprozess.
- Native Verpackung mit Capacitor oder einer anderen Lösung.
- Separate manuelle Abnahme auf aktuellem iOS Safari und Android Chromium.
- Barrierefreiheitsprüfung mit realem Screenreader.

## 10. Empfohlene nächste Schritte

### Unmittelbar

1. Aktuellen Ablauf auf einem mobilen Viewport manuell testen.
2. Die fünf Referenzsituationen Winter/tief, Sommer/Jagd, klar/hell, trüb und dichtes Kraut fachlich prüfen.
3. Verständlichkeit von Farbe, Datenlage, Evidenz und Wechselstrategie mit mindestens einer fachkundigen Testperson bewerten.
4. Beobachtete Probleme dokumentieren, ohne Regeln anhand einzelner Eindrücke automatisch umzubauen.

### Nächster größerer Planungsmeilenstein

Ein lokales Session- und Feedbacksystem ist der derzeit empfohlene nächste Kandidat:

- Session starten und aktiven Versuch markieren.
- Biss, Fang oder kein Erfolg erfassen.
- Bestehenden Dreiphasenplan kontrolliert fortschalten.
- Ergebnis und Feedback lokal speichern.
- Keine automatische Änderung globaler Regelgewichte.

Vor der Implementierung ist ein neuer `/plan` erforderlich, weil Persistenzschema, Zustandsautomat, UI-Ablauf und Migrationen gemeinsam festgelegt werden müssen. Erst nach Freigabe dieses Plans sollte ein neues `/goal` mit konkreten Abnahmekriterien gestartet werden.

## 11. Startprompt für einen neuen Codex-Chat

```text
Arbeite am Projekt Angelkompass im aktuellen Repository weiter. Lies zuerst PROJECT_CHECKPOINT.md vollständig und prüfe anschließend Git-Status, README.md, docs/meilenstein-fachliche-praezisierung.md sowie die produktiven Regeln unter src/domain/rules/perchLakeRules.ts. Behandle research/perch/v1.0.0 ausschließlich als nicht produktives Referenzarchiv. Verändere keine Fachregeln oder den vereinbarten Scope ohne ausdrückliche Freigabe. Der persönliche Bestand darf das fachliche Ranking niemals beeinflussen. Führe vor Änderungen die zum Auftrag passenden bestehenden Tests aus und erstelle vor größeren Änderungen einen Git-Checkpoint.
```
