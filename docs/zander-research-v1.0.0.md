# Zander am See – Regelwerk 1.0.0

Stand: 5. September 2026. Geltungsbereich: erreichbare Bereiche beim Uferangeln am See, keine Fluss- oder Bootslogik.

Vier Strukturtypen: Tiefenkante/Plateau, Steinpackung/harter Grund, flache Uferzone und freier Wasserbereich. Vier Köderkategorien: Zander-Gummifisch mit Jigkopf oder Texas/Offset, Drop Shot, Carolina Rig und flach laufender Wobbler. 13 Regeln nutzen dieselben Gruppenbegrenzungen wie die bestehenden Arten.

## Quellen und Grenzen

- Z01: [DTU Aqua – Sandart](https://www.fiskepleje.dk/fiskebiologi/sandart). Fachliche Artenübersicht zu geringer Lichtstärke, Freiwasser und Sauerstoffbedarf. Kein Nachweis einer bestimmten Köderrangfolge. Daraus abgeleitete Suchregeln werden als Erfahrung, nicht als wissenschaftlich validierte Fangprognose geführt.
- Z02: [Jörgen Larsson / Westin – Locate the big zander](https://www.westin-fishing.com/en/articles-videos/articles/locate-the-big-zander). Erfahrungsbericht zu Beutefisch, Kanten und freier Wassersäule. Übertragung vom Boot auf erreichbare Uferbereiche bleibt begrenzt. Die dort genannten großen Tiefen werden nicht als feste Angeltiefen übernommen.
- Z03: [Westin – Zander Box Dropshot + Texas & Carolina](https://www.westin-fishing.com/de/kits-b2c_spring-kits/zander-box-dropshot--plus--texas--carolina). Herstellerpraxis für diese Montagen vom Ufer und Boot; kein vergleichender Wirksamkeitsnachweis.
- Z04: [DAIWA – Tournament Tightwave Shad](https://en.daiwa.de/tournament_tightwave_shad--9216m1.html). Herstellerpraxis für flach laufende Wobbler auf Zander bei Nacht.

Alle Links am 5. September 2026 recherchiert. Für undatierte Herstellerseiten bezeichnet das Jahr im Register das Abrufjahr. Ködergrößen (7–10, 10–13, 13–16 cm), Gewichtsbereiche und Pausen sind redaktionelle Startwerte, keine ermittelten Optima. Mittlere Ködergröße ist der neutrale Ausgangspunkt; vorhandene andere Größen bleiben als transparenter Kompromiss nutzbar. Die Kälte-/Pausenregel ist ausdrücklich schwache Evidenz. Saison wird nur bei unbekannter Wassertemperatur als Winterhinweis genutzt. Beobachtetes Licht hat Vorrang vor der Tageszeit.

Zander werden nicht pauschal als ausschließlich grundnah behandelt. Die freien Horizonte bleiben Suchoptionen. Es gibt keine Regel zum gezielten Befischen von Laichnestern. Die allgemeinen Hinweise zu örtlichen Vorschriften gelten weiterhin; bei Hechtvorkommen enthalten alle Montagen einen Hinweis auf ein bissfestes Vorfach.

## Speicherung

Keine externe Datenbank vorhanden. Die produktiven TypeScript-Kataloge, das Quellenregister und die Eingabevalidierung sind erweitert. Bestand bleibt im bestehenden Envelope `angelkompass.inventory.v3`, Sessions in `angelkompass.sessions.v1`. Die zusätzliche Fischart und das Aktivitätszeichen `zanderContact` werden beim Lesen und Schreiben akzeptiert. Alte Bestände werden nicht automatisch als Zanderköder dupliziert. Neue Zandersessions speichern `zander-lake-1.0.0` samt vollständigem Empfehlungssnapshot. Bestehende Barsch- und Hechtsnapshots bleiben erhalten.

## Verifikation

Szenarien prüfen unbekannte Eingaben, nächtliches Flachwasser, explizite Lichtbeobachtung, Tiefe, Kraut, artspezifischen Bestand, Größenkompromisse und Quellenauflösung. Ein UI-Ablauf führt von der Zander-URL über Empfehlung und Session bis zum erneuten Laden, Logbuchfilter und JSON-Export. Die Bestandsmatrix umfasst alle drei Fischarten.
