---
id: T049
status: planned
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
5. Vor Produktivbetrieb Aufbewahrungs-, Lösch- und erforderliche Export-/Nachweisregeln technisch dokumentieren und implementieren, soweit die fachlichen/ rechtlichen Parameter aus T008/T011 belegt sind. Fehlende Fristen nicht erfinden.
6. Notification-E-Mails bleiben datensparsam und enthalten keine unnötigen Anfrageinhalte.

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
