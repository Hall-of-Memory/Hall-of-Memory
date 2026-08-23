---
id: T018
status: done
priority: P0
dependencies: [T017]
---
# Kundenpreview-Lifecycle der isolierten Sales-Demo

## Ziel

Die visuell und technisch abgenommene Route `/demo/` sowie die aktuelle Rahmenauswahl werden über einen explizit nicht produktiven Preview-Pfad für die Kundenansicht bereitgestellt. Produktion, Anfrage-API und private Betriebsdaten bleiben davon getrennt.

## Aktueller Preview-Stand — 2026-08-16

- Die aktuelle öffentliche Preview läuft über GitHub Pages unter Entwicklerhoheit: `https://alexdermohr.github.io/hall-of-memory-preview/demo/`.
- Die aktuelle Rahmenauswahl ist unter `https://alexdermohr.github.io/hall-of-memory-preview/demo/rahmen/` erreichbar.
- Frischer HTTP-Readback am 16.08.2026: beide Pfade liefern `200`.
- T041 sichert den Build für den GitHub-Pages-Unterpfad `/hall-of-memory-preview/` mit `npm run test:preview-base` regressionsseitig ab.
- Dieser Pages-Pfad ist ein **temporärer öffentlicher Publikationsmirror**, nicht die kanonische Quellwahrheit und nicht die Produktionsarchitektur. Das kanonische Arbeitsrepository bleibt bis zum Kunden-GitHub-Cutover lokal.
- T043 legt als Ziel fest: öffentliches kanonisches Repository direkt in einer GitHub-Organisation des Kunden; danach soll die Pages-Preview aus dieser kanonischen Quelle erzeugt und der bisherige Mirror erst nach erfolgreichem Readback archiviert werden.
- Produktion bleibt Cloudflare gemäß T009. Ein erfolgreicher Pages-Build oder Merge ist keine Produktionsfreigabe.
- Demo-Isolation bleibt fachlich erhalten: Preview-/Demo-Inhalte dürfen keine produktive Anfragewirkung oder privaten Eventdaten erzeugen.

## Historischer Tailscale-Funnel-Stand — nur Evidenz, nicht mehr aktuelle Preview-Autorität

Die folgenden Punkte dokumentieren den früheren T018-Pfad. Sie sind für Recovery/Audit erhalten, dürfen aber nicht mehr als aktueller Kundenlink oder aktueller Runtime-Lifecycle interpretiert werden.

- Demo-Implementierungsstand: `4ed6306` (`fix(demo): use current designer logo sources`), aufbauend auf der Event-first-Runde. Der Markenstand stammt aus der neueren Kundenmail „Logos“ vom 13.08.2026, 13:01:59 Europe/Berlin; die ältere ZIP-Mail von 12:52:02 Uhr ist überholt.
- Revisionsgebundener Volltest des final rebasten Implementierungs-Heads: Grabowski-Job `d7f82fe98cb6`, `succeeded`, Finalization-Receipt SHA-256 `5dbebf15026abda87b6a9fa35e12b90515849bc818267929be6b3ab4c1186b71`.
- Der Volltest umfasst Demo-Regressionssuite, Inquiry-/Security-Prüfungen, Quality-Baseline, Astro Check, Build sowie Worker- und Site-Dry-Runs. Astro Check: 0 Fehler, 0 Warnungen, 0 Hinweise.
- Zusätzlicher echter Chrome-CDP-Readback über den isolierten Grabowski-Browserworker `cdc6cd9e36ea4adf8499` in acht Referenz-Viewports: `1440×1000`, `1366×1024`, `834×1112`, `768×1024`, `621×900`, `620×900`, `390×844`, `340×844`.
- Alle acht Viewports: `overflowX=0`, `outsideCards=0`, drei Angebotskarten vorhanden, `#kundenbereich` vorhanden, alle neun geforderten Anfragefelder vorhanden und WhatsApp-FAB `position=fixed` vollständig innerhalb des Viewports.
- Mobile Typografie ist messbar reduziert: H1 `89.28px` bei 1440 px Breite, `54.6px` bei 390 px und `43.52px` bei 340 px. Der CDP-Lauf endete mit `EVENT_FIRST_VIEWPORT_ASSERTIONS=PASS`.
- Der isolierte CDP-Worker wurde anschließend gestoppt; temporäres Profil und Port `9339` wurden durch Grabowski freigegeben.
- Frühere öffentliche Preview: `https://heim-pc.tail6dbb90.ts.net:10000/demo/`.
- Tailscale Funnel nutzte ausschließlich HTTPS-Port `10000` und proxyt auf `http://127.0.0.1:4334`.
- `AllowFunnel` war live nur für `heim-pc.tail6dbb90.ts.net:10000` gesetzt.
- Bestehende Tailscale-Routen blieben unangetastet:
  - Standard-HTTPS `443` → `127.0.0.1:18082`, weiterhin nur Tailnet;
  - `9443` → `127.0.0.1:8766`, weiterhin nur Tailnet.
- Der frühere T018-Funnel-Port `8443` wurde nicht mehr verwendet. Dort war ein fremder Docker/UniFi-Dienst gebunden (`cgroup:/system.slice/docker.service`, TLS-Zertifikat `CN=unifi`); dieser Dienst wurde weder verändert noch gestoppt.
- Die Event-first-Runde wurde ohne Neustart oder Übernahme des laufenden Preview-Servers veröffentlicht: der bestehende Server las den aktualisierten kanonischen `dist` direkt.
- Nach T033 wurde der kanonische `dist` ohne Neustart des laufenden Preview-Servers neu gebaut. Öffentlicher TLS-Readback: `dist/demo/index.html` und ausgeliefertes HTML waren bytegenau identisch, SHA-256 `81219c6430e9f04bc74dad3034181720d26588856cf194730ab5e18c9d59f798`.
- Das öffentlich ausgelieferte `/brand/hall-of-memory-logo-primary.svg` war bytegenau identisch mit dem Anhang der neueren Mail: SHA-256 `76f3055f5e16081ad58b555263b4a92dec5fc52a87abe238c8f8c6459f573c13`.
- `PUBLIC_CURRENT_DESIGNER_ASSET_READBACK=PASS`: echtes Designer-SVG vorhanden, Event-/Galerieplatzhalter vorhanden, alte `hall-of-memory-mark-01.webp`/`02.webp` abwesend, `noindex,nofollow` erhalten.
- T033-Volltest: Grabowski-Job `e2787afb676d` `succeeded`, Receipt SHA-256 `401e756d6f1d9b10932e5d804c870e087f71a1c07dac9c1f55c03902f04001f0`. Reale Chrome-Abnahme in acht Referenz-Viewports: `CURRENT_DESIGNER_ASSET_VIEWPORTS=PASS`.
- Die früheren Demo-Begriffe „Zukunftsidee“, „nicht verfügbar“ und „nicht beauftragt“ fehlten öffentlich.
- Ohne bestätigte Hall-of-Memory-Businessnummer blieb WhatsApp fail-closed; öffentlich wurde kein `wa.me`-Ziel erzeugt.
- Demo-Isolation blieb erhalten: `noindex,nofollow`, `launchStatus=draft`, `apiCalls=0`.

## Historischer Runtime-Lifecycle des Tailscale-Pfads

- Statischer Preview-Server: Grabowski-Task `9592a29be97d431086882a64`, `python3 -m http.server` auf Loopback-Port `4334`, maximales Laufzeitfenster 24 Stunden. Der Task wurde während der Event-first-Runde nur gelesen und nicht neu gestartet, übernommen oder ersetzt.
- Funnel-Aktivierung wurde durch Grabowski-Task `9e53a130684a48d5bcdfb7dc` erfolgreich auf HTTPS-Port `10000` vorgenommen und war in Tailscale als Hintergrundkonfiguration aktiv.
- Fail-safe Funnel-Abschaltung: Grabowski-Task `a7d351557ea2472391ac54b7` deaktivierte ausschließlich `tailscale funnel --https=10000 off` nach 85.800 Sekunden. Damit wurde der öffentliche Funnel einige Minuten vor dem maximalen Serverende entfernt und hinterließ keinen absichtlich bekannten verwaisten 502-Endpunkt.
- Diese drei Einträge sind historische Evidenz und **keine** Behauptung über heute laufende Tasks, Ports oder Funnel-Konfigurationen.

## Abschlusskriterium

T018 darf `done` werden, wenn entweder der Previewbedarf endet oder der neue kundenkontrollierte Previewpfad aus T043 revisionsgebunden übernommen wurde und der bisherige Entwickler-Mirror nach erfolgreichem Readback abgelöst/archiviert ist. Eine Produktionsveröffentlichung wird durch T018 ausdrücklich nicht freigegeben und bleibt T009/T045 unterstellt.

## Closeout — 2026-08-23

- T043 hat die Kundenpreview revisionsgebunden in `Hall-of-Memory/Hall-of-Memory` übernommen.
- GitHub Pages aus dem Kundenrepo liefert den erwarteten Preview-Inhalt auf der Root-/Demo-Strecke und `/demo/rahmen/`.
- Der frühere Entwickler-Mirror `alexdermohr/hall-of-memory-preview` wurde nach erfolgreichem Ersatz archiviert; Historie wurde nicht gelöscht.
- Damit ist das T018-Abschlusskriterium erfüllt. Die weitere Arbeitsdomain-/Cloudflare-Veröffentlichung liegt ausschließlich in T045; weitere Rahmenentscheidungen liegen in T037/T038/T044.
