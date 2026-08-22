---
id: T013
status: blocked_external
priority: P1
dependencies: [T011, T005, T006]
---
# Vollständige Buchungsengine / verbindliche Echtzeitbuchung

## Einordnung

Bewusste **Folgearbeit**. T013 beginnt erst, wenn der einfachere Anfrage-/Verfügbarkeitsweg fachlich steht und die Geschäftsregeln belegt sind. Keine scheinbar professionelle Sofortbuchung auf Basis erfundener Annahmen.

## Fehlt vom Kunden / Betrieb

- Anzahl real vorhandener Einheiten je Angebot
- gemeinsam genutzte Ressourcen wie Personal, Transport oder Zubehör
- Mietdauer sowie Aufbau-/Abbau- und Fahrtpuffer
- Liefergebiete und mögliche Anfahrtskosten
- Regeln für Paket- und Produktkombinationen
- manuelle Bestätigung vs. verbindliche Sofortbuchung
- Zahlungs-/Anzahlungslogik
- Storno- und Umbuchungsregeln

## Technischer Pfad, noch nicht entschieden

1. D1-basierte Ressourcen-/Reservierungsdaten als einfache Ausgangsoption prüfen.
2. Echte zeitlich begrenzte Holds und konkurrierende Sofortbuchungen nur dann einführen, wenn das Geschäftsmodell sie verlangt.
3. Durable Objects oder vergleichbare serialisierte Koordination erst bei nachgewiesenem Race-Condition-/Hold-Bedarf prüfen.
4. Zahlungsanbieter erst nach fachlicher Entscheidung und transparenter Fremdkostenprüfung anbinden.

## Akzeptanz vor Aktivierung

- alle oben genannten Geschäftsregeln schriftlich belegt
- Ressourcenmodell aus T005 belastbar
- Admin-/Betriebsprozess aus T006 belastbar
- Architektur-Gate T011 abgeschlossen
- Kosten- und Fehlerfolgen der verbindlichen Buchung dokumentiert
