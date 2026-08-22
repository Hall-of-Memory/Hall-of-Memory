---
id: T004
status: done
priority: P0
dependencies: [T001, T003]
---
# Anfrageformular

## Akzeptanz
- Datum, Produkt, Paket, Veranstaltungsart, Ort und Kontaktdaten abbildbar
- serverseitige Validierung
- Spam-/Missbrauchsschutz vorgesehen
- Anfragezustellung und Speicherung nachvollziehbar

## Abschluss-Evidenz — 2026-08-11

- Das sichtbare Astro-Formular sendet exakt den gemeinsamen Vertrag an den konfigurierbaren Worker-Endpunkt: Angebot, optionales Paket, Datum, Veranstaltungsart, Ort, Name, E-Mail, optional Telefon/Nachricht und Einwilligung; `turnstileToken` bleibt reines Schutz-/Transportfeld.
- Leere optionale Werte werden im Frontend ausgelassen und serverseitig defensiv normalisiert. Zod-, Größen-, Angebot/Paket-, Turnstile-, Route- und Akteursprüfungen bleiben autoritativ.
- Explizites Turnstile-Rendering behandelt Erfolg, Ablauf, Timeout, Clientfehler sowie serverseitige Ablehnung/Nichtverfügbarkeit. Lokale Entwicklung und Tests verwenden ausschließlich Cloudflares öffentliche Testkeys.
- UI-Zustände decken `422`, Turnstile `403/503`, `429`, Speicher-/andere `5xx` und Netzwerkfehler ab. Nur ein geprüftes `201 received` mit `bookingCreated: false` erzeugt Erfolg; der Text sagt ausdrücklich, dass keine verbindliche Buchung entstanden ist.
- Während eines Requests sind Button und Controller gegen Doppel-Submit gesperrt. Fehler-/Erfolgsmeldungen sind fokussierbar und live angekündigt; echte Labels, Pflichtattribute und responsive Felder bleiben erhalten.
- Bei getrennten Origins erlaubt der Worker CORS ausschließlich für den konfigurierten öffentlichen Site-Origin oder seinen eigenen Origin. Die buildzeitige CSP erlaubt nur den konfigurierten API-Origin und Cloudflares Turnstile-Script/-Frame.
- Lokaler End-to-End-Smoke belegt Frontend-Payload → Worker → D1-Anfrage + Outbox → simuliertes `send_email` mit Status `sent` und Message-ID; ebenso UI-Erfolg, Validierungsablehnung, Turnstile-Ablehnung, `429`, Admin-JWT und Statusmutation.
- Automatische E-Mail an Interessenten wurde nicht ergänzt. Speicherung bleibt autoritativ, Betreiber-E-Mail bleibt nachgelagerte Benachrichtigung.
- Strukturierte Frontendtests prüfen Normalisierung, Response-Mapping, falsche Erfolgsantworten, Netzwerk-/Backendfehler, Doppel-Submit sowie das tatsächlich gebaute HTML auf Felder, Labels, Pflicht/optional, Statusrollen, Turnstile und CSP.

## Externes Produktionsaktivierungs-Gate

T004 ist implementiert und lokal akzeptiert. Der Livegang gehört zu T008/T009 und erfordert weiterhin kundeneigene produktive D1-/Worker-/Access-/Email-Bindings, exakten `PUBLIC_SITE_ORIGIN`, `PUBLIC_INQUIRY_API_URL`, einen echten produktiven Turnstile-Site-Key plus serverseitiges Secret, freigegebene Betreiberadressen sowie den finalen Datenschutz-/Einwilligungstext und die Aufbewahrungs-/Löschregeln. Ohne öffentliche Build-Konfiguration bleibt das Formular absichtlich fail-closed deaktiviert. Es wurden keine Produktionsressourcen angelegt.
