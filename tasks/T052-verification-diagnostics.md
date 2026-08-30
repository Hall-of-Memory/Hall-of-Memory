# T052 – Vollständige Verify-Diagnose statt First-Failure-Ping-Pong

Status: active — lokal vollständig verifiziert; PR-CI/Integration ausstehend

## Ausgangslage

Der kanonische `npm run verify` war eine lange `&&`-Kette. Bei einem größeren Redesign wurde dadurch pro Lauf oft nur der jeweils erste Fehler sichtbar; nach dessen Reparatur erschien erst im nächsten Lauf ein weiterer bereits vorhandener Fehler. Zusätzlich mischen einige visuelle Checks harte Invarianten mit design-sensitiven Erwartungen.

## Ziel

Den bestehenden kanonischen Verify-Pfad so orchestrieren, dass:

- Installations-/Dependency-Vorbedingungen weiterhin fail-closed bleiben;
- danach alle unabhängigen bestehenden Leaf-Gates in einem Lauf ausgeführt werden;
- mehrere unabhängige Fehler gemeinsam sichtbar sind;
- der Gesamt-Exit-Code weiterhin strikt fehlschlägt, sobald mindestens ein Gate rot ist;
- Fehlerklassen `INVARIANT`, `DESIGN-SENSITIVE` und `EVIDENCE` die Triage unterstützen, ohne Tests automatisch zu relativieren;
- GitHub Actions ohne neue divergierende Testlogik einen lesbaren Step-Summary erhält.

## Scope

- `npm run verify` auf einen kleinen Node-Orchestrator umstellen;
- den vollständigen bisherigen Leaf-Testbestand und seine Reihenfolge erhalten;
- synthetischen Multi-Failure- und Preflight-Fail-Closed-Vertrag testen;
- Agentenregel für ausdrücklich autorisierte Kundenredesigns dokumentieren;
- Verification Policy dokumentieren.

Nicht im Scope: Website-/CSS-/Copy-Änderungen, PR #37, visuelle Baseline-Migration, Deployment-/DNS-Änderungen oder neue GitHub-Required-Checks.

## Abnahme

1. Zwei synthetische unabhängige Fehler werden in **einem** Lauf beide gemeldet; ein dazwischenliegender grüner Check wird trotzdem ausgeführt.
2. Ein synthetischer Preflight-Fehler verhindert nachgelagerte Checks und markiert sie als `BLOCKED`.
3. Der Runner-Test beweist, dass kein vor T052 vorhandenes kanonisches Leaf-Gate verloren geht und `verify` sich nicht rekursiv aufruft.
4. Der reale `npm run verify` ist auf sauberem Installationsstand vollständig grün.
5. In GitHub bleibt der bestehende Checkname/Workflow erhalten; der Runner schreibt zusätzlich die vollständige Übersicht in den Step-Summary.
6. Production-/Pages-Gates bleiben unverändert.

## Lokale Evidence – 30.08.2026

- Echter leerer Worktree ohne `node_modules`: Install-State-Vertrag PASS, installierte Dependencies FAIL; 21 Folgeprüfungen wurden korrekt als `BLOCKED` ausgewiesen statt ausgeführt.
- Synthetischer Runner-Vertrag: zwei unabhängige Fehler in einem Lauf sichtbar, dazwischenliegender grüner Check weiter ausgeführt, fehlgeschlagene explizite Abhängigkeit blockiert nur ihren abhängigen Check, Preflight bleibt fail-closed, historische Leaf-Gate-Inventur vollständig erhalten, Summary-/JSON-Persistenz PASS.
- Erster realer Volltest nach dem Umbau: 22 PASS / 1 FAIL / 0 BLOCKED. Der einzige Fehler war ein Release-Safety-Metatest, der noch die alte inline `&&`-Darstellung von `verify` statt den fachlichen Build-Vertrag prüfte. Die nachfolgenden unabhängigen Gates liefen trotzdem weiter und wurden sichtbar.
- Der Release-Safety-Metatest prüft nun den kanonischen Verification-Plan; `build:verification` bleibt verpflichtend und der produktive `build` bleibt aus PR-Verify ausgeschlossen.
- `site-dry-run` ist explizit an den erfolgreichen `verification-build` gebunden, damit ein Buildfehler nicht versehentlich gegen ein altes `dist/` geprüft wird.
- Finaler Volltest auf dem damaligen aktuellen Patchstand: 23 PASS / 0 FAIL / 0 BLOCKED; terminaler Receipt `43f70ae870edb522b8d3c19b9211ffd572cfadf3b328fe9a3c9c91ec30185399`.
- `git diff --check`: PASS vor dem Evidence-Nachtrag; nach dem Nachtrag erneut als Teil des finalen Commit-Gates zu prüfen.

## Folgearbeit

Nach finaler visueller Freigabe des Kundenredesigns separat prüfen, welche exakten Pixel-/Kompatibilitätsregeln echte Designstandards sind und welche nur eine alte Baseline konservieren. Diese Arbeit darf T052 nicht mit dem offenen Kundendesign vermischen.
