---
id: T011
status: blocked_external
priority: P0
dependencies: []
---
# Produktregeln und Architektur-Gate

## Ziel

Die endgültige Full-Stack-Architektur erst festlegen, wenn die geschäftlichen Regeln für Selbstpflege, Verfügbarkeit und Buchung ausreichend geklärt und die relevanten Plattformoptionen praktisch validiert sind.

## Akzeptanz

- Kunden-Workflow Anfrage vs. Reservierung vs. Sofortbuchung geklärt
- Ressourcen-/Inventarmodell geklärt
- Mietdauer und Puffer geklärt
- Paket-/Preisregeln grob geklärt
- gewünschte Häufigkeit und Tiefe der Selbstpflege geklärt
- CMS-Pfad Git/Codex-basiert vs. eigener D1/R2-Admin entschieden
- Admin-Authentifizierung praktisch validiert
- Formular-/Spam-/Rate-Limit-Pfad praktisch validiert
- E-Mail-/Benachrichtigungspfad inkl. realer Kosten dokumentiert
- Produktionskonten-/Eigentumsgrenze festgelegt
- ADR 0001 danach ACCEPTED, SUPERSEDED oder ersetzt

## Technisch belegt — 2026-08-11

- Astro static-first bleibt ein getesteter, reversibler Frontendpfad; öffentliche Inhalte sind strukturiert und Zod-validiert.
- Der vollständige Inquiry-Pfad ist lokal praktisch belegt: exakte Origin-Grenze, Größen-/Schema-/Angebot-Paket-Prüfung, serverseitiges Turnstile, D1-Anfrage + Outbox und ausschließlich `received`/`bookingCreated: false`.
- Beide Workers-Rate-Limit-Bindings und der sichtbare `429`-Pfad sind reproduzierbar getestet. Der Akteursschlüssel nutzt Angebot plus Digest der normalisierten E-Mail, nicht die IP und nicht die Klartextadresse.
- Betreiberbenachrichtigung über D1-Outbox + asynchrones Email-Service-Binding ist lokal praktisch belegt; D1 bleibt Wahrheit, Zustellstatus/Retry sind im Admin sichtbar, und es gibt keine automatische Kundenmail. Der dokumentierte Kostenpfad trennt verifiziertes Betreiberziel von potenziell kostenpflichtigen beliebigen Empfängern.
- Cloudflare-Access-kompatible Admin-Authentifizierung validiert RS256-Signatur, Issuer und Audience. Fehlendes/falsches JWT wird abgewiesen; Anfrage-Liste und Statusmutation funktionieren lokal gegen D1.
- Das fachneutrale T005-Modell belegt `inquiry-only`, unbekanntes Inventar, mehrere Einheiten und Sperrintervalle, ohne daraus eine Buchung zu erfinden.
- Keine dieser Prüfungen hat eine Remote-D1, Access-App, Domain, Turnstile-/Email-Ressource oder produktives Secret angelegt.

Damit sind frühere Aussagen, Formular/Spam/Rate Limit, Admin-Auth oder Betreiberbenachrichtigung seien technisch ungeklärt, nicht mehr aktuell. Technische Evidenz ist jedoch keine Geschäftsentscheidung und keine Produktionsabnahme.

## Bestätigte Kundenentscheidungen — 2026-08-12

- Der Kunde selbst soll Preise, Bilder und Angebote später pflegen können; Texte bleiben ebenfalls strukturierte Inhalte.
- Domain und produktive Zugänge sollen unter Kundenhoheit liegen.
- Verfügbarkeitskalender und Buchungssystem sind gewünschte spätere Erweiterungen, nicht automatisch eine verbindliche V1-Sofortbuchung.
- Zusätzlich ist ein geschützter, veranstaltungsbezogener Fotozugang gewünscht; dessen eigene Schutz-/Speicherarchitektur wird in T025 geführt.

## Git/Codex-Selbstpflege als bevorzugter Basispfad — 2026-08-16

Die Entscheidung für ein öffentliches, kundenkontrolliertes GitHub-Repository und die geplante Nutzung von Codex verändern die CMS-Abwägung substanziell:

- Angebote, Pakete, FAQ, Galerie-Metadaten und Seitentexte liegen bereits als strukturierte, Zod-validierte Inhalte unter `src/content/` vor. Für seltene bis moderate Änderungen kann der Kunde Codex eng beauftragen, den Diff über einen Pull Request prüfen und die bestehende CI nutzen.
- Dieser Pfad vermeidet zunächst einen separaten CMS-Stack, zusätzliche Auth-/Schreiboberflächen und eine zweite Inhaltswahrheit. Deshalb ist **Git + Codex der bevorzugte Default für klassische Website-Inhalte**, solange die reale Kundenbenutzung ihn bestätigt.
- Daraus folgt noch keine Entscheidung, dass überhaupt kein Admin/CMS benötigt wird. Häufige Browser-Uploads, viele Galerie-/Eventbilder, komfortable Medienverwaltung oder andere nichttechnische Betriebsabläufe können weiterhin einen gezielten D1/R2-Admin rechtfertigen.
- Private Eventmedien aus T025 bleiben unabhängig davon außerhalb des öffentlichen Git und dürfen niemals über den Codex-/Repository-Pfad als Mediendatenbank behandelt werden.
- Architektur-, Security-, Dependency- und Deployment-Änderungen bleiben reviewpflichtig; der vereinfachte Kundenpfad zielt primär auf klar strukturierte Inhalte und kleine Layoutänderungen.

Damit wird nicht aus Implementierungsbequemlichkeit ein CMS gewählt. Stattdessen wird der kleinste bereits belegte Selbstpflegepfad zuerst real genutzt und ein eigener Admin nur für nachgewiesene Bedienlücken gebaut.

## Fehlende Geschäfts-/Kundenentscheidungen

1. Soll V1 ausschließlich Anfragen, manuell bestätigte Reservierungen oder bereits Reservierungsfunktionen unterstützen? Eine verbindliche Sofortbuchung bleibt bis zur ausdrücklichen Fachentscheidung T013.
2. Welche realen Einheiten, gemeinsamen Ressourcen, Mietdauern, Aufbau-/Abbau-/Fahrtpuffer und Lieferregeln gelten?
3. Welche Paket-, Produktkombinations- und Preisregeln sind fachlich korrekt?
4. Für die bestätigte Selbstpflege fehlen noch reale Änderungshäufigkeit, Umfang von Browser-/Massen-Uploads und die praktische Abnahme, ob Git/Codex für den Kunden angenehm genug ist. Git/Codex ist der bevorzugte Ausgangspfad; ein eigener Medien-/CMS-Admin wird nur bei belegtem Bedarf ergänzt.
5. Die Kundenhoheit ist als Ziel geklärt; offen sind konkrete Konten, Domain, Rollen, Betreiberadressen und akzeptierte laufende Kosten. Das öffentliche kanonische GitHub-Ziel wird in T043 geführt.
6. Welche Datenschutz-, Aufbewahrungs- und Löschregeln gelten für Anfrage, Benachrichtigung und den späteren Event-Fotobereich?

Punkt 4 wird nun über einen echten Codex-/PR-Golden-Path statt nur abstrakt entschieden. Bis zu diesem Readback bleiben Content-Schreibzugriffe im bestehenden Admin ausdrücklich `cms-path-pending-t011`; Punkte 1–3 und 6 bleiben zugleich die fachliche Grenze vor T013. T025 hat zusätzlich seine eigenen Auth-/Medien-/Löschentscheidungen.

## Status und Entblockung

T011 bleibt `blocked_external`, weil weiterhin fachliche Kunden-/Betriebsentscheidungen und die reale Selbstpflege-Abnahme fehlen. Nach deren dokumentierter Freigabe werden der endgültige CMS-/Medienpfad, Produktionskonten-/Eigentumsgrenze und Kostenentscheidung festgehalten und ADR 0001 als `ACCEPTED`, `SUPERSEDED` oder durch eine neue ADR ersetzt. Bis dahin bleibt die Full-Stack-/Buchungsarchitektur bewusst provisorisch, während Git/Codex für klassische öffentliche Inhalte als kleinster bevorzugter Selbstpflegepfad vorbereitet wird.
