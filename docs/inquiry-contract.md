# Anfragevertrag

Stand: 2026-08-11

Frontend und Worker verwenden denselben fachlichen Vertrag:

- `offerId`: Pflicht, muss einer strukturierten Angebots-ID entsprechen
- `packageId`: optional, muss zum Angebot gehören
- `date`: Pflicht, `YYYY-MM-DD`
- `eventType`: Pflicht, einer der Werte aus `src/lib/inquiry.ts`
- `location`: Pflicht, 2–180 Zeichen
- `name`: Pflicht, 2–120 Zeichen
- `email`: Pflicht, valide E-Mail, maximal 254 Zeichen
- `phone`: optional, maximal 40 Zeichen
- `message`: optional, maximal 2.000 Zeichen
- `privacyConsent`: Pflicht, ausschließlich `true`
- `turnstileToken`: Pflicht-Transportfeld für die serverseitige Siteverify-Prüfung, kein Fachdatenfeld der Anfrage

Leere optionale Strings werden vor dem Versand ausgelassen und im Worker zusätzlich defensiv wie „nicht gesetzt“ behandelt. Browser-native Validierung unterstützt die Bedienung; autoritativ bleiben Größenlimit, JSON-/Zod-Prüfung, Angebot/Paket-Referenzen, beide Rate Limiter und Turnstile im Worker.

## Öffentliche Response-Codes

- `201`: `{ inquiryId, status: "received", bookingCreated: false, ownerNotification: "queued" }`
- `403 human-verification-failed`
- `413 request-too-large`
- `415 content-type-must-be-json`
- `422 validation-failed`, `unknown-offer` oder `invalid-package-for-offer`
- `429 rate-limited`
- `500 storage-failed`
- `503 human-verification-unavailable`

Das Frontend zeigt Erfolg nur, wenn `201`, `received` und `bookingCreated: false` gemeinsam vorliegen. „Empfangen“ ist ausdrücklich keine Verfügbarkeits-, Reservierungs- oder Buchungsbestätigung.

## Konfiguration und Origin-Grenze

In `astro dev` werden ausschließlich Cloudflares offizieller sichtbarer Always-pass-Test-Site-Key und `http://127.0.0.1:8791/api/inquiries` verwendet. Ein Produktionsbuild aktiviert das Formular nur mit:

- `PUBLIC_INQUIRY_API_URL`: relative Same-Origin-Route oder HTTPS-Endpunkt
- `PUBLIC_TURNSTILE_SITE_KEY`: öffentlicher produktiver Site-Key

Der Worker akzeptiert Browser-CORS nur von seinem eigenen Origin oder dem exakten `PUBLIC_SITE_ORIGIN`. Produktions-Secret, D1, E-Mail-, Rate-Limit- und Access-Bindings bleiben serverseitig und werden nicht in den statischen Build übernommen.
