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

Domain und produktive Zugänge sollen auf den Namen des Kunden bzw. unter seine tatsächliche Kontrolle laufen. Das bestätigt die bereits vorhandene Eigentumsinvariante dieses Tasks; Entwicklerkonten dürfen keine dauerhafte Abhängigkeit erzeugen.

## Public-First GitHub-Entscheidung — 2026-08-16

- Das bestehende Repository soll nach bestandenem Publication Gate aus T043 direkt als **öffentliches kanonisches Repository** in einer GitHub-Organisation des Kunden veröffentlicht werden.
- Kein temporäres kanonisches Repository unter Entwicklerhoheit und kein späterer Transfer als Normalpfad. Das Kundenrepo `Hall-of-Memory/Hall-of-Memory` wurde am 22.08.2026 live als öffentliches Ziel unter Kundenhoheit verifiziert; der erste kanonische Remote wird ausschließlich dorthin gesetzt.
- Der Kunde bleibt Organisations-Owner; Alexander benötigt lediglich die Repository-Adminrechte, die für Pflege, CI und Integrationen tatsächlich nötig sind.
- Initial wird ausschließlich der geprüfte `main` veröffentlicht. Historische lokale Branches und Worktrees werden nicht pauschal per `--all` oder `--mirror` publiziert.
- Das öffentliche Repo ermöglicht auf dem kostenlosen GitHub-Pfad einen technisch geschützten PR-/CI-Workflow. Ruleset/Branch-Protection und der reale Required-Check werden erst nach Existenz des Kundenrepos konfiguriert und per Readback verifiziert.
- GitHub bleibt Quellcode-, Collaboration-, CI- und Preview-Oberfläche. Produktion bleibt die bereits vorbereitete Cloudflare-Architektur; ein Merge ist keine implizite Produktionsfreigabe.
- Die heutige öffentliche GitHub-Pages-Preview unter Entwicklerhoheit ist nur ein temporärer Publikationsmirror. Ziel ist, sie nach erfolgreichem Kundenrepo-/Pages-Readback aus der kanonischen Quelle abzulösen und anschließend zu archivieren.

## Technische Vorbereitung — 2026-08-11

- `docs/deployment-handover.md` beschreibt den reproduzierbaren Preflight, alle drei öffentlichen Buildvariablen, sämtliche serverseitigen Bindings/Variablen/Secrets, D1-Export und Migrationen `0001` → `0002`, Worker-vor-Site-Reihenfolge, Smokes, Readbacks und Rollback ohne automatische Down-Migration.
- `.env.example` enthält ausschließlich leere öffentliche Buildvariablen. `spikes/inquiry-worker/wrangler.production.example.jsonc` inventarisiert serverseitige Platzhalternamen, ist mit `REPLACE_WITH_*` absichtlich nicht produktiv deploybar und enthält kein Secret.
- `npm run dry-run:worker` und `npm run dry-run:site` prüfen beide Artefakte lokal ohne Upload. Das vollständige `npm run verify` umfasst Inquiry-Smoke, Domain/Form/Quality, Astro-Check/Build und beide Dry-Runs.
- Eigentums-/Zugangscheckliste und Ressourcen-/Kosteninventar grenzen Domain, Static/API Worker, D1, Turnstile, Rate Limit, Access und Email Service von nicht aktivierten R2/Queues/Durable Objects/Payments ab. Veränderte Free-Tiers oder Preise müssen vor Aktivierung im Kundenkonto erneut gelesen und akzeptiert werden.

## Externe Blockade

Es fehlen weiterhin kundeneigene Konten/Ressourcen und Rollen, Domain/API-Origin/DNS, echte Turnstile-/Access-/D1-/Rate-Limit-/Email-Bindings, verifizierte Ziel-/Absenderadresse, finale Inhalte sowie Datenschutz-/Löschfreigabe aus T008 und die verbleibenden Produkt-/CMS-Entscheidungen aus T011.

Der frühere GitHub-Blocker ist am 22.08.2026 in T043 in Umsetzung gegangen: Kundenorganisation/Zielrepo und Repository-Adminzugriff sind live verifiziert. Designer-Arbeitsquellen werden nicht öffentlich übertragen; nur die bestätigten Webexports gehen in die bereinigte Public-Historie. CI, Pages, Branch-Schutz und der revisionsgebundene Cutover werden in T043 live abgeschlossen. Ein Entwicklerrepo wird nicht als Zwischenlösung erzeugt.

T009 ist deshalb `blocked_external`. Es wurde kein produktives Deployment freigeschaltet und es wurden keine produktiven Secrets, Domains, Remote-D1-, Access-, Turnstile-, Email- oder kostenpflichtigen Ressourcen angelegt.

## Sales-Demo-Preview-Befund — 2026-08-11

- Die für T015 verwendete unauthentifizierte Cloudflare-Temporary-Preview unter `hall-of-memory.lofty-canoe.workers.dev` war beim T016-Closeout nicht mehr erreichbar und ohne dauerhafte Cloudflare-Authentifizierung nicht fortschreibbar.
- Als rein temporärer, nicht produktiver Ersatz wurde der exakt validierte T016-Build per `wrangler deploy --temporary` unter `https://hall-of-memory.dot-shaker.workers.dev/demo/` bereitgestellt. Der öffentliche Readback lieferte HTTP 200; Demo-HTML und Demo-CSS waren bytegenau identisch mit dem lokalen `dist`, `noindex,nofollow` und die Sales-Demo-Kennzeichnung blieben erhalten.
- Diese Temporary-Preview ist kein dauerhafter Hosting-/Handover-Nachweis. Eine stabile, wiederverwendbare Preview- oder Produktionsroute bleibt Bestandteil von T009 und setzt eine autorisierte, übergebbare Cloudflare-/Domain-Autorität voraus. Bis dahin darf aus wechselnden temporären `workers.dev`-Hostnamen keine Persistenzzusage abgeleitet werden.
