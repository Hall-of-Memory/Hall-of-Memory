---
id: T036
status: done
priority: P0
dependencies: [T035]
---
# Rahmen auf Tiefe, konkave Fassung und Materialität verfeinern

## Anlass

T035 hat die Rahmenhierarchie korrekt auf Signature, Produktkarten und Utility kalibriert. Die nächste Veredelung soll diese Familie nicht breiter, goldener oder ornamentaler machen, sondern räumlicher und materieller: eher Messingfassung, Objektivring und Passepartout als flache digitale Linie.

## Gestaltungsentscheidung

Mehr Gold würde vor allem Lautstärke und Flächenwirkung erhöhen. Für die gewünschte Atelier-/Vintage-Kamera-Anmutung ist stattdessen gerichtete Licht-/Schattenmodellierung sinnvoller: eine helle obere/seitliche Fase, eine dunkle Gegenkante und sehr zurückhaltende innere Vertiefung. Dadurch entsteht Relief, ohne zusätzliche Ornamentik oder dickere Konturen.

## Materialitäts-Hierarchie

- **stark / Signature:** Hero-Bildfassung mit äußerer Messingkante, gerichteter konkaver Fase, innerer Gegenkante und sanfter vertiefter Wärme.
- **mittel / gefasst:** Angebotskarten, Pakete und persönlicher Galerie-Zugang. Gleiche Fasenfamilie, aber schwächere Innenvertiefung; Hover behält die Materialkante statt sie durch einen reinen Drop-Shadow zu ersetzen.
- **leicht / Utility:** Anfrageformular und helle Kontaktkarte erhalten nur minimale gerichtete Licht-/Schattenkanten. FAQ bleibt bewusst linienbasiert und rahmenarm.

## Technische Leitlinie

- bestehende CSS-Struktur bleibt erhalten; keine neue Theme-Logik
- gemeinsame Fasenwirkung wird über eine kompakte CSS-Variable wiederverwendet
- keine breiteren Borders, keine zusätzliche Goldfläche, keine neuen Ornament-Pseudoelemente
- CSS-Budget bleibt unverändert; bei Überschreitung werden Regeln verdichtet statt das Budget erhöht
- keine Worker-, D1-, API-, Preis-, Kunden- oder Buchungsänderungen
- T018-Preview-Prozesse werden nicht übernommen, gestoppt oder neu gestartet

## Prüfstellen

- Hero-Bildfassung
- Angebotskarten Fotobox / Fotospiegel / Magazinbox
- Paketkarten
- persönlicher Galerie-/Kundenzugang
- Anfrageformular und FAQ auf Mobile
- helle Kontaktkarte
- horizontales Overflow-Verhalten bei kleinen Viewports

## Akzeptanz

- [x] Materialitäts-Hierarchie im Browser visuell und messbar bestätigt
- [x] Demo-CSS bleibt innerhalb des bestehenden 28-KiB-Budgets
- [x] Demo-Regressionssuite und Volltest grün
- [x] Responsive-Readback ohne horizontalen Overflow
- [x] bestehende T018-Preview nach validiertem Fast-forward readbacken
- [x] sauberer Commit auf T036

## Evidenz

- Fokussierter Demo-Test PASS: `css=28536` von `28672` Byte, `noindex=true`, `launchStatus=draft`, `apiCalls=0`; Budget unverändert.
- Vollständiges `npm run verify` PASS in Grabowski-Task `79315a38d58848578f665307`: Astro-Check 0 Fehler / 0 Warnungen, Build PASS, Worker- und Site-Wrangler jeweils ausschließlich `--dry-run`.
- Isolierter Chrome/CDP-Readback PASS in Grabowski-Task `99df7e51dd704cadbc4a0fcf`: 8 Viewports (`1440x1000`, `1366x1024`, `834x1112`, `768x1024`, `621x900`, `620x900`, `390x844`, `340x844`), überall `overflowX=0`, `outsideFrames=0`, `faqOutside=false`.
- Computed Styles bestätigen die Staffelung: Hero mit Außenkante plus heller/dunkler Fase und warmer Innenvertiefung; Angebote/Pakete/Zugang mit derselben, schwächeren Fasenfamilie; Anfrage/Kontakt nur mit minimaler gerichteter Licht-/Schattenkante. T018 auf Port 4334 blieb während dieser Prüfungen unangetastet.
- Kanonischer Build nach Fast-forward auf `main` PASS in Grabowski-Task `9a5b2947ea644adb94f9bd88`; der laufende Preview-Server wurde dabei nicht neu gestartet oder übernommen.
- T018-Preview-Server `9592a29be97d431086882a64` blieb auf Port 4334 laufend und bedient weiterhin `./dist`.
- Kanonisches `dist/demo/index.html`, Loopback `http://127.0.0.1:4334/demo/` und öffentliche Preview `https://heim-pc.tail6dbb90.ts.net:10000/demo/` sind bytegenau identisch: SHA-256 `e8b044ef4f5166f2a4ac78b628185a16ccf2893c27e8bff2c3459d1d8915af01`.
- Öffentlich referenziertes Demo-CSS `/_astro/demo.C6KxPrZE.css` ist bytegenau identisch mit dem kanonischen Build: SHA-256 `8504ee7c32438f3006da40fac7f2459892e0a1c78d99781787031ad27cda5a98`.
