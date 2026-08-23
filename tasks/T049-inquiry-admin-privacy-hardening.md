---
id: T049
status: active
priority: P0
dependencies: [T046]
---
# Inquiry-/Admin-Datenschutz vor Produktivaktivierung härten

## Ziel

Bevor echte personenbezogene Anfragen verarbeitet werden, wird der bereits vorhandene Inquiry-/Admin-Pfad nach Datenminimierung, Zugriffstrennung und Retention gehärtet. Die vorhandenen Validierungs-, Rate-Limit-, Turnstile-, CORS-, D1- und Cloudflare-Access-Verträge bleiben erhalten.

## Umsetzung

1. Admin-Listenansicht datensparsam machen: Listenendpunkte liefern nur die für die Übersicht benötigten Felder; E-Mail, Telefon, Nachricht und weitere Detaildaten werden erst über einen autorisierten Detailabruf geladen.
2. Einen expliziten autorisierten Detailendpunkt bzw. gleichwertigen Vertrag für eine einzelne Anfrage einführen.
3. Admin-Frontend und Worker-Verantwortung prüfen und unnötige Inline-HTML-/JavaScript-Kopplung abbauen, soweit dies ohne unnötige Architekturgröße möglich ist.
4. CSP des Adminpfads nach der Entkopplung verschärfen; `unsafe-inline` nicht dauerhaft nur aus Bequemlichkeit behalten.
5. Vor Produktivbetrieb Aufbewahrungs-, Lösch- und erforderliche Export-/Nachweisregeln technisch dokumentieren und implementieren, soweit die fachlichen/rechtlichen Parameter aus T008/T011 belegt sind. Fehlende Fristen nicht erfinden.
6. Notification-E-Mails bleiben datensparsam und enthalten keine unnötigen Anfrageinhalte.

## Slice 1 — Datenminimierung und Detailtrennung

Begonnen am 23.08.2026 auf Basis von `main` `d616b66644920add1dd2981e217ef26708d5ca22`.

- Der bestehende Worker-Core bleibt unverändert für Public-Inquiry, Notifications, Status-PATCH und Admin-HTML.
- `src/privacy-entry.ts` liegt als dünner Entry vor dem Core und fängt ausschließlich authentifizierte Admin-GETs für Inquiry-Liste und Inquiry-Detail ab.
- `/api/admin/inquiries` selektiert nur noch ID, Erstellzeit, Angebot/Paket, Veranstaltungsdaten, Ort, Name, Status und Notification-Status. `email`, `phone` und `message` werden nicht mehr aus D1 gelesen und nicht als JSON-Keys ausgeliefert.
- `GET /api/admin/inquiries/:id` liefert die Detaildaten einschließlich E-Mail, Telefon und Nachricht erst nach demselben Cloudflare-Access-Vertrag; ohne gültige Identität erfolgt vor jedem D1-Read ein `403`.
- Nicht-GET-Routen werden unverändert an den bestehenden Core delegiert; insbesondere bleibt der Status-PATCH-Vertrag unangetastet.
- Lokale Wrangler-Konfiguration und Production-Beispiel zeigen beide auf den Privacy-Entry; produktive Kundenressourcen werden durch diesen Task nicht aktiviert.
- Ein isolierter Unit-Vertrag und der vorhandene echte Wrangler/D1/Admin-Smoke prüfen die Datenminimierung Ende-zu-Ende.

## Abhängigkeiten und Blocker

T049 kann technische Datenminimierung nach T046 umsetzen. Konkrete rechtliche Aufbewahrungsfristen und endgültige Betriebsregeln bleiben von T008/T011 abhängig und werden bei fehlender Primärevidenz `blocked_external` statt geraten.

## Akzeptanz

- [ ] Listenabruf enthält keine unnötigen Kontakt-/Nachrichtenfelder.
- [ ] Detaildaten sind nur über den bestehenden authentifizierten Adminvertrag erreichbar.
- [ ] fehlende/ungültige Authentifizierung bleibt fail-closed.
- [ ] bestehende Rate-Limit-, Turnstile-, CORS- und Notification-Privacy-Verträge bleiben grün.
- [ ] Retention-/Löschpfad besitzt entweder belegte produktive Regeln oder einen expliziten externen Blocker ohne erfundene Frist.
- [ ] `npm ci` und `npm run verify` PASS.

## Nicht-Ziel

- keine Buchungsengine;
- kein neues CMS;
- keine Speicherung privater Eventfotos im Inquiry-Datenspeicher;
- keine Aktivierung produktiver D1-/Mail-/Turnstile-Ressourcen allein durch diesen Task.
