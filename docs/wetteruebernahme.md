# Optionale Wetterübernahme

Stand: 5. September 2026. Für aktuelle Bedingungen, nicht für die Planung eines zukünftigen Angeltags.

Auf der Bedingungsseite bietet Open-Meteo nach explizitem Abruf per Standort oder Ortssuche eine Vorschau. Nutzer wählen einen Suchtreffer mit Region und Land. „Offene Angaben ergänzen“ ergänzt ausschließlich unbekannte Tageszeit und Licht; bestehende Angaben werden auch bei Änderungen während des Abrufs erhalten. Alle Felder bleiben manuell änderbar. Die Vorschau benennt ihre Herkunft als Wettermodell. Es gibt keine automatische Aktualisierung und keinen Hintergrundabruf.

## Ableitung und Grenzen

Die API liefert Unix-Zeitstempel, aktuelle Bewölkung, Tag/Nacht und Sonnenauf-/untergang am gewählten Ort. Innerhalb einer Stunde vor/nach Sonnenaufgang wird „Morgen“, um Sonnenuntergang „Abend“ vorgeschlagen, sonst Tag/Nacht. Fehlen Sonnenzeiten (etwa in Polargebieten), dient das Tag/Nacht-Feld als Fallback. Nachts wird dunkles, in den Übergangsfenstern diffuses Licht vorgeschlagen; tagsüber ab 50 Prozent Bewölkung diffuses, darunter helles Licht. Diese Schwellen sind transparente Bedienheuristiken, keine neuen Fangregeln oder Messung des Lichts am Ufer. Fehlende Werte bleiben unbekannt. Modellzeitstempel mit mehr als zwei Stunden Abstand zur Gerätezeit werden beim Laden und Übernehmen abgelehnt.

Lufttemperatur, Wind in km/h und Niederschlag in mm werden nur angezeigt. Wassertemperatur, Trübung, Tiefe, Kraut, Struktur und Aktivität bleiben eigene Angaben. Rankingregeln, Evidenzgewichtung, Bestandsfilter und Hecht-Sicherheitsgate bleiben unverändert. Bestätigte Eingaben gehen wie manuelle Angaben in den bestehenden Session-Snapshot ein; es wird keine zusätzliche Wetter- oder Standortinformation gespeichert und kein alter Snapshot neu berechnet.

## Netzwerk und Datenschutz

Keine zusätzlichen Abhängigkeiten, Schlüssel oder Backend. Suchtext geht erst beim Suchen an die Geocoding-API; Koordinaten erst beim Wetterabruf an die Forecast-API. Koordinaten werden auf zwei Dezimalstellen gerundet. Standort, Suchtreffer und rohe Wetterdaten bleiben nur im Arbeitsspeicher der Komponente. Requests senden keine Credentials oder Referrer. Es gelten 15 Sekunden Abruf- und 10 Sekunden Standort-Timeout. Beim Verlassen wird ein laufender Netzwerkabruf abgebrochen. Fehlendes Netz, verweigerte Standortfreigabe, leere Treffer und Dienstfehler lassen manuelle Eingaben weiter zu.

Open-Meteos kostenloser gehosteter Dienst ist für nicht kommerzielle Nutzung vorgesehen, derzeit bis 10.000 Aufrufe täglich, ohne Verfügbarkeitsgarantie. Vor kommerzieller Nutzung den Tarif prüfen. Quellenhinweise auf Open-Meteo, CC BY 4.0 und GeoNames stehen direkt im Wetterbereich.

- [Forecast-API](https://open-meteo.com/en/docs)
- [Ortssuche](https://open-meteo.com/en/docs/geocoding-api)
- [Preise und Nutzung](https://open-meteo.com/en/pricing)

## Prüfung

Bestehende Ablauf- und Zustandstests vorab erfolgreich. Neue Tests prüfen Tag/Nacht/Dämmerung, fehlende und veraltete Daten, expliziten Abruf, gerundete Koordinaten, Erhalt manueller Werte, manuelle Korrektur, Netzfehler und verweigerte Standortfreigabe. Die aktuelle Gesamtprüfung umfasst 251 Tests.

TypeScript-Prüfung, Produktionsbuild, Routing- und Research-Validierung erfolgreich. Browserprüfung mit echten Open-Meteo-Daten für Potsdam: Suche, Auswahl, Vorschau und Übernahme erfolgreich. Auf 390 und 320 Pixeln geprüft; 320 Pixel ohne horizontales Überlaufen, Darstellung im dunklen Farbschema visuell geprüft. Keine Browserfehler im geprüften Ablauf. Standortfehler und Netzausfall sind automatisiert geprüft; keine echte Standortfreigabe für den Test erforderlich. Da der pnpm-Start in dieser Umgebung hing, wurden die Skriptprogramme direkt aus den vorhandenen lokalen Abhängigkeiten ausgeführt. Nicht veröffentlicht.

## Ergänzung: automatische Zeitangaben

Neue Pläne wählen Jahreszeit und Tageszeit ohne Netz oder Standortfreigabe anhand der lokalen Gerätezeit vor. Jahreszeiten folgen dem mitteleuropäischen Kalender (März–Mai Frühling, Juni–August Sommer, September–November Herbst, Dezember–Februar Winter). Die Uhrzeit dient als Näherung: 05–09 Uhr Morgen, 09–18 Uhr Tag, 18–22 Uhr Abend, sonst Nacht. Diese Zeitfenster sind keine astronomischen Dämmerungszeiten. Ein Hinweis erklärt die Vorauswahl; alle Optionen bleiben korrigierbar.

Bei einer Wetterübernahme im neu geöffneten Formular kann der Sonnenzeiten-Vorschlag die noch unberührte Uhrzeit-Vorauswahl präzisieren. Manuell gewählte Tageszeiten und wiederhergestellte Entwürfe bleiben erhalten. Unbekannte Wetterwerte löschen keine Vorauswahl. Bestehende Sessions bleiben unverändert.
