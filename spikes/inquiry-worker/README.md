# Anfrage-Worker-Spike

Nur lokaler technischer Spike für T004/T011. Kein produktives Deployment, keine Remote-D1-Ressource und kein Kundensecret.

Validiert werden gemeinsamer Anfragevertrag, exakte CORS-Origin-Grenze, Angebot/Paket-Abgleich, zweistufiges Rate Limiting, serverseitiges Turnstile-Siteverify mit Cloudflares öffentlichen Testschlüsseln, persistente Speicherung samt D1-Outbox, simulierte Betreiberbenachrichtigung und Access-kompatibler Adminzugriff. Erfolgreich bedeutet ausschließlich `received`; der Worker gibt explizit `bookingCreated: false` zurück.

Das Astro-Frontend kann über `PUBLIC_INQUIRY_API_URL` auf diesen Vertrag zeigen. Produktiv müssen alle Platzhalter-/Testbindings und `PUBLIC_SITE_ORIGIN` im kundeneigenen Konto ersetzt werden; ohne öffentliche Buildkonfiguration bleibt das Formular deaktiviert.
