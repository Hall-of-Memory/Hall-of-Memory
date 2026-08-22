---
id: T008
status: blocked_external
priority: P1
dependencies: [T002, T004]
---
# Qualität, SEO, Accessibility und Datenschutz

## Akzeptanz
- technische SEO-Baseline
- sinnvolle Metadaten/strukturierte Daten
- Core-Web-Vitals-orientierte Performance
- Tastatur/Screenreader-Baseline
- Formulardatenschutz und minimale Datenspeicherung dokumentiert
- Impressum, Datenschutz und Cookie-/Consent-Thema vor Livegang fachlich und technisch geklärt

## Technische Evidenz — 2026-08-11

- Meta-Description, Open-Graph-Baseline, semantisches `WebPage`-/`ItemList`-/`Service`-JSON-LD aus validierten Site-/Angebotsdaten, genau eine H1 und klare Header/Nav/Main/Footer-Landmarks sind umgesetzt.
- `PUBLIC_SITE_URL` ist optional und wird fail-closed als reine HTTPS-Origin validiert. Ohne echte Domain oder bei `launchStatus: draft` entstehen kein Canonical/`og:url`, kein indexierbarer Sitemap-Eintrag und keine Crawlingfreigabe. Die frühere falsche `example.invalid`-Sitebehauptung ist entfernt.
- Tastatur-Sprunglink fokussiert das echte `main`, globale `:focus-visible`-Stile inklusive Forced-Colors-Fallback, echte Labels, korrekte Pflicht-/Optional-Semantik, Live-Status, benanntes Turnstile-Fieldset, Reduced Motion und responsive Einspaltenform bilden die Tastatur-/Screenreader-Baseline.
- Turnstile wird erst viewport- beziehungsweise fokusnah geladen. Gehashte Assets erhalten Immutable-Caching; HTML bleibt revalidierbar. `scripts/test-quality.mjs` prüft gebautes HTML, SEO-Fail-Closed-Verhalten, JSON-LD-Struktur, Landmarks/Labels/Statusrollen, CSP/Security-Header, nicht blockierende lokale Scripts sowie harte Budgets von 32 KiB HTML, 24 KiB CSS, 20 KiB JavaScript und 20 KiB gzip für initiales HTML/CSS/JS.
- `docs/privacy-data-flow.md` dokumentiert alle Pflicht-/Optionalfelder, D1 als Wahrheit, die nicht duplizierende Outbox, den nicht gespeicherten Turnstile-Token, gehashtes Akteurs-Rate-Limit, minimierte Betreiberbenachrichtigung und das bewusste Fehlen einer Kundenmail. Keine Aufbewahrungsdauer wurde erfunden.

## Kundenwunsch — 2026-08-12

Impressum, Datenschutz und das Cookie-Thema sollen ausdrücklich berücksichtigt werden. Ein Cookie-Banner wird nicht pauschal als Lösung vorausgesetzt: Vor Livegang ist anhand der tatsächlich eingesetzten Drittanbieter-, Analyse-, Marketing- und Einbettungsdienste zu entscheiden, welche Einwilligung technisch und rechtlich erforderlich ist; unnötige Cookies/Tracker sollen vermieden werden.

## Weitere technische Evidenz — 2026-08-12 / T027

- `/impressum/` und `/datenschutz/` sind als echte statische Routen umgesetzt und im Footer verlinkt.
- Beide Seiten sind bis zur finalen Kunden-/Rechtsfreigabe sichtbar als `Entwurfsstand` gekennzeichnet und `noindex,nofollow`; es werden keine Pflichtangaben erfunden.
- `docs/legal-privacy-baseline.md` dokumentiert die technische Grenze ohne Rechtsberatung zu simulieren.
- `scripts/test-quality.mjs` prüft beide Legal-Routen und eine trackerarme Baseline. Bekannte Analyse-/Marketing-/Social-Embed-Marker sind im aktuellen öffentlichen Build nicht vorhanden.
- Es wurde bewusst kein prophylaktisches Cookie-/Consent-Banner und keine Analyse-/Marketingtechnik ergänzt. Die tatsächliche Consent-Entscheidung bleibt von den final eingesetzten Diensten abhängig.
- Finaler Browser-Readback `87c81100db34493eb38df7d1`: `/impressum/` und `/datenschutz/` auf 1440, 834, 390 und 340 px Breite jeweils HTTP 200, `scrollWidth == innerWidth`, korrekte Robots-/Footerdaten und keine Console-/Page-Errors.
- Externer Preview-Readback vom unabhängigen Host `wg-prod-1` lieferte für beide Legal-Routen HTTP 200, Entwurfsmarker und `noindex,nofollow`.
- Finaler kompletter Regressionslauf `f06334ec0f6443feaa6204fa` PASS; Quality-Wert `html=9388 css=9683 js=6779 gzip=8437`.

## Externe Blockade vor Abschluss

- echte öffentliche Domain für Canonical, Sitemap, Turnstile-Hostname und Produktions-Readback
- vollständige, fachlich freigegebene Impressumsangaben
- fachlich/rechtlich freigegebener Datenschutz- und Einwilligungstext
- konkrete Liste der tatsächlich eingesetzten Drittanbieter-, Analyse-, Marketing- und Einbettungsdienste als Grundlage der Cookie-/Consent-Entscheidung
- konkrete Aufbewahrungs-/Löschfrist samt freigegebenem Betriebsprozess für D1, Exporte und Betreiberpostfach
- für den späteren privaten Event-Fotobereich zusätzlich dessen tatsächliche Speicher-/Auslieferungs-, Zugangs- und Löschdaten aus T025

Wenn diese Angaben vorliegen, müssen finale Inhalte, Löschumsetzung und Browser-/Produktionsreadback ergänzt werden. Bis dahin bleibt T008 korrekt `blocked_external`; die bereits technisch umsetzbare Struktur aus T027 ist abgeschlossen.
