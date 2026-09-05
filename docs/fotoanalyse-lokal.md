# Lokale Fotoanalyse – Ufer-Scanner (Beta)

Einstieg: Neue Session → Fischart → Uferfoto analysieren. Das Feature läuft für Barsch, Hecht und Zander ohne Backend, API-Schlüssel oder Abrechnung pro Bild. Es erkennt allgemeine Bildbereiche, keine Fische oder Fangchancen.

## Ablauf und Grenzen

JPEG, PNG oder WebP bis 20 MB auswählen oder die mobile Kamera verwenden. Die Vorschau wird auf maximal 1280 Pixel Kantenlänge verkleinert und neu als JPEG erzeugt; EXIF/GPS-Metadaten werden nicht übernommen. Das Foto und seine Pixel bleiben im Arbeitsspeicher. Der Klick auf „Lokal analysieren“ lädt einen dedizierten Worker und startet die tatsächliche Modellberechnung. Es werden keine Bilder an einen Server geschickt.

Farben markieren Wasser, Pflanzen, Felsen, Holz und bestimmte Bauwerke. Die Legende schaltet Masken ein/aus; ein Regler verändert ihre Deckkraft. Prozentwerte sind Bildflächenanteile, keine kalibrierten Konfidenzen. Nur eine ausdrückliche Bestätigung kann Krautbild bzw. harte Struktur in die Bedingungen übernehmen. Bisherige Angaben bleiben erhalten; Hechtsicherheitsbestätigung, Tiefe, Aktivität, Temperatur und Trübung werden niemals aus dem Foto geändert. Im Barschprofil wird keine harte Struktur ergänzt.

Nebel, Spiegelungen und verdeckte oder kleine Strukturen bleiben schwierig. Pflanzen an Land sind kein Beleg für Wasser-Kraut; Felsen an Land sind kein Beleg für harten Grund. Leere Ergebnisse, ungültige Dateien, Modellfehler, fehlender Arbeitsspeicher, Abbrüche und Zeitüberschreitungen haben eigene Rückwege. Ein fehlender Bereich ist kein Nachweis seiner Abwesenheit.

## Modell, Laufzeit und Download

- Transformers.js **3.8.1**, ONNX Runtime Web, WebAssembly mit einem Thread. Kein WebGPU-Zwang und keine Cross-Origin-Isolation erforderlich.
- [DETR ResNet-50 Panoptic](https://huggingface.co/facebook/detr-resnet-50-panoptic), [ONNX-Konvertierung](https://huggingface.co/Xenova/detr-resnet-50-panoptic), unveränderliche Revision `ea24b2d4e0bfae31f0a1299ba3fb892a2df064de`.
- FP32-Gewichte: **172.282.717 Byte**, WASM-Laufzeit etwa **21,6 MB**, plus Worker und Konfiguration. Im Produkt als ungefähr 200 MB Erstdownload ausgewiesen. q8 wurde verworfen: am Ufer-Testbild entstanden stark falsche Flächen. FP32 trennte Wasser, Pflanzen und Felsen wesentlich besser.
- Modellvorverarbeitung: kurze Seite 640, lange Seite maximal 960 Pixel; Original-Seitenverhältnis bleibt erhalten. Panoptic-Schwelle 0,7; Masken unter 0,5 % Bildfläche werden nicht angezeigt.
- Die ONNX-Konfiguration enthält Platzhalter für zusammengefasste COCO-Kategorien. Die App ordnet ausschließlich die überprüften IDs 184, 193, 198 anhand der [offiziellen COCO-Kategorien](https://github.com/cocodataset/panopticapi/blob/master/panoptic_coco_categories.json) zu. Himmel (187) wird nicht als Wasser interpretiert.
- Apache-2.0-Modell und Bibliothek; MIT-Laufzeit. Hinweise unter `public/licenses/` sind auch über die Oberfläche erreichbar.

## Speicherung und Offlinebetrieb

Keine Datenbankmigration. Keine Fotos, Analysen oder EXIF-Daten in localStorage, Router-State oder Sessiondaten. Nur die vom Menschen bestätigten normalen Conditions können später mit einer Session gespeichert werden. Beim Verlassen werden Worker beendet und die Vorschau-URL freigegeben; überholte Antworten werden ignoriert.

Die Modell-Dateien nutzen den eigenen Cache `angelkompass-photo-model-v1`. In Produktionsbuilds hält Workbox nach der ersten Verwendung Worker und WASM-Dateien in `angelkompass-photo-runtime-v1`. Diese großen Dateien sind ausdrücklich vom normalen App-Precache ausgenommen. Offlineanalyse setzt voraus, dass alle benötigten Dateien bereits geladen wurden und der Browser sie nicht gelöscht hat. Private Browser können Caching ablehnen; die Onlineanalyse bleibt dann möglich. Beim ersten Download erhält Hugging Face normale Verbindungsdaten, keine Fotos. Abbruch beendet den Worker einschließlich laufender Downloads; nach 180 Sekunden wird ebenfalls beendet.

## Prüfung

Automatisierte Tests prüfen Maskengruppierung und Klassen, Dateigrenzen, unveränderte Bedingungen ohne Bestätigung, artspezifische Übernahme, Worker-Abbruch/Timeout/Fehler, verspätete Ergebnisse, Router-Rückwege und Foto-Freigabe. Abschlussprüfung: 260 Tests in 18 Dateien erfolgreich; TypeScript, Produktionsbuild, Quellen- und Routingvalidierung sowie `git diff --check` erfolgreich.

Echter Browser-Test mit dem vorhandenen Uferbild `public/assets/terrain/lake-morning.webp`: FP32 erkannte Wasser (35 %), Pflanzen (19 %) und Felsen (8 %). Das ist ein Funktionstest, keine Messung der Modellgenauigkeit. Die bestätigte Krautkante und harte Struktur wurden im Zanderformular korrekt übernommen. Mobile Breite 390 Pixel ohne horizontalen Überlauf geprüft.

Eine Feldprüfung mit vielfältigen echten Uferfotos sowie Tests auf physischen iOS-/Android-Geräten stehen noch aus. Der Offlinebetrieb ist durch Cache-Konfiguration vorbereitet; ein vollständiger Flugmodus-Test auf einem Mobilgerät ist noch ausstehend.
