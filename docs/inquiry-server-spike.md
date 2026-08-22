# Lokaler Anfrage-Server-Spike

Stand: 2026-08-11

Validierter Ablauf ohne externe Produktionsressource:

`POST /api/inquiries` → exakte Origin-Prüfung → Route-Limiter → JSON-/Größenprüfung → Zod-Vertrag → Angebot/Paket → Akteurs-Limiter → Turnstile Siteverify → lokale D1-Anfrage + Outbox → `201 received` → asynchrone Betreiberbenachrichtigung

`received` ist eine Anfrage und keine Reservierung/Buchung. Das Astro-Frontend verwendet diesen Vertrag nun direkt; ohne explizite Produktionskonfiguration bleibt sein Submit fail-closed deaktiviert.

## Produktions-Gate, noch offen

- endgültige Backend-/Datenbankentscheidung in T011
- kundeneigene produktive Worker-/D1-/Access-/Email-/Rate-Limit-Bindings
- produktiver Turnstile-Schlüssel/Secret und Hostname-Regeln
- öffentliche Site-/API-URLs und exakter CORS-Origin
- verifizierte Betreiber-Ziel-/Absenderadresse
- finaler Datenschutz-/Einwilligungstext und Aufbewahrungs-/Löschregeln

Eine automatische Kundenmail ist nicht Bestandteil von V1. Der lokale Smoke nutzt Wrangler-E-Mail-Simulation und legt keine Remote-Ressource an.
