# Angelkompass

Zentrale Arbeitsanleitung für Coding-Agenten: [`AGENTS.md`](AGENTS.md)

Vollständiger Übergabestand für neue Chats: [`PROJECT_CHECKPOINT.md`](PROJECT_CHECKPOINT.md)

Mobile, lokal speichernde Entscheidungshilfe für das Uferangeln auf Barsch, Hecht und Zander am See.

Neu: [Datenabsicherung und Köderbox-Analyse](docs/datensicherung-und-koederanalyse-2026-10-03.md) mit Speicherschutz, Teilen der Sicherung, Sicherungserinnerung und einer Analyse, welche Ködergröße die eigene Box am meisten ergänzt.

Aktuelle Modernisierung: [`docs/ux-modernisierung-2026-10-03.md`](docs/ux-modernisierung-2026-10-03.md) mit Am-Wasser-Werkzeugen (Bildschirm an, Schrittuhr, Vibration, große Tasten, Fang-Details), gespeicherten Angelstellen, Auswertung im Logbuch, Seitenübergängen und neu gegliedertem CSS. Vorherige UI-/UX-Überarbeitung: [`docs/ux-fokus-2026-09-08.md`](docs/ux-fokus-2026-09-08.md). Kompakte Bedingungen und Köderbox, eindeutige Empfehlungskarten mit aufklappbaren Quellen, aktueller Handlungsschritt im Vordergrund und direkter Zugang zum aktiven Plan. Der [geführte Einstieg](docs/ux-angelplan-2026-09-05.md) umfasst auch Abschluss und Wiederholungsstart.

Aktuelles Code-, Daten- und UI-Review: [`docs/review-2026-09-07.md`](docs/review-2026-09-07.md). Frühere Prüfung: [`docs/review-2026-09-05.md`](docs/review-2026-09-05.md).

## Entwicklung

```bash
pnpm install
pnpm dev
```

Qualitätsprüfung: `pnpm lint`, `pnpm test` und `pnpm build`. Formatierung: `pnpm format` (Prettier; `pnpm format:check` prüft nur). Styles liegen nach Bereichen unter `src/ui/theme/` (Tokens, Basis, App-Rahmen, Komponenten, je Seite sowie `motion.css`). Der Build prüft zusätzlich den erzeugten Service Worker auf Startfehler, widersprüchliche Cacheeinträge und fehlende Offline-Dateien. Für einen vorhandenen Build: `pnpm pwa:validate`.

Die Fachlogik liegt unabhängig von React unter `src/domain`. Das Barschprofil umfasst drei Spot-Typen und zehn Ködertypen, das Hechtprofil vier Spot-Typen und neun Ködertypen, das Zanderprofil vier Spot-Typen und vier Ködertypen. Das Zander-Regelwerk und seine Quellen sind in [`docs/zander-research-v1.0.0.md`](docs/zander-research-v1.0.0.md) dokumentiert. Optional ergänzt Open-Meteo aktuelle Wettervorschläge; es gibt kein Backend. `pnpm lint` prüft beide TypeScript-Projekte.

Die Engine berechnet zuerst eine unveränderte fachliche Rangfolge. Der lokal gespeicherte persönliche Bestand wird erst anschließend ausgewertet: Sichtbar und startbar sind maximal drei tiefenkompatible, vorhandene Köder; abweichende vorhandene Größen werden transparent als Kompromiss verwendet. Die beste fehlende Option erscheint separat als fachliche Ergänzung.

## Fachliche Eingaben

Jahreszeit und Tageszeit sind bei neuen Plänen automatisch aus der Gerätezeit vorausgewählt und bleiben änderbar. Die Tageszeit ist ohne Standort eine Näherung.

Neben Jahreszeit, Tageszeit, Trübung und Tiefe verarbeitet das See-MVP manuell gewählte Wassertemperaturklassen, Licht, beobachtete Aktivität und das Krautbild. Unbekannte Angaben bleiben neutral.

Bei unbekannter Tiefe wird für zusätzliche Beschwerung keine feste Grammzahl oder Flachwasser-Gewichtsklasse vorgegeben. Die Anleitung empfiehlt die leichteste kontrollierbare Beschwerung. Größenabhängige Ködergesamtgewichte bleiben davon unabhängig.

Produktive Regeln sind deklarativ nach Evidenzklasse und Ursache gruppiert. Gruppen-Caps verhindern, dass korrelierte Angaben wie Saison und Temperatur mehrfach dominieren. Jede Empfehlung weist Eingabeabdeckung und Evidenzgüte getrennt aus und enthält eine dreistufige Wechselstrategie.

Das vollständige Wissensarchiv unter `research/` bleibt Referenzmaterial und wird nicht zur Laufzeit geladen.

## Optionale Wetterübernahme

Auf der Bedingungsseite lassen sich über Standortfreigabe oder Ortssuche aktuelle Wetterdaten abrufen. Nach einer Vorschau ergänzt „Offene Angaben ergänzen“ unbekannte Tageszeit- und Lichtangaben. Windrichtung und Luftdrucktendenz werden nur zur Information angezeigt. Eigene Angaben bleiben erhalten und jederzeit änderbar. Lufttemperatur ersetzt keine Wassertemperatur. Ohne Netz bleibt die manuelle Eingabe verfügbar. Details und Grenzen: [`docs/wetteruebernahme.md`](docs/wetteruebernahme.md).

## Angelstellen

Auf der Bedingungsseite lassen sich Trübung, Tiefe, Kraut und Struktur als Angelstelle merken und später vorausfüllen. Zeit, Licht, Temperatur und Aktivität werden jedes Mal neu erfasst. Die gewählte Stelle läuft neben den Bedingungen durch den Ablauf, erreicht aber weder die Engine noch die gespeicherten Bedingungen. Neue Sessions speichern nur eine Kopie des Namens.

## Lokale Sessions

Eine der maximal drei vorhandenen Empfehlungen kann als aktive Session gespeichert werden. Biss und Fang werden protokolliert; „Kein Erfolg“ schaltet durch den dreistufigen Wechselplan. Sessions und Verlauf bleiben ausschließlich auf dem Gerät und verändern weder Ranking noch Regelgewichte. Details stehen in [`docs/meilenstein-session-feedback.md`](docs/meilenstein-session-feedback.md).

Neue Angelpläne speichern Köder, vorhandene Größe, Beschwerung oder Ködergewicht, Montage, Führung und Grundfarbe für jeden Wechselschritt. Der zweite Versuch verwendet einen passenden anderen Präsentationsstil aus den maximal drei vorhandenen Optionen; die bestehenden Sonderwechsel für Popper, Blade Bait, Spinnertail und Tailbait bleiben erhalten. Fehlt ein passender Gegenstil, wird die Variation mit dem Startköder ausdrücklich erklärt. Beim Spotwechsel bleibt die Montage des zweiten Versuchs erhalten. Die Am-Wasser-Karte zeigt die Angaben des aktuellen Schritts; ursprüngliche Startangaben sind später separat aufklappbar. Alte Sessions werden nicht neu berechnet. Fehlen gespeicherte Wechselschritt-Montagen, erklärt die Karte diese Grenze.

Nach dem letzten Wechselschritt bleibt die Session bis zum bewussten Abschluss aktiv. Bisse und Fänge können weiter erfasst und rückgängig gemacht werden; weitere Fortschaltungen sind gesperrt. Späte Rückmeldungen erscheinen in den Sessiondetails als „Nach dem Wechselplan“. Beim Rückgängigmachen eines späteren Bisses oder Fangs bleibt der Plan ausgeschöpft; erst die Rücknahme des letzten Wechsels führt zurück zu Schritt drei.

Die Am-Wasser-Karte hält den Bildschirm wach, solange sie geöffnet ist (abschaltbar). Sie zeigt die Zeit im aktuellen Schritt und erinnert einmalig mit Vibration, wenn die im Schritt geplanten Minuten erreicht sind. Der Plan schaltet nie automatisch weiter. Große Tasten sind optional. Nach Biss oder Fang können Länge (nur beim Fang) und Notiz ergänzt werden, auch später auf der Sessionseite.

Die letzte Rückmeldung einer aktiven Session lässt sich einschließlich des Phasenwechsels rückgängig machen. Das Logbuch bietet Filter nach Zielfisch, Biss-/Fangzähler und eine aufklappbare Auswertung nach Köder, Angelstelle, Trübung und Tageszeit. Sie ist rein beschreibend und verändert keine Empfehlungen. Der reine JSON-Export aller Session-Snapshots liegt unter Datensicherung. Zum Löschen eines Eintrags nach links wischen oder das Drei-Punkte-Menü öffnen und „Endgültig löschen“ bestätigen. „Abbrechen“ erhält den Eintrag; die Bestätigung erfolgt innerhalb der App ohne Browserdialog. Bei einem Speicherfehler bleibt die Session erhalten und das Löschen kann erneut versucht werden. Die Köderbox bietet Suche, Zielfischfilter und eine Bestandsübersicht. Beim Bearbeiten der Bedingungen und beim Browser-Zurück bleiben Eingaben im Verlauf des aktuellen Tabs erhalten.

## Köderbox-Analyse

„Lücken in der Köderbox finden“ (`/bestand/analyse`) rechnet die eigene Box je Zielfisch durch ein festes Raster typischer Seesituationen. Dabei gelten dieselben Regeln und dieselbe Auswahl wie im Angelplan (höchstens drei vorhandene, tiefenpassende Köder). Die Seite zeigt, wie oft ein Plan möglich ist, wie oft die fachlich beste Wahl vorhanden ist und wie oft eine Nachbargröße nötig wird. Dazu kommen bis zu fünf Ergänzungen, die am häufigsten zum Startköder würden. Die Werte beschreiben die Abdeckung nach dem Regelwerk, keine Fangwahrscheinlichkeit. Das Ranking bleibt unverändert. Die Berechnung läuft in einem Web Worker. Details: [`docs/datensicherung-und-koederanalyse-2026-10-03.md`](docs/datensicherung-und-koederanalyse-2026-10-03.md).

## Datensicherung

„Datensicherung & Wiederherstellung“ ist über Köderbox und Logbuch erreichbar, auch ohne vorhandene Sessions. Eine vollständige JSON-Sicherung enthält Bestand, Sessions, Angelstellen und die ursprünglichen Speicherwerte einschließlich nicht lesbarer Einträge. Ältere Sicherungen ohne Angelstellen bleiben lesbar. Der Import unterstützt auch bisherige reine Session-Exporte. Nach einer Vorschau ergänzt er Ködergrößen und neue Sessions; lokale Sessions mit gleicher ID bleiben unverändert. Ist bereits ein Plan aktiv, werden zusätzlich importierte aktive Pläne als abgeschlossen übernommen.

Wo das Gerät Dateien teilen kann, öffnet „Sicherung teilen oder in Dateien sichern“ das Teilen-Menü, z. B. für Dateien oder iCloud Drive. Der Download bleibt verfügbar. Die Seite zeigt den Zeitpunkt der letzten Vollsicherung und den Speicherschutz des Browsers (`navigator.storage.persist()`, einmalig nach dem ersten Sessionstart automatisch angefordert). Logbuch und Sessionabschluss erinnern an eine Sicherung, sobald mindestens drei Einträge ungesichert sind oder die letzte Sicherung über 30 Tage zurückliegt.

Die App nutzt weiterhin lokalen Browser-Speicher (Bestand v3, Sessions v1, Angelstellen v1) ohne Konto oder Serverdatenbank. Die Wiederherstellung prüft Änderungen seit der Vorschau und verwendet eine Rücksicherung für Schreibfehler und unterbrochene Importe. Nicht lesbare Originaleinträge bleiben erhalten, werden aber nicht automatisch aus einer Sicherung aktiviert. Browserdaten können vom Nutzer oder Betriebssystem gelöscht werden; wichtige Sicherungen deshalb außerhalb des Browsers aufbewahren. Format, Konfliktverhalten und Grenzen stehen im [aktuellen Review](docs/review-2026-09-07.md).

## Veröffentlichung

Der Produktions-Build ist für GitHub Pages unter `https://bugzda.github.io/angelkompass/` konfiguriert. Pushes auf `main` werden über `.github/workflows/pages.yml` geprüft, gebaut und veröffentlicht. Der lokale Entwicklungsserver bleibt unter `/` erreichbar.
