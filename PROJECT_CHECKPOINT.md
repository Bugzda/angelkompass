# Projekt-Checkpoint Angelkompass

Stand: 12. Juli 2026  
Ausgangsreferenz der Ködererweiterung: `4034cf7` (`main`)
Aktueller Hauptstand: `07d34af` (`main` und `codex/fachdata-2`, GitHub-Pages-Deployment ausgelöst)
Produktstatus: veröffentlichte, installierbare See-/Ufer-PWA für Barsch und Hecht mit Sessionprotokoll

Dieses Dokument ist der Einstiegspunkt für einen neuen Codex-Chat. Es beschreibt ausschließlich den vorhandenen Projektstand; es erweitert oder verändert keine Fachregeln.

## 1. Ziel und aktueller Umfang

Angelkompass ist eine mobile React-/TypeScript-PWA, die für das Uferangeln auf Barsch oder Hecht an einem See deterministische Empfehlungen erzeugt.

Aktuell enthalten:

- Zielfisch Barsch oder Hecht; Auswahl vor jeder neuen Session.
- Gewässer ausschließlich See.
- Schwerpunkt ausschließlich Uferangeln.
- Drei Spot-Typen: Krautkante, Flachwasserzone und Tiefenkante.
- Zehn aktive Barsch-Ködertypen ohne Drop Shot; der zusätzliche Spinnertail bleibt Teil des erweiterten Katalogs.
- Hechtprofil mit vier Spots: Schilf-/Krautkante, Flachwasser/Bucht, Tiefenübergang und harte Deckung.
- Hechtprofil mit neun Ködertypen: Gummifisch, Jerkbait, Crankbait, Spinnerbait, Blinker, Spinner, Swimbait, Topwater und Tailbait.
- Manuelle Eingaben für Jahreszeit, Tageszeit, Trübung, Tiefe, Wassertemperaturklasse, Licht, Aktivitätsanzeichen, Krautbild und weitere sichtbare Struktur.
- Vollständiges fachliches Ranking, aus dem höchstens drei tatsächlich vorhandene, tiefenkompatible und startbare Empfehlungen abgeleitet werden.
- Getrennte Anzeigen für Eingabeabdeckung und Regel-Evidenz.
- Lokaler persönlicher Köderbestand mit Größenklassen Klein/Mittel/Groß; fehlende Köder werden niemals in die startbare Hauptliste gemischt.
- Höchstens eine fachlich interessante, aber fehlende Köderoption und nicht bestätigte Spots erscheinen separat als optionale Hinweise.
- Ist die bevorzugte Größe nicht vorhanden, wird transparent die nächstgelegene vorhandene Größe verwendet und Montage, Gewicht sowie Führung dafür neu aufgelöst.
- Separater Button „Alle Größen“ je Köder; markiert oder entfernt alle drei Größen gesammelt.
- Farbfamilie, vier generische Farbbeispiele und situationsbezogene Farbbegründung pro Empfehlung.
- Heißwasserhinweis ohne Behauptung nicht gemessener Sauerstoffwerte.
- PWA-Manifest, Service Worker und Offline-Precache.
- Lokale Sessionhistorie mit gewähltem Empfehlungssnapshot, Biss-/Fangfeedback und kontrollierter Fortschaltung des Dreiphasenplans.
- Hecht-Sicherheitsgate vor der Berechnung: hechtsicheres Vorfach, Kescher, Lösezange/Abhakmöglichkeit und lokale Regeln bestätigen.
- Kontrollierte PWA-Aktualisierung mit sichtbarem Hinweis; während einer aktiven Session wird niemals ungefragt neu geladen.
- GitHub-Pages-Routingfallback für direkte Aufrufe und Neuladen verschachtelter Routen.

Nicht enthalten:

- Fluss, Kanal, Boot oder weitere Fischarten außer Barsch und Hecht.
- Export, Cloud-Synchronisation oder automatische fachliche Auswertung des Sessionfeedbacks.
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
13. Physikalisch ungeeignete Köder werden auch zum Auffüllen einer unvollständigen Top-Liste nicht verwendet. Weniger als drei echte Bestandsoptionen bleiben bewusst weniger als drei.
14. Eine vorhandene Nachbargröße ist als transparenter Kompromiss erlaubt; die bevorzugte Reihenfolge lautet für `medium`: small, large; für `small`: medium, large; für `large`: medium, small.

## 3. Datenmodell und Engine

Zentrale Typen stehen in `src/domain/models/types.ts`.

Wassertemperaturklassen:

- `cold`: bis 8 °C
- `cool`: 9–12 °C
- `mild`: 13–18 °C
- `warm`: 19–23 °C
- `hot`: über 23 °C
- `unknown`

Produktive Regeln stehen in den artspezifischen Regeldateien `src/domain/rules/perchLakeRules.ts` und `src/domain/rules/pikeLakeRules.ts`. Die gemeinsame Pipeline bezieht sie über `src/domain/species/profiles.ts`. Jede neue Regel benötigt:

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

Artenprofile liefern je Fischart Kataloge, Spots, Regeln, Regelversion und fachliche Metadaten. Barsch nutzt `perch-lake-2.0.0`; Hecht nutzt `pike-lake-2.0.0`. Bestand, Sicherheitsbestätigung und die materialgerechte Farbhilfe verändern niemals das Fachranking.

Für die fünf zusätzlichen Suchköder gelten folgende harte Grenzen: Popper ist nur im Flachwasser kompatibel; Blade Bait nur in mittlerer und tiefer Zone. Crankbait, Chatterbait und Spinnerbait sind für flache und mittlere Tiefe katalogisiert. Spinner und Spinnerbait bleiben eigenständige Typen.

Für Hecht gilt: Topwater ist nur im flachen, warmen Aktivitätsfenster fachlich begünstigt; harte Deckung und Vegetationskanten sind getrennte Uferspots. Hecht-Köderprofile verwenden medium/large als produktive Größenbereiche und verlangen ein hechtsicheres Vorfach in der Montagebeschreibung.

## 4. Benutzerablauf

1. Startseite → „Session starten“.
2. Nutzer wählt Barsch oder Hecht.
3. Nutzer erfasst die artspezifische See-Situation über Chips; bei Hecht muss zusätzlich die Sicherheitsbestätigung gesetzt werden.
4. Ergebnis zeigt maximal drei tiefenkompatible Köder aus dem persönlichen Bestand; vorhandene Nachbargrößen dürfen transparent als Kompromiss verwendet werden.
5. Die beste fehlende Option und nicht bestätigte Spots erscheinen ausschließlich als separate optionale Hinweise.
6. Jede Karte enthält Datenlage, Evidenz, Größe, Gewicht, Farbe, Montage, Führung, Gründe und drei Wechselphasen.
7. Der Bestand wird unter `/bestand` artspezifisch in `angelkompass.inventory.v3` lokal gespeichert; v1/v2-Einträge werden verlustarm übernommen und bis zur Größenprüfung markiert. Alte Schlüssel bleiben erhalten.

Ohne passende Bestandsoption zeigt die Ergebnisansicht eine klare Bestandsmeldung statt einer falschen Empfehlung. Eine optionale fehlende Köderergänzung ist nicht startbar. Wenn der Nutzer ausdrücklich bestätigt, dass keine Struktur vorhanden ist, wird kein spekulativer Spot-Tipp angezeigt.

Die Bedingungen werden zur Berechnung als React-Router-State an `/empfehlung` übergeben. Erst nach bewusster Auswahl einer vorhandenen Empfehlung werden Bedingungen und Empfehlung einschließlich der aufgelösten Präsentation als unveränderlicher Session-Snapshot lokal gespeichert. Neue Hecht-Sessions enthalten `pikeSafetyConfirmed: true` und `pike-lake-2.0.0`; alte v1-Snapshots bleiben lesbar, verwenden ihre gespeicherten Montage-/Führungstexte und werden nicht neu berechnet. Es darf nur eine aktive Session geben; abgeschlossene Sessions stehen unter `/verlauf` bereit.

## 5. Wichtige Dateien

- `README.md`: kurze Projektübersicht und Entwicklungsbefehle.
- `src/domain/models/types.ts`: fachliche Typen und Ergebnisverträge.
- `src/domain/rules/perchLakeRules.ts`: aktive, kuratierte Regeln und Regelgruppen.
- `src/domain/rules/pikeLakeRules.ts`: aktive Hecht-Regeln und Quellenmetadaten.
- `src/domain/species/profiles.ts`: Artenprofile und getrennte Regel-/Katalogauswahl.
- `src/domain/engine/scoring.ts`: generische Scoring-, Konfidenz- und Bestandslogik.
- `src/domain/engine/colorGuidance.ts`: Farbfamilien, Beispiele und Farbbegründungen.
- `src/domain/engine/explanations.ts`: deutsche Reason-Code-Texte.
- `src/domain/catalogs/spots.ts`: drei Spot-Typen.
- `src/domain/catalogs/lures.ts`: zehn Ködertypen.
- `src/domain/catalogs/pikeLures.ts` und `src/domain/catalogs/pikeSpots.ts`: Hecht-Kataloge.
- `src/features/sessions/`: versionierte Persistenz, Zustandsautomat, aktive Session und Verlauf.
- `src/features/situation/SituationPage.tsx`: mobile Eingabemaske.
- `src/features/situation/SpeciesPage.tsx`: Fischart-Auswahl vor der Eingabemaske.
- `src/features/recommendations/RecommendationPage.tsx`: Ergebnisdarstellung.
- `src/features/inventory/`: lokaler Bestand.
- `src/test/scenarios/goldenScenarios.test.ts`: 24 Golden-Szenarien und Invarianten.
- `docs/recherche-audit.md`: Bewertung der recherchierten Wissensgrundlage.
- `docs/meilenstein-fachliche-praezisierung.md`: dokumentierter Fachmeilenstein.
- `research/perch/v1.0.0/`: vollständiges, nicht produktives Wissensarchiv.
- `scripts/validate-research.mjs`: Strukturvalidator für das Research-JSON.
- `scripts/validate-routing.mjs`: prüft den GitHub-Pages-Fallback für direkte Routen.
- `public/404.html` und `index.html`: erhalten und restaurieren direkte SPA-Routen auf GitHub Pages.
- `docs/hecht-research-v1.0.0.md`: Hecht-Quellen, Ableitungen und Regelgrenzen.

## 6. Quellen und Herkunft

Der separate Research-Lauf lieferte:

- `research/perch/v1.0.0/barsch_regelwerk.json`: 53 Regeln, 32 Referenzszenarien und 23 Quellen.
- `research/perch/v1.0.0/barsch_wissensgrundlage.md`: lesbare Wissensgrundlage.
- `research/perch/v1.0.0/README.md`: Herkunft, Prüfsummen, Status und Verwendungsregeln.

Wichtige produktiv referenzierte Quellen sind unter anderem Westrelin et al. zur Habitatnutzung, Jacobsen et al. zu Aktivität und Nahrung sowie Eklöv zur Habitatkomplexität. Die konkreten Quellen-IDs und URLs stehen in `src/domain/rules/perchLakeRules.ts`; der vollständige Quellenkatalog steht im Research-JSON.

Das Hecht-Research v1.0.0 ist in `docs/hecht-research-v1.0.0.md` dokumentiert. Produktiv referenziert werden Studien zu Schilf-/Submersvegetation und Hechthabitat, habitatspezifischer Entwicklung im See sowie temperaturabhängiger Prädation. Köderführung und Hängerrisiko sind als Erfahrungswissen niedriger gewichtet.

Die 2026 referenzierte Studie zu fluoreszierenden Ködern konnte beim Audit technisch nicht direkt abgerufen werden. Deshalb wurde daraus keine produktive Bonusregel abgeleitet. Diese Unsicherheit darf nicht stillschweigend als geklärt markiert werden.

## 7. Prüfstatus

Zuletzt vollständig erfolgreich geprüft vor Commit `07d34af` und anschließend unverändert auf `main` gepusht:

- TypeScript: erfolgreich.
- 179 automatisierte Tests in 11 Testdateien: erfolgreich.
- Darunter Bestandsmatrizen für Barsch und Hecht, Größenkompromisse, neutrale Wasserbereiche sowie Session-, Persistenz-, Migrations- und UI-Ablauftests.
- Produktions- und PWA-Build: erfolgreich.
- Research-Validator für das Barsch-Archiv: 53 Regeln, 32 Szenarien und 23 Quellen valide.
- Produktives Quellenregister: 20 Quellen; alle Regelreferenzen aufgelöst.
- Routing-Validator für den GitHub-Pages-Fallback: erfolgreich.
- Research-Archiv nicht im Produktions-Bundle.
- Produktions-JavaScript nach Altlastenbereinigung: 395,17 kB beziehungsweise 120,16 kB gzip; rund 7 kB roh und 2,6 kB gzip kleiner als zuvor.
- Keine externen Laufzeitaufrufe im Produktcode.
- Frühere öffentliche GitHub-Pages-Smoke-Tests waren erfolgreich; das Deployment von `07d34af` wurde durch den Push auf `main` ausgelöst, aber in diesem Arbeitsschritt nicht nochmals im Browser abgenommen.
- Öffentlicher Bestand-Smoke-Test: 13 Köderkarten und Button „Alle Größen“ im Release enthalten.
- PWA-Updateverhalten: `registerType: 'prompt'`; neue Versionen werden sichtbar angeboten und erst nach bewusster Bestätigung aktiviert.

Standardbefehle:

```bash
pnpm dev
pnpm test
pnpm build
pnpm research:validate
pnpm routing:validate
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
- `4034cf7`: dokumentarischer Projekt-Übergabecheckpoint und Ausgangspunkt der Ködererweiterung.
- `daf01b5`: Hecht-MVP in `main` übernommen; Fischartprofile, Hecht-Regeln, Bestand v2 und Sicherheitsgate veröffentlicht.
- `82061a5`: Scroll-Fix; Berechnungsbutton bleibt im Seitenfluss, nur die Hauptnavigation ist fixiert.
- `a9b23c5`: PWA-Service-Worker auf automatische Aktualisierung umgestellt.
- `7c8b599`: Button „Alle Größen“ je Köder veröffentlicht.
- `cbd0fae`: praktische Empfehlungen klar vom theoretischen Ranking getrennt.
- `b607b87`: Empfehlungen ohne bestätigte Struktur über einen neutralen Wasserbereich abgesichert.
- `ef51cdb`: sichtbare Top-Liste konsequent auf tatsächlich vorhandene Köder und Größen beschränkt.
- `07d34af`: Bestands- und Spot-Hinweise korrigiert, Sessionspeicher validiert, GitHub-Pages-Routing abgesichert und alte Laufzeitreste entfernt.

Vor größeren Änderungen soll erneut ein Git-Checkpoint erstellt werden. Änderungen an Fachregeln und Research-Archiv sollten getrennte Commits bleiben.

## 9. Offene Fragen

Noch nicht entschieden oder nachgewiesen:

- Fachliche Freigabe der Regeln durch einen erfahrenen Barschangler.
- Ergebnisse eines realen Feldtests am Wasser.
- Ob und wann weitere Spot-, Köder- oder Gewässertypen produktiv aktiviert werden.
- Ob Sessiondaten künftig zusätzlich exportiert werden sollen.
- Native Verpackung mit Capacitor oder einer anderen Lösung.
- Separate manuelle Abnahme auf aktuellem iOS Safari und Android Chromium.
- Barrierefreiheitsprüfung mit realem Screenreader.
- Fachliche Freigabe des Hecht-Regelwerks durch einen erfahrenen Hechtangler.

## 10. Empfohlene nächste Schritte

### Unmittelbar

1. Prüfen, ob das GitHub-Pages-Deployment für `07d34af` erfolgreich abgeschlossen ist, und direkte Aufrufe von `/neu`, `/bestand`, `/verlauf` sowie einer Sessionroute testen.
2. Die öffentliche App auf iOS Safari und Android Chromium mit Fischartwahl, artspezifischem Bestand v3, Beständen mit 0–3 Ködern, Größenkompromissen und Sessionverlauf manuell testen.
3. Besonders den zuvor gemeldeten warmen, trüben, tiefen Barschfall ohne Fischsichtung prüfen: vorhandener Jig muss als startbare Option erscheinen; fehlende Köder nur optional.
4. Die Hecht-Referenzsituationen fachlich mit einem erfahrenen Hechtangler prüfen.
5. Verständlichkeit von Größenkompromiss, optionaler Ergänzung, Sicherheitsgate, Farbe, Datenlage, Evidenz und Wechselstrategie bewerten.
6. Beobachtete Probleme dokumentieren, ohne Regeln anhand einzelner Eindrücke automatisch umzubauen.

### Nächster größerer Planungsmeilenstein

Nach technischer und fachlicher Abnahme des Sessionprotokolls sollte entschieden werden, ob ein lokaler Datenexport sinnvoll ist. Eine automatische Anpassung fachlicher Regelgewichte bleibt ausdrücklich außerhalb des Umfangs.

## 11. Startprompt für einen neuen Codex-Chat

```text
Arbeite am Projekt Angelkompass im aktuellen Repository ab Commit 07d34af weiter. Lies zuerst PROJECT_CHECKPOINT.md vollständig und prüfe anschließend Git-Status, README.md, docs/meilenstein-fachliche-praezisierung.md, docs/hecht-research-v1.0.0.md sowie die produktiven Regeln unter src/domain/rules/perchLakeRules.ts und src/domain/rules/pikeLakeRules.ts. Prüfe zuerst den Status des GitHub-Pages-Deployments und die direkten SPA-Routen. Behandle research/perch/v1.0.0 ausschließlich als nicht produktives Referenzarchiv. Verändere keine Fachregeln, Artenprofile oder den vereinbarten Scope ohne ausdrückliche Freigabe. Der persönliche Bestand darf das fachliche Ranking niemals beeinflussen; die sichtbare Hauptliste darf nur tatsächlich vorhandene, tiefenkompatible und startbare Köder enthalten. Fehlende Köder und nicht bestätigte Spots bleiben optionale, nicht startbare Hinweise. Führe vor Änderungen die zum Auftrag passenden bestehenden Tests aus und erstelle vor größeren Änderungen einen Git-Checkpoint.
```
