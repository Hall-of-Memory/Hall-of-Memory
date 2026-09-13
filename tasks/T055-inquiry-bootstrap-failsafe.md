---
id: T055
status: done
priority: P1
dependencies: [T004, T049]
---
# Inquiry-Bootstrap fail-closed absichern

## Diagnose

Der Gesamt-Audit auf dem nach T054 integrierten Anfragepfad zeigte eine enge Bootstrap-Lücke: Bei vollständig gesetzter öffentlicher Inquiry-Konfiguration war der Submit-Button bereits im servergerenderten HTML aktiv. Das Formular besitzt bewusst keinen nativen `action`-/`method`-Fallback, weil der Backendvertrag JSON erwartet. Fällt das Client-JavaScript vor der Registrierung des Submit-Handlers aus, darf der Browser deshalb niemals auf eine native GET-Übermittlung personenbezogener Felder zurückfallen.

## Ziel

Der Server liefert das aktive Anfrageformular immer fail-closed aus. Nur der erfolgreich initialisierte Client-Controller darf es nach vollständiger DOM-/Konfigurationsprüfung und gebundenem Submit-Handler interaktiv schalten.

## Scope

- Submit im servergerenderten aktiven Formular unabhängig von der öffentlichen Konfiguration `disabled` halten.
- Der Client klemmt den Button beim Bootstrap zusätzlich fail-closed.
- Fehlende DOM-Elemente, API-URL oder Turnstile-Site-Key lassen den Button deaktiviert.
- Erst nach Controller-Erzeugung und erfolgreicher Registrierung des `submit`-Handlers wird der Button freigeschaltet.
- Bestehende Turnstile-Lazy-Initialisierung, Fehlerdarstellung, Doppel-Submit-Sperre und Preview-Deaktivierung bleiben unverändert.
- Kein nativer POST-Fallback und keine Änderung am JSON-Backendvertrag.

## Akzeptanz

- [x] Ein konfigurierter Build enthält den aktiven Inquiry-Pfad, aber dessen Submit-Button ist im ausgelieferten HTML weiterhin `disabled`.
- [x] Ohne Client-JavaScript ist damit keine Formularübermittlung möglich und es gibt keinen nativen GET-Pfad für Kontaktfelder.
- [x] Der Client hält den Button bei fehlender Konfiguration oder unvollständigem DOM deaktiviert.
- [x] Die einzige Bootstrap-Freischaltung liegt nach der Registrierung des Submit-Handlers.
- [x] Bestehende Inquiry-/Turnstile-/Doppel-Submit-Tests bleiben Bestandteil des kanonischen Verify.
- [x] Der lokale T055-Kandidat besteht `npm ci`, `npm run test:form` und `npm run verify` mit 23 PASS / 0 FAIL / 0 BLOCKED. Der veröffentlichte PR-Head muss zusätzlich frisches CI bestehen.
- [ ] Nach Integration besteht der `main`-Push-Run einschließlich `pages-runtime`.

## Abgrenzung

T055 aktiviert keine Produktion, ergänzt keine Rechtstexte, ändert keine Retention-/Löschpolicy und mutiert keine Provider-, DNS- oder Backendressourcen. Der vollständige aktive Produktionspfad bleibt an die bestehenden externen Release-Gates gebunden.

## Lokale Evidenz

- Grabowski-Task `2aaeb0f92a594f6ab7cd9a47`: `npm ci` PASS, konfigurierter `test:form` PASS, kanonischer `npm run verify` 23/23 PASS.
- Astro Check: 68 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise.
- Worker-/Site-Dry-Runs laufen mit Wrangler 4.131.1 erfolgreich.
