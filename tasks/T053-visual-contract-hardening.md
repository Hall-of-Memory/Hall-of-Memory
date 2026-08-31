# T053 – Visual Contract Hardening

Status: active

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
3. Eine kontrollierte technische Regression wird als `VIS-INVARIANT-LOGO-HIDDEN` erkannt.
4. Eine kontrollierte design-sensitive Abweichung wird als `VIS-DESIGN-LOGO-SIZE` erkannt.
5. Der reale Visual-Test bleibt für Desktop, Tablet und Mobil einschließlich sechs Full-Page-Screenshots und Rahmenvariante 10 grün.
6. `npm run verify` bleibt kanonisch und vollständig grün.
7. Der PR ist auf #42 gestapelt; #42 selbst bleibt unverändert und wartet weiterhin auf menschliche visuelle Abnahme.