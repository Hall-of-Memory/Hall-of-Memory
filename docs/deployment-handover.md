# Deployment- und Handover-Runbook

Stand: 2026-08-24

Dieses Runbook trennt zwei Stufen:

1. **Domain-Arbeitsstand:** die gepflegte Hall-of-Memory-Website wird unter `https://hallofmemory.de` erreichbar und dort weiterentwickelt; sie bleibt bis zur inhaltlichen/rechtlichen Freigabe `noindex` und das produktive Anfrageformular bleibt fail-closed.
2. **Vollständige V1-Produktion:** Anfrage-Worker, Turnstile, Access, D1, Email-Binding und finale Recht-/Inhaltsfreigaben werden erst nach den Gates aus T008/T010/T011 aktiviert.

Die Kundenentscheidung vom 22.08.2026 autorisiert Stufe 1. Sie ist keine pauschale Freigabe neuer kostenpflichtiger Dienste oder der Backend-Stufe 2.

## 1. Aktuelle Kundeninfrastruktur

- Produktions-/Primärdomain: `https://hallofmemory.de`
- Registrar/DNS: kundeneigen bei STRATO
- autoritative Nameserver zum Stand 22.08.2026: `docks09.rzone.de`, `shades16.rzone.de`
- Apex-A-Record: `217.160.0.152`
- `www.hallofmemory.de`: CNAME auf `hallofmemory.de`
- kanonisches Source-Repo: `Hall-of-Memory/Hall-of-Memory`
- `main`: PR-geschützt, Required Check `verify`, Admin-Enforcement, Conversation Resolution, kein Force-Push/Branch-Löschen
- GitHub Pages: nur Übergangs-Fallback, nicht Produktionsplattform
- Cloudflare: vorgesehene produktive Auslieferung; auf dem Heim-PC ist Wrangler derzeit **nicht** an ein Kundenkonto authentifiziert

T045 ist die operative Wahrheit für den Domain-Cutover.

## 2. Öffentlicher Buildvertrag

Öffentliche, nicht geheime Buildwerte:

| Name | Vertrag |
|---|---|
| `PUBLIC_SITE_URL` | für den Domain-Build exakt `https://hallofmemory.de`, ohne Pfad/Query/Fragment |
| `PUBLIC_INQUIRY_API_URL` | leer, solange Stufe 2 nicht aktiviert ist; später relative Same-Origin-Route oder vollständiger HTTPS-Endpunkt |
| `PUBLIC_TURNSTILE_SITE_KEY` | leer, solange Stufe 2 nicht aktiviert ist; später öffentlicher produktiver Site-Key |
| `PUBLIC_WHATSAPP_NUMBER` | nur bestätigte Business-Nummer; sonst leer |

Solange Inhalte/Legal noch Entwurfsstand sind, bleibt `noindex` bewusst erhalten. Das ist für die Arbeitsdomain kein Fehler.

`public/_redirects` enthält für Cloudflare Workers Static Assets genau die vorläufige Root-Regel:

```text
/ /demo/ 302
```

Damit zeigt `https://hallofmemory.de/` auf die gepflegte Kundenwebsite unter `/demo/`, ohne den sicherheitsgehärteten internen Root-Scaffold oder seine Formularprüfungen zu ersetzen. Bis zur finalen Launch-Entscheidung bleibt es ein temporärer `302` statt eines permanenten `301`.

Der Anfragebereich auf `/demo/` ist in Stage 1 nur eine sichtbare Ablaufvorschau: Feldgruppen und Submit sind disabled, es gibt keinen Mock-Submit und keinen clientseitigen Pfad, der eingegebene Kontaktdaten scheinbar entgegennimmt und verwirft. Ein echter Anfragepfad darf erst mit Stage 2 aktiviert werden.

## 3. Stufe 1 — Domain-Arbeitsstand

Vor Mutation:

- exakten Git-Commit und sauberen Worktree lesen;
- `npm ci` und `npm run verify` grün;
- Domain-Build mit `PUBLIC_SITE_URL=https://hallofmemory.de` erzeugen;
- `dist/_redirects` exakt auf die eine freigegebene Regel prüfen;
- keine Secrets oder produktiven Backend-Platzhalter im Artefakt;
- **vollständigen autoritativen STRATO-DNS-Zonenstand** vor jeder Nameservermutation inventarisieren/exportieren: alle Ownernamen/Subdomains, Recordtypen, Werte, Prioritäten und TTLs; mindestens `A`, `AAAA`, `CNAME`, `MX`, `TXT` (einschließlich SPF/DKIM/DMARC/Verifikationen), `SRV` und `CAA`; aktuelle `NS`/`SOA` separat dokumentieren;
- DNSSEC/DS-Status beim Registrar separat read-backen. Bei aktivem DNSSEC darf der Nameserverwechsel nicht erfolgen, solange ein alter/inkompatibler DS die neue Delegation validierungsfehlerhaft machen würde; die zum Umschaltzeitpunkt gültige STRATO-/Cloudflare-Migrationsprozedur wird live gelesen und revisionsgebunden protokolliert;
- im kundeneigenen Cloudflare-Kontext Account/Zone, Tarif und tatsächlich verlangte Nameserver/Custom-Domain-Konfiguration lesen;
- **vor dem Nameserverwechsel** sämtliche weiterhin benötigten nicht-provider-spezifischen RRsets aus dem STRATO-Snapshot in Cloudflare anlegen/importieren. Mail-/Verifikationsrecords (`MX`, zugehörige `A`/`AAAA`, `TXT`, `SRV`) bleiben DNS-only; nur bewusst gewählte Webrecords dürfen proxied werden;
- den normalisierten STRATO-Snapshot und die Cloudflare-Zone recordweise vergleichen. Abgesehen von bewusst dokumentierten providerbedingten `NS`/`SOA`-/Proxy-Unterschieden darf kein benötigter Record fehlen oder unerklärt abweichen. `CAA` muss mit der vorgesehenen TLS-Zertifikatsausstellung vereinbar sein; bei Unklarheit bleibt der Cutover blockiert;
- vollständigen Zonen-Snapshot, DNSSEC-Ausgangszustand und vorherige Nameserver als Rollbackevidenz außerhalb von Secrets protokollieren. Die bekannten Apex-`A`- und `www`-Records allein sind ausdrücklich **kein** vollständiger DNS-Sicherungsnachweis.

### Maschinenlesbares Vollzonen-/DNSSEC-Gate

Die Provider-Sicherung wird vor dem Nameserverwechsel nicht nur textuell, sondern mit `scripts/dns-zone-cutover.mjs` fail-closed geprüft. Das Werkzeug erwartet zwei **vollständige, lokal bereitgestellte JSON-Snapshots**; es ruft keinen Provider auf und nimmt selbst keine DNS-Mutation vor. Ein `complete: true` ist dabei eine vom Provider-Export zu belegende Eingangsbehauptung und ersetzt nicht den Nachweis, dass der Export tatsächlich vollständig war.

Quellsnapshot STRATO:

```json
{
  "schemaVersion": 1,
  "provider": "strato",
  "zone": "hallofmemory.de",
  "complete": true,
  "capturedAt": "<ISO-8601 mit Zeitzone>",
  "dnssec": { "dsRecords": [] },
  "records": [{ "name": "@", "type": "A", "ttl": 3600, "values": ["..."] }]
}
```

Zielsnapshot Cloudflare:

```json
{
  "schemaVersion": 1,
  "provider": "cloudflare",
  "zone": "hallofmemory.de",
  "complete": true,
  "capturedAt": "<ISO-8601 mit Zeitzone>",
  "dnssec": { "migrationReady": false },
  "allowedWebValueChanges": [],
  "records": [{ "name": "@", "type": "A", "ttl": 300, "values": ["..."], "proxied": true }]
}
```

Für beide Snapshots sind `NS` und `SOA` am Zonenapex als Authority-Evidenz Pflicht; sie werden anschließend nur als providerverwaltete Unterschiede vom Inhaltsvergleich ausgenommen. Absolute Recordnamen außerhalb der deklarierten Zone werden abgewiesen. `capturedAt` muss ISO-8601 mit expliziter Zeitzone sein. Ein Snapshot darf für eine Cutover-Entscheidung höchstens sechs Stunden alt sein, und Quell-/Zielsnapshot dürfen höchstens eine Stunde auseinanderliegen. Für Cloudflare müssen `A`/`AAAA`/`CNAME` explizit `proxied: true|false` tragen. Von `MX` oder `SRV` referenzierte Ziele müssen DNS-only bleiben. Alle übrigen RRsets werden owner-/typgebunden verglichen. TTL-Abweichungen sind sichtbar, aber allein nicht blockierend. Bewusste Webzieländerungen sind nur für `A`/`AAAA`/`CNAME` über `allowedWebValueChanges` mit begründetem Eintrag zulässig; Mail-/SRV-Ziele können darüber nicht freigegeben werden, und ungenutzte Freigaben blockieren. Existieren im STRATO-Snapshot DS-Records, bleibt das Gate rot, bis `dnssec.migrationReady=true` revisionsgebunden belegt ist.

Prüfung:

```sh
node scripts/dns-zone-cutover.mjs <strato-snapshot.json> <cloudflare-snapshot.json>
```

Nur Exit-Code `0` **und** `passed: true` gelten als PASS. Der Report bindet beide normalisierten Vollsnapshots über SHA-256, nennt Recordschlüssel und Fehlerklassen, gibt aber absichtlich keine RRset-Werte, TXT-Verifikationstokens, Freigabegründe oder sonstigen DNS-Inhalt wieder. Die vollständigen Snapshots können solche Werte enthalten und werden deshalb nicht ins Repository committed, sondern ausschließlich in einem freigegebenen Evidenz-/Rollbackpfad außerhalb von Git gehalten.

Dann:

1. statische Site revisionsgebunden nach Cloudflare deployen;
2. Deployment auf dem Cloudflare-Standardhost read-backen;
3. `hallofmemory.de` als Custom Domain an das geprüfte Deployment binden;
4. Cloudflare-Zonenbestand nochmals gegen den vollständigen STRATO-Snapshot vergleichen und den Vergleich als `PASS` binden; DNSSEC/DS-Preflight muss ebenfalls `PASS` sein;
5. die von Cloudflare tatsächlich ausgegebenen Nameserver revisionsgebunden lesen;
6. **erst bei bestandenem Vollzonen- und DNSSEC-Gate** die STRATO-Nameserver kontrolliert auf diese Cloudflare-Werte umstellen;
7. DNS-Propagation, vollständige öffentliche Record-Stichprobe (insbesondere Web + Mail/Verifikation) und TLS abwarten/read-backen;
8. `https://hallofmemory.de/` muss mit `302` nach `/demo/` führen;
9. `/demo/` und `/demo/rahmen/` müssen HTTP 200 liefern und die erwarteten Assets laden;
10. `www` erhält eine explizite Redirect-/Canonical-Strategie;
11. Desktop/Mobil-Browserreadback durchführen.

Bei irgendeinem unklaren externen Write-Ausgang: keine Wiederholung ohne Provider-Readback.

## 4. Stufe 2 — Anfrage/Admin-Produktion

Erst nach Entblockung von T008/T010/T011:

| Art | Name | Zweck |
|---|---|---|
| D1-Binding | `DB` | autoritative Anfragen und Benachrichtigungs-Outbox |
| Rate-Limit-Binding | `PUBLIC_ROUTE_LIMITER` | grobes Limit des öffentlichen Endpunkts |
| Rate-Limit-Binding | `PUBLIC_ACTOR_LIMITER` | Angebot + gehashte normalisierte E-Mail |
| Email-Binding | `NOTIFY_OWNER` | Betreiberbenachrichtigung |
| Secret | `TURNSTILE_SECRET_KEY` | serverseitiger Turnstile-Secret-Key |
| Variable | `SPIKE_MODE` | exakt `production` |
| Variable | `ACCESS_TEAM_DOMAIN` | kundeneigene Access-Team-Domain |
| Variable | `ACCESS_AUD` | Audience der Access-Anwendung |
| Variable | `NOTIFY_TO` | verifizierte Betreiber-Zieladresse |
| Variable | `NOTIFY_FROM` | verifizierte Absenderadresse |
| Variable | `PUBLIC_SITE_ORIGIN` | exakt `https://hallofmemory.de` |

`ACCESS_JWKS_JSON` und `SMOKE_LIMITER` bleiben ausschließlich lokale Testkonfiguration. Die Vorlage `spikes/inquiry-worker/wrangler.production.example.jsonc` darf mit Platzhaltern nie produktiv deployt werden. Die tatsächliche kundengebundene Laufzeitkonfiguration heißt exakt `spikes/inquiry-worker/wrangler.production.jsonc`, ist in `.gitignore` ausgeschlossen und darf weder Secrets noch `REPLACE_WITH_*`-/`example.invalid`-/`local-only`-Werte enthalten.

Die Produktionskonfiguration wird einmalig aus der Beispielvorlage erzeugt und vollständig mit den im Kundenkonto read-backbaren Ressourcenwerten befüllt. Vor jedem produktiven Worker-Dry-Run gilt fail-closed:

```sh
rg -n 'REPLACE_WITH|example\.invalid|local-only' spikes/inquiry-worker/wrangler.production.jsonc
npm run dry-run:worker:production
```

Der `rg`-Schritt muss **ohne Treffer** enden. `npm run dry-run:worker:production` bindet ausdrücklich `--config spikes/inquiry-worker/wrangler.production.jsonc`; der normale lokale `npm run dry-run:worker` gegen `spikes/inquiry-worker/wrangler.jsonc` ist **kein** Produktionsnachweis. Secrets werden weiterhin ausschließlich über den Plattform-Secretstore gesetzt und deshalb nicht durch den JSONC-Dry-Run transportiert.

Reihenfolge Stufe 2:

1. D1-/Worker-/Access-/Turnstile-/Email-Ressourcen im Kundenkonto inventarisieren und Kosten/Limits bestätigen.
2. `spikes/inquiry-worker/wrangler.production.jsonc` aus der Beispielvorlage erzeugen bzw. die vorhandene lokale Datei gegen den Kunden-Readback abgleichen; alle Platzhalter müssen ersetzt sein. Noch **vor jedem D1-Write** den gebundenen `DB`-Eintrag gegen die tatsächlich gewünschte Remote-D1 im Kundenkonto lesen.
3. Exakt `npm run dry-run:worker:production` ausführen und den Output auf die erwarteten produktiven Bindings prüfen. Der Dry-Run muss denselben `DB`-Binding-Namen und dieselbe produktive Konfiguration zeigen, die in den folgenden D1-Befehlen verwendet werden.
4. Erst jetzt D1 sichern und migrieren. Bei einer bereits bestehenden D1 zunächst `wrangler d1 export DB --remote --config spikes/inquiry-worker/wrangler.production.jsonc --output <approved-backup-path>` ausführen. Danach `wrangler d1 migrations list DB --remote --config spikes/inquiry-worker/wrangler.production.jsonc` lesen und offene Migrationen kontrolliert mit `wrangler d1 migrations apply DB --remote --config spikes/inquiry-worker/wrangler.production.jsonc` anwenden. Bei einer frisch angelegten leeren D1 entfällt nur der Export, nicht der configgebundene Migrations-Readback.
5. Secrets ausschließlich im Plattform-Secretstore und **configgebunden an den Inquiry-Worker** setzen. Für Turnstile exakt `wrangler secret put TURNSTILE_SECRET_KEY --config spikes/inquiry-worker/wrangler.production.jsonc` verwenden; ein configloser Secret-Befehl aus dem Repository-Root ist verboten, weil er sonst den statischen Site-Worker aus `wrangler.jsonc` treffen kann. Danach den Secret-Binding-Status des Inquiry-Workers read-backen, ohne den Secretwert offenzulegen.
6. Erst danach exakt dieselbe Konfiguration revisionsgebunden deployen: `wrangler deploy --strict --config spikes/inquiry-worker/wrangler.production.jsonc`.
7. Health, CORS, Access, D1 und Outbox read-backen.
8. **Vor jedem Stage-2-Site-Build** einen eigenen revisionsgebundenen Routing-/UI-Commit integrieren: Die Stage-1-Regel `/ /demo/ 302` muss entfernt oder so ersetzt werden, dass `/` auf eine tatsächlich aktive Anfrage-Route zeigt. Solange `/` noch auf die bewusst deaktivierte Stage-1-`/demo/`-Form führt, ist Stage 2 fail-closed **nicht aktivierbar**. Ein bloßes Setzen von API-URL und Turnstile-Key reicht ausdrücklich nicht.
9. Vor dem Commit, der `launchStatus=production` setzt, die Release-Inputs für den vertrauenswürdigen `main`-Push binden: Repository-Variable `PRODUCTION_INQUIRY_API_URL`, Repository-Variable `PRODUCTION_TURNSTILE_SITE_KEY` und Actions-Secret `PRODUCTION_WORKER_CONFIG_JSON` mit dem revisionsgebunden geprüften Inhalt von `spikes/inquiry-worker/wrangler.production.jsonc`. Diese Werte werden nicht in Pull-Request-Jobs injiziert. Fehlen sie auf `main`, scheitert der Production-Build fail-closed und Pages deployt nicht.
10. Erst nach diesem Routing-Readback `npm run check:production-readiness` ausführen und die Site mit API-URL und Turnstile-Site-Key bauen – ausschließlich über `npm run build`. Sobald `launchStatus=production` gesetzt ist, führt `npm run build` denselben Readiness-Check automatisch vor Astro aus und bricht bei jedem fehlenden Beleg fail-closed ab. Der ausgelieferte Primärpfad muss jetzt ein aktives `data-inquiry-form`, Turnstile und die verbindliche Datenschutz-Einwilligung enthalten; die Stage-1-Markierung `data-demo-inquiry-disabled` darf auf dem Primärpfad nicht mehr die Anfrage ersetzen. Der GitHub-Pages-Build bleibt davon bewusst getrennt: Er ist der Kanal `github-pages-preview`, nutzt seine Preview-Origin und ist kein Produktionsdeploy.
11. Die Site ausschließlich über `npm run deploy` deployen und danach den vollständigen Browser-Smoke ausführen. Dieser Befehl erzwingt nochmals den strikten Production-Readiness-Check und einen frischen gegateten Build, bevor Wrangler deployen darf; ein direkter `wrangler deploy` aus dem Repository-Root ist kein freigegebener Produktionspfad.

## 5. Verifikation

Kanonischer lokaler Volltest:

```sh
npm ci
npm run verify
```

Für den Stage-1-Domain-Build zusätzlich:

```sh
PUBLIC_SITE_URL=https://hallofmemory.de npm run build
```

Stage 1:

- Build erfolgreich;
- `_redirects` enthält nur `/ /demo/ 302`;
- `/demo/` bleibt `noindex`, solange die Freigabe nicht erfolgt ist;
- statischer Arbeitsstand behauptet kein funktionsfähiges produktives Anfrageformular;
- keine Secrets in `dist/` oder Buildlogs.

Stage 2 hat absichtlich einen **anderen Routingvertrag**: Vor dem produktiven Site-Build muss die Stage-1-Root-Weiterleitung in einem eigenen geprüften Commit entfernt/ersetzt sein. Der Build ist zu verwerfen, wenn `dist/_redirects` weiterhin `/ /demo/ 302` enthält und `/demo/` weiterhin `data-demo-inquiry-disabled` als einzigen primären Anfrageweg ausliefert.

## 6. Produktions-Readback

Stufe 1:

- DNS/Nameserver entsprechen dem dokumentierten Ziel;
- HTTPS-Zertifikat gültig;
- `/` → `302 /demo/`;
- `/demo/` und `/demo/rahmen/` → HTTP 200;
- Logo, Eventbild, Styles, Frame-Assets und Navigation laden;
- Mobile/Desktop-Basis funktioniert;
- `noindex` bleibt bis zur Launchfreigabe erhalten.

Stufe 2 zusätzlich:

- `/` führt **nicht mehr** über die Stage-1-Regel auf eine deaktivierte `/demo/`-Anfrage;
- der primäre öffentliche Anfragepfad enthält ein aktives Formular mit API-Ziel, Turnstile und Datenschutz-Einwilligung und kann eine kontrollierte Testanfrage übermitteln;
- `GET /health` des Anfrage-Workers liefert `ok: true` und `mode: production`;
- `__spike`-Routen sind nicht erreichbar;
- fremder Origin wird abgewiesen;
- Admin ohne gültigen Access-JWT wird abgewiesen;
- kontrollierte Testanfrage erzeugt genau die erwartete D1-/Outbox-Wirkung, keine Reservierung und keine automatische Kundenmail;
- Datenschutz-/Löschregel wird eingehalten.

## 7. Rollback

Vor DNS- und Deployment-Mutationen immer den vorherigen Zustand protokollieren.

- Sitefehler: auf vorherige Cloudflare-Version zurückrollen und Readback wiederholen.
- Domainfehler: STRATO-DNS/Nameserver auf den protokollierten vorherigen Zustand zurücksetzen; TTL und Zertifikat erneut lesen.
- Workerfehler in Stufe 2: vorherige Worker-Version aktivieren; Health, Access und D1 read-only prüfen.
- D1-Migrationen haben kein automatisches Down-Skript; künftige destruktive Migrationen brauchen vorab einen eigenen Restore-/Forward-Fix-Plan.

## 8. Eigentum, Repo-Sichtbarkeit und Übergabe

- Registrar, Domain, Cloudflare-Account/Zone, Billing und produktive Ressourcen bleiben kundenkontrolliert.
- Persönliche Entwicklerkonten dürfen kein dauerhafter Single Point of Failure sein.
- Das GitHub-Repo liegt bereits unter Kundenhoheit.
- Das Source-Repo soll langfristig so privat wie sinnvoll sein; eine Sichtbarkeitsänderung darf aber nicht unbemerkt den `main`-Schutz entfernen.
- Keine kostenpflichtige GitHub-Aufwertung ohne ausdrückliche Freigabe.
- Private Eventfotos, Kundendaten, Secrets und nicht öffentliche Source-Master bleiben unabhängig von der Repo-Sichtbarkeit außerhalb von Git.
- GitHub Pages wird nach erfolgreichem Domain-Cutover aus der Primärrolle entfernt.

## 9. Kosten

Free-Tiers und Preise sind keine dauerhafte Zusage. Vor Aktivierung neuer Plattformressourcen werden die aktuellen Dashboard-/Vertragswerte im Kundenkonto gelesen. Kostenpflichtige Zusatznutzung wird nur nach ausdrücklicher Freigabe aktiviert.
