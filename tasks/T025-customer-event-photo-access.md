---
id: T025
status: planned
priority: P0
dependencies: [T011]
---
# Geschützter Kunden-Fotobereich pro Veranstaltung

## Verbindlicher Kundenwunsch — bestätigt 2026-08-13

Der Kunde hat am 13.08.2026 ausdrücklich klargestellt, dass der Kundenbereich tatsächlich gewünscht ist und nicht nur als spätere Idee behandelt werden soll.

Veranstaltungskunden sollen nach ihrem Event auf ihre eigenen Fotos zugreifen können. Bevorzugt ist ein geschützter persönlicher Link oder Code. Entscheidend ist die harte Mandantentrennung: Jeder Kunde darf ausschließlich seine eigene Veranstaltung und die zugehörigen Bilder sehen.

Der Kundenbereich ist damit ein P0-Produktziel. `planned` bedeutet hier nicht „optional“, sondern dass für die produktive Umsetzung noch konkrete Betriebs- und Datenschutzentscheidungen fehlen.

## Ziel

Einen datensparsamen, mobil nutzbaren und technisch wirklich geschützten Event-Fotobereich entwerfen und umsetzen, der von der öffentlichen Marketing-Galerie (T007) getrennt ist und später unter Kundenhoheit betrieben werden kann.

## Bereits umgesetzt — Security Foundation T026

Der produktunabhängige Sicherheitskern ist bereits vorhanden und getestet:

- kryptographische Erzeugung hochentropischer persönlicher Link-Tokens mit 256 Bit Zufallsentropie
- Klartexttoken nicht Teil des persistierbaren Grants; nur SHA-256-Digest
- Ablauf und Widerruf von Grants
- explizite Bindung eines gültigen Tokens an die tatsächlich angeforderte `galleryId`
- erneute Asset-Scope-Prüfung; Event A kann weder Event B noch Assets von Event B autorisieren
- ungültige Token-, Scope-, Zeit- und Assetdaten werden fail-closed abgewiesen
- positive und negative Regressionstests sind Teil von `npm run verify`

Evidenz: T026 `done`, Implementierung `ace206f933e787c39795a4f58490f8960a9a75e8` plus Scope-Härtung `142796f`.

Die aktuelle private Designpreview zeigt den Kundenbereich bereits als echten Bestandteil der Customer Journey und nicht mehr als „Zukunftsidee“. Das ist Präsentations- und Architekturarbeit; es ersetzt noch nicht die produktive Galerie- und Speicherimplementierung.

Diese Foundation entscheidet bewusst noch nicht zwischen persönlichem Link und menschlich eingegebenem Passwort/Code. Kurze Passwörter/Codes dürfen nicht über den Link-Token-SHA-256-Pfad behandelt werden.

## Harte Sicherheitsinvarianten

- keine öffentliche Auflistung privater Veranstaltungsgalerien
- Event A darf Medien oder Metadaten von Event B weder über Navigation noch durch URL-/ID-Manipulation erreichen
- Autorisierung gilt an jeder Galerie-/Mediengrenze; `noindex` oder schwer erratbare Pfade allein sind kein Ersatz für Zugriffsschutz
- Zugangsdaten, Codes oder Tokens werden nicht im Klartext in Logs oder Repository geschrieben
- private Medien liegen nicht in einem frei listbaren öffentlichen Bucket/Pfad
- Zugang muss widerrufbar bzw. rotierbar sein, ohne andere Veranstaltungen zu beeinflussen
- Datenschutz-, Aufbewahrungs- und Löschregeln müssen vor Produktivbetrieb feststehen

## Noch zu entscheiden / vom Kunden oder Betrieb zu klären

- finaler Zugangsablauf: persönlicher Link, menschlich eingegebener Code oder eine Kombination daraus
- falls Code: erforderliche Entropie, Rate-Limits und Schutz vor Online-Raten; kurze Codes dürfen nicht wie hochentropische Tokens behandelt werden
- Ansicht-only oder zusätzlich Download; gegebenenfalls Originale vs. optimierte Webdateien
- wer Galerien anlegt und Bilder bereitstellt/hochlädt
- Aufbewahrungsdauer, Löschprozess und gegebenenfalls Ablaufdatum des Zugangs
- Widerruf, erneute Freigabe und Weitergabe eines Zugangs
- erwartete Bildmengen, Dateigrößen und Anzahl paralleler Veranstaltungen
- gewünschte Kundendomain/URL-Struktur
- ob Browser-Uploads im Admin erforderlich sind; falls ja, mit T006/T011 koordinieren

## Noch nicht sinnvoll vorwegzunehmen

- Auswahl/Provisionierung von R2 oder anderem privaten Objektspeicher ohne belegtes Medienvolumen und Uploadmodell
- produktive D1-Gallery-/Asset-/Grant-Schemata ohne entschiedenen Betriebsworkflow
- öffentliches Login-/Code-UI ohne entschiedenes Zugangsmodell
- Download-/Originaldateirechte ohne Kundenentscheidung
- Versand-/Freigabelogik ohne Kommunikationsweg und Ablaufregel
- automatische Löschung ohne freigegebene Aufbewahrungsregel

## Technischer Prüfpfad

- private Objektspeicherung und autorisierte Auslieferung vergleichen; R2 nur bei belegtem Bedarf aktivieren
- persönlichen Link/Token gegen Passwort-/Code-Modell hinsichtlich Bedienung, Widerruf, Missbrauchsschutz und Rate-Limits bewerten
- direkte Objekt-URLs dürfen die Galerieberechtigung nicht umgehen; zeitlich begrenzte signierte URLs oder autorisierter Proxy sind mögliche, erst noch zu validierende Pfade
- die bestehende T026-Scope-Logik an der späteren Medienauslieferung erzwingen und durch End-to-End-Negativtests belegen
- mobile Galerie, Ladeverhalten und Bildgrößen praktisch prüfen

## Abgrenzung

- T007: öffentliche, freigegebene Marketing-Galerie
- T006: Betreiber-Admin und spätere Inhaltspflege
- T013: Verfügbarkeit / verbindliche Buchungsengine
- T025: ausschließlich privater Fotozugang für konkrete Veranstaltungen

## Akzeptanz vor `done`

- Schutzmodell und Kunden-UX fachlich freigegeben
- private Speicher-/Auslieferungsgrenze dokumentiert und praktisch validiert
- Cross-Event-Isolation durch positive und negative End-to-End-Tests belegt
- Widerruf/Rotation des produktiven Zugangs belegt
- bei Code-Zugang: Online-Rate-Limit und Entropie-/Bruteforce-Schutz belegt
- Datenschutz-, Aufbewahrungs- und Löschregeln umgesetzt
- responsive Kundenansicht geprüft
- keine produktive Ressource oder laufende Kosten ohne vorherige Freigabe aktiviert
