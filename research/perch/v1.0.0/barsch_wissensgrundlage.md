# Wissensgrundlage für eine regelbasierte Entscheidungshilfe zum Barschangeln

Version 1.0 · 12. Juli 2026 · Zielart: Europäischer Flussbarsch (*Perca fluviatilis*) · Region: Mittel- und Nordeuropa

## Ergebnis in einem Satz

Die belastbarsten Treiber sind thermische Saisonphase, Tageslicht, nutzbare Tiefe/Sauerstoff, Beute und Habitatstruktur; Bewölkung, Wind, Regen und Luftdruck sollten nicht als eigenständiger „Beißindex“, sondern überwiegend als kontextabhängige Modifikatoren von Licht, Trübung, Temperatur, Köderkontrolle und Zugang modelliert werden.

## 1. Geltungsbereich und Evidenz

Die Matrix ist für Seen, Flüsse und Kanäle sowie Ufer- und Bootsangeln mit Kunstködern konzipiert. Sie beschreibt Wahrscheinlichkeiten, keine Gewissheiten. Besonders große individuelle Unterschiede wurden in Telemetriestudien wiederholt beobachtet. Direkte Echtzeitbeobachtungen – Beutefische, Echolotsignale, Jagd, Nachläufer oder Bisse – sollen daher pauschale Regeln überstimmen.

Evidenzklassen:

| Code | Bedeutung | Engine-Gewichtung (Vorschlag) |
|---|---|---:|
| **W** | Wissenschaftlich gut belegt oder durch passende Feld-/Laborstudien gestützt | `confidence × 1,00` |
| **E** | Breiter anglerischer Erfahrungswert; plausibel, aber nicht direkt/allgemein getestet | `confidence × 0,75` |
| **S** | Schwach belegt, umstritten oder stark kontextsensitiv | höchstens `confidence × 0,35` |

Effektstärke: `+3` stark positiv, `+2` mittel positiv, `+1` leicht positiv, `0` neutral/unklar, negative Werte entsprechend. Der Sicherheitsgrad von 0 bis 1 bezeichnet Evidenz und Übertragbarkeit – nicht die Fangchance.

## 2. Regeln für die Scoring-Engine

### 2.1 Saison, Temperatur und Tiefe

| ID / Klasse | Bedingung | Empfehlung | Effekt | Gegenbedingungen | Sicherheit | Kurzbegründung / Quellen |
|---|---|---|---:|---|---:|---|
| R001 W | 5–12 °C, steigend; Vorlaich/Laich wahrscheinlich | Geschützte Flachbuchten, Gehölz/Krautreste, Buchteingänge; 4–9 cm Jig/Ned oder suspending Twitchbait, 3–10 g, langsam | +3 | nördlich später; Kälterückschlag; Schutzregeln; große Fische noch tiefer | .88 | Laichbeginn ist temperatur- und breitengradabhängig; starre, komplexe Flachsubstrate werden gewählt. [Ning 2025](https://researchoutput.csu.edu.au/ws/portalfiles/portal/609914679/579873124_published_article.pdf), [Snickars 2010](https://www.diva-portal.org/smash/record.jsf?pid=diva2:358598), [Probst 2008](https://epic.awi.de/19428/1/Pro2008c.pdf) |
| R002 W | Frühling/Frühsommer, meist 10–18 °C | Litoral, Krautaußenkante, Fels, Holz, Plateau; 5–10 cm Shad/Crank/Texas, 4–12 g | +3 | sehr klar/hell; fehlende Beute; sauerstoffarmes Flachwasser | .86 | Feldtelemetrie: Frühjahr/Sommer verstärkte Nutzung von Litoral und komplexen Habitaten. [Westrelin 2018](https://hal.science/hal-01832981v1/document) |
| R003 W | Sommer >16 °C | Kraut-/Uferstruktur und pelagische Beute parallel prüfen; aktive Searchbaits, dann Präzision | +2 | >23–26 °C/Stress; klares Wasser mittags; fehlende pelagische Beute | .78 | Hohe Aktivität möglich, Habitatwahl aber individuell zwischen Litoral und Pelagial. [Ning 2025](https://researchoutput.csu.edu.au/ws/portalfiles/portal/609914679/579873124_published_article.pdf), [Zamora 2002](https://link.springer.com/article/10.1023/A%3A1021396016424) |
| R004 W | Abkühlender Spätsommer/Herbst, etwa 16→8 °C | Flach-Tief-Übergänge, Kanten/Plateaus, Beuteschwärme; 6–12 cm Jig/Crank/Vibration, 6–20 g | +3 | noch sommerlich geschichtet; Wasserstandswechsel; Beute bleibt flach | .88 | Tiefenwanderung plus im Herbst teils erhöhte Fangbarkeit durch veränderte Nahrungslage. [Heermann 2013](https://www.researchgate.net/publication/235327665_Explaining_recreational_angling_catch_rates_of_Eurasian_perch_Perca_fluviatilis_The_role_of_natural_and_fishing-related_environmental_factors) |
| R005 W | Winter/≤8 °C | Tiefe Kanten, Winterlöcher, Häfen; 3–8 cm Ned/Dropshot/Pintail, 4–18 g, langsam | +3 | flacher durchmischter See; milde Sonne; pelagische Beute höher | .90 | Herbst/Winter meist tiefer; Aktivität sinkt, verschwindet aber nicht. [Jacobsen 2002](https://orbit.dtu.dk/en/publications/activity-and-food-choice-of-piscivorous-perch-perca-fluviatilis-i/) |
| R023 W | Temperatur steigt im saisonal normalen Bereich | Suchtempo leicht erhöhen; erwärmte, sauerstoffreiche Zonen prüfen | +1 | Hitzestress; Beute bleibt tief | .72 | Aktivität korreliert in einigen, nicht allen Studien mit Temperatur. [Ning 2025](https://researchoutput.csu.edu.au/ws/portalfiles/portal/609914679/579873124_published_article.pdf) |
| R024 W | >23 °C, besonders flach/eutroph | Sauerstoffreiche Zonen suchen; kurze Drills; bei Stress nicht gezielt angeln | −2 | tiefer, kühler, gut oxygenierter See; Quellzufluss | .82 | Temperatur- und Sauerstoffstress können wichtiger als Struktur sein. [USFWS 2021](https://www.fws.gov/sites/default/files/documents/Ecological-Risk-Screening-Summary-European-Perch.pdf) |
| R025 W | Thermo-/Sauerstoffschichtung | Nur nutzbare Schicht bewerten; Köder im Fischhorizont statt automatisch am Grund | +3 | vollständig durchmischter Flachsee | .90 | Tiefe ist nur nutzbar, wenn Temperatur und Sauerstoff passen. [Ning 2025](https://researchoutput.csu.edu.au/ws/portalfiles/portal/609914679/579873124_published_article.pdf) |
| R052 W | Kalender widerspricht Temperatur/Trend | Thermische Phase höher als Monatsname gewichten | +3 | direkt beobachteter Laichstatus | .94 | Phänologie verschiebt sich mit Breite, Verlauf und Gewässertyp. [Ning 2025](https://researchoutput.csu.edu.au/ws/portalfiles/portal/609914679/579873124_published_article.pdf) |

### 2.2 Tageszeit, Licht, Bewölkung und Trübung

| ID / Klasse | Bedingung | Empfehlung | Effekt | Gegenbedingungen | Sicherheit | Kurzbegründung / Quellen |
|---|---|---|---:|---|---:|---|
| R006 W | Taglicht | Sichtbare Jagdräume/Strukturkanten; visuelle Kunstköder | +2 | Extremtrübung; grell/klar; Nachtanpassung trüber Seen | .90 | Barsch ist überwiegend visueller Tagesjäger. [FishBase](https://www.fishbase.se/summary/perca-fluviatilis.html) |
| R007 W | Morgen-/Abenddämmerung | Kraut-/Uferkanten und Tiefenübergänge; 5–10 cm Twitch/Crank/Shad | +3 | Midsommer; stark trüber See; Winter-Mittagsfenster | .90 | Wiederholte Telemetrie-Befunde von Aktivitätsspitzen, aber nicht universell. [Zamora 2002](https://link.springer.com/article/10.1023/A%3A1021396016424), [Jacobsen 2002](https://orbit.dtu.dk/en/publications/activity-and-food-choice-of-piscivorous-perch-perca-fluviatilis-i/) |
| R008 W | Volle Dunkelheit, klar bis mäßig trüb | Bekannte Struktur; langsam, nah, deutliche Silhouette/Wasserverdrängung | −2 | hypereutroph/trüb; Kunstlicht; lokal angepasstes Nachtverhalten | .82 | Nachtaktivität meist geringer; trübe Systeme können abweichen. [Jacobsen 2015](https://www.fiskepleje.dk/-/media/sites/fiskepleje/nyheder/2015/juni/behavioural-strategy-of-large-perch-perca-fluviatilis-varies-between-a-mesotrophic-and-a-hypereutrop.pdf) |
| R009 W | Sehr klar + hohe Beleuchtung | Tiefe, Schatten, Außenkante; Distanz; natürliche/transluzente Köder | +2 | Dämmerung; Oberflächenkräuselung; aktive Flachjagd | .70 | Visuelle Prädation/Räubervermeidung stützen die Tendenz, nicht jede konkrete Köderregel. [Henseler 2020](https://www.researchgate.net/publication/338647141_Predation_risk_and_competition_affect_habitat_use_of_adult_perch_Perca_fluviatilis) |
| R010 W | Mäßig trüb, grob 10–30 NTU/Sicht 0,4–1,5 m | Struktur/Beute priorisieren; Nahkontakt und Kontrast moderat erhöhen | 0 | Extremtrübung; Schlammstoß; kleine visuelle Jäger | .82 | Nahrungsaufnahme sank im Versuch nicht zwingend; Begegnungsrate/Kontrast kompensieren. [Granqvist & Mattila 2004](https://ui.adsabs.harvard.edu/abs/2004HyBio.514...93G/abstract) |
| R011 E | Stark trüb, Sicht <0,4 m | Präzise an Struktur; 5–10 cm Shad/Crank/Spinnerbait; starke Silhouette, langsam–moderat | +2 | sehr kalt; Extremfracht; Hänger | .68 | Biologisch plausibel und breit genutzt, konkrete Reiz-/Farbwerte wenig isoliert getestet. [Westin](https://www.westin-fishing.com/en/articles-videos/articles/perch-fishing-with-lures) |
| R012 W | Fluo vs. sonst ähnlicher nicht-fluoreszierender Softbait | Kein genereller Fluo-Bonus; Silhouette, Größe und Führung priorisieren | 0 | andere Extrembedingungen könnten abweichen | .92 | 501 Versuche/331 Barsche: kein Effekt auf Fangrate/Größe nach Kontrolle der Lichtvariablen. [Radinger et al. 2026](https://cdnsciencepub.com/doi/pdf/10.1139/cjfas-2025-0084?download=true) |
| R036 E | Klar + natürliche Beute bekannt | Lokale Beutefarben/transluzent; Hintergrundkontrast beachten | +2 | Reaktionsbiss; Dämmerung; Trübung | .72 | Plausible Imitationsregel, keine universelle Farbrangliste. [Westin](https://www.westin-fishing.com/en/articles-videos/articles/perch-fishing-with-lures) |
| R037 E | Trüb/schwaches Licht | Dunkle oder sehr helle Silhouette je Hintergrund; Rassel/Druckwelle nur testen | +2 | Fluo allein kein Bonus; Überreizung bei Druck | .70 | Umriss/Kontrast plausibler als feste Farbnamen. [Granqvist & Mattila 2004](https://ui.adsabs.harvard.edu/abs/2004HyBio.514...93G/abstract), [Radinger 2026](https://cdnsciencepub.com/doi/pdf/10.1139/cjfas-2025-0084?download=true) |
| R043 S | Bewölkung allein | Nur als Lichtmodifier: flache/offene Zonen etwas weniger abwerten | +1 | Trübung dominiert; Nacht; lokaler Klarwasser-Effekt | .60 | Unterwasserlicht ändert sich, isolierte Fangwirkung ist begrenzt belegt. [Jacobsen 2015](https://www.fiskepleje.dk/-/media/sites/fiskepleje/nyheder/2015/juni/behavioural-strategy-of-large-perch-perca-fluviatilis-varies-between-a-mesotrophic-and-a-hypereutrop.pdf) |

### 2.3 Kraut, Steine, Holz, Kanten, Brücken, Häfen und Einläufe

| ID / Klasse | Bedingung | Empfehlung | Effekt | Gegenbedingungen | Sicherheit | Kurzbegründung / Quellen |
|---|---|---|---:|---|---:|---|
| R013 W | Mäßig dichtes Kraut | Außenkante, Lücken, Kraut–offen; Texas/Free, Spinnerbait/Crank darüber, Dropshot außen | +3 | verfilzter Kern; Sauerstoffzehrung; Hecht dominiert | .86 | Komplexität bietet Habitat; sehr dichtes Kraut senkt aber Jagdeffizienz. [Eklöv 1997](https://www.diva-portal.org/smash/get/diva2:158848/FULLTEXT01.pdf) |
| R014 W | Extrem dichtes Kraut | Außenkante/Taschen/Gassen statt blindem Kern; weedless oder oberhalb | −1 | kleine Barsche als Schutz; Beute in Taschen | .78 | Aufenthaltsraum und Fangbarkeit sind nicht identisch. [Eklöv 1997](https://www.diva-portal.org/smash/get/diva2:158848/FULLTEXT01.pdf) |
| R015 W | Blockstein/Fels/Geröll | Fels, Steinpackung, Stein–Sand; Crank, Carolina/Texas, Ned/Creature | +3 | keine Beute; Hänger; glatter strukturloser Fels | .86 | Adultbarsche nutzten Fels/Block in einer Feldstudie besonders stark. [Westrelin 2018](https://hal.science/hal-01832981v1/document) |
| R016 W | Totholz/Stümpfe, besonders Frühling/Sommer | Holz-/Schattenseite; weedless Texas/Jika, Twitch außen, Dropshot vertikal | +3 | Schutzregel; Hänger; sauerstoffarmes Flachwasser | .84 | Saisonale Habitatpräferenz plus Laichsubstrat. [Westrelin 2018](https://hal.science/hal-01832981v1/document), [Probst 2008](https://epic.awi.de/19428/1/Pro2008c.pdf) |
| R017 E | Kante/Plateau/Tiefensprung | Oberkante bei wenig Licht, Fuß bei Kälte/hell; Jig/Carolina/Dropshot/Crank | +3 | keine Beute; Hypoxie; vom Ufer unerreichbar | .80 | Bündelt Tiefenwechsel, Beute und Angriffswege; allgemeine Kausalstudie fehlt. [Westin](https://www.westin-fishing.com/en/articles-videos/articles/perch-fishing-with-lures) |
| R018 E | Brücke/Pfeiler | Schattenkante, strömungsabgewandte Seite; Search-Crank, dann Dropshot/Jig | +3 | keine Tiefe; starke Turbulenz; Lärm ohne Habitatwert | .74 | Schatten, Hartstruktur und Strömungsschutz wirken zusammen. [Canal & River Trust](https://canalrivertrust.org.uk/things-to-do/fishing/the-fisheries-and-angling-team/becoming-a-lure-angler) |
| R019 E | Hafen/Hafeneinfahrt | Einfahrt, Spundwand, Steg, tiefstes Becken; warm aktiv, kalt finesse | +2 | Bootsverkehr; monoton/flach; Sommerhypoxie | .76 | Häfen kombinieren Schutz, Vertikalstruktur und Tiefe, aber nicht immer Sauerstoff. [Westin](https://www.westin-fishing.com/en/articles-videos/articles/perch-fishing-with-lures) |
| R021 E | Moderater, sauberer Einlauf | Seitliche Naht, erste Rinne; Shad/Jig, bei Trübung Crank/Spinnerbait | +2 | kaltes Schmelzwasser; Schlamm; Hochwasser/Treibgut | .72 | Sauerstoff/Driftfutter plausibel; Wasserqualität und Temperatur entscheiden das Vorzeichen. |
| R022 E | Schleuse/Wehr/Spundwand | Ruhige Ecke, Wandfuß; vertikal Jig/Dropshot oder Crank parallel | +2 | Sperrzone; Schwall; monotone Wand | .75 | Tiefe, Hartstruktur und wechselnde Strömung sind typische Konzentratoren. [Canal & River Trust](https://canalrivertrust.org.uk/things-to-do/fishing/the-fisheries-and-angling-team/becoming-a-lure-angler) |
| R049 E | Überhang/Schattenkante | Schatten-Licht-Grenze, unterspültes Ufer; kleiner Softbait/Twitch/Dropshot | +2 | keine Tiefe; Hauptstrom; Naturschutz | .74 | Deckung und Schatten können Beute/Barsch sammeln; lokal. |
| R050 E | Muschelbank/harte Platte/Kies | Hart–weich-Übergang; Carolina/Free/Creature/Ned/Crank | +2 | ohne Relief/Beute; Abrieb; pelagische Fische | .76 | Benthische Nahrung plus klare Übergangslinie. [Dörner 2003](https://hero.epa.gov/reference/6626595/) |

### 2.4 Strömung, Wind und Wetter

| ID / Klasse | Bedingung | Empfehlung | Effekt | Gegenbedingungen | Sicherheit | Kurzbegründung / Quellen |
|---|---|---|---:|---|---:|---|
| R020 W | Mäßige/starke Flussströmung | Strömungsnaht, Kehrwasser, Ufer-/Pfeilerschatten; kompakter Jig/Crank; meist 8–25 g | +3 | warme sauerstoffarme Stillzone; Beute im Hauptstrom | .82 | Begrenzte Dauerschwimmleistung macht energiegünstige Randbereiche plausibel. [Ning 2025](https://researchoutput.csu.edu.au/ws/portalfiles/portal/609914679/579873124_published_article.pdf) |
| R039 E | 2–5 Bft auf Ufer, Sicht/Beute günstig | Windzugewandte Kraut-/Steinkante/Plateau; Searchbait, dann Jig; Gewicht erhöhen | +1 | Schlammtrübung; Abkühlung; keine Beute; Gefahr | .55 | Direkter Fangbonus schwach belegt; Wind wirkt indirekt. [Heermann 2013](https://www.researchgate.net/publication/235327665_Explaining_recreational_angling_catch_rates_of_Eurasian_perch_Perca_fluviatilis_The_role_of_natural_and_fishing-related_environmental_factors) |
| R040 S | Kompassrichtung allein („West gut/Ost schlecht“) | Kein eigenständiger Bonus; nur relativ zu Ufer, Fetch, Temperatur und Sicherheit | 0 | gewässerspezifisch lernbares Muster | .90 | Ohne Geometrie/Luftmassenhistorie nicht übertragbar. |
| R041 E | Wind verhindert Kontrolle/Sicherheit | Leeseite/Hafen; kompakter/schwererer Köder; ggf. abbrechen | +3 | sichere, erfahren kontrollierbare Drift | .96 | Sicherheit und Präsentation überstimmen spekulativen Windseitenbonus. |
| R042 S | Luftdruck steigt/fällt allein | Höchstens Tie-Breaker; kein starker Bonus/Malus | 0 | Front ändert zugleich Licht/Wind/Temperatur | .86 | Artspezifische Feldbelege schwach, Variablen konfundiert. [Heermann 2013](https://www.researchgate.net/publication/235327665_Explaining_recreational_angling_catch_rates_of_Eurasian_perch_Perca_fluviatilis_The_role_of_natural_and_fishing-related_environmental_factors) |
| R051 S | Regen/Front | Über Trübung, Zufluss, Licht, Temperatur und Wind rechnen | 0 | warmer sauberer Zufluss positiv; kalter Schlamm negativ | .90 | Regen kann gegensätzliche indirekte Wirkungen haben. |

### 2.5 Beute, Größe, Montagen, Führung, Angeldruck und Zugang

| ID / Klasse | Bedingung | Empfehlung | Effekt | Gegenbedingungen | Sicherheit | Kurzbegründung / Quellen |
|---|---|---|---:|---|---:|---|
| R026 W | Beute/Jagd/Echolot bestätigt | Schwarmrand/unter Schwarm/nahe Struktur; 5–12 cm Shad/Jerk/Crank exakt im Horizont | +3 | Fehlidentifikation; keine Raubaktivität; Uferreichweite | .94 | Beuteverfügbarkeit bestimmt Habitat, Nahrung und Fangbarkeit stark. [Dörner 2003](https://hero.epa.gov/reference/6626595/) |
| R027 W | Ziel Großbarsch | Kanten/Hartgrund/pelagische Beute; 7–12 cm Start, 5–14 cm testen | +2 | Großbarsche auf Kleinstbeute/Invertebraten; Winter; Druck | .80 | Piscivorie nimmt mit Größe zu, bleibt aber opportunistisch. [FishBase](https://www.fishbase.se/summary/perca-fluviatilis.html) |
| R028 E | Ziel Stückzahl/Bestandsnachweis | 2–6 cm Spinner/Crank/Microjig/Dropshot, 1–8 g | +2 | große Beute; Wurfweite/Tiefe | .77 | Kleinere Köder passen mehr Größenklassen; keine absolute Selektion. |
| R029 E | Kraut/Äste/Hänger | Texas/Free/Jika/Tokyo weedless; minimales Kontrollgewicht | +3 | offener Grund; freie Haken effizienter | .90 | Hängerarme Präsentation erschließt das Zielhabitat. [Sportfiskarna](https://www.sportfiskarna.se/fiske/fakta-fisketips/fiskemetoder/spinnfiske/) |
| R030 E | Offener Hartgrund/Sand/Kies | Carolina/Ned/Jig/Free; schleifen/hüpfen, Pausen | +3 | Muschelabrieb; Blockklemmen; suspendierte Fische | .88 | Geeignete Grundkontakt-Montagen. [Sportfiskarna](https://www.sportfiskarna.se/fiske/fakta-fisketips/fiskemetoder/spinnfiske/) |
| R031 E | Punktuell/suspendiert an Kante/Pfeiler/Boot | Dropshot/vertikal, 3–8 cm, 4–20 g; lange im Sichtfeld | +3 | Flächensuche; sehr schneller Strom; Temporeaktion | .88 | Köderhöhe und Gewicht sind unabhängig steuerbar. [Sportfiskarna](https://www.sportfiskarna.se/fiske/fakta-fisketips/fiskemetoder/spinnfiske/) |
| R032 E | Aktive Fische/Flächensuche | Crank, Spinner-/Chatter-, Vibrationbait, zügiger Shad; Fächer/Tiefen | +3 | kalt/inaktiv; Hänger; Druck | .86 | Maximiert Begegnungsrate und lokalisiert Schwärme. [Westin](https://www.westin-fishing.com/en/articles-videos/articles/perch-fishing-with-lures) |
| R033 E | Kalt oder Nachläufer ohne Biss | Ned/Dropshot/Carolina/Pintail; 3–8 cm; langsam, kurze Wege, lange Pausen | +2 | aggressives kurzes Beißfenster | .82 | Mehr Aufenthaltszeit; keine Garantie für „klein und langsam“. |
| R034 E | Warm + sichtbare Jagd | 5–11 cm Crank/Twitch/Topwater/Shad, zügig/stop-and-go | +3 | Hitzestress; Druck; Grundfische | .84 | Beobachtete Aktivität rechtfertigt aktives Suchen. |
| R035 E | Warm, flach, wenig Licht + Oberflächenjagd/Brut | 4–9 cm Popper/Walk/Twitch; Serien + Pausen | +3 | keine Oberflächenzeichen; kalt; starke Welle | .80 | Oberflächenbeobachtung ist Auslöser, nicht „Sommer“ allein. |
| R038 E | Tiefe/Wind/Strömung steigt | Gewicht stufenweise bis reproduzierbarer Kontrolle erhöhen; Fallzeit messen | +3 | langsamer Fall gewünscht; flach; Steinklemmen | .94 | Kontrolle ist nötig; Übergewicht kostet Fallzeitqualität und erhöht Hänger. |
| R044 W | Hoher Angeldruck | Unauffällige Offshore-/zweite Struktur, anderer Winkel/Zeit; danach kleiner/subtiler | +2 | frischer Schwarm; Beißfenster; Druck nur vermutet | .78 | Fangbarkeit hängt von Raumverhalten/Erfahrung ab, aber keine universelle Köderscheu. [Monk & Arlinghaus 2018](https://cdnsciencepub.com/doi/10.1139/cjfas-2017-0029), [Vainikka et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC5804226/) |
| R045 W | Boot sicher verfügbar | Offshore/Pelagial/vertikale Spots; Sonar/Drift und exakter Winkel | +3 | Ufermuster; Verbote; Wind | .92 | Boot erhöht räumliche Überlappung mit mobilen Fischen. [Monk & Arlinghaus 2018](https://cdnsciencepub.com/doi/10.1139/cjfas-2017-0029) |
| R046 E | Nur Ufer | Brücke, Hafen, Verengung, steiles Ufer; zuerst parallel, dann Fächer | +3 | monotones Flachufer; Offshore-Winterstand | .90 | Reichweite ist harter Filter: unerreichbarer Spot bekommt praktisch Score null. |
| R047 E | Nach 10–15 min/15–25 guten Würfen keine Zeichen | Tiefe/Winkel → Search/Finesse → Strukturtyp wechseln; Farbe später | +3 | bekanntes kurzes Fenster; sichere Echolotfische | .90 | Standort/Begegnung erklären mehr als endlose Farbrotation. [Sportfiskarna](https://www.sportfiskarna.se/om-oss/aktuellt/nyheter/nyhet/fanga-abborren-med-jigg-med-jacob-lexxe/) |
| R048 E | Biss/Nachläufer/Kontakt | Gleichen Horizont mit Dropshot/Ned/Jig; ähnlichen Nachbarspot prüfen | +3 | Einzelwanderer; andere Art | .92 | Kontakt ist ein starkes Echtzeitsignal; Barsche stehen häufig in Gruppen. |
| R053 W | Beobachtung widerspricht Wetter/Kalender | Beobachtung priorisieren und Muster replizieren | +3 | Fehlidentifikation; Einzelsignal | .96 | Feinskalige Raumwahl bestimmt Fangbarkeit stärker als Pauschalregeln. [Heermann 2013](https://www.researchgate.net/publication/235327665_Explaining_recreational_angling_catch_rates_of_Eurasian_perch_Perca_fluviatilis_The_role_of_natural_and_fishing-related_environmental_factors), [Monk 2018](https://cdnsciencepub.com/doi/10.1139/cjfas-2017-0029) |

## 3. Gewichtsklassen und Präsentationslogik

Absolute Grammwerte hängen von Tiefe, Ködervolumen, Schnur, Wind, Strömung und Wurfwinkel ab. Die Engine soll deshalb zuerst die leichteste kontrollierbare Klasse wählen und anschließend über ein Feedbackfeld („Grundkontakt zu selten/zu häufig“, „Drift zu groß“) korrigieren.

| Klasse | Bereich | Typischer Startpunkt |
|---|---:|---|
| Micro | 1–4 g | flach, windarm, kleine Köder |
| Light | 4–8 g | Ufer/Kanal, 1–4 m, leichte Strömung |
| Medium | 8–15 g | Kanten, Wind, mittlere Strömung |
| Medium-heavy | 15–25 g | tiefer See, Fluss, Boot |
| Heavy | 25–35 g | nur wenn Tiefe/Drift/Strömung es wirklich erfordern |

## 4. Wechselstrategie bei ausbleibenden Bissen

1. **Suchen:** 10–15 Minuten oder 15–25 saubere Würfe pro Mikrospot; Fächer, Tiefen und Winkel statt nur Farben variieren.
2. **Präzisieren:** Kontakt/Nachläufer/Biss mit Searchbait → selben Horizont mit Jig, Ned oder Dropshot langsam nachfischen.
3. **Einzelvariable testen:** zuerst Führung, dann Größe, dann Silhouette/Farbe, dann Montage.
4. **Standort wechseln:** nach zwei unterschiedlichen Präsentationsstilen ohne Lebenszeichen den nächsten Strukturtyp anlaufen.
5. **Muster bestätigen:** einen zweiten ähnlichen Spot testen; erst nach Wiederholung erhält das Muster einen hohen temporären Score.

## 5. Referenztests

Die vollständigen 32 Tests stehen maschinenlesbar in `test_scenarios`. Diese Übersicht zeigt die erwarteten Top-3-Paare aus Spot und Köderstrategie. Die Reihenfolge ist Bestandteil des Referenztests; gleichwohl sind kleine Score-Abstände als „praktisch gleichwertig“ zu behandeln.

| ID | Situation | Erwartete Top 3 |
|---|---|---|
| T01 | Klarer Baggersee, 8 °C steigend, Morgendämmerung, Ufer | 1 Totholz-Flachbucht + 5–7 cm Pintail/4–6 g langsam; 2 Kieskante + suspending Twitchbait; 3 erste Steilkante + Ned |
| T02 | Nordsee im Mai, aber 5 °C, Boot | 1 tiefe Kante vor Laichbucht + Dropshot; 2 felsige Buchteinfahrt + Ned; 3 tiefer Hafen/Steg + Pintail vertikal |
| T03 | Trüber Stadtkanal, 14 °C, Brücke/Spundwand, Druck hoch | 1 Pfeiler/Schatten + Crank→Dropshot; 2 Wandfuß + kontrastiger Shad; 3 Schleusenecke + Texas |
| T04 | Krautsee, 18 °C, Abenddämmerung | 1 Krautaußenkante + Shad/Spinnerbait; 2 Krautloch + Texas; 3 Brutplateau + Topwater |
| T05 | Sehr klarer tiefer See, 20 °C, sonniger Mittag, Boot | 1 tiefe Fels-Schattenkante + Naturshad; 2 Beute über Thermokline + vertikaler Shad; 3 tiefe Krautkante + Dropshot |
| T06 | Klar, bedeckt, Sommermorgen, Ufer | 1 flache Krautkante + Twitch/Crank; 2 tiefe Steinpackung + Shad; 3 Steg/Brücke + Dropshot |
| T07 | Eutroph, 26 °C, windstill | 1 guter Zufluss; 2 oxygenierte Freiwasserschicht; 3 beschattete windoffene Außenkante; Hitzestressfilter aktiv |
| T08 | 17 °C, 4 Bft auf Felsküste, Ufer | 1 sichere Wind-Felskante + Crank/Shad; 2 Buchtspitze + Vibration→Jig; 3 Lee bei Kontrollverlust + Carolina |
| T09 | Windseite durch Schlamm extrem trüb | 1 Trübungsgrenze + Kontrastshad; 2 geschützte Krautkante; 3 Lee mit Restklarheit |
| T10 | Tiefe Talsperre, 12 °C fallend, Beute bei 9 m | 1 Beute an Kante + vertikaler Shad; 2 Plateauabbruch + Jig; 3 Blockkante + Carolina Creature |
| T11 | Herbstlicher Kanalhafen, 11 °C | 1 Hafeneinfahrt + Shad→Dropshot; 2 Pfahl/Steg + Dropshot; 3 Wandfuß + Ned |
| T12 | Winter-Baggersee, 5 °C, klares Wasser, Ufer | 1 Steilufer zum Winterloch + Ned; 2 tiefe Hafeneinfahrt + Dropshot; 3 sonnige tiefe Felskante + Pintail |
| T13 | Trüber Winterhafen, 4 °C, hoher Druck | 1 tiefste Spundwandecke + Kontrast-Dropshot; 2 Einfahrt unten + Shad; 3 Pfähle/Boote + Pintail |
| T14 | Mäßiger Sommerfluss, 19 °C | 1 Buhnennaht + Shad; 2 Kehrwasser/Stein + Crank→Texas; 3 Pfeiler abstrom + Dropshot/Jig |
| T15 | Flusshochwasser, 12 °C, Extremtrübung | 1 sicheres Uferkehrwasser + kompakter Shad; 2 ruhige Seitenbucht + Spinnerbait; 3 klarerer Nebenarm + Crank/Shad |
| T16 | Klarer Niedrigwasserfluss, Mittag, hoher Druck | 1 tiefer Brückenschatten + Natur-Dropshot; 2 unterspülter Überhang + leichtes Texas; 3 wenig befischte Steinkante + Carolina |
| T17 | Kanal mit Schleusenschwall | 1 sichere ruhige Schleusenecke + Shad; 2 Wandfuß abstrom + Vertikaljig; 3 Fahrwassernaht + Crank |
| T18 | Flachsee nach Kälterückschlag | 1 erste Kante vor Bucht + Ned; 2 tiefe Krautkante + Dropshot; 3 windgeschützter Fels + suspending Twitch |
| T19 | Warmer Regen, sauberer oxygenierter Einlauf | 1 Einlaufnaht + Shad; 2 erste Vertiefung + Crank→Dropshot; 3 bewegte Krautkante + Spinnerbait |
| T20 | Kalter schlammiger Zufluss | 1 äußere Mischkante + Kontrastshad; 2 unbeeinflusste Bucht + Ned/Carolina; 3 tiefe stabile Kante + Dropshot |
| T21 | Pelagische Sommerbarsche per Sonar | 1 unter Beuteschwarm + vertikaler Shad; 2 Unterwasserberg + Crank/Jig; 3 Sattel + Dropshot/Carolina |
| T22 | Gleiches Gewässer, nur Ufer; Beute außer Reichweite | 1 Landzunge mit Tiefe + Weitwurf-Shad; 2 Hafeneinfahrt + Crank; 3 windnahe Uferkante + Vibration→Jig |
| T23 | Steinsee mit Krebsen, 16 °C, Abend | 1 Stein–Sand + Carolina Creature; 2 Blockkante + weedless Jika/Texas; 3 Felsplateau + Crank mit Kontakt |
| T24 | Extrem verkrauteter Kanal, 20 °C | 1 freie Fahrrinne + weedless Shad; 2 Krautloch + Texas; 3 über Kraut bei Brut + Topwater/Spinnerbait |
| T25 | Brücke mit Kunstlicht nachts | 1 Licht-Schatten + dunkler Twitch; 2 Pfeilerrückseite + Dropshot; 3 beleuchtete Wand + langsamer Crank |
| T26 | Vollmond ohne weitere Hinweise | 1 bekannte Uferkante + langsamer Shad; 2 beleuchtete Struktur; 3 flacher Stein nur bei Beutezeichen; **kein Mondbonus** |
| T27 | Wolkenlos, klar, hoher Druck, hoher Angeldruck | 1 unmarkierte Offshore-Hartkante + Natur-Carolina; 2 tiefe Schattenseite + Dropshot; 3 entfernte Krautkante + Ned |
| T28 | Fallender Luftdruck, sonst unverändert | 1 bestätigte Struktur; 2 Beutefischzone; 3 Kraut–Stein; **kein starker Druckbonus** |
| T29 | Fluo gegen nicht fluo, sonst gleich | 1 randomisiert am besten Spot; 2 Silhouette/Größe priorisieren; 3 Führung vor Farbe; **kein Fluo-Bonus** |
| T30 | 20 Crankwürfe ohne Kontakt an Krautkante | 1 tieferer Winkel/Jig; 2 punktuell Dropshot/Ned; 3 andere Struktur; **nicht fünf Farben zuerst** |
| T31 | Nachläufer auf Crank unter Brücke | 1 gleicher Horizont/Dropshot; 2 Pfeilerrückseite/Ned; 3 nächste ähnliche Brücke zum Bestätigen |
| T32 | 7 Bft am offenen See, kleines Boot | 1 Hafen vom Ufer; 2 sichere Leebucht; 3 abbrechen; **Sicherheit überschreibt Score** |

## 6. Implementierungshinweise

- Standort- und Strategie-Score separat führen. Ein Spot kann biologisch gut, vom Ufer aber praktisch unerreichbar sein.
- Pro Treibergruppe (`season`, `light`, `visibility`, `cover`, `flow` usw.) die Summe auf ±3 deckeln, um Doppeltzählung zu vermeiden.
- Für unbekannte Werte keine negative Regel auslösen.
- Beobachtung als temporären Bayes-artigen Update behandeln: bestätigte Beute/Biss `+3`, ähnlicher Nachbarspot `+1`, nach zwei Fehlversuchen zurück auf Prior.
- Safety/Legal als harte Filter, nicht als negative Punkte.
- Wassertemperatur und Trend sind wichtiger als Monatsname. Nord-/Mitteleuropa benötigen regional kalibrierte Schwellen.
- Farben als Kategorien abbilden (`natural`, `translucent`, `dark_silhouette`, `high_contrast`, `fluorescent`) und keine Markennamen verwenden.
- Gewichte dynamisch über Zielhorizont/Grundkontakt korrigieren, statt fixe Grammwerte nur aus der Tiefe abzuleiten.

## 7. Zentrale Unsicherheiten

1. Viele ökologische Studien betreffen einzelne Seen, Größenklassen oder kurze Zeiträume; individuelle Unterschiede sind groß.
2. Anglerische Montagen wurden selten kontrolliert gegeneinander getestet. Die Zuordnung Montage↔Habitat ist überwiegend Praxiswissen.
3. Trübung ist kein einzelner Zustand: Algen, Huminstoffe und Mineralschlamm können unterschiedliche optische/ökologische Wirkungen haben.
4. Windrichtung, Luftdruck, Mond und Fronten sind stark konfundiert. Ohne lokale Daten sollten sie nur wenig Gewicht erhalten.
5. „Großbarsch = großer Köder“ ist eine Tendenz, keine Regel; große Barsche können sehr kleine Beute oder Invertebraten wählen.

## 8. Quellenkern

Die maschinenlesbare Datei enthält 23 verlinkte Quellenobjekte und referenziert sie je Regel. Besonders tragend sind die [globale Biologie-Übersicht von Ning et al. (2025)](https://researchoutput.csu.edu.au/ws/portalfiles/portal/609914679/579873124_published_article.pdf), die [Reservoir-Telemetrie von Westrelin et al. (2018)](https://hal.science/hal-01832981v1/document), die Tages-/Saisonstudien von [Zamora & Moreno-Amich](https://link.springer.com/article/10.1023/A%3A1021396016424) und [Jacobsen et al.](https://orbit.dtu.dk/en/publications/activity-and-food-choice-of-piscivorous-perch-perca-fluviatilis-i/), die Fangratenanalyse von [Heermann et al. (2013)](https://www.researchgate.net/publication/235327665_Explaining_recreational_angling_catch_rates_of_Eurasian_perch_Perca_fluviatilis_The_role_of_natural_and_fishing-related_environmental_factors), das Raumverhaltens-Experiment von [Monk & Arlinghaus](https://cdnsciencepub.com/doi/10.1139/cjfas-2017-0029) und der kontrollierte Fluoreszenztest von [Radinger et al. (2026)](https://cdnsciencepub.com/doi/pdf/10.1139/cjfas-2025-0084?download=true).

