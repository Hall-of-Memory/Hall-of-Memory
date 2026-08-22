# Legal-/Privacy-Baseline

Stand: 2026-08-12

Dieses Dokument beschreibt nur den technisch belegbaren Projektstand. Es ist keine Rechtsberatung und ersetzt keine freigegebenen Rechtstexte.

## Technisch bereits festgelegt

- Die Website erhält echte Routen für Impressum und Datenschutz.
- Solange die Kunden-/Rechtsangaben fehlen, kennzeichnen diese Seiten ihren Entwurfsstatus sichtbar und werden nicht als finale Rechtstexte dargestellt.
- Der aktuelle öffentliche Build enthält keine Analyse-, Marketing- oder Social-Embed-Integration.
- Cloudflare Turnstile ist ausschließlich für den Anfragepfad vorgesehen und wird erst viewport-/fokusnah geladen, wenn das Anfrageformular produktiv konfiguriert ist.
- Das Anfrageformular speichert den Turnstile-Token nicht als Fachdaten; der technische Datenfluss ist in `docs/privacy-data-flow.md` dokumentiert.
- Eine Cookie-/Consent-Oberfläche wird nicht vorsorglich erfunden. Vor Livegang wird anhand der tatsächlich eingesetzten Dienste geprüft und fachlich/rechtlich entschieden, welche Einwilligung erforderlich ist.

## Vor Livegang weiterhin erforderlich

- vollständige, freigegebene Impressumsangaben
- freigegebener Datenschutz-/Einwilligungstext
- konkrete Aufbewahrungs- und Löschregeln
- vollständiges Inventar tatsächlich eingesetzter Drittanbieter, Analyse-, Marketing- und Einbettungsdienste
- daraus abgeleitete Cookie-/Consent-Entscheidung
- Produktionsreadback gegen die echte Kundendomain

T027 setzt ausschließlich die strukturelle und technisch überprüfbare Grundlage um. T008 bleibt bis zu den externen Angaben `blocked_external`.
