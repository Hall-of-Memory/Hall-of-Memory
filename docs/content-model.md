# Inhaltsmodell

Stand: 2026-08-11

## Ziel

Marketing-Inhalte sind als strukturierte, durch Astro/Zod validierte Daten vom Seitenlayout getrennt. Dadurch kann später ein Git-basiertes CMS oder eine andere Bearbeitungsoberfläche angebunden werden, ohne die öffentliche Seitenstruktur neu zu bauen.

## Collections

- `site`: Marken-/Seiteneinstellungen
- `offers`: Event-Angebote
- `packages`: optionale Pakete und Preislabels
- `faqs`: FAQ-Einträge
- `gallery`: freigegebene Bildmetadaten

Die Schemata stehen in `src/content.config.ts`; die Inhalte liegen unter `src/content/`.

## Quellenkennzeichnung

Jeder Eintrag trägt `source = internal-draft` oder `customer-provided`. Der aktuelle Entwurf enthält keine erfundenen Preise, Bewertungen, Kontaktdaten oder Originalbilder. Pakete, FAQ und Galerie bleiben leer, bis belastbare Inhalte vorliegen.

## CMS-Grenze

Dieses Datenmodell entscheidet noch nicht über Pages CMS, ein anderes Git-CMS oder einen eigenen D1/R2-Admin. T011 bleibt dafür das Architektur-Gate.
