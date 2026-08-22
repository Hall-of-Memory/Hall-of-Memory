# Datenschutz-Datenfluss und Datenminimierung

Stand: 2026-08-11

## Zweck und Grenze

Das Formular nimmt eine unverbindliche Veranstaltungsanfrage entgegen. Es erzeugt weder Reservierung noch Buchung noch Zahlung. Dieses Dokument beschreibt ausschließlich den technisch implementierten Datenfluss; es ersetzt keinen fachlich oder rechtlich freigegebenen Datenschutz-/Einwilligungstext.

## Erhobene Daten

Pflichtfelder sind Angebots-ID, Wunschdatum, Veranstaltungsart, Ort beziehungsweise Veranstaltungsstätte, Name, E-Mail-Adresse und die bestätigte Einwilligung. Paket-ID, Telefonnummer und Freitextnachricht sind optional. Leere optionale Felder werden bereits im Browser ausgelassen und serverseitig erneut normalisiert; D1 speichert sie dann als `NULL`.

Der Turnstile-Token ist nur ein kurzlebiges Transportfeld für die serverseitige Prüfung. Er wird nicht in D1, Outbox oder Betreiberbenachrichtigung gespeichert. Eine IP-Adresse wird nicht als Anfragefeld gespeichert. Der zweite Rate-Limit-Schlüssel besteht aus Angebots-ID und einem SHA-256-Digest der normalisierten E-Mail-Adresse; die Klartextadresse wird nicht an das Rate-Limit-Binding übergeben.

## Datenfluss

1. Der Browser sendet die Felder und den Turnstile-Token ausschließlich an den konfigurierten HTTPS-Worker. Ohne API-URL und öffentlichen Turnstile-Key bleibt das Formular deaktiviert.
2. Der Worker prüft Origin, Requestgröße, Schema, Angebot/Paket, beide Rate Limits und Turnstile, bevor er Fachdaten schreibt.
3. D1 ist die fachliche Wahrheit. `inquiries` enthält die oben genannten Anfragefelder, Erstellzeit, technische ID und Bearbeitungsstatus.
4. Im selben D1-Batch entsteht ein Outbox-Eintrag in `inquiry_notifications`. Er enthält nur IDs, Benachrichtigungsart, Zustellstatus, Versuche, Zeitstempel sowie gegebenenfalls Message-ID und gekürzte Fehlerdiagnose; Formulardaten werden dort nicht dupliziert.
5. Erst nach erfolgreichem D1-Schreiben wird die Betreiberbenachrichtigung asynchron versucht. Sie enthält nur Anfrage-ID, Angebots-ID und Wunschdatum. Kontaktdaten, Ort und Nachricht bleiben im Access-geschützten Adminbereich. Eine E-Mail ist nie die fachliche Wahrheit.
6. Es wird keine automatische E-Mail an die anfragende Person versandt. Eine solche Funktion ist weder stillschweigend aktiviert noch Voraussetzung für die Anfrageannahme.
7. Der Adminzugriff validiert das Cloudflare-Access-JWT. Token und flüchtig abgeleitete Adminidentität werden nicht im Anfrageschema gespeichert.

## Noch extern festzulegen

- freigegebener Datenschutz- und Einwilligungstext einschließlich Verantwortlichem und Betroffenenrechten
- konkrete Aufbewahrungs- und Löschfrist sowie betrieblicher Löschprozess für D1 und nachgelagerte Betreiberpostfächer
- Umgang mit Backups/Exporten und fehlgeschlagenen Benachrichtigungsdiagnosen innerhalb derselben Löschregel
- reale, verifizierte Betreiber-Ziel-/Absenderadresse und berechtigte Adminidentitäten

Bis diese Punkte belegt und umgesetzt sind, darf der Produktionsbuild nicht auf `launchStatus: production` gesetzt und das Anfrageformular nicht live aktiviert werden. Es wird bewusst keine Aufbewahrungsdauer erfunden.
