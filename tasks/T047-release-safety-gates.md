---
id: T047
status: active
priority: P0
dependencies: [T046]
---
# Release-Safety-Gates für Stage 2

## Ziel

Nach der Landingpage-Konvergenz wird der Übergang von Entwurf/Stage 1 zu Produktion maschinell fail-closed gemacht. Ein halb fertiger Produktionszustand darf weder durch `launchStatus`, einen Merge noch durch einen unabhängigen Deploy-Workflow entstehen.

## Umsetzung

1. Ein Production-Readiness-Gate einführen. `launchStatus: production` bzw. ein produktiver Build ist nur erlaubt, wenn die tatsächlich erforderlichen Voraussetzungen belegt sind.
2. Mindestens prüfen: finale Legal-Inhalte, keine Entwurfs-/Dummy-Marker, freigegebene öffentliche Medien, konsistente Produktdaten, korrekter Produktions-Origin, produktive Inquiry-/Turnstile-Konfiguration, Stage-1-Root-Redirect entfernt oder bewusst auf den aktiven Produktionspfad umgestellt, Canonical/Sitemap konsistent.
3. Verify und Deployment sequenzieren: deploybare Artefakte dürfen nur aus einer revisionsgebunden erfolgreich verifizierten Revision entstehen; bevorzugt Build-once/Deploy-same-artifact statt unabhängiger Doppelbuilds.
4. GitHub-Actions-Supply-Chain härten: verwendete Actions revisionsgebunden pinnen, nicht benötigte Checkout-Credentials deaktivieren und automatische Dependency-/Actions-Updates einrichten, sofern dies ohne neue kostenpflichtige Dienste möglich ist.
5. CSP-/Security-Header-Drift zwischen `BaseLayout` und Deploymentheadern durch eine kanonische Policy oder explizite Konsistenztests verhindern.
6. HSTS erst nach stabilem HTTPS-/Domain-Cutover aktivieren; keine Vorwegnahme des Providerzustands.

## Slice 1 — Production Readiness und Policy-Drift

Begonnen am 23.08.2026 auf Basis von `main` `d159b76a6ff118c628e4218cea9531af642d3416`.

- `check:production-readiness` ist ein explizites Release-Gate und wird im aktuellen Stage-1-Zustand absichtlich fehlschlagen. Es verändert weder `launchStatus` noch Routing oder Providerzustand.
- Der kanonische `verify`-Pfad prüft stattdessen, dass der aktuelle Entwurfszustand reproduzierbar blockiert wird und ein vollständig belegter synthetischer Produktionszustand passieren kann.
- Nicht maschinell ableitbare Freigaben werden über `src/release/production-approvals.json` fail-closed mit `approved=true` plus nichtleerer `evidenceRef` verlangt; im aktuellen Stand bleiben Legal, öffentliche Medien und Produktinhalt bewusst unfreigegeben.
- Technische Readiness prüft zusätzlich Produktions-Origin, Inquiry-API, Nicht-Test-Turnstile-Key, kundenbezogene Production-Worker-Konfiguration und das Entfernen des Stage-1-Root-Redirects.
- Dokument-CSP/Referrer-Policy werden aus `src/lib/security-policy.ts` erzeugt; ein Test bindet die deploymentseitigen `_headers` an dieselben sicherheitsrelevanten Werte und hält HSTS bis nach dem stabilen TLS-/Domain-Cutover ausdrücklich aus.
- Checkout/Setup-Node werden in Verify und Pages revisionsgebunden gepinnt; Checkout-Credentials werden nicht persistiert. Dependabot wird für npm und GitHub Actions wöchentlich aktiviert.
- Deploy-Sequenzierung und vollständige Pinning-Abdeckung der übrigen Pages-Actions bleiben ein eigener Folgeslice innerhalb T047.

## Nicht-Ziel

- keine finalen Rechts- oder Kundendaten erfinden;
- kein Domain-/Nameserverwechsel durch diesen Task;
- keine Aktivierung des Inquiry-Backends ohne die bestehenden Provider-/Produktfreigaben;
- keine neue Deploymentplattform.

## Akzeptanz

- [ ] ein absichtlich unvollständiger Production-Build scheitert reproduzierbar.
- [ ] Stage-1-Preview bleibt weiterhin baubar und fail-closed.
- [ ] Deployment hängt revisionsgebunden an erfolgreichen Verify-/Build-Evidenzen.
- [ ] deploytes Artefakt ist eindeutig auf Source-Revision und Verifikation zurückführbar.
- [ ] Actions-Härtung verändert keine fachliche Websitefunktion.
- [ ] Security-Header/CSP können nicht unbemerkt auseinanderlaufen.
- [ ] `npm ci` und `npm run verify` PASS.

## Stage-2-Grenze

Ein bestandenes T047 ist notwendig, aber nicht hinreichend für den Launch. T008/T010/T011/T045 und die dort fehlende externe Wahrheit bleiben maßgeblich.
