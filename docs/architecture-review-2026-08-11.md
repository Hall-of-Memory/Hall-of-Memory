# Architektur-Review — 2026-08-11

## Urteil

Der aktuelle Astro-SSG-Stand ist eine gute, reversible **Design- und Frontend-Basis**, aber noch keine abschließend belegte Produktionsarchitektur. Die frühere ACCEPTED-Entscheidung war zu früh, weil zentrale Geschäftsregeln für Selbstpflege, Verfügbarkeit und Buchung noch fehlen.

## Trennung nach Datentyp

### Öffentliche Marketing-Inhalte
- Startseite, Angebote, Pakete, Preise, FAQ, SEO-Texte und kuratierte Galerie ändern sich relativ selten.
- Static-first bleibt dafür attraktiv: geringe Laufzeitkosten, hohe Robustheit, gute Performance.
- Editierbarkeit darf nicht automatisch bedeuten, dass alle öffentlichen Seiten dauerhaft aus einer Datenbank gerendert werden müssen.

### Operative Daten
- Anfragen, Verfügbarkeiten, Reservierungen, Status, interne Notizen und spätere Buchungen sind transaktional und gehören nicht in Git.
- Dafür ist eine serverseitige API mit Datenbank sinnvoll.

## Provisorisches Zielbild

1. Astro als öffentliche, static-first Website beibehalten.
2. Dynamische Funktionen über klar begrenzte Cloudflare-Worker-Routen/API ergänzen.
3. D1 als Kandidat für Anfragen, Ressourcen, Verfügbarkeiten und Status.
4. R2 erst aktivieren, wenn Browser-Uploads durch den Kunden wirklich benötigt werden; kuratierte Startbilder können zunächst Build-Assets bleiben.
5. Turnstile plus serverseitige Validierung und Rate Limiting für öffentliche Formulare.
6. Adminbereich nur authentifiziert; Cloudflare Access ist ein bevorzugter Kandidat, bevor eigene Authentifizierung gebaut wird.
7. Bei unverbindlichen Anfragen genügt D1 mit Constraints/Transaktionen. Bei echten Sofortbuchungen mit konkurrierenden Holds oder mehreren Ressourcen Durable Objects als Koordinationsoption prüfen.
8. Öffentliche Website und Produktionskonten am Ende im Besitz des Kunden; keine dauerhafte Abhängigkeit von Entwicklerkonten.

## CMS / Selbstpflege

Noch nicht entschieden. Zwei ernsthafte Pfade:

### A — Git-basiertes CMS
Beispiel: Keystatic / strukturierte Content-Dateien.

Vorteile:
- versionierte Änderungen
- öffentliche Site bleibt statisch
- kein Inhalts-Datenbankzwang

Nachteile:
- Keystatic benötigt serverseitige/Node-Funktionen für eine produktive Admin-UI
- GitHub-/App-Authentifizierung ist zusätzliche Infrastruktur
- Medien im Repo skalieren schlechter bei vielen großen Bildern

### B — Eigener Adminbereich + D1/R2

Vorteile:
- einheitliche, kundenfreundliche Oberfläche
- Inhalte und operative Daten aus Kundensicht an einem Ort
- keine Git-Kenntnisse nötig

Nachteile:
- wesentlich mehr eigener Auth-/CRUD-/Upload-Code
- mehr Sicherheits- und Wartungsverantwortung
- für statische öffentliche Seiten braucht es einen Publish-/Rebuild-Mechanismus oder gezielte dynamische Auslieferung

Entscheidung erst nach Klärung, wie häufig und wie umfangreich der Kunde selbst ändern will.

## Buchungslogik

Nicht vorschnell „vollständige Onlinebuchung“ implementieren. Vorher müssen mindestens feststehen:

- Anzahl identischer Einheiten je Produkt
- ob Fotobox/Fotospiegel/Magazinbox gleichzeitig auf verschiedenen Events sein können
- Mietdauer und Aufbau-/Abbaupuffer
- Fahrt-/Liefergebiete und Anfahrtskosten
- Paketkombinationen
- manuelle Freigabe vs. verbindliche Sofortbuchung
- Anzahlungs-/Zahlungslogik
- Storno-/Umbuchungsregeln

Ohne diese Regeln wäre ein Kalender optisch professionell, fachlich aber potenziell falsch.

## E-Mail / Benachrichtigungen

- Anfragen sollen zuerst zuverlässig gespeichert werden; E-Mail ist Benachrichtigung, nicht einzige Datenquelle.
- Kostenlose Betreiberbenachrichtigungen an verifizierte Ziele sind möglich.
- Automatische Bestätigungen an beliebige Kundenadressen können je nach Anbieter/Tarif Fremdkosten oder Free-Tier-Abhängigkeiten erzeugen.
- Daher keine Zusage „für immer 0 Euro“ für alle Zusatzfunktionen.

## Kostenprinzip

Ziel bleibt: feste technische Kosten möglichst auf Domainniveau reduzieren. Das ist für die erwartete Anfangsgröße plausibel, aber keine Garantie für beliebige Nutzung oder dauerhaft unveränderte Free-Tarife.

## Architektur-Gate

Bevor irreversible Full-Stack-Entscheidungen getroffen werden, T011 abschließen. Das vorhandene Frontend darf parallel weiterentwickelt werden, solange Änderungen frameworkneutral bzw. leicht reversibel bleiben.

## Folgearbeit Buchungsengine

Die vollständige verbindliche Echtzeitbuchung ist jetzt ausdrücklich als T013 separiert. Dadurch kann der Anfrage-/Verfügbarkeitsweg professionell fertiggestellt werden, ohne vorzeitig Zahlungs-, Hold-, Ressourcen- oder Stornologik zu erfinden.
