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

## Follow-up — Pages-Actions v5 / Node 24

- Der terminale Main-Lauf `32637259771` auf `d214b179b3502c7190baa88e37b5e6db39198c5c` war funktional vollständig grün, meldete aber weiterhin Node-20-Deprecation-Warnungen aus den bis dahin gepinnten Pages-Actions v4.
- PR #27 aktualisiert ausschließlich die revisionsgebundenen Pins von `actions/upload-pages-artifact` auf `fc324d3547104276b827a68afc52ff2a11cc49c9` (`v5.0.0`) und `actions/deploy-pages` auf `cd2ce8fcbc39b97be8ca5fce6e763baed58fa128` (`v5.0.0`). Die Verify-/Deploy-Sequenz, Pfade, Receipts und Produktlogik bleiben unverändert.
- Der revisionsgebundene PR-Verify-Lauf `32637713352` auf Head `25e8b4f95237e59691bec836f8224648183a6b44` war grün. Dabei liefen Checkout, Node-Setup, Installation und der kanonische `npm run verify`-Pfad erfolgreich.
- Auf dem PR-Event wurden die main-only Schritte `Build verified GitHub Pages artifact`, `Bind Pages artifact to this Verify run` und `Upload verified GitHub Pages artifact` sowie der Job `pages-runtime` erwartungsgemäß übersprungen. Dieser PR-Lauf belegt daher die Workflow-/Contract-Verträglichkeit, aber ausdrücklich **nicht** die reale Ausführung der beiden v5-Pages-Actions oder den Deploy-/Receipt-Readback.
- Die Runtime-Akzeptanz dieses v5-Follow-ups ist deshalb zweiphasig: Nach Integration muss der erste `push`-Lauf auf `main` revisionsgebunden `verify`, Artefakt-Build/-Bindung/-Upload, `deploy-pages@v5`, Runtime-Receipt-Readback und terminalen `pages-runtime=success` bestehen. Run-ID und exakte Main-Revision sind anschließend hier nachzutragen; ein Merge allein gilt nicht als Runtime-Beweis.

## Reopen — Production-Build-/Deploy-Gate

Der revisionsgebundene Review-Readback von PR #26 zeigte nach dessen Merge noch einen echten P1-Bypass: `npm run build` und `npm run deploy` waren auf `main` nicht mit `check:production-readiness` verbunden. Damit konnten die synthetischen Readiness-Tests grün sein, ohne dass ein später auf `launchStatus=production` gesetzter realer Site-Build denselben Gate zwingend ausführt.

T047 wurde deshalb bis zum revisionsgebundenen Fix samt erfolgreichem Post-Merge-`pages-runtime` wieder `active`. Der Fix musste normale Stage-1-Builds weiter erlauben, aber jeden Production-Build vor Astro fail-closed prüfen; der freigegebene Site-Deploy-Pfad musste zusätzlich einen strikten Readiness-Check und einen frischen gegateten Build vor Wrangler erzwingen.

## Terminaler Closeout — 23.08.2026

- Die revisionsgebundene T047-PR-Kette ist: PR #24 → Merge `4af05923ff4ce456ccc1e718c4ebbdd94361ada8`; PR #25 → Merge `500e24b9c2f61c71fd26a72a2bb3372de6da15b2`; PR #26 → Merge `d214b179b3502c7190baa88e37b5e6db39198c5c`; PR #27 → Merge `7b702822376cc45ab78b3f766ec2d556bd854fe5`; PR #29 → Merge `d0a645bc7aeeba1bf642b46074b437ac36a12c71`. PR #28 gehört zu T038 und ist ausdrücklich nicht Teil dieses Release-Safety-Closeouts.
- PR #29 wurde nur auf dem exakten Head `b1f2c1a49dad9ce8c69dc4cd315dc2b7071a10c8` gemergt. Sein Required-Verify-Lauf `32657540559` war erfolgreich; `pages-runtime` war auf dem Pull-Request-Event korrekt übersprungen.
- Der finale PR-Head bestand lokal den vollständigen `npm run verify`-Pfad einschließlich Production-Readiness, Security-Policy, Pages-Deployment-Vertrag, Astro-Check sowie Worker-/Site-Dry-Run. `npm audit --audit-level=high` meldete `0 vulnerabilities`. Ein unvollständiger synthetischer Production-Zustand blieb fail-closed; der aktuelle Stage-1-/Draft-Zustand bleibt baubar.
- `.github/grabowski-required-checks.json` bindet die repositoryseitige Review-/Merge-Policy dauerhaft an den Required Check `verify`; die GitHub-Ruleset-Wahrheit verlangt ebenfalls strikt `verify` und aufgelöste Reviewthreads.
- Der reale Post-Merge-Golden-Run ist der `push`-Run `32658349135` auf exakt `main=d0a645bc7aeeba1bf642b46074b437ac36a12c71`. Der Job `verify` war erfolgreich; darin liefen auch `Enforce production release build`, `Build verified GitHub Pages artifact`, `Bind Pages artifact to this Verify run` und `Upload verified GitHub Pages artifact` erfolgreich.
- Im selben Run war `pages-runtime` erfolgreich. Die Schritte `Publish pending runtime status`, `Deploy verified artifact to GitHub Pages`, `Verify deployed runtime receipt` und `Publish terminal runtime status` liefen jeweils erfolgreich. Auf exakt `d0a645bc7aeeba1bf642b46074b437ac36a12c71` steht der Commit-Status `pages-runtime=success` mit Ziel `https://hall-of-memory.github.io/Hall-of-Memory/`.
- Der veröffentlichte Receipt liegt unter `hall-of-memory-deployment.json` beziehungsweise `https://hall-of-memory.github.io/Hall-of-Memory/hall-of-memory-deployment.json` und wurde live mit HTTP-Erfolg gelesen. Inhalt: `schemaVersion=1`, `sourceRevision=d0a645bc7aeeba1bf642b46074b437ac36a12c71`, `verifyWorkflow=Verify`, `verifyRunId=32658349135`, `channel=github-pages-preview`.
- Der Pages-Vertrag bleibt fail-closed: keine unabhängige Pages-Pipeline, kein PR-Deploy, Source-SHA und Verify-Run-ID sind gebunden, der Receipt liegt nicht unter `.well-known/`, `pages-runtime` besitzt `pending` plus terminal `success|failure`, Actions sind auf volle Commit-SHAs gepinnt, Checkout-Credentials bleiben mit `persist-credentials: false` deaktiviert und der Deployment-/Readback-Pfad behält Timeout-Headroom.
- HSTS bleibt bewusst **aus**, bis der stabile Domain-/TLS-Cutover aus T045 real belegt ist. Dieser Closeout aktiviert weder Domain/DNS noch Inquiry-Produktion und erfindet keine extern fehlende Datenschutz- oder Kundenwahrheit.

Damit ist T047 technisch terminal belegt. T048 darf nach Integration dieses Closeouts beginnen; T049 bleibt korrekt `blocked_external`, bis T008/T011 reale Retention-/Löschregeln und Enforcement-Evidenz liefern.

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
- [x] realer Post-Merge-`main`-Run liefert auf derselben Revision terminal `pages-runtime=success` und einen live lesbaren, SHA-/Run-ID-gebundenen Receipt.

## Stage-2-Grenze

T047 ist technisch terminal `done`. Das ist notwendig, aber nicht hinreichend für den Launch. T008/T010/T011/T045 und die dort fehlende externe Wahrheit bleiben maßgeblich; T049 bleibt bis zur realen Retention-/Löschpolicy aus T008/T011 `blocked_external`.