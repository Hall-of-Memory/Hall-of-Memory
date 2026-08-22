---
id: T032
status: done
priority: P0
dependencies: [T014, T031]
---
# Event-first Kundenfeedback vom 13.08.2026 umsetzen

## Kundenauftrag

Die bestehende Premium-Demo soll den bestätigten Schwarz-/Gold-/Creme-Charakter behalten, aber deutlich stärker als Event- und Erlebniswebsite funktionieren und weniger wie eine Editorial-/Magazinseite wirken.

Verbindliche Quelle: `docs/customer-feedback-2026-08-13.md`.

## Umgesetzt

- Hero auf Event-first Hierarchie umgestellt
- „Every Star Has a Memory“ und direkter CTA prominent integriert
- große visuelle Hero-Fläche für echtes Bild beziehungsweise später optional Video vorbereitet
- zunächst ZIP-basierte Markenmotive integriert; dieser Teil wurde durch T033 nach Eingang der neueren Designer-Mail korrigiert
- Angebotskarten für Fotobox, Fotospiegel und Magazinbox mit größeren visuellen Flächen, kurzen Kerninformationen sowie „Mehr erfahren“ und „Jetzt anfragen“
- Goldornamentik und Rahmendichte deutlich reduziert; mehr freie und cremefarbene Fläche für modernen Premium-Rhythmus
- Smartphone-Typografie sichtbar verkleinert und auf 620 px sowie 380 px gesondert balanciert
- gewünschte Startseitenlogik umgesetzt: Angebote, Vorteile, Pakete, Galerie, Ablauf, Anfrage, FAQ/Kontakt
- persönlichen Kundenbereich zusätzlich als echten Bestandteil der Customer Journey integriert
- bisherige Demo-Bezeichnungen „Zukunftsidee“, „nicht verfügbar“ und „nicht beauftragt“ entfernt
- Paket-Slot im Demoformular aktiv nutzbar gemacht, ohne Paketpreise oder Leistungen zu erfinden
- vollständige gewünschte Anfragefeldstruktur sichtbar gemacht: Produkt, Paket, Datum, Ort, Veranstaltungsart, Name, E-Mail, Telefonnummer, Freitext
- festen hochwertigen WhatsApp-Button einschließlich Standardtext und produktspezifischer Textlogik implementiert
- WhatsApp bewusst fail-closed: ohne echte Hall-of-Memory-Businessnummer kein `wa.me`-Ziel
- FAQ-/Kontaktbereich ergänzt
- Struktur weiterhin produktunabhängig erweiterbar gehalten

## Nicht erfunden / bewusst offen

- keine echten Produkt- oder Eventfotos simuliert; die vorgesehenen Flächen werden mit Originalmaterial aus T010 ersetzt
- keine Paketnamen, Leistungen oder Preise erfunden
- keine Hall-of-Memory-WhatsApp-Nummer geraten
- damaliger ZIP-Befund war nur Zwischenstand; die neuere Mail „Logos“ liefert echte SVG-/AI-/PNG-/JPG-/PDF-Quellen und wird in T033 autoritativ
- produktiver Kundenbereich nicht fälschlich als abgeschlossen markiert; T025 bleibt P0 und `planned`

## Qualitätsbeleg

Dedizierter Regressionstest über Grabowski-Job:

- Unit: `grabowski-job-ed1291cf8a4c`
- Ergebnis: `succeeded`
- Finalization receipt SHA-256: `01820f76fbbed7e66f6ba0a9a63daf3438b8157081aca8585ecac5a2c7f89f46`
- Ausgabe: `sales-demo-customer-feedback-ok`
- vollständiger `npm run verify`-Lauf: Unit `grabowski-job-a624866e48aa`, Ergebnis `succeeded`, Receipt SHA-256 `ab67a3eab5790c48332a79c03b556bcd27d8ef51277d5c44d5c328be12e71ed1`
- Astro Check im Volltest: 0 Fehler, 0 Warnungen, 0 Hinweise
- Worker- und Site-Deployment: jeweils erfolgreicher lokaler Dry-Run ohne produktive Mutation
- finaler post-rebase Volltest des gemergten Implementierungs-Heads `35551d9274e612e317a93ee42ac2d4649e99187c`: Grabowski-Job `d7f82fe98cb6`, `succeeded`, Receipt SHA-256 `5dbebf15026abda87b6a9fa35e12b90515849bc818267929be6b3ab4c1186b71`
- öffentlicher T018-Readback nach kanonischem Build: HTML sowie beide CSS-Bundles bytegenau identisch zum lokalen `dist`; semantischer Readback `PUBLIC_DEMO_SEMANTIC_READBACK=PASS`
- echter isolierter Chrome-CDP-Readback in acht Referenz-Viewports von 1440×1000 bis 340×844: `overflowX=0`, `outsideCards=0`, alle neun Anfragefelder vorhanden, WhatsApp-FAB vollständig im Viewport; `EVENT_FIRST_VIEWPORT_ASSERTIONS=PASS`
- private Preview bleibt `noindex,nofollow`
- echte API-Aufrufe in der Demo: `0`
- lokale Kundenassets: `2`
- HTML: `20830` Bytes
- CSS gesamt: `26720` Bytes
- JS: `1057` Bytes
- initiales HTML/CSS/JS gzip: `13697` Bytes

## Restzuständigkeiten

- T010: echte Event-/Produktbilder, Pakete/Preise, Businessnummer und weitere Kundendaten; die Vektorlogoquelle ist durch T033 geklärt
- T025: produktiver geschützter Kunden-Fotobereich
- T018: bestehender Kundenpreview-Lifecycle; die Runtime wurde weder übernommen noch neu gestartet oder gestoppt, der kanonische `dist` wurde nach dem Merge aktualisiert und öffentlich bytegenau validiert

## Akzeptanz

- [x] Kundenfeedback als verbindliche Repo-Anforderung dokumentiert
- [x] Event- statt Editorial-Hierarchie umgesetzt
- [x] Mobiltypografie reduziert
- [x] Goldrahmen zurückgenommen
- [x] gewünschte Inhaltsreihenfolge im Layout abgebildet
- [x] Angebotskarten und Anfragefelder angepasst
- [x] Kundenbereich als echtes Ziel kommuniziert
- [x] WhatsApp sicher vorbereitet
- [x] gelieferte Markenassets integriert
- [x] Regressionstest grün
