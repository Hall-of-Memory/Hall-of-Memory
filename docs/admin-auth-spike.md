# Geschützter Admin-Spike

Stand: 2026-08-11

## Ziel

T006/T011 validieren den kleinsten sicheren Verwaltungsweg, ohne vorzeitig ein eigenes Login-System oder einen endgültigen CMS-Pfad zu bauen.

Der lokale Worker-Spike schützt `/admin` und `/api/admin/*` mit einem Cloudflare-Access-kompatiblen JWT-Vertrag. Er validiert Signatur, Issuer und Audience serverseitig. Für den lokalen Smoke-Test wird bei jedem Lauf ein flüchtiges RSA-Schlüsselpaar erzeugt und nur der öffentliche JWKS-Wert an `wrangler dev --local` übergeben. Es wird kein privater Testschlüssel im Repository gespeichert.

Produktiv soll der Worker die von Cloudflare Access bereitgestellten und rotierenden öffentlichen Schlüssel vom Team-Domain-Endpunkt verwenden. Der lokale `ACCESS_JWKS_JSON`-Pfad existiert ausschließlich für reproduzierbare Tests.

## Praktisch validiert

- `/admin` ohne Access-JWT → 403
- JWT mit falscher Audience → 403
- gültiges RS256-JWT → geschützte Adminseite erreichbar
- Anfragen aus D1 lesbar
- Anfrage-Status von `new` auf `contacted` änderbar und danach wieder lesbar
- Content-Schreibzugriff absichtlich **nicht** aktiviert

## CMS-Grenze

Öffentliche Inhalte liegen weiterhin in strukturierten Git-Dateien. Der Admin-Spike meldet deshalb explizit:

`content.writable = false` / `cms-path-pending-t011`

Damit ist die Sicherheits- und Verwaltungsoberfläche praktisch geprüft, ohne die offene Produktentscheidung Git-CMS vs. D1/R2-Admin künstlich vorwegzunehmen.

## Keine Produktionsmutation

Der Spike erzeugt weder eine Cloudflare-Access-Anwendung noch eine Remote-D1-Datenbank, Domain oder produktive Secrets.

## Primärquellen

- Cloudflare Access: `Cf-Access-Jwt-Assertion` serverseitig validieren, inklusive Signatur, Issuer und Audience.
- Cloudflare Access Signing Keys: `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`.
- Wrangler `dev --local`: Worker und Bindings lokal ausführen; `--var` überschreibt lokale Variablen für reproduzierbare Tests.
