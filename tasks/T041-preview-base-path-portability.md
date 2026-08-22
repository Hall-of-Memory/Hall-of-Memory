# T041 — Preview Base-Path Portability

Status: done
Datum: 2026-08-14

## Anlass

Beim revisionsgebundenen GitHub-Pages-Build von T040 wurde vor der Publikation belegt, dass Astro die konfigurierte `base` zwar für gebündelte Assets berücksichtigt, wörtliche root-absolute Links und Public-Asset-Pfade aus den Astro-Templates aber nicht automatisch umschreibt. Ein direktes Spiegeln des Builds hätte deshalb unter `/hall-of-memory-preview/` gebrochene Navigation, Markenassets und Preview-Skripte erzeugt. Es wurde nichts fehlerhaft veröffentlicht.

## Umsetzung

- alle statischen internen Pfade in Demo, Rahmenübersicht, Startseite, Impressum und Datenschutz verwenden nun `import.meta.env.BASE_URL`; Default-Build unter `/` bleibt semantisch unverändert
- Rahmenasset-Pfade und alle übrigen lokalen Demo-Assets folgen demselben normalisierten Base-Vertrag
- neues Regression-Gate `npm run test:preview-base` baut explizit mit `/hall-of-memory-preview` und verwirft jeden HTML/CSS/JS/XML/TXT-Root-Verweis außerhalb dieser Basis
- das Gate prüft zusätzlich T040-Kernsemantik und die sechs Rahmenlinks und ist Bestandteil von `npm run verify`
- kein nachträglicher Mirror-Rewrite und keine zweite Pfadlogik eingeführt

## Validierung

- Finaler Validierungslauf `9d07f9af09864525b4fcf14e`, Lifecycle Receipt `6c0b3fc99aa9181ca4e81a902c2385751ed6b210d3fa0463273b7d5447b44175`, vollständig erfolgreich.
- `npm run test:demo` PASS: `sales-demo-customer-feedback-ok`, `noindex=true`, `apiCalls=0`, HTML 20.253 B, CSS 28.620 B, JS 1.057 B, 14.148 B gzip.
- `npm run test:preview-base` PASS: 30 generierte Dateien, `bad_root_refs=0`, Tree-SHA-256 `919019cbc6c8ef4008513908db4eabcdbaa39df093d3b33ff4ba47fa4b098507`.
- `npm run check` PASS: 37 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise.
- `npm run build` PASS: 11 statische Seiten.
- `git diff --check` PASS.
- Die einzigen Build-Hinweise außerhalb des Astro-Checks sind die bereits bekannten leeren Kunden-Collections `packages`, `faqs` und `gallery`; sie entsprechen extern fehlenden Inhalten und sind kein Base-Path-Fehler.
