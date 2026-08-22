---
id: T034
status: done
priority: P0
dependencies: [T033]
---
# Kundenquellenpaket kanonisieren und Public-Grenze festlegen

## Anlass

Die aktuellen Designerquellen wurden als vollständiges Kundenquellenpaket bereitgestellt und zunächst hashgebunden archiviert. Mit dem kundenkontrollierten öffentlichen GitHub-Repository wird zwischen privater Quellen-/Recovery-Evidenz und veröffentlichbaren Web-Exports getrennt.

## Umsetzung

- ursprüngliches `logos.zip`: SHA-256 `baffc14a9fa9582682ff658f431ec229177ccab698e7d961056f2c5baa584851`, 2.104.448 Byte; private Recovery-Evidenz, nicht Teil der neuen öffentlichen Git-Historie
- öffentliche Primärfassung: `public/brand/hall-of-memory-logo-primary.svg`, SHA-256 `76f3055f5e16081ad58b555263b4a92dec5fc52a87abe238c8f8c6459f573c13`
- öffentliche dunkle JPG-Fassung: `public/brand/hall-of-memory-logo-dark.jpg`, SHA-256 `4bf4bd0a524af72cc7a9375531e1a00f9d385d62318666fb662aef5f3f040c22`
- öffentliche helle JPG-Fassung: `public/brand/hall-of-memory-logo-light.jpg`, SHA-256 `7bd29e4f79b830ea6c97a75118098abfc36a70d616bfba8093b8f01253211c3e`
- `scripts/test-sales-demo.mjs` prüft die öffentlichen Exporte direkt gegen ihre bestätigten Hashes und benötigt keine privaten Designerquellen.
- `.ai`, `.pdf`, ZIP und andere Arbeitsquellen bleiben außerhalb des öffentlichen Repositorys; Build und Preview sind davon unabhängig.

## Akzeptanz

- [x] ursprüngliches Quellenpaket als private Recovery-Evidenz erhalten
- [x] Weblogos hashgebunden und beide Designer-Kontexte sinnvoll sichtbar
- [x] öffentliche Website kann ohne Veröffentlichung der Designer-Arbeitsdateien vollständig gebaut und geprüft werden
- [x] bestehendes Hall-of-Memory-Repo bleibt die Projektquelle; der öffentliche GitHub-Stand erhält eine bereinigte Veröffentlichungshistorie
