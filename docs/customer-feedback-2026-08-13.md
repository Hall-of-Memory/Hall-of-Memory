# Kundenfeedback — 2026-08-13

## Status und Autorität

Diese Datei dokumentiert die vom Kunden am 13.08.2026 bestätigten Anforderungen für Hall of Memory. Sie konkretisiert den Projektbrief und ist für die weitere Ausgestaltung der Website verbindliche fachliche Referenz. Technische Sicherheits-, Datenschutz- und Betriebsentscheidungen werden weiterhin in den zuständigen Tasks und Architekturdokumenten geführt.

## Bestätigte Gestaltungsrichtung

- Schwarz, Gold und Creme bleiben die Markenbasis.
- Die Seite soll hochwertig, elegant, modern und emotional wirken.
- Die bisherige Editorial-/Magazinwirkung wird zugunsten eines deutlich stärkeren Event- und Erlebnisgefühls reduziert.
- Echte Event- und Produktfotografie soll deutlich früher sichtbar werden; insbesondere der Hero soll ein starkes großes Bild tragen und später optional durch kurzes Video erweitert werden können.
- Große Überschriften bleiben ein Stilmittel, werden auf Smartphones aber kleiner und ausgewogener eingesetzt.
- Goldene Rahmen und Ornamente bleiben Akzent, dürfen die Seite aber nicht dominieren. Mehr freie Fläche und ruhigere Sektionen sollen die Hochwertigkeit erhöhen.
- Hall of Memory darf strukturell nicht als reine Fotobox-Seite modelliert werden. Weitere Event-Angebote müssen später ohne grundlegenden Neubau ergänzt werden können.

## Designkalibrierung aus der Nachbesprechung

Die Kundenformulierung „an manchen Stellen etwas viel“ wird ausdrücklich **nicht** als Auftrag verstanden, die goldene Rahmenfamilie zu entfernen. Die daraus abgeleitete Designentscheidung lautet:

- kein echter Hell-/Dark-Mode-Schalter in der Sales-Phase; die Marke bleibt eine kuratierte dunkle Premium-Hauptwelt
- helle Cremeflächen werden als gezielte Kontrastinseln eingesetzt, nicht als zweites gleichberechtigtes Theme
- auf dunklen Flächen bleibt die transparente Creme-/Gold-SVG die primäre Logofassung
- auf hellen Cremeflächen wird bei zusätzlicher Logoplatzierung die kontrastierende dunkle Designerfassung eingesetzt
- die Rahmenfamilie bleibt erhalten, wird aber hierarchisch statt flächig verwendet

Rahmenhierarchie:

1. **Hero / Signature:** stärkste Fassung mit Messing-/Goldkante, innerer Fase und zurückhaltenden Eckdetails
2. **Angebotskarten:** leichtere Doppelkontur mit viel Innenraum; deutlich ruhiger als der Hero
3. **Utility-Bereiche:** Formular, FAQ und längere Textflächen bleiben weitgehend rahmenarm und arbeiten primär mit Separatoren und Luft

Die Formensprache orientiert sich an Vintage-Kamera, Objektivring, Messingfassung, Fotoatelier und Passepartout. Barocke Schnörkel, flächiges Gold und dekorative Dauerrahmung bleiben ausgeschlossen.

## Verbindliche Startseitenfolge

1. starkes großes Bild; später optional Video
2. Logo und Claim „Every Star Has a Memory“
3. direkter CTA „Jetzt anfragen“
4. Angebote: Fotobox, Fotospiegel, Magazinbox
5. kurze Vorteile / „Warum Hall of Memory“
6. Pakete
7. echte Galerie
8. „So funktioniert’s“
9. Anfrageformular
10. FAQ, Kontakt und WhatsApp

Der persönliche Kundenbereich darf in der Customer Journey zusätzlich sichtbar erklärt werden; er ist kein bloßer Zukunftshinweis.

## Angebotskarten

Für Fotobox, Fotospiegel und Magazinbox gilt:

- großes echtes Produktbild, sobald freigegebenes Material vorliegt
- Produktname
- kurze, verständliche Kerninformationen
- CTA „Mehr erfahren“
- CTA „Jetzt anfragen“
- optional kontextbezogener WhatsApp-Einstieg mit bereits passendem Produkttext

Die Produktkarten müssen datengetrieben bleiben, damit neue Event-Angebote später gleichartig ergänzt werden können.

## Anfrageformular

Gewünschte Felder:

- gewünschtes Produkt
- Paket
- Veranstaltungsdatum
- Ort
- Veranstaltungsart
- Name
- E-Mail
- Telefonnummer
- Freitext für weitere Wünsche

Eine Anfrage bleibt fachlich von einer verbindlichen Buchung oder Verfügbarkeitsbestätigung getrennt.

## WhatsApp

Verbindlicher Wunsch:

- fester WhatsApp-Button unten rechts
- auch mobil dauerhaft gut sichtbar
- hochwertige Gestaltung passend zu Schwarz/Gold/Creme, kein generischer Standard-Look
- Klick öffnet WhatsApp direkt zur Business-Nummer
- Standardtext: „Hallo, ich interessiere mich für Hall of Memory und möchte gerne eine Anfrage stellen.“
- bei Einstieg aus Fotobox, Fotospiegel oder Magazinbox möglichst produktspezifisch vorausgefüllter Text

Technische Regel: Keine Nummer erraten oder aus anderen Projekten übernehmen. Der Link wird erst aktiviert, wenn die echte Hall-of-Memory-Businessnummer vorliegt.

## Geschützter Kundenbereich

Der Kundenbereich ist ausdrücklich ein gewünschter Bestandteil des Produkts und keine bloße Zukunftsidee.

Ziel:

- Kunde erhält nach seiner Veranstaltung einen persönlichen geschützten Zugang, vorzugsweise per persönlichem Link oder Code
- jeder Zugang ist exakt an die eigene Veranstaltung gebunden
- keine fremde Galerie darf durch URL-Manipulation, erratbare IDs oder fehlende Medienautorisierung erreichbar werden
- die mobile Galerie gehört zum Zielbild
- Widerruf beziehungsweise Rotation eines Zugangs muss möglich sein

Die bereits vorhandene Security Foundation aus T026 bleibt Grundlage. Produktive Speicher-, Upload-, Aufbewahrungs- und Löschregeln werden in T025 abgeschlossen.

## Gelieferte Markenassets

### Autoritativer Stand: lokales Kundenquellenpaket `logos.zip`

Der aktuelle Markenstand wurde als `logos.zip` bereitgestellt und privat hashgebunden archiviert. Archiv-SHA-256: `baffc14a9fa9582682ff658f431ec229177ccab698e7d961056f2c5baa584851`. Für die öffentliche Git-Historie werden ab 22.08.2026 nur die bestätigten Web-Exports unter `public/brand/` geführt; die Designer-Arbeitsdateien bleiben private Recovery-Evidenz.

Belegte Originaldateien:

- `59080_Hall of Memory_PP-01-01.jpg` — SHA-256 `4bf4bd0a524af72cc7a9375531e1a00f9d385d62318666fb662aef5f3f040c22`
- `59080_Hall of Memory_PP-01.ai` — SHA-256 `8e34de565670895ce09a985010349fcc477dfbe28dca1b61ddf383e1c984a306`
- `59080_Hall of Memory_PP-01.png` — SHA-256 `eb779ad63ea6e6c27ed88ebf87aad957f62386e7996f725f83ea763dbb121a82`
- `59080_Hall of Memory_PP-01.svg` — SHA-256 `76f3055f5e16081ad58b555263b4a92dec5fc52a87abe238c8f8c6459f573c13`
- `59080_Hall of Memory_PP-02-01.jpg` — SHA-256 `7bd29e4f79b830ea6c97a75118098abfc36a70d616bfba8093b8f01253211c3e`
- `59080_Hall of Memory_PP-02.pdf` — SHA-256 `3f1e7c20b59b3c80b7b3dc5171d661b474aded7b75a337898beaf8daa6770460`
- `Paket 3 SchlichtStraight-3.ai` — SHA-256 `0fbfa12f428cf233733a7598f3be8d023ca0f020a8294c315dd47677bfc1f7cd`

Für die Website wird die vom Designer gelieferte SVG-Datei **byteidentisch und unverändert** als primäre transparente Creme-/Gold-Logoquelle verwendet. Zusätzlich werden die aktuelle dunkle und helle JPG-Fassung unverändert als Referenzvarianten im Projekt gehalten. Die Logoform selbst darf nicht nachgezeichnet, gefiltert oder verändert werden.

Wichtige Korrektur: Die Marken-/Logodateien sind **keine Event- oder Produktfotografie**. Die vorherigen WebP-Ableitungen aus der älteren ZIP dürfen daher weder Hero noch Galerie als vermeintliche Eventbilder füllen. Event- und Produktflächen bleiben für freigegebene echte Fotos beziehungsweise Video reserviert.

## Umsetzung in der Preview — 2026-08-13

Bereits umgesetzt:

- Event-first Hero mit großer Marken-/Bildfläche und später austauschbarem Bild-/Video-Slot
- Claim „Every Star Has a Memory“ und direkter CTA
- Angebotskarten mit „Mehr erfahren“ und „Jetzt anfragen“
- reduzierte Gold-/Rahmendichte und mehr ruhige Fläche
- responsive Typografie mit deutlich zurückgenommenen Mobilgrößen
- Vorteile, Pakete, Galerie, Ablauf, Kundenbereich, Anfrage, FAQ und Kontakt in der gewünschten Journey
- sämtliche gewünschten Anfragefelder in der Preview
- WhatsApp-Komponente einschließlich Standard- und Produktspezifischer Nachricht; fail-closed bis zur echten Businessnummer
- Kundenbereich als echte Zielanforderung statt als „Zukunftsidee“
- Entfernung der bisherigen Demo-Begriffe „Zukunftsidee“, „nicht verfügbar“ und „nicht beauftragt“ aus der Preview
- exakte Einbindung der aktuellen Designer-SVG als Logo; alte ZIP-WebP-Ableitungen entfernt
- Regressionstest für Struktur, Formfelder, lokale Assets, Preview-Isolation, Responsive-Hooks und Größenbudgets

Nachjustierung T035: Die Rahmen wurden nicht weiter entfernt, sondern als dreistufige Vintage-/Messing-Familie neu kalibriert. Hero und persönlicher Galerie-Zugang tragen die stärksten Fassungen, Angebotskarten eine leichtere Doppelkontur, Formular/FAQ bleiben bewusst ruhiger. Auf der hellen Kontaktfläche wird die dunkle Designerfassung verwendet; ein Theme-Toggle wurde bewusst nicht eingeführt.

## Externe Lücken / nächste Zulieferungen

- echte, zur Webnutzung freigegebene Produkt- und Eventfotos
- gegebenenfalls freigegebenes kurzes Hero-Video
- angekündigte Referenz-Websites
- konkrete Paketnamen, Leistungen und Preise
- finale Produkt- und Markentexte
- echte Hall-of-Memory-WhatsApp-Businessnummer
- produktive Kontaktziele, Domain- und Betreiberangaben
- für den Kundenbereich: finaler Link-/Code-Ablauf, Uploadprozess, Bildmengen, Downloadrechte, Aufbewahrung und Löschung

Diese offenen Punkte werden ausschließlich in den Hall-of-Memory-Tasks unter `tasks/` geführt; es wird kein paralleles Bureau-Register angelegt.
