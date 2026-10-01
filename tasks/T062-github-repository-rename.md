---
id: T062
status: active
priority: P1
dependencies: []
---
# GitHub-Repository auf `memoraevents` umbenennen

## Ziel

Das kanonische GitHub-Repository wird von `Hall-of-Memory/Hall-of-Memory` auf `Hall-of-Memory/memoraevents` umbenannt.

Diese Änderung betrifft die Repository-Identität und alle aktuell davon abgeleiteten technischen Pfade. Sie ist **keine** pauschale Marken-/Content-Umbenennung und ändert den produktiven Cloudflare-Worker `hall-of-memory` nicht.

## Livezustand — 01.10.2026

- `main` ist sauber und synchron auf `9055903b40301759eca9f1290beb55d91e2236ff`.
- GitHub-Repo aktuell: `Hall-of-Memory/Hall-of-Memory`, Sichtbarkeit `PUBLIC`, aktueller Zugriff `ADMIN`.
- Default Branch: `main`.
- Mehrere offene PRs existieren; insbesondere PR #66 ist eine separate, derzeit konfliktbehaftete Markenänderung und wird nicht in diesen Rename-Scope gezogen.
- Das Repository besitzt mehrere verknüpfte Git-Worktrees. Deshalb wird der physische Hauptcheckout `/home/alex/repos/hall-of-memory` in T062 **nicht** umbenannt; ein blindes Verschieben würde bestehende Worktree-Gitdir-Verweise brechen.
- Produktion läuft unabhängig über `https://memoraevents.de` auf Cloudflare.
- GitHub Pages bleibt nur technischer Fallback und muss mit dem neuen Repository-Slug auf `/memoraevents/` wechseln.

## Scope

1. npm-Paketname in `package.json` / `package-lock.json` auf `memoraevents`.
2. GitHub-Pages-Buildbasis von `/Hall-of-Memory/` auf `/memoraevents/`.
3. Repo-/Pages-Regressionstests entsprechend aktualisieren.
4. Aktuelle operative Dokumentation auf `Hall-of-Memory/memoraevents` als kanonisches Source-Repo setzen.
5. Volltest auf dem Rename-Prep-Branch grün belegen.
6. GitHub-Repository selbst auf `memoraevents` umbenennen.
7. `origin` auf den neuen GitHub-Pfad setzen und remote read-backen.
8. Rename-Prep-PR nach der GitHub-Umbenennung unmittelbar revisionsgebunden mergen.
9. GitHub Pages auf dem neuen Repo-Slug read-backen.

## Bewusst unverändert

- historische Tasks/Entscheidungen mit damaligen Namen;
- öffentliche Markenbezeichnung und Website-Texte außerhalb technisch notwendiger Repo-Referenzen;
- Cloudflare-Worker `hall-of-memory`;
- bestehende Asset-/Fundus-Dateinamen und immutable Fundus-Manifeste;
- lokaler physischer Checkout-Pfad, solange verknüpfte Worktrees existieren.

## Akzeptanz

- GitHub zeigt kanonisch `Hall-of-Memory/memoraevents`;
- alter GitHub-Pfad wird nur noch über GitHubs Rename-Redirect erreicht;
- `origin` zeigt explizit auf `git@github.com:Hall-of-Memory/memoraevents.git`;
- `package.json` und Lockfile führen `memoraevents`;
- Pages-Build und Tests verwenden `/memoraevents/`;
- aktuelle operative Doku nennt `Hall-of-Memory/memoraevents`;
- `npm run verify` ist auf dem finalen Rename-Head grün;
- offene PRs bleiben nach Rename vorhanden und adressierbar;
- Produktion auf `memoraevents.de` bleibt unverändert grün.

## Prep-Verifikation — 01.10.2026

- `git diff --check`: PASS
- `npm run test:pages-artifact`: PASS
- `npm run test:release-safety`: PASS
- `npm run test:inquiry-contract`: PASS
- `npm run verify`: **23 PASS · 0 FAIL · 0 BLOCKED**
- npm-Paketname und Pages-Basis sind revisionsgebunden auf `memoraevents` vorbereitet.

## GitHub-Rename-Readback — 01.10.2026

- GitHub-Repository erfolgreich auf `Hall-of-Memory/memoraevents` umbenannt.
- Neuer kanonischer URL: `https://github.com/Hall-of-Memory/memoraevents`.
- Alter URL `https://github.com/Hall-of-Memory/Hall-of-Memory` liefert HTTP 301 auf den neuen Pfad.
- Lokaler `origin` zeigt explizit auf `git@github.com:Hall-of-Memory/memoraevents.git`.
- Remote-`main` bleibt `9055903b40301759eca9f1290beb55d91e2236ff`; Rename-Branch bleibt `1fdd2db23f0101e703ed563afa95aa096551f02f`.
- PR #71 ist unter dem neuen Repo-Pfad weiterhin `OPEN/CLEAN`; GitHub `verify` und Vercel sind grün.
- Alle zuvor offenen PRs (#70, #66, #64, #63, #61, #54, #45) sind unter dem neuen Repo-Pfad erhalten.
- Der lokale physische Checkout bleibt wegen der verknüpften Worktrees absichtlich unter `/home/alex/repos/hall-of-memory`.
