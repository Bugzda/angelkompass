# UX-Durchgang: vom Einstieg zum abgeschlossenen Angelplan

Stand: 5. September 2026. Umsetzung des empfohlenen UX-Durchgangs im bestehenden See-Ablauf.

## Änderungen

- Die Startseite erklärt vor der ersten Session drei Schritte. Aktive Sessions führen direkt zur Am-Wasser-Karte. Abgeschlossene Sessions können als Vorlage für neue Bedingungen dienen; eine Hecht-Sicherheitsbestätigung wird dabei zurückgesetzt.
- Fischwahl, Bedingungen und Empfehlungen zeigen eine gemeinsame Fortschrittsanzeige.
- Auf der Bedingungsseite ist früh sichtbar, ob Köder für die Fischart vorhanden sind. Die Köderbox öffnet mit dem passenden Filter und erhält den Bedingungsentwurf, auch vor der Hecht-Sicherheitsbestätigung.
- Eine Weiter-Aktion bleibt während der Köderauswahl erreichbar. Die Auswahl wird direkt gespeichert. Fehler unterdrücken den positiven Speicherhinweis; eine leere Suche lässt sich zurücksetzen.
- Der beste vorhandene Vorschlag zeigt Ort, Größe, Farbe und Führung sowie einen direkten Startknopf. Dieser öffnet den gespeicherten Plan auf der Am-Wasser-Karte. Größenkompromisse werden bereits vor diesem Start sichtbar. Die bisherigen Detailkarten und bewusste Auswahl anderer Ränge bleiben nutzbar.
- Ein leerer Bestand führt direkt zur passenden Köderauswahl und wieder zurück zu denselben Bedingungen. Die Erklärung der Bewertungsgrößen ist aufklappbar.
- Netzwerk- und Offlinebereitschaft sind auch auf kleinen Displays sichtbar. Aktive Angelpläne sind von anderen Seiten aus mit einem Link erreichbar.
- Die Am-Wasser-Karte hält Rückmeldungen während des Scrollens erreichbar. Sessions können dort beendet werden. Der Abschluss zeigt Fang-/Bisszahlen, Logbuch und Wiederholungsstart; abgeschlossene Pläne zeigen keine aktuelle Arbeitsphase mehr. Phasenwechsel werden für Screenreader angekündigt.

## Validierung

243 Tests erfolgreich, darunter acht neue Tests für den zusammenhängenden Nutzerablauf, Übernahme der Bedingungen, Größenkompromisse, Sicherheitsreset, aktiven Plan, Abschluss und Speicherfehler. TypeScript-Prüfung, Produktionsbuild, Quellen- und Routingvalidierung erfolgreich. Browserprüfung des neuen Ablaufs auf 390 und 320 Pixel Breite, ohne horizontales Überlaufen auf der schmalen Am-Wasser-Karte. Keine Browserfehler im geprüften Ablauf.

Keine neue Abhängigkeit oder Änderung an gespeicherten Datenformaten. Die Arbeit betrifft die Bedienung des bestehenden See-Ablaufs. Eigene Köder, mehrere Boxen, ein Flussregelwerk und ein Sicherungsimport sind separate Funktionsausbauten und in diesem UX-Durchgang nicht enthalten.
