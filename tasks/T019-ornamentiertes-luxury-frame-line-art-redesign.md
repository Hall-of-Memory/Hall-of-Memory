---
id: T019
status: done
priority: P0
dependencies: [T017]
---
# Ornamentiertes Luxury-Frame- und Line-Art-Redesign der Sales-Demo

## Ziel

Die isolierte Route `/demo/` wurde gegen die vom Nutzer am 12.08.2026 gelieferte Art Direction veredelt: klassische Luxusmarke / High-End-Hotel / Schmuck / Fashion Editorial. Gold bleibt auf Hairlines, Gravur, Rahmen, Marker und dezente Line-Art begrenzt. Keine großen Goldflächen, Glows, Stock-Icons, Drittanbieterassets, Glassmorphism oder Effektshow.

Die beigefügte Referenz wurde ausschließlich als Art Direction verwendet. Sie ist nicht als Rastergrafik oder Fremdasset in die Website gelangt; die Gestaltung besteht aus CSS, semantischem Markup und eigenen Inline-SVGs.

## Ausgangsstand und Autorität

- Live verifizierter Ausgangsstand: `main`, sauber, HEAD `c647ef3d0e9e44103fafb51bb277d241345816c6`.
- T019 war frei und wurde als P0-Task unter `tasks/` angelegt; Task-Registrierungs-Commit: `afdff180746146c4e948b7bcdb3cb2b8cdef791e`.
- T018 blieb während der gesamten Umsetzung unabhängig `active`; dessen Preview-Server auf Loopback-Port 4334 und Funnel-Cleanup für 8443 wurden nicht übernommen, gestoppt oder umkonfiguriert.
- App-Scope der eigentlichen Gestaltung: ausschließlich `src/pages/demo.astro` und `src/styles/demo.css`. Kein neues JavaScript, keine externen Assets, keine Produktions-/Worker-/D1-/API-Änderung.

## Umsetzung

### Ornamentiertes Rahmensystem

- Wiederverwendbares `.demo-ornate-frame` mit feinem äußeren Champagnerrahmen, sehr zurückhaltender innerer Hairline und vier kleinen gravurartigen CSS-Eckdetails.
- Dosierte Anwendung auf Hero-Bühne, Angebotskarten, Anfrageformular, Future-Tafeln, neues gerahmtes Kapitel und Footer.
- Keine großen Goldflächen, kein Glow und keine zusätzliche UI-Chrome-Schicht.

### Future-Editorial und eigene Line-Art

- Future-Header als Editorial-Spread: große Serif-Headline links; Erklärung rechts an einer dünnen vertikalen Champagnerlinie mit mittigem Marker.
- Sehr zurückhaltende architektonisch-botanische Hintergrundgravur als eigenes Inline-SVG; mobil bewusst ausgeblendet, damit die kleine Komposition nicht dekorativ überladen wird.
- Vier eigenständig gezeichnete Inline-SVG-Line-Arts, jeweils `aria-hidden` und nur als subtile Bronze-/Champagnergravur eingesetzt:
  1. Galeriekorridor mit Bogenarchitektur und Perspektivlinien,
  2. hochwertige Präsent-/Geschenkbox mit Band,
  3. klassische Concierge-/Serviceglocke,
  4. ornamentierter klassischer Schlüssel.
- Vier Future-Tafeln mit Medaillons `01`–`04`, kurzer Zierlinie, ruhiger Typografie, `ZUKUNFTSIDEE`-Fußzeile und kleinem Marker.
- Normal-flow-basierter Hall-of-Memory-Signaturdivider und anschließendes großzügiges `framed chapter` mit eigenem Marker und klarer Kapitelöffnung ergänzt.

## Realer iPad-Befund: Ursachenlage und struktureller Fix

### Belegt

- Im Ausgangsmarkup war der Future-Bereich die letzte Section innerhalb von `<main>`; direkt danach begann der separat gerahmte Footer.
- Future und Footer waren zwei unabhängig inset-gerahmte Flächen. Zwischen ihnen existierte kein eigener normal-flow-basierter Übergangs-/Kapitelbaustein; der Footer hatte lediglich einen kleinen `margin-top`.
- An dieser konkreten Adjazenz wurden keine negativen Margins, kein `translateY` und keine feste Future-Höhe gefunden, die einen klassischen geometrischen DOM-Overlap erklären würden.
- `.demo-page` besaß global `overflow-x: hidden`; dieses Clipping wurde entfernt, damit horizontaler Fehlzustand nicht als scheinbarer PASS maskiert werden kann.

### Plausibel, aber nicht als Safari-Bug behauptet

Der reale iPad-Screenshot ist am besten als visuell unsauberer Übergang zweier unmittelbar aufeinanderfolgender, separat gerahmter Flächen zu erklären, nicht als nachgewiesener negativer DOM-Versatz. Eine exakte Reproduktion des ursprünglichen Safari-Rasterisierungspfads liegt nicht vor; deshalb wird kein spezifischer Safari-Engine-Bug behauptet.

### Strukturelle Reparatur

- Future wächst vollständig intrinsisch mit seinem Inhalt; kein fixes Section-Höhenmodell und kein viewportgebundener Übergang.
- Karten/Grid-Minima sind für schmale Layouts begrenzt; lange Titel, insbesondere `Buchungsfunktionen`, dürfen die Karte nicht verbreitern.
- Zwischen Future und Folgebereich liegt jetzt ein eigenständiger Divider im normalen Dokumentfluss.
- Die Folgesektion ist ein separat gerahmtes Kapitel, ebenfalls im normalen Flow; Future → Divider → Chapter → Footer besitzen messbar positive Abstände.
- Kein `overflow: hidden` wurde als Reparatur über den Übergang gelegt, keine negative Margin und kein Transform-Hack eingeführt.

Damit hängt die Trennung nicht von Safari-spezifischer Viewport-Höhenberechnung ab. Verbleibende Unsicherheit betrifft nur die exakte historische Ursache des ursprünglichen Safari-Rasterbildes, nicht die final gemessene Geometrie.

## Technische Gates

Finaler revisionsnaher Gate-Lauf: Grabowski-Task `424e9b2aaf2648a48e2466e7`, **PASS**.

- `npm run test:demo` — PASS; `noindex=true`, `launchStatus=draft`, `apiCalls=0`; Demo-HTML 16.452 Byte, kombiniertes CSS 28.654 Byte, JS 1.057 Byte, gzip 13.288 Byte.
- `npm run test:form` — PASS.
- `npm run test:quality` — PASS.
- `npm run check` — PASS, 0 Fehler, 0 Warnungen, 0 Hinweise.
- `npm run build` — PASS.
- `npm run verify` — PASS einschließlich lokaler Inquiry-Spike-/Domain-/Form-/Quality-/Demo-Gates und Worker-/Site-Dry-Runs.
- `git diff --check` — PASS.
- Die bekannten Warnungen zu leeren Collections `packages`, `faqs` und `gallery` blieben Baseline und wurden nicht verschlechtert.

## Chrome-Stable/CDP-Proof

Korrigierter finaler Evidenzsatz: `/tmp/hom-t019-final-review-v5/`, Manifest-SHA-256 `1b266847996ee2091ccb90faa252b75b06896fbe71ab7672ae03c4f529eee175`.

Die finalen Screenshots sind korrekt an die Zielbereiche gebunden: In allen `future`-Captures liegt die Future-Section etwa 18 px unter dem Viewportanfang und die Headline ist sichtbar; in allen `transition`-Captures sind Signaturdivider und Chapter-Headline sichtbar.

| Viewport | scrollWidth / innerWidth | Titel | Overshoot | Flow-Abstände Future→Divider / Divider→Chapter / Chapter→Footer |
|---|---:|---|---:|---:|
| 1440×1000 | 1425 / 1440 | alle passen | 0 | 104 / 104 / 104 px |
| 834×1112 | 819 / 834 | alle passen | 0 | 66,718 / 66,719 / 66,718 px |
| 390×844 | 375 / 390 | alle passen | 0 | 66 / 66 / 54 px |
| 1366×1024 | 1351 / 1366 | alle passen | 0 | 104 / 104 / 104 px |
| 340×844 | 325 / 340 | alle passen | 0 | 66 / 66 / 54 px |

In allen fünf Viewports gilt `document.documentElement.scrollWidth <= window.innerWidth`; `Buchungsfunktionen` kollidiert oder clippt nicht. Alle vier Line-Art-SVGs sind vorhanden. Die große Hintergrundgravur bleibt auf Desktop/iPad sichtbar und ist auf Mobile bewusst deaktiviert.

Der task-eigene Chrome-Stable-Worker wurde nach dem Proof gestoppt; ephemeres Profil sowie Port-/Profil-Leases wurden vollständig freigegeben. Es verbleibt kein eigener Browserworker.

## Unabhängiger visueller Review

Read-only Review durch einen vom Writer getrennten Grok-4.5-Reviewer, Grabowski-Task `99b5d7debe1c4fbf8f4e9e0c`, gebunden an den korrigierten v5-Evidenzsatz: **PASS**.

- keine P0-, P1- oder P2-Findings am Future-/Übergangs-Scope;
- klassische Luxury-Sprache, Schwarz/Ivory und zurückhaltendes Gold bestätigt;
- Future-Plaques nicht mehr als generische Webcards bewertet;
- Future → Divider → framed chapter sauber;
- iPad 834/1366 komponiert;
- Mobile 390/340 reduziert und ohne Clipping bei `Buchungsfunktionen`;
- ausdrücklich für die Kundenpräsentation freigegeben.

Zusätzlich wurde die gesamte Demo revisionsnah über 18 target-gebundene Screenshots geprüft: Hero, Angebote, Editorial, Anfrage, Future und Übergang jeweils bei `1440×1000`, `834×1112` und `390×844`. Evidenzmanifest: `/tmp/hom-t019-coherence-review/`, SHA-256 `b72b51751e7cfc618dc90f4b2a81443a2b9e99b3a188021d0b36b2763c3e8912`. Der unabhängige Read-only-Reviewer `309ce4e4cadb4d399861b497` bewertet die **gesamte Demo als PASS und kundenpräsentabel**, ohne P0/P1.

Zwei P2-Nuancen wurden eingeordnet:

- Der im `390×844`-Offers-Capture oberhalb der Section sichtbare angeschnittene Rest „Fotobox“ ist kein Seitenfehler, sondern Folge der bewusst target-gebundenen Aufnahme: die Offers-Section liegt etwa 18 px unter dem Viewportanfang und zeigt damit noch einen schmalen Streifen der vorherigen Angebots-Ribbon.
- Das Fotobox-Motiv wirkt bei `834×1112` etwas quadratischer/gedrungener als bei Desktop und Mobile, bleibt aber intakt. Dieser nicht blockierende Responsive-Micro-Polish ist als T020 dedupliziert unter `tasks/` registriert und blockiert weder T019 noch die Kundenpräsentation.

## Öffentliche Preview-Evidenz

T018 bleibt absichtlich `active`. Die bestehende autorisierte Preview wird weiterhin über `https://heim-pc.tail6dbb90.ts.net:8443/demo/` auf den unveränderten Loopback-Server 4334 geführt; bestehende 443-/9443-Routen wurden nicht verändert.

Ein TLS-verifizierter Readback wurde explizit gegen die drei öffentlichen Tailscale-Funnel-Edge-Adressen `185.40.234.37`, `185.40.234.172` und `185.40.234.210` durchgeführt. Auf allen drei Edges sind HTML und beide eingebundenen Stylesheets bytegenau identisch zum lokalen finalen `dist`:

- `dist/demo/index.html`: `ac6e6335ed31c1b46183a08ab235c77fd778f9477f314d94484f4f010d2ec667`;
- `/_astro/InquiryEventFields.CqO4gryu.css`: `9a98496830bfed27072d900d94c1d8ef98cf55eb123af7e2057f8057137c10c2`;
- `/_astro/demo.BhvP8xad.css`: `fb23fea05d359cf1a0963b0f284ddfb2f0a5b74111e5dbc6a40a087c8c62a659`.

## Abschluss

T019 ist nach technischen Gates, korrigiertem Chrome/CDP-Proof, unabhängigem Future-Review, unabhängigem Full-Demo-Review und öffentlichem Edge-Readback `done`. T018 bleibt als separater Preview-Lifecycle `active`. T020 hält ausschließlich den nicht blockierenden Responsive-Motif-Micro-Polish fest. Produktionsroute, Anfrage-API, D1, Worker, T013 und `launchStatus` sind unverändert geblieben.
