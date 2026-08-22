# Deployment- und Handover-Runbook

Stand: 2026-08-11

Dieses Runbook bereitet den Livegang reproduzierbar vor. Es autorisiert kein Deployment und keine Provisionierung. Alle Ressourcen, Domains, Empfänger und Zugänge müssen vor Ausführung im kundeneigenen Konto liegen. Platzhalter dürfen nie deployt werden.

## 1. Externe Freigabegates

Vor einem Produktionslauf müssen T008, T010 und T011 entblockt sein. Konkret erforderlich sind:

- echte öffentliche Domain und API-Origin sowie geklärter Registrar-/DNS-Status
- freigegebene Inhalte und `src/content/site.json` mit bewusst gesetztem `launchStatus: production`
- freigegebener Datenschutz-/Einwilligungstext und konkrete Aufbewahrungs-/Löschregel
- kundeneigener Cloudflare-Account/Zone mit benannten Eigentümern und mindestens einem Wiederherstellungszugang
- kundeneigene D1-, Worker-, Turnstile-, Access-, Rate-Limit- und Email-Binding-Ressourcen
- verifizierte Betreiber-Ziel- und Absenderadresse; keine automatische Kundenmail ist Bestandteil von V1
- entschiedener Selbstpflege-Workflow aus T011; das Deployment baut keinen vorläufigen CMS-Editor
- akzeptierte laufende Kosten und Limits aus dem Ressourceninventar unten

## 2. Konfigurationsvertrag

Öffentlicher Astro-Build, ausschließlich nicht geheim:

| Name | Exakter Inhalt |
|---|---|
| `PUBLIC_SITE_URL` | HTTPS-Origin der öffentlichen Site, ohne Pfad, Query oder Fragment |
| `PUBLIC_INQUIRY_API_URL` | relative Same-Origin-Route oder vollständiger HTTPS-Anfrage-Endpunkt |
| `PUBLIC_TURNSTILE_SITE_KEY` | öffentlicher Site-Key des produktiven Turnstile-Widgets |

Fehlt `PUBLIC_SITE_URL`, wird kein Canonical behauptet, `robots.txt` sperrt Crawling und die Sitemap bleibt leer. Entwurfsinhalte bleiben auch mit URL `noindex`. Fehlen API-URL oder Site-Key, bleibt das Formular fail-closed deaktiviert. `.env.example` dokumentiert nur die Namen und enthält keine Werte.

Serverseitiger Worker-Vertrag:

| Art | Name | Zweck |
|---|---|---|
| D1-Binding | `DB` | autoritative Anfragen und Benachrichtigungs-Outbox |
| Rate-Limit-Binding | `PUBLIC_ROUTE_LIMITER` | grobes Limit des öffentlichen Endpunkts |
| Rate-Limit-Binding | `PUBLIC_ACTOR_LIMITER` | Angebot + gehashte normalisierte E-Mail |
| Email-Binding | `NOTIFY_OWNER` | Betreiberbenachrichtigung an verifiziertes Ziel |
| Secret | `TURNSTILE_SECRET_KEY` | serverseitiger produktiver Turnstile-Secret-Key |
| Variable | `SPIKE_MODE` | exakt `production`; deaktiviert lokale `__spike`-Routen |
| Variable | `ACCESS_TEAM_DOMAIN` | HTTPS-Origin der kundeneigenen Access-Team-Domain |
| Variable | `ACCESS_AUD` | Audience der Access-Anwendung |
| Variable | `NOTIFY_TO` | verifizierte Betreiber-Zieladresse |
| Variable | `NOTIFY_FROM` | verifizierte Absenderadresse |
| Variable | `PUBLIC_SITE_ORIGIN` | exakter öffentlicher Site-Origin für CORS |

`ACCESS_JWKS_JSON` und `SMOKE_LIMITER` sind ausschließlich lokale Testkonfiguration und dürfen nicht in die Produktionskonfiguration. Produktiv werden die rotierenden öffentlichen Schlüssel von `ACCESS_TEAM_DOMAIN` gelesen und alle `__spike`-Routen bleiben deaktiviert. `spikes/inquiry-worker/wrangler.production.example.jsonc` ist eine absichtlich nicht deploybare Platzhaltervorlage. Sie wird als nicht versionierte `wrangler.production.jsonc` kopiert, vollständig ersetzt und vor Nutzung mit `rg -n 'REPLACE_WITH|example\.invalid|local-only'` fail-closed geprüft.

## 3. Reproduzierbarer Preflight ohne Remote-Mutation

Vom sauberen, freigegebenen Commit aus und mit Node 22:

```sh
git status --short
git rev-parse HEAD
npm ci
npm run spike:inquiry
npm run test:domain
npm run test:form
npm run test:quality
npm run check
npm run build
npm run dry-run:worker
npm run dry-run:site
git show --check HEAD
```

Für den produktionsähnlichen Site-Build werden die drei öffentlichen Werte explizit in der Buildumgebung gesetzt. Danach sind `dist/index.html`, `dist/robots.txt`, `dist/sitemap.xml` und `dist/_headers` zu prüfen: genau erwartetes Canonical, `index,follow` durch Abwesenheit von `noindex`, korrekter Sitemap-Origin, korrekter CSP-Connect-Origin und aktiviertes Formular. Geheimnisse dürfen weder in `dist/` noch im Buildlog vorkommen.

## 4. Erstmalige Aktivierungsreihenfolge

Die Reihenfolge vermeidet eine sichtbare Site mit noch nicht funktionsfähigem Backend.

1. Commit-ID, verantwortliche Person, Wartungsfenster und bisherige Worker-Versionen protokollieren: `wrangler deployments status --config <production-worker-config>` und für die Site `wrangler deployments status --config wrangler.jsonc`.
2. Bei einer bestehenden D1 vor Migration einen verschlüsselt und zugriffsbeschränkt abzulegenden Export erstellen: `wrangler d1 export DB --remote --config <production-worker-config> --output <approved-backup-path>`.
3. Offene Migrationen lesen: `wrangler d1 migrations list DB --remote --config <production-worker-config>`. In numerischer Reihenfolge zunächst `0001_inquiries.sql`, dann `0002_notifications.sql` anwenden: `wrangler d1 migrations apply DB --remote --config <production-worker-config>`.
4. Tabellen und Migrationen read-only prüfen; keine manuell abweichenden Produktionsschemata akzeptieren.
5. Turnstile-Secret interaktiv und ohne Shell-History setzen: `wrangler secret put TURNSTILE_SECRET_KEY --config <production-worker-config>`. Alle übrigen Bindings/Variablen gegen die Tabelle oben lesen.
6. Worker nochmals dry-run bauen, anschließend nur nach ausdrücklicher Freigabe mit Konfliktschutz deployen: `wrangler deploy --strict --config <production-worker-config>`.
7. Worker-Readback und Smokes aus Abschnitt 5 vollständig durchführen. Erst wenn Speicherung, Outbox, Access und CORS funktionieren, fortfahren.
8. Site mit den drei öffentlichen Buildvariablen frisch bauen und den Output wie in Abschnitt 3 prüfen.
9. Site erst danach und nur nach ausdrücklicher Freigabe deployen: `wrangler deploy --strict --config wrangler.jsonc`.
10. DNS/Custom Domain aktivieren beziehungsweise umschalten, dann Browser-Smoke gegen die echte öffentliche Domain durchführen.

Das Runbook legt absichtlich keine Accounts, Remote-D1, Access-App, Turnstile-Ressource, Email-Ressource, Domain oder Git-Remote an.

## 5. Produktions-Smoke und Readback

- `GET /health` des Anfrage-Workers liefert `ok: true` und `mode: production`; `GET /__spike/count` liefert in Produktion `404`.
- Preflight/POST mit einem fremden `Origin` wird `403 origin-not-allowed`; der exakte Site-Origin erhält nur seine eigene CORS-Freigabe.
- `/admin` und `/api/admin/inquiries` ohne Access-JWT sowie mit unberechtigter Identität werden abgewiesen.
- Ein kontrollierter Browser-Smoke mit gültigem Turnstile erzeugt genau eine D1-Anfrage, `bookingCreated: false`, einen Outbox-Eintrag und eine Betreiberbenachrichtigung. Er erzeugt keine Reservierung und keine Kundenmail.
- Die Testanfrage wird im geschützten Admin angezeigt, lässt sich auf einen erlaubten Status ändern und wird anschließend gemäß der freigegebenen Löschregel behandelt.
- Site-Readback prüft Statuscode, Security-Header, Canonical, Robots/Sitemap, CSP, Formularziel sowie Desktop-/Mobilansicht mit Tastatur und Screenreader-Baseline.
- `wrangler deployments status` für beide Worker und `git rev-parse HEAD` werden im Handoverprotokoll zusammengeführt.

## 6. Rollback

Vor jedem Deployment die bisher aktive Version mit `wrangler deployments list --config <config>` notieren.

- Sitefehler: vorherige Site-Version mit `wrangler rollback <site-version-id> --config wrangler.jsonc --message <reason>` aktivieren und Status/Headers erneut lesen.
- API-/Adminfehler: vorherige Worker-Version mit `wrangler rollback <worker-version-id> --config <production-worker-config> --message <reason>` aktivieren; anschließend Health, Access und eine read-only D1-Abfrage prüfen.
- D1-Migrationen haben bewusst kein automatisches Down-Migration-Skript. Die vorhandenen Migrationen sind additiv; ein älterer Worker ignoriert die zusätzliche Outbox-Tabelle. Bei destruktiven künftigen Migrationen ist vorab ein eigener vorwärtsgerichteter Reparatur-/Restoreplan Pflicht. Ein D1-Export darf nicht ungeprüft über neue Anfragen zurückgespielt werden.
- Bei Domain-/DNS-Fehlern zur zuvor protokollierten Zielkonfiguration zurückkehren; TTL und Zertifikatsstatus read-only prüfen.

## 7. Eigentum, Zugänge und Übergabe

- Registrar, Domain, Cloudflare-Account/Zone, Billing und sämtliche Ressourcen gehören dem Kunden oder sind nachweislich vollständig übertragbar.
- Primärer Eigentümer, zweiter Wiederherstellungsinhaber und Rollen nach geringstem Recht sind benannt; persönliche Entwicklerkonten sind kein dauerhafter Single Point of Failure.
- Quellrepository und produktiver Git-Remote liegen unter Kundenhoheit; der aktuelle lokale Stand besitzt noch keinen Remote.
- D1-Datenbank, beide Worker, Turnstile-Widget/Hostname-Regeln, Access-Anwendung/Policies, Email Routing/Binds und Rate-Limit-Namespaces sind inventarisiert.
- Secrets werden über den Plattform-Secretstore gesetzt, nicht in Git, `.env`, Tickets, Buildartefakte oder Handoverdokumente kopiert; Rotations- und Recovery-Verantwortung ist benannt.
- Deployment-Commit, Plattform-Versionen, DNS-Ziele, Backuport, Smokeprotokoll, Rollbackversionen und freigegebene Datenschutz-/Löschregeln sind übergeben.

## 8. Kosten- und Ressourceninventar

| Ressource | V1-Zweck | Aktivierung/Kostenprüfung |
|---|---|---|
| Domain/Registrar/DNS | öffentliche Kundenadresse | kundeneigener Vertrag; Preis und Verlängerung vor Kauf bestätigen |
| Static Assets Worker | Astro-Site | aktuelles Cloudflare-Limit/Tarif vor Aktivierung prüfen |
| Anfrage-Worker | API und Admin | Requests/CPU-Limits und Tarif vor Aktivierung prüfen |
| D1 | Anfrage + Outbox | Speicher, Reads/Writes, Export/Backupbedarf prüfen |
| Turnstile | Bot-Schutz | Hostname-Regeln und aktuelle Konditionen prüfen |
| Workers Rate Limiting | Route-/Akteurslimit | Verfügbarkeit und Planlimit im Kundenkonto prüfen |
| Cloudflare Access | Adminschutz | Nutzerzahl, IdP und aktuellen Tarif prüfen |
| Email Service/Binding | Betreiberhinweis | verifiziertes Ziel ist laut belegter Projektentscheidung für V1 der kostenarme Pfad; aktuelle Konditionen erneut prüfen |
| Automatische Kundenmail | nicht Bestandteil von V1 | nicht provisionieren; beliebige Empfänger können einen Paid-Pfad verlangen |
| R2/Queues/Durable Objects/Payment | nicht Bestandteil von V1 | erst bei belegtem Bedarf und eigener Kostenentscheidung aktivieren |

Free-Tiers und Preise können sich ändern. Deshalb enthält das Repository keine dauerhafte Null-Euro-Zusage: Vor Freigabe werden Dashboard-/Vertragswerte im Kundenkonto gelesen, mit erwarteter Last dokumentiert und vom Kunden akzeptiert.
