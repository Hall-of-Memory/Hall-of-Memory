---
id: T050
status: done
priority: P1
dependencies: [T012, T048]
---
# Lokalen Verify gegen stale Installationsstände fail-closed härten

## Befund

Beim revisionsgebundenen Repo-Selbstreview am 23.08.2026 war `main` sauber auf `924ff2766865f55861bc8b6e3c85ccf248603bbb` synchronisiert und `npm run verify` lief vollständig grün. Der Dry-Run zeigte dabei jedoch `wrangler 4.120.1`, obwohl `package.json` auf diesem Quellstand exakt `wrangler 4.124.0` verlangt. Der lokale `node_modules`-Stand stammte noch aus einem älteren Checkoutzustand.

GitHub Actions ist davon nicht betroffen, weil der Verify-Workflow vor `npm run verify` bereits `npm ci` ausführt. Lokal konnte der kanonische Verify-Befehl aber einen Quell-/Toolchain-Mismatch nicht selbst erkennen und dadurch irreführend grün werden.

## Ziel

`npm run verify` soll vor der langen Testkette fail-closed prüfen, dass alle erforderlichen direkt deklarierten Runtime- und Development-Abhängigkeiten vorhanden und exakt in der in `package.json` gepinnten Version installiert sind. Die Prüfung darf den Installationsstand nicht selbst verändern. Plattformabhängige `optionalDependencies` bleiben bewusst außerhalb dieser Pflichtprüfung.

## Scope

- kleiner Node-Guard für erforderliche direkte `dependencies` und `devDependencies`;
- kontrollierter Positiv-/Negativtest für Match, Versionsabweichung, fehlendes Pflichtpaket, nicht-exakte Specs und legitimes Fehlen einer `optionalDependency`;
- Guard am Anfang des kanonischen `npm run verify`;
- keine Runtime-, Inhalts-, Frame-, Domain-, Cloudflare- oder Deploymentänderung;
- keine implizite Installation innerhalb von `verify`.

## Akzeptanz

- [x] passender, frisch mit `npm ci` installierter Direkt-Dependency-Stand besteht den Guard;
- [x] eine absichtlich abweichende direkte Paketversion wird erkannt und mit erwartet/installiert ausgegeben;
- [x] eine fehlende erforderliche direkte Dependency wird erkannt;
- [x] nicht-exakt gepinnte erforderliche Direkt-Specs werden fail-closed erkannt und schützen damit die bestehende T012-Policy;
- [x] eine fehlende `optionalDependency` wird nicht fälschlich zum Pflichtfehler;
- [x] `npm run verify` startet mit dem kontrollierten Guard und bleibt ansonsten kanonisch unverändert;
- [x] frisches `npm ci`, vollständiges `npm run verify`, `npm audit --audit-level=high` und `git diff --check` sind grün;
- [x] Diff-Selbstreview bestätigt: keine Produktionssemantik und keine fremde aktive Arbeit verändert.

## Abschluss-Evidenz — 2026-08-23

- Isolierte Lane: `1df758bc497eb5fefffbcbc9b1921845`, Base `924ff2766865f55861bc8b6e3c85ccf248603bbb`; fremde Dirty-Worktrees blieben unangetastet.
- Negativbeweis vor Installation: `npm run verify` stoppte nach dem kontrollierten Contract-Test am neuen Install-State-Guard mit Exit 1 und meldete alle sieben fehlenden erforderlichen direkten Pakete samt Sollversion. Die lange Testkette lief nicht an.
- Kontrollierter finaler Guard-Test: `matching=true mismatch_detected=true missing_detected=true exact_specs_enforced=true optional_missing_allowed=true`.
- Frisches `npm ci`: PASS; Grabowski-Receipt `84516bd1855fffb7579459e5cc890cb9d2883a8012b468711656f546b071f7f5`.
- Realer Install-State nach `npm ci`: `installed-dependencies-ok direct=7`; Wrangler im finalen Verify exakt `4.124.0` statt des zuvor stale beobachteten `4.120.1`.
- `astro check`: `0 errors`, `0 warnings`, `0 hints` nach Selbstreview-Hygiene.
- Der vollständige staged Selbstreview erkannte vor Abschluss eine falsche Pflichtbehandlung von `optionalDependencies`; dies wurde vor Commit entfernt und durch `optional_missing_allowed=true` regressionsgesichert.
- Finales wortwörtliches `npm run verify` über neutralen `/usr/bin/env --`-Wrapper: PASS; Grabowski-Receipt `ee4af3580699b83a09771cc453519fad364f56655b84ce3866d84d36e517dc57`.
- `npm audit --audit-level=high`: `found 0 vulnerabilities`; Grabowski-Receipt `35d5b90a0be94420c1543b98e30372a162052bccce0e7d47ab94e6f3b4e4f677`.
- `git diff --check`: PASS.
- Bestehende Astro-Hinweise zu den absichtlich leeren Collections `packages.json` und `gallery.json` sind Build-Log-Warnungen des File-Loaders, keine neuen T050-Diagnosen; ihre Semantik wurde nicht verändert.
