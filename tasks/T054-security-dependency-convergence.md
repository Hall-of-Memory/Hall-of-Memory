---
id: T054
status: done
priority: P1
dependencies: [T012]
---
# Security-Dependency-Konvergenz nach Gesamt-Audit

## Diagnose

Der Gesamt-Audit von `main@34b0997a82030c1bf02344d6fd4c37ff0cccdc59` zeigte fünf als HIGH gemeldete installierte Dependency-Knoten, während der kanonische `npm run verify` vollständig grün blieb. Die Befunde lagen in `fast-uri`, `svgo` sowie dem über `wrangler`/`miniflare` eingebrachten `sharp`-Pfad.

Die offenen Dependabot-PRs #45–#48 basieren auf dem älteren Base-Commit `520c95006e621c33793ed1e2dcf711312923cc46`; ihre grünen Checks vom 06.09.2026 sind deshalb keine aktuelle Merge-Evidenz nach den späteren PRs #42/#44. Insbesondere hebt #46 Wrangler nur auf 4.128.0 an und terminalisiert den aktuellen Auditbefund nicht.

## Ziel

Den kleinsten nachweislich ausreichenden Security-Slice integrieren, ohne unabhängige Framework-/Produktänderungen mitzuziehen.

## Scope

- `wrangler` direkt auf `4.131.1` pinnen.
- Transitive Lockfile-Auflösung für `fast-uri` und `svgo` auf nicht verwundbare kompatible Stände aktualisieren.
- `astro` bleibt in diesem Slice auf `7.2.9`.
- `zod` bleibt in diesem Slice auf `4.4.3`.
- Keine Produkt-, DNS-, Cloudflare- oder Produktionsressourcen ändern.
- Dependabot #47/#48 bleiben unabhängige Wartungsupdates; #45 wird separat frisch gegen `main` geprüft.

## Akzeptanz

- [x] `npm audit --json` meldet 0 Vulnerabilities auf dem geprüften T054-Baum.
- [x] `npm ci` ist reproduzierbar erfolgreich.
- [x] `npm run verify` endet mit 23 PASS / 0 FAIL / 0 BLOCKED.
- [x] Worker- und Site-Dry-Run laufen innerhalb des kanonischen Verify mit Wrangler 4.131.1 erfolgreich.
- [x] Direkte Astro-/Zod-Versionen bleiben unverändert.
- [x] Die Implementierung ist gegen `main@34b0997a82030c1bf02344d6fd4c37ff0cccdc59` gebunden; der veröffentlichte PR muss zusätzlich den strikten aktuellen GitHub-Check gegen seinen exakten Head bestehen. Alte Dependabot-Checks werden nicht wiederverwendet.

## Vorvalidierung

Ein isolierter, wegwerfbarer Export des exakten Ausgangs-Heads wurde am 12.09.2026 mit genau diesem Dependency-Slice geprüft: `npm audit` 0 Vulnerabilities, `npm ci` PASS und `npm run verify` 23/23 PASS. Diese Vorvalidierung ersetzt nicht die exakte Prüfung des tatsächlichen T054-Heads.

## Exakte lokale Abschluss-Evidenz

- Task `c9e9a50469ce41019a201783`: `npm audit --json` = 0 Vulnerabilities; `npm ci` = PASS; `npm run verify` = 23 PASS / 0 FAIL / 0 BLOCKED.
- Wrangler-Dry-Runs liefen mit `4.131.1`; `fast-uri` ist `3.1.7`, `svgo` `4.1.0`; direkte `astro`-/`zod`-Pins blieben `7.2.9` bzw. `4.4.3`.
- GitHub-PR-/CI-Evidenz ist ein separates Merge-Gate und wird nicht durch ältere Dependabot-Läufe ersetzt.
