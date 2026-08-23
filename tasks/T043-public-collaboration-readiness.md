---
id: T043
status: active
priority: P0
dependencies: [T009, T011, T018]
---
# Öffentliches kundenkontrolliertes GitHub-Repo, Codex-/CI-Readiness und Publication Gate

## Ziel

Hall of Memory in das öffentliche, kundenkontrollierte Repository `Hall-of-Memory/Hall-of-Memory` überführen, dort CI, geschützten PR-Workflow und eine GitHub-Pages-Kundenpreview betreiben und den bisherigen Entwickler-Mirror erst nach erfolgreichem Readback archivieren. Produktion bleibt davon getrennt bei Cloudflare gemäß T009.

## Architekturentscheidung

- Der Kunde bleibt Owner der GitHub-Organisation; `alexdermohr` besitzt ausschließlich Repository-Adminrechte für die technische Pflege.
- GitHub ist Quellcode-, Review-, CI- und Preview-Oberfläche; ein Merge ist keine Produktionsfreigabe.
- `tasks/` bleibt die einzige Aufgabenquelle. GitHub Issues sind keine parallele Task-Registry.
- Private Eventmedien, personenbezogene Daten, Secrets und Designer-Arbeits-/Quelldateien gehören nicht in das öffentliche Repository.
- Nur die für die Website benötigten unveränderten Marken-Webexports unter `public/brand/` werden veröffentlicht.
- Die bisherige lokale Vollhistorie wird nicht als öffentliche Historie publiziert. Der öffentliche Erststand wird als bereinigter Root-Commit aus dem vollständig geprüften aktuellen Tree erzeugt; historische Branches/Worktrees werden weder mit `--all` noch `--mirror` übertragen.

## Livezustand — 2026-08-22 vor Erstveröffentlichung

- Kundenorganisation und Zielrepo live verifiziert: `Hall-of-Memory/Hall-of-Memory`.
- Sichtbarkeit: `PUBLIC`; Default-Branch: `main`; Zielrepo vor dem Cutover leer.
- GitHub-Berechtigung für `alexdermohr` live verifiziert: `admin`.
- Kanonischer lokaler Ausgangsstand vor dem Cutover: `main` `73ed117f30536af47ce7e91cb7ddd4dbea467947`, clean.
- Public-Readiness-Änderungen aus `adc5cbd291ef5d8dace4c57d15e5adcaa4e7daa9` wurden auf den aktuellen Stand übernommen, ohne die neueren Stellar-Frame-Änderungen zurückzudrehen.
- Fremde/historische Dirty-Worktrees wurden inventarisiert und nicht übernommen, bereinigt, resetet oder veröffentlicht.

## Publication Gate

### Historie und Datenhygiene

- Frühere Vollprüfung über 93 erreichbare Revisionen: keine jemals versionierte `.env`, `.dev.vars`, Private-Key-, Credential- oder Secret-Datei; `.env.example` ist absichtlich versioniert.
- Redigierter Content-Scan fand keine Private-Key-Header, GitHub-/Slack-/Stripe-Live-Tokens oder generische Secret-Zuweisungen.
- Absolute lokale `/home/...`-Pfade wurden aus dem veröffentlichungsrelevanten Text-Tree entfernt.
- Private Eventmedien, Verträge, Rechnungen, Zugangsdaten und produktive Secrets sind nicht Bestandteil des Public-Trees.

### Designer-/Markenassets

Der Kunde hat die Hall-of-Memory-Grafiken selbst beauftragt. Für die öffentliche Repository- und Preview-Nutzung wird trotzdem eine restriktive technische Grenze verwendet:

- öffentliches SVG: `public/brand/hall-of-memory-logo-primary.svg` — SHA-256 `76f3055f5e16081ad58b555263b4a92dec5fc52a87abe238c8f8c6459f573c13`;
- öffentliches dunkles JPG: `public/brand/hall-of-memory-logo-dark.jpg` — SHA-256 `4bf4bd0a524af72cc7a9375531e1a00f9d385d62318666fb662aef5f3f040c22`;
- öffentliches helles JPG: `public/brand/hall-of-memory-logo-light.jpg` — SHA-256 `7bd29e4f79b830ea6c97a75118098abfc36a70d616bfba8093b8f01253211c3e`;
- `.ai`, `.pdf`, ZIP und sonstige Designer-Arbeitsquellen werden aus dem öffentlichen Tree entfernt und bleiben private Recovery-Evidenz;
- `scripts/test-sales-demo.mjs` prüft die drei öffentlichen Webexports direkt gegen die bestätigten Hashes und benötigt die privaten Quellen nicht.

Damit wird die Website-/Preview-Nutzung nicht unnötig mit einer öffentlichen Weitergabe der Designer-Arbeitsdateien gleichgesetzt.

## Collaboration-/CI-/Pages-Vorbereitung

- `AGENTS.md` definiert Taskautorität, Agenten-/Codex-Arbeitsvertrag, Public-Grenze, Verifikation und Deployment-Grenze.
- `CONTRIBUTING.md` beschreibt den Branch-/PR-Workflow für Kunde, Codex und Entwickler.
- `.github/workflows/verify.yml` führt für PRs und `main` mit Node 22, `npm ci` und exakt `npm run verify` aus; keine Secrets und kein Produktionsdeployment.
- `.github/workflows/pages.yml` baut ausschließlich die statische GitHub-Pages-Preview unter `/Hall-of-Memory/` und deployt sie über GitHub Pages; Cloudflare wird dadurch nicht verändert.
- `.gitignore` hält private Kunden-/Quellenarchive explizit aus zukünftigen öffentlichen Commits heraus.

## Cutover-Schritte

1. bereinigten Tree vollständig lokal verifizieren;
2. private lokale Recovery-Referenz auf den bisherigen Vollhistorien-`main` sichern;
3. aus dem geprüften Tree einen parentlosen Public-Root-Commit erzeugen;
4. `origin` direkt auf `Hall-of-Memory/Hall-of-Memory` setzen und ausschließlich diesen Root-Commit als `main` publizieren;
5. GitHub Actions und Pages live readbacken;
6. `main` mit PR-Pflicht, Required-`Verify`, Force-Push-/Deletion-Schutz absichern;
7. einen realen kleinen PR über den geschützten Pfad erfolgreich mergen;
8. neue Kundenpreview unter `https://hall-of-memory.github.io/Hall-of-Memory/` gegen `/demo/` und `/demo/rahmen/` prüfen;
9. erst danach den bisherigen Mirror `alexdermohr/hall-of-memory-preview` archivieren;
10. lokalen kanonischen `main` auf die neue öffentliche Historie ausrichten, während die alte Vollhistorie ausschließlich lokal als Recovery-Referenz erhalten bleibt.

## Live-Evidenz — 2026-08-22

- Bereinigter öffentlicher Root-Commit: `32ba86e724a7d932f044a736848774d63c7ec6d5`; parentlos, nur `main` öffentlich.
- Der erste `Verify`-Lauf auf GitHub zeigte einen timingabhängigen Testfehler im Inquiry-Rate-Limit-Smoke: Der reale Limiter hatte bereits `429` geliefert, danach erzeugte der Test für die UI-Abbildung unnötig einen weiteren Request, der auf dem GitHub-Runner als `backend-failed` enden konnte.
- Abhilfe in PR #1: die erste reale `429`-Antwort des bestehenden 12-Request-Smokes wird per `Response.clone()` gebunden und für das UI-Mapping wiederverwendet; es gibt keinen zusätzlichen Request nach ausgeschöpftem Limit. Damit bleiben realer Rate-Limiter und UI-Abbildung getrennt bewiesen.
- Lokale Verifikation des Fixes: `npm ci`, dreimal `npm run spike:inquiry`, danach vollständiges `npm run verify` und `git diff --check`; alle grün.
- GitHub-Runner `verify` auf dem revisionsgebundenen PR-Head war anschließend grün; der PR wird erst nach erneut grünem Check auf dem aktualisierten Head gemergt.
- GitHub Pages wurde für `build_type=workflow` aktiviert. Der erneute Pages-Build und das Deployment waren erfolgreich.
- Release-Hardening am 2026-08-22 trennt den normalen Astro-/Cloudflare-Build vom Pages-Artefakt: `scripts/prepare-pages-artifact.mjs` kopiert den gebauten Tree in `.pages-artifact` und ersetzt ausschließlich dort `index.html` durch die bereits gebaute `/demo/index.html`. `src/pages/index.astro` und `public/_redirects` bleiben hash-identisch; `test:pages-artifact` ist Bestandteil von `npm run verify`.
- `.github/workflows/pages.yml` baut über `npm run build:pages` und lädt ausschließlich `.pages-artifact` hoch. Damit zeigt die GitHub-Pages-Wurzel die Kundenpreview, ohne den produktiven Root-Scaffold oder den Cloudflare-Redirectvertrag umzuschreiben.
- Externer Readback: `https://hall-of-memory.github.io/Hall-of-Memory/demo/` und `https://hall-of-memory.github.io/Hall-of-Memory/demo/rahmen/` liefern jeweils HTTP `200` und den erwarteten Hall-of-Memory-Inhalt.
- `main` ist live geschützt: Pull Request erforderlich, Required Check `verify` mit `strict=true`, Schutz gilt auch für Admins, offene Review-Gespräche müssen aufgelöst sein, Force-Push und Branch-Löschung sind deaktiviert, verpflichtende Approval-Anzahl `0`.
- Codex-Review auf PR #1 meldete berechtigt, dass die CI-Stabilisierung zunächst nicht im kanonischen Taskjournal dokumentiert war. Dieser Befund wird mit derselben PR revisionsgebunden eingearbeitet; der Review-Thread wird erst nach GitHub-Readback des aktualisierten Heads aufgelöst.

## Live-Evidenz — 2026-08-23

- PR #3 (`Harden Pages preview and inquiry contracts`) wurde über den geschützten Mergepfad revisionsgebunden gemergt; Merge-Commit auf `main` ist `180c97e805890d2e2f827d07c0eb16c983186d54`. Der anschließende `main`-Verify-Lauf `32595447199` und das Pages-Deployment `32595447302` waren erfolgreich.
- Live-Readback nach diesem Merge: `https://hall-of-memory.github.io/Hall-of-Memory/` liefert HTTP `200` und dieselbe Kundenpreview wie `/demo/`; `/demo/rahmen/` liefert ebenfalls HTTP `200`. Die Pages-Wurzel zeigt keinen produktiven Anfrageformular-Scaffold.
- Der lokale kanonische Checkout `/home/alex/repos/hall-of-memory` wurde am 23.08.2026 aus dem sauberen Vor-Publication-Stand `73ed117f30536af47ce7e91cb7ddd4dbea467947` auf exakt `origin/main` `180c97e805890d2e2f827d07c0eb16c983186d54` ausgerichtet und folgt wieder `origin/main`. Der alte Stand bleibt zusätzlich unter `refs/grabowski/recovery/hall-of-memory-pre-public-main-20260823T0525Z` erhalten.
- Der ersetzte Entwickler-Mirror `alexdermohr/hall-of-memory-preview` hatte keine offenen PRs und keine laufenden Actions und wurde nach erfolgreichem Ersatz am 23.08.2026 archiviert. Branches oder Historie wurden nicht gelöscht.
- Die grünen GitHub-Läufe meldeten als reine CI-Hygiene noch die abgekündigte Node-20-Actions-Runtime für `actions/checkout@v4` und `actions/setup-node@v4`. Die offiziellen aktuellen Releases wurden live als Checkout `v7.0.1` und Setup-Node `v7.0.0` verifiziert; der Closeout-PR hebt deshalb ausschließlich diese beiden Action-Majors auf `@v7`, während der Projektvertrag `node-version: '22'` unverändert bleibt.

## Restgrenze

Die autonom ausführbare GitHub-/Pages-/CI-/Protection- und Mirror-Cutover-Arbeit ist abgeschlossen. Nicht autonom möglich ist die Anmeldung im persönlichen ChatGPT/Codex-Konto des Kunden. Der abschließende **Kunden-Codex-Golden-Path** bleibt deshalb bis zu seiner GitHub-Verbindung als externer Akzeptanzpunkt offen.

## Akzeptanz

T043 darf erst `done` werden, wenn:

- Publication Gate vollständig belegt ist;
- öffentliches Kundenrepo unter Kundenhoheit existiert;
- Public-`main` nur die bereinigte Veröffentlichungshistorie enthält;
- CI und `main`-Schutz live funktionieren;
- GitHub-Pages-Preview aus dem Kundenrepo live verifiziert ist;
- der alte Entwickler-Mirror nach erfolgreichem Ersatz archiviert ist;
- ein realer geschützter PR-Pfad funktioniert hat;
- und der Kunde anschließend einen kleinen Codex-/PR-Golden-Path erfolgreich durchgeführt hat.
