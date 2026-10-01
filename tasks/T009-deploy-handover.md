---
id: T009
status: blocked_external
priority: P0
dependencies: [T001, T004, T008, T010, T011]
---
# Deployment, Domain und Handover

## Akzeptanz
- produktive Konten/Domain unter Kundenhoheit oder vollständig übergebbar
- reproduzierbares Deployment
- laufende Kosten vor Aktivierung transparent
- Quellcode und relevante Zugänge vollständig übergabefähig

## Bestätigter Kundenwunsch — 2026-08-12

Domain und produktive Zugänge sollen auf den Namen des Kunden bzw. unter seine tatsächliche Kontrolle laufen. Entwicklerkonten dürfen keine dauerhafte Abhängigkeit erzeugen.

## Produktionsdomain-Entscheidung — 2026-08-22

Der Kunde möchte die Website jetzt direkt auf der vorhandenen Domain **`https://hallofmemory.de`** veröffentlichen und anschließend dort weiterentwickeln. T045 ist der operative Domain-Cutover-Task.

Live belegt:

- Registrar/DNS liegt beim Kunden bei STRATO.
- Autoritative Nameserver: `docks09.rzone.de`, `shades16.rzone.de`.
- Aktueller Apex-A-Record: `217.160.0.152`.
- `www.hallofmemory.de` ist CNAME auf `hallofmemory.de`.

Die Produktionsplattform bleibt Cloudflare. GitHub Pages ist nur noch Übergangs-Fallback und wird nach erfolgreichem Domain-Readback nicht mehr als Primärpreview benötigt.


## Produktionsdomain-Pivot — 2026-09-27

Die Kundenentscheidung vom 27.09.2026 supersediert den operativen Domainpfad vom 22.08.2026: neue Produktions-/Primärdomain ist **`https://memoraevent.de`**. T060 ist ab jetzt der operative Domain-Cutover-Task; T045/T059 bleiben historische Evidenz des früheren `hallofmemory.de`-Pfads.

Frisch belegt:

- Registrar/DNS liegt beim Kunden bei INWX.
- Autoritative Nameserver: `ns.inwx.de`, `ns2.inwx.de`, `ns3.inwx.eu`.
- Apex, `www` und der vorhandene Wildcard-`A` zeigen auf `185.181.104.242`.
- Apex-`MX`, Apex-`TXT`, `_dmarc TXT` und Apex-`CAA` sind aktuell leer.
- Beim `.de`-Parent ist kein DS veröffentlicht.
- Der bestehende Cloudflare-Worker `hall-of-memory` bleibt Zielruntime.
- Die neue Cloudflare-Zone existiert noch nicht. Der vorhandene delegierte Cloudflare-Zugang erreicht den `Add domain`-Pfad, wird bei der Zonenerstellung aber ausdrücklich wegen fehlendem `com.cloudflare.api.account.zone.create` blockiert. Es wurde keine Zone erstellt und keine kostenpflichtige Option aktiviert.

Least-Privilege-Folge: Bevorzugt legt Aram die Zone einmal selbst an und delegiert danach bei Bedarf `Domain Administrator` nur für `memoraevent.de`. Ein breiterer accountweiter Adminzugang ist dafür nicht der Standardpfad.


## Produktionsdomain-Korrektur — 2026-09-30 / Live-Readback 2026-10-01

Der Kunde hat die Primärdomain auf **`https://memoraevents.de`** korrigiert. T061 supersediert damit den operativen Domainpfad aus T060; T060 bleibt historische Evidenz des bereits gemergten `memoraevent.de`-Zwischenstands.

Frisch belegt:

- `memoraevents.de` ist öffentlich registriert und über INWX delegiert.
- Aktuelle Nameserver: `ns.inwx.de`, `ns2.inwx.de`, `ns3.inwx.eu`.
- Apex und `www` zeigen auf `185.181.104.242`; Apex-MX/TXT/CAA und `_dmarc TXT` sind leer.
- Beim `.de`-Parent ist kein DS veröffentlicht.
- Die Cloudflare-Zone `memoraevents.de` existiert bereits im kundeneigenen Aram-Account, Plan `Free Website`, Status `pending`.
- Cloudflare weist `quentin.ns.cloudflare.com` und `tia.ns.cloudflare.com` zu.
- Cloudflare enthält exakt die drei importierten A-RRsets für Apex, `www` und Wildcard `*`, jeweils auf `185.181.104.242`.
- Der bestehende Worker `hall-of-memory` bleibt Zielruntime.
- Offen ist ausschließlich der authentifizierte INWX-Provider-Readback vor der Delegationsmutation; die aktuelle Browser-Session ist bei INWX nicht angemeldet und AXFR ist nicht verfügbar.


## GitHub-/Source-Entscheidung — aktualisiert 2026-08-22

- Das kanonische Kundenrepo ist `Hall-of-Memory/Hall-of-Memory`.
- Der bisherige Public-First-Schritt war ein Bootstrap, um kundenkontrollierten Remote, CI, Pages und Branch Protection ohne Zusatzkosten sicher zu etablieren.
- Der Kunde möchte den Source nun möglichst privat halten. Das ist architektonisch sinnvoll, weil die öffentliche Website und die Repository-Sichtbarkeit getrennte Schichten sind.
- Eine Sichtbarkeitsänderung darf aber **nicht** stillschweigend den gerade eingerichteten `main`-Schutz entfernen. GitHub dokumentiert Branch Protection/Rulesets für private Repositories nicht für GitHub Free for organizations, sondern für passende bezahlte Pläne.
- Deshalb gilt fail-closed: Repo erst dann auf `private` umstellen, wenn live belegt ist, dass der Kundentarif die benötigten Schutzregeln für private Repositories unterstützt, oder der Kunde bewusst eine andere Schutz-/Kostenentscheidung trifft.
- Keine kostenpflichtige GitHub-Aufwertung wird ohne ausdrückliche Freigabe aktiviert.
- Unabhängig von der Sichtbarkeit bleiben private Eventmedien, Secrets, personenbezogene Kundendaten und nicht öffentliche Designer-Source-Master außerhalb von Git.

## Technische Vorbereitung — 2026-08-11 bis 2026-08-22

- `docs/deployment-handover.md` beschreibt den reproduzierbaren Preflight, öffentliche Buildvariablen, serverseitige Bindings/Variablen/Secrets, D1-Export und Migrationen, Worker-vor-Site-Reihenfolge, Smokes, Readbacks und Rollback.
- `.env.example` enthält ausschließlich leere öffentliche Buildvariablen. `spikes/inquiry-worker/wrangler.production.example.jsonc` ist absichtlich nicht produktiv deploybar und enthält kein Secret.
- `npm run dry-run:worker` und `npm run dry-run:site` prüfen beide Artefakte lokal ohne Upload. Das vollständige `npm run verify` umfasst Inquiry-Smoke, Domain/Form/Quality, Astro-Check/Build und beide Dry-Runs.
- Das Kundenrepo ist live; `main` besitzt PR-Pflicht, Required Check `verify`, Conversation Resolution, Admin-Enforcement sowie deaktivierten Force-Push und Branch-Löschung.
- Der erste öffentliche GitHub-Runner-Fehler im Rate-Limit-Smoke wurde in PR #1 korrigiert und im kanonischen T043-Journal dokumentiert.
- GitHub Pages aus dem Kundenrepo ist als Übergangs-Preview live und extern read-backbar.

## Externe Blockade

Für den **statischen Domain-Livegang** fehlt aktuell nur noch der authentifizierte INWX-Provider-Readback für `memoraevents.de`. Die Cloudflare-Zone existiert bereits und wartet auf die Registrar-Delegation. Vor einer INWX-Nameservermutation müssen der vollständige INWX→Cloudflare-DNS-Vergleich und das DNSSEC/DS-Gate aus T061 PASS sein.

Für die vollständige V1 mit Anfrage/Admin bleiben zusätzlich die produktiven Ressourcen/Freigaben aus T008/T010/T011 erforderlich: Turnstile, Access, D1, Rate Limit, Email-Binding, verifizierte Ziel-/Absenderadresse, finale Inhalte sowie Datenschutz-/Löschregel.

Der statische Marketing-/Demo-Livegang auf `memoraevents.de` darf von diesen späteren Backend-Bausteinen getrennt vorbereitet werden, solange nicht fälschlich ein funktionsfähiges produktives Anfrageformular behauptet wird. Fehlende produktive Formularwerte bleiben fail-closed.

T009 bleibt deshalb `blocked_external`; T061 ist für den unmittelbar gewünschten Domain-Cutover `active`.

## Historischer Preview-Befund — 2026-08-11

- Frühere unauthentifizierte Cloudflare-Temporary-Previews unter wechselnden `workers.dev`-Hostnamen waren ausdrücklich nicht dauerhaft.
- Diese temporären Hosts sind keine Produktions- oder Handover-Wahrheit.
- Der damalige Primärdomain-Befund zu `hallofmemory.de` sowie der zwischenzeitliche `memoraevent.de`-Pivot sind historische Evidenz. Seit der korrigierten Kundenentscheidung vom 30.09.2026 ist `memoraevents.de` die vorgesehene produktive Primäradresse; T061 ist dafür autoritativ.