---
id: T047
status: done
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

## Deploy-Sequenzierung und Runtime-Evidenz

- Die frühere eigenständig getriggerte Pages-Kette wurde entfernt. `Verify` ist für PRs und `push` auf `main` der autoritative Workflow; der Pages-Deploy hängt auf `main` strukturell mit `needs: verify` am erfolgreichen Verify-Job.
- Das deployte Pages-Artefakt enthält einen Receipt mit exakter Source-Revision und Verify-Run-ID. `pages-runtime` veröffentlicht zuerst `pending` und erst nach Deploy plus erfolgreichem Receipt-Readback terminal `success` oder `failure`.
- Der erste echte Post-Merge-Lauf dieser Kette, `32632277801` auf `4af05923ff4ce456ccc1e718c4ebbdd94361ada8`, deckte fail-closed eine reale Packaging-Lücke auf: `actions/upload-pages-artifact@v4` schließt Root-Einträge mit führendem Punkt aus, weshalb der damalige Receipt unter `.well-known/` nicht deployt wurde. Der Deploy selbst war erfolgreich, der Runtime-Readback wurde korrekt rot.
- PR #25, Head `658aea3a4c0233879e67201d00a0bb1df11a0882`, verlegte den Receipt auf den tatsächlich uploadbaren Pfad `/hall-of-memory-deployment.json`, ergänzte Cache-Busting und einen expliziten Contract-Test gegen den versteckten Pfad. Der PR-Verify-Lauf `32636073060` war grün.
- PR #25 wurde als Merge-Commit `500e24b9c2f61c71fd26a72a2bb3372de6da15b2` integriert. Der anschließende Main-Lauf `32636739589` bestand sowohl `verify` als auch `pages-runtime`; Build, Artefaktbindung, Upload, Deploy, Runtime-Receipt-Readback und terminaler Runtime-Status waren jeweils erfolgreich.
- Ein zusätzlicher unabhängiger Live-Readback des veröffentlichten Receipts lieferte exakt `sourceRevision=500e24b9c2f61c71fd26a72a2bb3372de6da15b2`, `verifyRunId=32636739589`, `verifyWorkflow=Verify` und `channel=github-pages-preview`.

## Nicht-Ziel

- keine finalen Rechts- oder Kundendaten erfinden;
- kein Domain-/Nameserverwechsel durch diesen Task;
- keine Aktivierung des Inquiry-Backends ohne die bestehenden Provider-/Produktfreigaben;
- keine neue Deploymentplattform.

## Akzeptanz

- [x] ein absichtlich unvollständiger Production-Build scheitert reproduzierbar.
- [x] Stage-1-Preview bleibt weiterhin baubar und fail-closed.
- [x] Deployment hängt revisionsgebunden an erfolgreichen Verify-/Build-Evidenzen.
- [x] deploytes Artefakt ist eindeutig auf Source-Revision und Verifikation zurückführbar.
- [x] Actions-Härtung verändert keine fachliche Websitefunktion.
- [x] Security-Header/CSP können nicht unbemerkt auseinanderlaufen.
- [x] `npm ci` und `npm run verify` PASS.

## Stage-2-Grenze

T047 ist technisch terminal `done`. Das ist notwendig, aber nicht hinreichend für den Launch. T008/T010/T011/T045 und die dort fehlende externe Wahrheit bleiben maßgeblich.