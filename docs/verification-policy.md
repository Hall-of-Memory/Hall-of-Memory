# Verification Policy

## Ziel

`npm run verify` ist der einzige kanonische Volltest für Hall of Memory. T052 ändert nicht die fachlichen Leaf-Tests, sondern nur deren Orchestrierung: belastbare Vorbedingungen bleiben fail-closed, danach werden unabhängige Fehler in demselben Lauf vollständig sichtbar gemacht.

## Ablauf

1. **Preflight**
   - `test:install-state`
   - `check:install-state`
   - Scheitert hier eine Prüfung, werden nachgelagerte Ergebnisse nicht als vertrauenswürdig ausgegeben und der Lauf stoppt.
2. **Unabhängige Checks**
   - dieselben Inquiry-, Privacy-, Domain-, Gallery-, Formular-, Release-, Quality-, Demo-, Visual-, Preview-, Astro-, Build- und Wrangler-Prüfungen wie vor T052;
   - ein einzelner Fehler beendet andere unabhängige Prüfungen nicht;
   - nachgelagerte Checks mit expliziter Abhängigkeit werden bei gescheiterter Voraussetzung als `BLOCKED` markiert statt gegen möglicherweise veraltete Artefakte zu laufen;
   - am Ende ist der Exit-Code trotzdem ungleich null, sobald mindestens eine Prüfung fehlgeschlagen oder blockiert ist.
3. **Summary**
   - Terminal: vollständige PASS/FAIL/BLOCKED-Übersicht;
   - GitHub Actions: dieselbe Übersicht in `$GITHUB_STEP_SUMMARY`;
   - optional kann `VERIFICATION_REPORT_PATH` eine JSON-Ausgabe anfordern.

## Fehlerklassen

### INVARIANT

Technische oder fachliche Invariante, zum Beispiel Datenschutz, Datenverträge, Buildfähigkeit, kein ungewollter Overflow oder funktionierende Assets. Bei einem Fehler zuerst die Implementation und die reale Regression untersuchen. Den Test nicht abschwächen, nur um CI grün zu machen.

### DESIGN-SENSITIVE

Eine Prüfung enthält Erwartungen, die sich bei einem bewusst autorisierten Redesign legitim ändern können, zum Beispiel Layout, Abstände oder visuelle Geometrie. Ein Fehler ist **keine automatische Erlaubnis**, den Test zu ändern. Zuerst den aktuellen Task und dokumentierte Kundenentscheidungen lesen und danach entscheiden, ob Implementation oder Erwartung veraltet ist.

### EVIDENCE

Eine Prüfung belegt Artefakt-, Preview- oder Readback-Wahrheit. Bei einem Fehler insbesondere Revision, Route, Artefaktbindung und Aktualität der Evidence prüfen.

Ein Check kann mehrere Klassen tragen. `test:visual` ist bewusst gemischt: dort können sowohl echte Invarianten als auch design-sensitive Erwartungen und Evidence betroffen sein. Die Klassen ersetzen deshalb niemals das Lesen der konkreten Fehlermeldung.

## Redesign-Regel

Bei einem ausdrücklich dokumentierten Kundenredesign gilt die aktuelle Kunden-/Taskentscheidung als Designautorität. Ein `DESIGN-SENSITIVE`-Fehler darf nicht reflexartig dadurch behoben werden, dass die neue Gestaltung auf eine ältere visuelle Baseline zurückgesetzt wird. Gleichzeitig bleiben `INVARIANT`-Anteile bindend.

## Nicht-Ziele

- keine zweite, divergierende CI-Logik;
- kein automatisches Wegerklären roter Tests;
- kein Auto-Fixer;
- keine pauschale Lockerung visueller Qualitätsgates;
- keine Änderung der Production-/Pages-Release-Gates.
