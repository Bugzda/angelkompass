# Meilenstein: lokale Sessions und Feedback

Stand: 12. Juli 2026

## Ziel

Eine der maximal drei vorhandenen Empfehlungen kann als lokale Angelsession gestartet werden. Die App protokolliert Biss, Fang und ausbleibenden Erfolg und führt bei „Kein Erfolg“ kontrolliert durch den bestehenden Dreiphasenplan. Das Feedback verändert weder Ranking noch Regelgewichte.

## Festgelegter Ablauf

1. Bedingungen erfassen, fachliche Rangfolge berechnen und anschließend auf den persönlichen Bestand projizieren.
2. Eine der drei Empfehlungen bewusst auswählen.
3. In der aktiven Phase Biss, Fang oder keinen Erfolg protokollieren.
4. Nur „Kein Erfolg“ schaltet von Ausgangsversuch über Präzisieren zu Spot wechseln.
5. Nach der letzten erfolglosen Phase gilt der Plan als ausgeschöpft.
6. Die Session wird ausschließlich manuell abgeschlossen.

Es darf nur eine aktive Session geben. Abgeschlossene Sessions bleiben auf dem Gerät erhalten und sind schreibgeschützt. Jede Session kann nach Bestätigung gelöscht werden.

## Persistenz und Historie

Sessions liegen als versionierter JSON-Envelope unter `angelkompass.sessions.v1` im lokalen Browser-Speicher. Bedingungen und gewählte Empfehlung werden vollständig als Snapshot gespeichert. Historische Sessions werden deshalb nach Regel- oder Katalogänderungen nicht neu berechnet.

Der persönliche Bestand wird separat unter `angelkompass.inventory.v3` gespeichert. Die Schlüssel `angelkompass.inventory.v1` und `.v2` bleiben ausschließlich als Migrationsquellen für bestehende Nutzer erhalten. Ein alter IndexedDB-Prototyp wird weder importiert noch gelöscht. Defekte oder unvollständige Sessioneinträge werden beim Lesen verworfen; Schreibfehler werden in der Oberfläche angezeigt.

## Fachliche Grenzen

- Sessionfeedback ist ein persönliches Protokoll und keine neue Evidenzquelle.
- Das fachliche Ranking wird vor der Sessionauswahl vollständig berechnet.
- Der Bestand verändert weiterhin keine Scores oder Reihenfolge.
- Es gibt keine Cloud-Synchronisation, Konten, Exporte oder automatische Ablaufzeit.
