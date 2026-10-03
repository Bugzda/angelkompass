# UX-Modernisierung · 3. Oktober 2026

Ausgangsstand: `main` bei `dfa28ac`. Umgesetzt wurden alle Punkte aus dem App-Review vom selben Tag: kleine Verbesserungen, Funktionen für die Nutzung am Wasser, gespeicherte Angelstellen, Auswertung im Logbuch, optische Modernisierung und technisches Aufräumen. Fachregeln, Regelgewichte, Ranking und bestehende Empfehlungssnapshots bleiben unverändert.

## Oberfläche

- **App-Rahmen:** Die Verbindungsleiste erscheint nur noch offline. „Offline bereit“ wird einmalig als Toast angezeigt (`angelkompass.offline-announced.v1`). Die Auswahl des Farbschemas ist ein Symbolknopf über einem unsichtbaren nativen Select; Tastatur- und Screenreader-Bedienung bleiben erhalten.
- **Startseite dunkel:** Im dunklen Farbschema zeigt der Hero eine abgedunkelte Nachtvariante statt des hellen Morgennebels.
- **Bedingungen:** Felder mit einer Auswahl sind gleich breite Segmente, Trübung, Tiefe, Kraut und Licht zusätzlich mit Symbolen. „Unbekannt“ bleibt eine gleichwertige, gestrichelte Option. Die Feldbeschriftungen sind unverändert.
- **Empfehlung:** Die Bedingungen erscheinen als Chips. Ein Tipp öffnet das passende Feld auf der Bedingungsseite (`/neu/:fish#turbidity`). Größe, Gewicht und Typ stehen immer in derselben Reihenfolge als Kacheln. Bei der fehlenden Ergänzung wird kein interner Punktwert mehr angezeigt.
- **Köderbox:** Pro Köder gibt es eine Zeile mit zweizeiligen Größenknöpfen und einen Zähler (z. B. 2/3). Die Auswahl wird ruhig hervorgehoben statt vollflächig in Lime. Filter und Suche bleiben beim Scrollen sichtbar. Bereits vorhandene Köder stehen oben; die Reihenfolge bleibt während eines Besuchs fest, damit Karten beim Antippen nicht springen.
- **Bewegung:** Seitenwechsel nutzen die View Transitions API, Kopfzeile und Navigation bleiben dabei stehen. Dazu kommen gedrückte Zustände für Touch-Ziele, kurze Zähleranimationen nur bei Änderungen, eingeblendete Bilder und ein Lade-Platzhalter beim Wetterabruf. Bei `prefers-reduced-motion` ist alles abgeschaltet.
- **Logbuch-Export:** Der reine Logbuch-Export liegt jetzt auf der Seite Datensicherung („Nur Logbuch exportieren“) statt doppelt im Logbuch.

## Am Wasser

- **Bildschirm an:** Solange die Am-Wasser-Karte geöffnet ist, wird per Wake Lock API verhindert, dass sich der Bildschirm abschaltet. Nach Rückkehr in die App wird der Wake Lock erneut angefordert. Ohne Unterstützung erscheint ein Hinweis.
- **Schrittuhr:** Zeigt die Zeit im aktuellen Schritt. Beginn ist der Sessionstart bzw. der letzte Wechsel „Ohne Kontakt“; „Neu starten“ gilt nur für den aktuellen Schritt (`angelkompass.step-clock.v1`). Nennt der Schritt Minuten (derzeit Schritt 1: 10–15 Minuten), gibt es einmalig eine Erinnerung mit Vibration. Der Plan schaltet nie automatisch weiter.
- **Vibration:** Kurze Rückmeldung bei Biss, Fang und Wechsel. Sie wird vor der ersten Nutzerinteraktion nicht ausgelöst. iOS Safari unterstützt keine Vibration.
- **Große Tasten:** Optionaler Modus mit großen Rückmeldeflächen.
- **Einstellungen** (`angelkompass.water-preferences.v1`): Bildschirm an (Standard an), Vibration (an), große Tasten (aus).
- **Fang-Details:** Nach Biss oder Fang öffnet sich ein optionales Bottom-Sheet: Länge in cm (nur beim Fang, 1–200) und Notiz (bis 280 Zeichen). Auf der Sessionseite lassen sich Details später ergänzen oder bearbeiten.

## Angelstellen

- Gemerkt werden Trübung, Tiefe, Kraut und Struktur (`angelkompass.spots.v1`, Schema 1). Zeit, Licht, Temperatur und Aktivität werden jedes Mal neu erfasst.
- Die Auswahl einer Stelle füllt nur diese Merkmale vor. Harte Deckung wird seit der Datenbankprüfung vom 3. Oktober 2026 auch beim Barsch übernommen.
- Nach Änderungen kann die gewählte Stelle aktualisiert werden. Löschen erfolgt über „Angelstellen verwalten“ mit Bestätigung in der App.
- Die Stelle wird als `spotRef` neben den Bedingungen durch den Planungsablauf gereicht. Engine und gespeicherte Bedingungen sehen diesen Wert nie (`conditionsOnly`). Neue Sessions speichern eine Namenskopie (`session.spot`); spätere Umbenennungen oder Löschungen ändern alte Sessions nicht.

## Auswertung im Logbuch

„Deine Auswertung“ zeigt Sessions, Bisse und Fänge nach Köder, Angelstelle, Wassertrübung und Tageszeit sowie den längsten Fang. Kontakte zählen für den Köder, der im jeweiligen Wechselschritt tatsächlich verwendet wurde. Die Auswertung ist rein beschreibend und verändert weder Ranking noch Regelgewichte. Die Oberfläche weist darauf hin, dass wenige Sessions keinen Beleg darstellen.

## Wetter

Der Abruf zeigt zusätzlich Windrichtung und die Luftdrucktendenz der letzten drei Stunden (steigend, fallend oder gleichbleibend bei ±1 hPa). Beides dient nur der Information und fließt nicht in die Empfehlung ein. Zusätzliche Open-Meteo-Parameter: `wind_direction_10m`, `pressure_msl`, stündlich `pressure_msl` mit `past_hours=4`.

## Daten und Kompatibilität

| Bereich | Änderung | Kompatibilität |
| --- | --- | --- |
| Sessions v1 | optional `spot {id, name}`; Feedback optional `lengthCm`, `note` | Alte Einträge bleiben gültig, keine Neuberechnung. Ungültige Werte werden wie bisher als nicht lesbar erhalten. |
| Angelstellen v1 | neuer Schlüssel `angelkompass.spots.v1` | Ungültige Einträge bleiben erhalten (`retained`). |
| Vollsicherung | zusätzliches Feld `spots`, Originalspeicher inkl. Angelstellen | Ältere Sicherungen ohne `spots` werden gelesen. Lokale Stellen mit gleicher ID gewinnen. |
| Rücksicherungs-Journal | umfasst jetzt drei Speicherbereiche | Offene Journale aus älteren Versionen ohne Angelstellen werden nachgeholt; Angelstellen bleiben dann unberührt. |

UI-Einstellungen (`water-preferences`, `step-clock`, `offline-announced`) sind bewusst nicht Teil der Sicherung.

## PWA

- Manifest: dunkle `theme_color`/`background_color` (`#071413`), damit der Startbildschirm nicht weiß aufblitzt.
- App-Shortcuts: Aktiver Angelplan (`/aktiv` leitet zur laufenden Karte oder zu „Neuer Plan“), Neuer Angelplan, Köderbox, Logbuch.
- Drei schmale Installations-Screenshots unter `public/screenshots/` (JPEG, nicht im Offline-Cache).

## Technik

- Prettier (`pnpm format`, `pnpm format:check`) mit dem bisherigen Stil: ohne Semikolons, einfache Anführungszeichen, 120 Zeichen.
- CSS ist nach Bereichen gegliedert: `tokens`, `base`, `layout`, `components`, `home`, `planning`, `recommendation`, `inventory`, `sessions`, `data`, `motion`. Die früheren Override-Dateien (`refinements`, `journey`, `usability`, `pages`) sind aufgelöst. Dabei wurden 87 Selektoren für nicht mehr vorhandene Klassen entfernt. Vor neuen Stilen wurden die berechneten Styles aller Routen in Hell/Dunkel bei 390 und 1280 px verglichen: keine Abweichung.
- Aufgeteilte Komponenten: `RecommendationOption`, `ConditionSummary`, `ChoiceField`, `SpotPicker`, `SessionRow`, `LogbookInsights`, `LureCard`, `ThemeControl`, `ConnectionStatus`, `Toast`.

## Prüfungen

- `pnpm lint`, `pnpm test` (338 Tests in 25 Dateien), `pnpm build` inkl. PWA-Validierung und `pnpm routing:validate` erfolgreich.
- Neue Tests: `src/test/sessions/waterTools.test.tsx` (Schrittuhr, Fang-Details, Einstellungen) und `src/test/ux/spotsAndInsights.test.tsx` (Angelstellen im Ablauf, Sicherung und ältere Journale, Auswertung, Wetterinformationen).
- Mobiler Gesamtablauf im integrierten Browser auf eigenem lokalem Ursprung mit Wegwerfdaten: Köderbox, Plan mit neuer Angelstelle, Empfehlung, Karte, Biss, Wechsel, Fang mit Länge, Abschluss, Auswertung, Datensicherung. Zusätzlich Hell/Dunkel und Desktop geprüft.

## Offen

- Abnahme auf echten Geräten: Wake Lock (iOS Safari ab 16.4), Vibration (Android), View Transitions (Safari ab 18) und Darstellung des Bottom-Sheets mit eingeblendeter Tastatur.
- Die Erinnerung der Schrittuhr funktioniert nur bei geöffneter App; Push-Benachrichtigungen sind nicht umgesetzt.
