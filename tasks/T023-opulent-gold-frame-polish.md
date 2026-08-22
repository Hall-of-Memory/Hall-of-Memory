---
id: T023
status: done
priority: P0
dependencies: [T022]
---
# Opulent Gold Frame Polish

## Ziel

Die isolierte `/demo/` wird sichtbar kräftiger, goldiger und luxuriöser gerahmt. Außen- und Innenfassungen, Eckornamente, Divider, Marker und gravurartige Line-Art erhalten mehr Gewicht sowie kontrollierte Champagner-/Antikgold-Verläufe, ohne Neon, Glow, Kitsch, moderne Glass-Cards oder flächige Goldwirkung.

## Art Direction

- Rahmen sind gestalterischer Hauptträger und deutlich präsenter als in T022.
- Gold zeigt klar lesbare Hell-/Dunkel-Staffelung: Champagnergold, warmes Messing und gedämpftes Antikgold.
- Karten lesen als gefasste Premiumtafeln; Hero-/Stage-Fassung ist das stärkste Einzelstück.
- Ornamentik ist größer und lesbarer, bleibt aber klassisch und kontrolliert.
- Line-Art wird an die höhere Rahmenstärke angepasst, bleibt gravurartig und textdienlich.

## Scope

Bevorzugt nur:

- `src/styles/demo.css`
- `src/pages/demo.astro`
- `tasks/INDEX.md`
- diese Taskdatei

Keine Änderung an Worker, D1, echter Anfrage-API, Buchungsengine, Produktionsroute, Preisen, Kundendaten, Testimonials, Verfügbarkeiten oder `launchStatus`. Kein neues JavaScript.

## Acceptance

- Hero-/Stage-Fassung, Angebotskarten, Future-Karten, Kapitel und Footer besitzen sichtbar kräftigere Goldrahmen mit kontrollierten Tonwertverläufen.
- Innenfassungen und Eckornamente sind klarer und dekorativer, ohne Glitzer-/Glow-Effekt.
- Divider, Marker, Medaillons und Signaturlinien führen deutlich stärker.
- Offer-/Future-Line-Art ist lesbarer und kräftiger, ohne iconhafte Wirkung.
- Viewports `1440×1000`, `834×1112`, `390×844`, `1366×1024`, `340×844`: `scrollWidth <= innerWidth`, keine abgeschnittenen Ornamente oder Rahmenkollisionen.
- `npm run test:demo`, `npm run test:form`, `npm run test:quality`, `npm run check`, `npm run build`, `npm run verify`, `git diff --check` grün.
- Demo-Isolation bleibt `launchStatus=draft`, `noindex,nofollow`, `apiCalls=0`.
- T018 bleibt eigenständig aktiv; dessen Preview-Server, Cleanup-Task und fremde 443-/9443-Routen werden nicht übernommen oder gestoppt.
- Nach finalem PASS wird der laufende T018-Previewpfad mit dem verifizierten Build aktualisiert und öffentlich rückgelesen.

## Closeout-Evidenz

- Implementierung: Commit `60839ce` (`feat(demo): strengthen opulent gold framing`).
- Stage/Hero nutzt eine stärkere 4px-Metallfassung; gemeinsame Premiumtafeln nutzen eine kräftigere doppelte Rahmenarchitektur mit Gold-Hell-/Dunkelstaffelung und klareren Eckornamenten.
- Goldtokens und Rahmenverläufe staffeln Champagnergold, Antikgold und warmes Messing; keine flächige Goldfüllung, kein Glow und kein Neon.
- Offer-/Future-Line-Art, Divider, Marker und Medaillons wurden sichtbar kräftiger und kontrastreicher geführt.
- Demo-CSS nach Build: `28659` Byte bei Qualitätsgrenze `28672` Byte.
- Pflichtviewports in echtem Chrome/Playwright: `1440×1000`, `834×1112`, `390×844`, `1366×1024`, `340×844` jeweils `horizontalOverflow=0`; keine überstehenden DOM-Elemente.
- Unabhängiger Full-Demo-Visual-Review `0fe066777a864cecb659d58e`: **PASS**, Konfidenz `0.95`, keine Blocker. Die einzige optionale Tablet-Dichteidee ist dedupliziert als T024 registriert.
- Gates: `npm run test:demo`, `npm run test:form`, `npm run test:quality`, `npm run check`, `npm run build`, `npm run verify`, `git diff --check` vollständig PASS. Bestehende Content-Loader-Warnungen für leere Collections unverändert.
- Isolation: `launchStatus=draft`, `noindex,nofollow`, `apiCalls=0` erneut belegt.
- Kundenpreview: `https://heim-pc.tail6dbb90.ts.net:8443/demo/` liefert vom unabhängigen Host `wg-prod-1` `HTTP 200`, gültige TLS-Verifikation und exakt den lokalen Build.
- Öffentlicher/lokaler HTML-SHA-256: `077461d7dc2ef0f2bc59f3e154a4463760082aae8e16089c6a4e5a262374554e`.
- Öffentlicher/lokaler CSS-SHA-256: `InquiryEventFields.CqO4gryu.css` = `9a98496830bfed27072d900d94c1d8ef98cf55eb123af7e2057f8057137c10c2`; `demo.ATv6hcvG.css` = `2031a81061d3c66ef995015f860216848c3920605ab53ef31f5be7eda37b3a31`.
- Der Heim-PC-eigene `curl` meldete für denselben Funnel lokal eine selbstsignierte Vertrauenskette; der unabhängige externe TLS-Readback verifiziert die Kunden-URL dagegen fehlerfrei. Damit ist dies ein lokaler Prüfumgebungsbefund, kein Preview-Blocker.
