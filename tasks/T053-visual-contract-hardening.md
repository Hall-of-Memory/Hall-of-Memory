# T053 – Visual Contract Hardening

Status: done

## Ziel

Den verbleibenden visuellen Testvertrag nach T052 und dem sauberen T051-Successor so härten, dass technische Regressionen klar von design-sensitiven Abweichungen unterschieden werden und unbegründete frühere Pixelwerte nicht mehr als technische Wahrheit wirken.

## Ausgangslage

T051/#42 hat die zusätzliche `redesign-v1.css`-/`redesign-contract.css`-Struktur bereits beseitigt und die sichtbare Kundenrichtung in `demo.css` konsolidiert. T052 klassifiziert `test:visual` bereits als gemischten `INVARIANT`-/`DESIGN-SENSITIVE`-/`EVIDENCE`-Check.

Verbleibend war insbesondere:

- exakte Logoerwartung 72×84 px Desktop und 54×63 px Tablet/Mobil ohne dokumentierten Markenvertrag;
- kritische Browserassertions ohne stabile maschinenlesbare Failure-Codes;
- nur ein generischer kontrollierter Negativtest ohne Beweis der Fehlerklasse.

## Scope

- `scripts/test-visual-regression.mjs`
- `docs/visual-verification-contract.md`
- `docs/verification-policy.md`
- Task-Index und dieses Journal

Keine Änderung an CSS, Astro-Komponenten, Content, Kunden-Copy, Produktion oder PR #42 selbst.

## Vertrag

- Exakte Pixelassertions bleiben nur zulässig, wenn eine aktuelle Kunden-/Marken-/Produktentscheidung den Wert ausdrücklich bindet.
- Das Logo wird ohne solchen Vertrag über Sichtbarkeit, Assetladung, plausible Größenbandbreite und Header-Containment abgesichert.
- Kritische Visual-Fehler verwenden `VIS-INVARIANT-*`, `VIS-DESIGN-*` oder `VIS-EVIDENCE-*`.
- Ein Kundenredesign darf bei `VIS-DESIGN-*` nicht reflexartig zurückgerollt werden; aktuelle Designautorität zuerst lesen.

## Acceptance

1. Die unbegründeten exakten 72-/54-Pixel-Logoassertions sind aus `test:visual` entfernt, ohne CSS-Werte zu verändern.
2. Kritische Checks für Overflow, Assets, Navigation, Prozesslayout, Logo und Evidence liefern stabile Failure-Codes.
3. Eine kontrollierte technische Regression (`display:none` am Logo) wird als `VIS-INVARIANT-LOGO-HIDDEN` erkannt, bevor eine Größenklassifikation greifen kann.
4. Eine kontrollierte design-sensitive Abweichung wird als `VIS-DESIGN-LOGO-SIZE` erkannt.
5. Der reale Visual-Test bleibt für Desktop, Tablet und Mobil einschließlich sechs Full-Page-Screenshots und Rahmenvariante 10 grün.
6. `npm run verify` bleibt kanonisch und vollständig grün.
7. Der PR ist auf #42 gestapelt; #42 selbst bleibt unverändert und wartet weiterhin auf menschliche visuelle Abnahme.

## Abschlussbelege – 31.08.2026

- gestapelter PR: #44 `T053: Semantic visual contracts and failure codes`, Base `redesign/startseite-v1-clean` / #42;
- Ausgangsbasis von T053: exakter #42-Head `90f2e937ded8f0b63964f488c210866a9ee95bff`;
- Implementierungscommit: `03aa26eebee1da9ceba04cbaaa60067c48e0492c`;
- unveränderter Ausgangs-Visual-Test: PASS, Receipt `835359608d7b41932df67b0335df7862a4cf95396024f317dbe94e311c02619b`;
- finaler gezielter Visual-Test: PASS mit 3 Viewports, 6 Full-Page-Screenshots, Rahmenvariante 10 sowie `VIS-INVARIANT-LOGO-HIDDEN` und `VIS-DESIGN-LOGO-SIZE`, Receipt `14f9d03795d5a461e15e35200cfe9bc748a7371370b64517069f8afdbec431fc`;
- finaler lokaler kanonischer Verify auf dem vollständigen Implementierungsstand: PASS, Receipt `e22ab1e9ea8fea15af40345685503342e428e2fd6498ed68267f71c87ef9a204`;
- GitHub Actions Run `33376987060` auf exakt `03aa26eebee1da9ceba04cbaaa60067c48e0492c`: `verify` PASS, Visual-Artefakt-Upload PASS, `pages-runtime` auf Pull Requests erwartungsgemäß SKIPPED;
- Vercel und Vercel Preview Comments auf demselben PR-Head: PASS;
- Scope: ausschließlich Testvertrag, Dokumentation und Task-Wahrheit; keine CSS-, Astro-, Content-, Kunden-Copy- oder Produktionsänderung.

T053 ist damit fachlich abgeschlossen. PR #44 bleibt absichtlich gestapelt und darf nicht unabhängig vor #42 integriert werden. Nach Arams visueller Freigabe und Integration von #42 wird #44 gegen den dann aktuellen `main` reconciled beziehungsweise retargeted und erneut exact-head verifiziert.