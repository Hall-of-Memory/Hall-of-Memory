# Verfügbarkeitsmodell — sichere V1-Basis

Stand: 2026-08-11

Die Verfügbarkeitsanzeige bleibt von einer verbindlichen Buchung getrennt. Solange Inventar, Zeiten, Puffer und gemeinsame Ressourcen nicht belegt sind, liefert das Modell `requires-review` und darf keine automatische Zusage erzeugen.

- `inquiry-only`: immer manuelle Prüfung.
- `capacity-aware`: nur bei explizit bekanntem Inventar; freie physische Einheiten können als `appears-available` erscheinen.
- `appears-available` ist nicht bindend. Atomare Reservierung, konkurrierende Holds und Zahlung gehören zu T013.

Bereits modelliert und als T005 abgeschlossen: mehrere Einheiten je Angebot, deaktivierte Einheiten, echte Zeitintervalle, bestätigte Belegungen, manuelle Sperren und Wartung. Echte Stückzahlen, Puffer, Fahrtzeiten, Personal-/Transportabhängigkeiten und Paketkopplungen sind fehlende fachliche Inputs für T013 beziehungsweise spätere Konfiguration, kein technischer T005-Restpunkt.
