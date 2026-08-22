---
id: T037
status: active
priority: P0
dependencies: [T036]
---
# Schauwerk-Fundus Stellar-Frame Pilot

## Ziel

Den ersten echten Schauwerk-Fundus-Baustein in der Hall-of-Memory-Demo als isolierten visuellen Proof einsetzen, ohne die bestehende T018-Preview oder andere Rahmenhierarchien zu verändern.

## Eingangsbeweis

- Fundus-Asset: `hall-of-memory.stellar-frame.01`
- Construction Master SHA-256: `c69b4d478ba626309b35f7b2838e16cd294eb1d1244f30ada514e77f6ab30353`
- abgelehnter zu-floraler Referenzmaster SHA-256: `f45aa92aa1c4e53e2efbca17fcbca79b606e3b5c67bf9bf4c97def70b5b7f99d`
- Fundus Build: `be78575455211702661d868fed9c2eed5bbe8634e94cda199073bdfb43f7adb6`
- Fundus-Masken-SVG SHA-256: `3a2b72bc17953f0e4efaaa315c78f6ca4f3489dc66de75d661467b5aff165b00`
- square Consumer-SVG SHA-256: `c77ae47f1f072457e9905a50bb8b646d36d4bc35574e16d2441df8d09d074290`
- der Build ist technisch validiert, aber absichtlich noch **nicht** ästhetisch `accepted`

## Consumer-Adaption

Der 1024×1536-Construction-Master darf auf der quadratischen Hero-Fläche nicht global auf 1:1 gestaucht werden. Die Review-Lane verwendet deshalb eine square-adapted SVG-Hülle: Topband 0–160, Mittelband 688–848 und Bottom-Band 1376–1536 bleiben jeweils 1:1; nur die überwiegend geraden vertikalen Zwischenstücke werden auf die quadratische Fassung verkürzt. Der Fundus-Master und sein Build-Digest bleiben unverändert.

## Scope

- nur Hero-/Eventbild-Fassung der Demo
- vorhandene Messing-/Fasenmaterialität erhalten
- Fundus-SVG ausschließlich als recolorierbare Linien-/Maskenebene einsetzen
- kein Produktkarten-, Paket-, Footer- oder Theme-Refactor
- T018 auf Port 4334 nicht übernehmen, stoppen oder überschreiben
- separate Review-Preview auf Port 4335 / Tailnet HTTPS 10001

## Akzeptanz

- [x] `npm run verify` grün; CSS-Budget eingehalten
- [x] Desktop-/Tablet-/Mobile-Readback ohne horizontalen Overflow
- [x] Chromium lädt und rendert die square-adapted SVG als CSS-Maske
- [ ] neuer Rahmen ist visuell gegenüber Logo und Eventinhalt passend zurückhaltend
- [ ] direkte visuelle Nutzerabnahme: `nehmen` oder benannte Korrektur
- [ ] erst nach `nehmen`: Fundus-Acceptance und Consumer-Package erzeugen; finalen Vendoring-Lock binden

## Evidenz

- Schauwerk PR #125 gemergt; Fundus-Asset reproduziert Build `be78575455211702661d868fed9c2eed5bbe8634e94cda199073bdfb43f7adb6` auf `main`.
- Hall-of-Memory Final-Verify: Grabowski Task `a0771a3fbd5f4d18844938e9`, terminal `completed`.
- Astro Check: 32 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise.
- Demo-Budget: HTML 21.144 B; CSS 28.279 B von maximal 28.672 B; JS 1.057 B; gzip 14.247 B.
- Chromium-Readback: Desktop 1440×1000 → Hero 601,5×601,5; Tablet 834×1112 → 640×640; Mobile 390×844 → 362×362; jeweils horizontaler Overflow 0.
- CSS-Masken-Readback referenziert `hall-of-memory-stellar-frame-01-square.svg` bei allen drei Viewports, `mask-size: 100% 100%`, Opazität 0,72.
- isolierte Review-URL: `https://heim-pc.tail6dbb90.ts.net:10001/demo/` (Tailnet-only); bestehende T018-Preview auf 10000/4334 blieb unverändert.
