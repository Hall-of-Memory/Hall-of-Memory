# T039 — Header Logo Presence

Status: done
Abhängigkeit: T033

## Ziel

Das aktuelle Hall-of-Memory-Primärlogo im Demo-Header soll als klarer Markenanker lesbar sein, ohne Navigation oder Hero zu dominieren. Die Logoquelle bleibt unverändert; geändert wird ausschließlich ihre responsive Darstellung.

## Umsetzung 14.08.2026

- Desktop/iPad-Breite: Primärlogo von 42×49 px auf 72×84 px vergrößert (ca. +71 % in der Höhe).
- Header-Mindesthöhe von 92 px auf 112 px angehoben, damit die größere Marke nicht gequetscht wirkt.
- Abstand Logo → Claim moderat von 13 px auf 16 px erhöht; Claim bleibt typografisch sekundär.
- Bis 860 px: Logo 54×63 px, Header-Mindesthöhe 88 px; der Claim bleibt wie zuvor ausgeblendet.
- Bis 380 px: Logo 46×54 px, damit Logo und Anfrage-CTA gemeinsam in der mobilen Kopfzeile bleiben.
- Keine Änderungen an Logo-Dateien, Navigation, Hero-Inhalten, Rahmenlogik oder Backend.

## Acceptance

- [x] Responsive CSS-Hierarchie explizit festgelegt.
- [x] Demo-Test schützt Desktop- und Tablet-Präsenz gegen Regression.
- [x] `npm run test:demo` PASS; 11 Seiten gebaut, Sales-Demo-Test grün.
- [x] `npm run check` PASS; 36 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise.
- [x] `npm run build` PASS; 11 statische Seiten.
- [x] Lokaler CDP-Readback: 1024 px → Logo 72×84, Header 112, Claim sichtbar; 834 px → 54×63, Header 88, Claim verborgen; 390 px → 54×63 und 0 px horizontaler Overflow; 375 px → 46×54 und 0 px horizontaler Overflow. Anfrage-CTA bleibt vollständig im Viewport.
- [x] Öffentliche Preview aktualisiert: Preview-Commit `a19177029525c641d2d5da8befbe59cd5ef82cf3`, Pages-Status `built`, Source `ac030d5a7ba0deb56c66aaadd5f05ad982d33c6a`, 32 generierte Dateien, `bad_root_refs=0`, Published-Tree `de7acde0ae305e8f209e39d3d44d2f66e15510101dcacee1109350fab8353ec0`. Externer CDP-Readback: 1024 px = Logo 72×84 / Header 112 / Claim sichtbar; 390 px = 54×63 / Header 88 / 0 px Overflow; 375 px = 46×54 / Header 88 / 0 px Overflow. `noindex,nofollow` und GitHub-Pages-Basis bleiben erhalten.

## Öffentliche Preview

`https://alexdermohr.github.io/hall-of-memory-preview/demo/`
