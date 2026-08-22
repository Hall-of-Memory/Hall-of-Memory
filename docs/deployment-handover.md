# Deployment- und Handover-Runbook

Stand: 2026-08-22

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

## 3. Stufe 1 — Domain-Arbeitsstand

Vor Mutation:

- exakten Git-Commit und sauberen Worktree lesen;
- `npm ci` und `npm run verify` grün;
- Domain-Build mit `PUBLIC_SITE_URL=https://hallofmemory.de` erzeugen;
- `dist/_redirects` exakt auf die eine freigegebene Regel prüfen;
- keine Secrets oder produktiven Backend-Platzhalter im Artefakt;
- aktuellen STRATO-DNS-Zustand und ein Rollbackziel dokumentieren;
- im kundeneigenen Cloudflare-Kontext Account/Zone, Tarif und tatsächlich verlangte Nameserver/Custom-Domain-Konfiguration lesen.

Dann:

1. statische Site revisionsgebunden nach Cloudflare deployen;
2. Deployment auf dem Cloudflare-Standardhost read-backen;
3. `hallofmemory.de` als Custom Domain an das geprüfte Deployment binden;
4. erst danach die von Cloudflare tatsächlich ausgegebenen Nameserver/DNS-Werte bei STRATO setzen;
5. DNS-Propagation und TLS abwarten/read-backen;
6. `https://hallofmemory.de/` muss mit `302` nach `/demo/` führen;
7. `/demo/` und `/demo/rahmen/` müssen HTTP 200 liefern und die erwarteten Assets laden;
8. `www` erhält eine explizite Redirect-/Canonical-Strategie;
9. Desktop/Mobil-Browserreadback durchführen.

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

`ACCESS_JWKS_JSON` und `SMOKE_LIMITER` bleiben ausschließlich lokale Testkonfiguration. Die Vorlage `spikes/inquiry-worker/wrangler.production.example.jsonc` darf mit Platzhaltern nie produktiv deployt werden.

Reihenfolge Stufe 2:

1. D1-/Worker-/Access-/Turnstile-/Email-Ressourcen im Kundenkonto inventarisieren und Kosten/Limits bestätigen.
2. D1 vor Migration exportieren, Migrationen lesen und kontrolliert anwenden.
3. Secrets ausschließlich im Plattform-Secretstore setzen.
4. Worker dry-run, dann revisionsgebunden deployen.
5. Health, CORS, Access, D1 und Outbox read-backen.
6. Site mit API-URL und Turnstile-Site-Key bauen; Formular muss jetzt aktiv sein.
7. Site deployen und vollständigen Browser-Smoke ausführen.

## 5. Verifikation

Kanonischer lokaler Volltest:

```sh
npm ci
npm run verify
```

Für den Domain-Build zusätzlich:

```sh
PUBLIC_SITE_URL=https://hallofmemory.de npm run build
```

Zu prüfen:

- Build erfolgreich;
- `_redirects` enthält nur `/ /demo/ 302`;
- `/demo/` bleibt `noindex`, solange die Freigabe nicht erfolgt ist;
- statischer Arbeitsstand behauptet kein funktionsfähiges produktives Anfrageformular;
- keine Secrets in `dist/` oder Buildlogs.

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
