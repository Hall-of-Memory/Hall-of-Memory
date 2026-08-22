# Kanonische Kundenanforderungen — Hall of Memory

Stand: 2026-08-13

## Autorität

Diese Datei bündelt die bestätigten fachlichen Kundenwünsche in einer einzigen, fortschreibbaren Referenz. Datiertes Feedback bleibt in `docs/customer-feedback-2026-08-13.md` als Evidenz erhalten; technische Umsetzung und Restarbeit werden ausschließlich unter `tasks/` geführt. Bei Widersprüchen gilt die zeitlich neuere ausdrückliche Kundenangabe.

## Marke und Gestaltung

- hochwertig, modern, elegant und emotional
- Farbwelt: Schwarz, Gold und Creme
- Event- und Erlebniswirkung vor Magazin-/Editorialwirkung
- echte Produkt- und Eventfotografie möglichst früh; Hero mit starkem großem Bild, später optional kurzem Video
- große Typografie als Stilmittel, auf Smartphones deutlich kleiner und ausgewogen
- Goldrahmen und Ornamente als hochwertige Akzente, nicht als dominante Dekoration
- insgesamt ruhig, materiell, hochwertig und mit ausreichend freier Fläche
- Hall of Memory nicht als reine Fotobox-Marke modellieren; spätere Eventangebote müssen ohne strukturellen Neubau ergänzbar sein

## Logo und Markenquellen

Die vom Kunden beauftragten Designer-Originale bleiben als private Projekt-/Recovery-Quelle außerhalb der öffentlichen Git-Historie. Das öffentliche Repository enthält ausschließlich die für die Website benötigten, unveränderten Web-Exports:

- `public/brand/hall-of-memory-logo-primary.svg` — SHA-256 `76f3055f5e16081ad58b555263b4a92dec5fc52a87abe238c8f8c6459f573c13`
- `public/brand/hall-of-memory-logo-dark.jpg` — SHA-256 `4bf4bd0a524af72cc7a9375531e1a00f9d385d62318666fb662aef5f3f040c22`
- `public/brand/hall-of-memory-logo-light.jpg` — SHA-256 `7bd29e4f79b830ea6c97a75118098abfc36a70d616bfba8093b8f01253211c3e`
- Designerdateien unverändert verwenden; nicht nachzeichnen, umfärben oder filtern.
- Creme/Gold ist die primäre Markenfassung.
- Schwarz/Gold soll ebenfalls sinnvoll eingesetzt werden, wenn Hintergrund und Gesamtdesign davon profitieren.
- Keine Logodatei als vermeintliches Event- oder Produktfoto verwenden.
- `.ai`, `.pdf`, ZIP-Archive und sonstige Arbeits-/Quelldateien werden nicht für die GitHub.io-Preview benötigt und bleiben außerhalb des öffentlichen Repositorys.

## Startangebote

- Fotobox
- Fotospiegel
- Magazinbox

Neue Event-/Mietangebote müssen später datengetrieben ergänzt werden können.

## Gewünschte Startseiten-Journey

1. starkes großes Event-/Produktbild, später optional Video
2. Logo und Claim „Every Star Has a Memory“
3. direkter CTA „Jetzt anfragen“
4. aktuelle Angebote
5. kurze Vorteile / „Warum Hall of Memory“
6. Pakete und Preise
7. echte Galerie
8. „So funktioniert’s“
9. Anfrageformular
10. FAQ, Kontakt und WhatsApp

Der geschützte Kundenbereich darf zusätzlich als echter Produktbestandteil erklärt werden.

## Angebotskarten

Je Angebot:

- echtes Produktbild, sobald freigegebenes Material vorliegt
- Produktname
- kurze verständliche Kerninformationen
- CTA „Mehr erfahren“
- CTA „Jetzt anfragen“
- optional produktspezifischer WhatsApp-Einstieg

## Pakete und Preise

- Pakete und Preise sollen auf der Website sichtbar sein
- keine Paketnamen, Leistungen oder Preise erfinden; nur bestätigte Kundendaten verwenden
- Struktur so anlegen, dass der Kunde Preise und Angebote später selbst pflegen kann

## Galerie und Medien

- öffentliche Galerie mit freigegebenem Event-/Produktmaterial
- Logos und Markenmotive nicht als Ersatz für echte Eventbilder ausgeben
- Hero später optional mit kurzem Video
- Bilder responsive, performant und mit sinnvollen Alt-Texten ausliefern

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
- Freitext / weitere Wünsche

Eine Anfrage ist keine verbindliche Buchung und keine Verfügbarkeitsbestätigung.

## WhatsApp

- fester hochwertiger Button unten rechts
- mobil dauerhaft gut sichtbar
- passend zur Schwarz-/Gold-/Creme-Gestaltung
- Standardtext: „Hallo, ich interessiere mich für Hall of Memory und möchte gerne eine Anfrage stellen.“
- bei Einstieg aus einem Angebot möglichst produktspezifischer Text
- echte Businessnummer erst nach bestätigter Zulieferung aktivieren; niemals raten oder aus anderen Projekten übernehmen

## Geschützter Fotozugang nach Veranstaltungen

- persönlicher geschützter Zugang, vorzugsweise Link oder Code
- jeder Kunde sieht ausschließlich seine eigene Veranstaltung und die dazugehörigen Bilder
- keine fremden Galerien durch URL-Manipulation, erratbare IDs oder fehlende Medienautorisierung
- mobil nutzbare Galerie
- Zugriff muss widerrufbar beziehungsweise rotierbar sein
- öffentlicher Marketing-Galeriebereich strikt vom privaten Event-Fotobereich trennen

Noch fachlich festzulegen: Uploadprozess, Link-/Code-Ablauf, Ansichts-/Downloadrechte, Aufbewahrung, Löschung, Widerruf und erwartetes Datenvolumen.

## Responsive und Bedienung

- Smartphone, Tablet und Desktop von Anfang an belastbar
- Mobiloptimierung ist Pflicht, keine nachträgliche Zusatzrunde
- Kunde soll später insbesondere Preise, Bilder und Angebote selbst pflegen können

## Betrieb und Übergabe

- Domain und produktive Konten/Zugänge unter Kundenhoheit beziehungsweise auf den Namen des Kunden
- Quellcode und relevante Zugänge vollständig übergabefähig
- kein monatliches Website-Abo an den Entwickler; laufende Kosten möglichst auf notwendige Domain-/Infrastrukturkosten begrenzen
- Impressum, Datenschutz und gegebenenfalls Consent/Cookie-Anforderungen vor Veröffentlichung korrekt berücksichtigen

## Spätere Ausbaustufe

- Verfügbarkeitskalender
- Buchungssystem beziehungsweise verbindliche Buchungslogik erst nach geklärten Geschäftsregeln

## Noch fehlende Kundenzulieferungen

- freigegebene Produkt-, Galerie- und Eventbilder
- gegebenenfalls freigegebenes Hero-Video
- weitere angekündigte Referenz-Websites
- konkrete Paketnamen, Leistungen und Preise
- finale Produkt- und Markentexte
- echte WhatsApp-Businessnummer
- produktive Kontaktziele, Betreiberangaben und Domainstatus
- genauer Selbstpflege-Workflow
- fachlich/rechtlich freigegebene Impressums-, Datenschutz-, Aufbewahrungs- und Löschangaben

## Nicht verwechseln

- Logo/Markenmaterial ≠ Eventfotografie
- Anfrage ≠ Buchung
- öffentliche Galerie ≠ privater Kunden-Fotobereich
- spätere Buchungsengine ≠ Bestandteil des ersten Livegangs ohne bestätigte Geschäftsregeln
