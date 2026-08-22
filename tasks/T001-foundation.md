---
id: T001
status: done
priority: P0
dependencies: []
---
# Projektgrundlage, Stack-Validierung und App-Scaffold

## Ziel

Technisch belastbare Projektbasis schaffen, ohne den Kunden unnötig an laufende Kosten oder einen Anbieter zu binden.

## Akzeptanz

- aktuelle Plattform-/Frameworkoptionen anhand Primärquellen validiert
- Zielarchitektur dokumentiert und ADR aktualisiert
- lauffähiges lokales App-Scaffold im Repo
- Entwicklungs-, Build- und Testpfad reproduzierbar
- keine Secrets im Repo
- initialer visueller Platzhalter respektiert Schwarz/Gold-Richtung, ohne fremde Referenzseiten zu kopieren
- Task-Index und Evidenz aktualisiert

## Abschluss-Evidenz — 2026-08-11

- Architektur anhand aktueller Astro-/Cloudflare-Primärdokumentation validiert.
- Astro/Cloudflare-Scaffold angelegt.
- `npm run check` erfolgreich.
- `npm run build` erfolgreich.
- Schwarzes/goldenes responsives Ausgangsdesign mit klar gekennzeichneten Platzhaltern vorhanden.
- Keine produktiven Konten, Secrets, D1- oder R2-Ressourcen angelegt.

## Architekturkorrektur — 2026-08-11

Live-Readback zeigte Astro 7.2 statt der zunächst dokumentierten Astro-6-Annahme. Außerdem aktivierte der vorsorglich installierte Cloudflare-Adapter unnötige Image-/Session-Bindings. Korrigiert auf reines Astro-SSG + Workers Static Assets ohne Adapter. Check, Build und Wrangler-Dry-Run danach erneut erfolgreich geprüft.
