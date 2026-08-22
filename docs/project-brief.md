# Projektbrief

Stand: 2026-08-13

## Kunde / Marke

- Marke: Hall of Memory
- Langfristige Positionierung: hochwertige Event-Angebote / Vermietung
- Startangebote: Fotobox, Fotospiegel, Magazinbox
- Später: weitere Event-/Mietangebote ohne strukturellen Neubau der Website ergänzbar
- Claim: „Every Star Has a Memory“

## Gestaltungsrichtung

- hochwertig, modern, elegant und emotional
- primär Schwarz, Gold und Creme
- Event- und Erlebniswirkung steht vor Editorial-/Magazinwirkung
- starke echte Bildwirkung früh im Seitenverlauf; Hero mit großem Bild, später optional kurzem Video
- große Typografie als Stilmittel, auf Smartphones aber bewusst kleiner und ausgewogener
- Goldrahmen und Ornamente nur als hochwertige Akzente; mehr freie Fläche und ruhigere Flächen
- Referenzseiten dienen als Inspiration für Aufbau, Rhythmus und Stil, nicht zum Kopieren
- mobile, Tablet- und Desktop-Darstellung gehören von Anfang an zum Designziel

Die konsolidierte fachliche Referenz liegt in `docs/customer-requirements.md`; die vollständige Kundenrückmeldung vom 13.08.2026 bleibt in `docs/customer-feedback-2026-08-13.md` als datierte Evidenz dokumentiert.

## Gewünschte Startseitenfolge

1. starkes großes Bild, später optional Video
2. Logo + „Every Star Has a Memory“
3. direkter CTA „Jetzt anfragen“
4. Fotobox, Fotospiegel und Magazinbox
5. kurze Vorteile / Warum Hall of Memory
6. Pakete
7. echte Galerie
8. „So funktioniert’s“
9. Anfrageformular
10. FAQ / Kontakt / WhatsApp

Der geschützte Kundenbereich darf zusätzlich innerhalb dieser Journey sichtbar erklärt werden und ist ein echter Produktbestandteil.

## Logo- und Markenassets — Kundenstand 2026-08-13 / Public-Grenze 2026-08-22

- Der Kunde hat die Designer-Grafiken selbst beauftragt; für die Website werden ausschließlich die bereits bestätigten Web-Exports verwendet.
- Die vollständigen Designer-Originale und das ursprüngliche ZIP bleiben als private Projekt-/Recovery-Quelle außerhalb der öffentlichen Git-Historie.
- Öffentliche Primärfassung: `public/brand/hall-of-memory-logo-primary.svg`, SHA-256 `76f3055f5e16081ad58b555263b4a92dec5fc52a87abe238c8f8c6459f573c13`.
- Öffentliche dunkle JPG-Fassung: `public/brand/hall-of-memory-logo-dark.jpg`, SHA-256 `4bf4bd0a524af72cc7a9375531e1a00f9d385d62318666fb662aef5f3f040c22`.
- Öffentliche helle JPG-Fassung: `public/brand/hall-of-memory-logo-light.jpg`, SHA-256 `7bd29e4f79b830ea6c97a75118098abfc36a70d616bfba8093b8f01253211c3e`.
- Creme/Gold bleibt primäre Markenfassung; Schwarz/Gold wird kontextabhängig eingesetzt.
- Das Logo selbst darf nicht verändert, nachgezeichnet, umgefärbt oder gefiltert werden.
- Logo-/Markenfiles sind keine Eventfotografie; Hero- und Galerieflächen bleiben für echte freigegebene Produkt-/Eventbilder getrennt.
- Private Designer-Quelldateien sind keine Voraussetzung für Build, CI, Codex oder GitHub Pages.

## Bestätigte Funktions- und Inhaltswünsche

- responsive / mobil optimiert; Smartphone, Tablet und Desktop müssen belastbar funktionieren
- Fotobox, Fotospiegel und Magazinbox als aktuelle Angebote
- Architektur so erweiterbar, dass weitere Event-Angebote später ohne strukturellen Neubau ergänzt werden können
- Angebotskarten mit echtem Produktbild, kurzen Kerninformationen, „Mehr erfahren“ und „Jetzt anfragen“
- Pakete und Preise auf der Website
- öffentliche Galerie mit freigegebenem Bildmaterial
- Anfrageformular mit Produkt, Paket, Veranstaltungsdatum, Ort, Veranstaltungsart, Name, E-Mail, Telefonnummer und Freitext
- fester hochwertiger WhatsApp-Button unten rechts, mobil gut sichtbar, mit Standardtext und möglichst produktspezifischem Einstieg
- Inhalte später durch den Kunden selbst pflegbar: insbesondere Preise, Bilder und Angebote; Texte bleiben ebenfalls Bestandteil des strukturierten Inhaltsmodells
- Domain und produktive Zugänge sollen unter Kundenhoheit bzw. auf den Namen des Kunden laufen
- Quellcode und relevante Zugänge müssen vollständig übergabefähig sein
- kein monatliches Website-Abo an den Entwickler; laufende Kosten möglichst auf notwendige Domain-/Infrastrukturkosten begrenzen
- Impressum, Datenschutz und das Cookie-/Consent-Thema müssen vor Veröffentlichung fachlich und technisch berücksichtigt werden

## Geschützter Fotozugang nach Veranstaltungen

Der Kunde hat am 13.08.2026 erneut ausdrücklich bestätigt, dass der Kundenbereich tatsächlich gewünscht ist und nicht nur als spätere Idee behandelt werden soll.

Veranstaltungskunden sollen nach ihrem Event über einen persönlichen Link oder Code auf ihre eigenen Fotos zugreifen können.

Harte fachliche Anforderung: Ein Veranstaltungskunde darf ausschließlich seine eigene Veranstaltung und die dazugehörigen Bilder sehen. Öffentliche oder fremde Event-Galerien dürfen durch URL-Manipulation, erratbare IDs oder fehlende Medienautorisierung nicht erreichbar sein.

Die Security Foundation aus T026 ist bereits vorhanden. Die produktive Schutz-, Speicher-, Freigabe-, Upload- und Löscharchitektur wird in T025 abgeschlossen. Die öffentliche Galerie aus T007 bleibt davon getrennt.

## WhatsApp

- Standardnachricht: „Hallo, ich interessiere mich für Hall of Memory und möchte gerne eine Anfrage stellen.“
- Bei Einstieg aus Fotobox, Fotospiegel oder Magazinbox soll möglichst das Produkt bereits im Text enthalten sein.
- Die Businessnummer wird nicht geraten und nicht aus anderen Projekten übernommen.
- Die Preview enthält die technische und gestalterische Komponente bereits; ohne echte Hall-of-Memory-Businessnummer bleibt der Link absichtlich deaktiviert.

## Spätere Ausbaustufe

- Verfügbarkeitskalender
- Buchungssystem / gegebenenfalls verbindliche Buchungslogik

Die vollständige Buchungsengine bleibt als eigener Folgetask T013 getrennt, damit keine Geschäftsregeln erfunden werden.

## Angebotsstrategie

Sinnvolle Extras dürfen von Anfang an vorgesehen bzw. umgesetzt werden, sofern sie ohne unnötige Komplexität und laufende Abokosten realisierbar sind. Ziel ist ein professioneller End-to-End-Auftritt, nicht bloß eine statische Visitenkarte.

## Bereits konkretisierte Betriebswünsche

- Der Kunde selbst soll Preise, Bilder und Angebote später ändern können.
- Domain, produktive Konten und Zugänge sollen in der Kontrolle des Kunden liegen.
- Verfügbarkeit und Buchung sind gewünschte spätere Erweiterungen und nicht automatisch Bestandteil des ersten Livegangs.
- Der geschützte Event-Fotobereich ist ein eigener gewünschter Produktbereich und darf nicht mit der öffentlichen Marketing-Galerie verwechselt werden.

## Noch fehlende Kundeneingaben / Entscheidungen

- Originalbilder / freigegebenes Produkt-, Galerie- und Eventmaterial
- gegebenenfalls freigegebenes kurzes Hero-Video
- angekündigte zusätzliche Referenz-Websites
- konkrete Pakete, Preise und fachliche Leistungsumfänge
- finale Texte
- echte Hall-of-Memory-WhatsApp-Businessnummer
- gewünschte produktive Kontaktdaten / Zieladresse für Anfragen
- gewünschte Domain bzw. vorhandener Domainstatus
- genauer Selbstpflege-Workflow: Änderungshäufigkeit, Browser-Uploads, Vorschau/Freigabe und gewünschte Bedienoberfläche
- für den geschützten Fotobereich: finaler Link-/Code-Ablauf, Ansichts-/Downloadrechte, Bereitstellung/Upload, Aufbewahrung/Löschung, Widerruf/Entzug und erwartetes Datenvolumen
- für Cookie/Consent: tatsächlich eingesetzte Drittanbieter-, Analyse-, Marketing- oder Einbettungsdienste; daraus folgt, ob und welche Einwilligung technisch erforderlich ist
- fachlich/rechtlich freigegebene Impressums-/Datenschutz-/Einwilligungsangaben sowie Aufbewahrungs-/Löschregeln
- für eine spätere Buchungsengine die in T013 dokumentierten Inventar-, Puffer-, Zahlungs-, Storno- und Reservierungsregeln
