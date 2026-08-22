---
id: T026
status: done
priority: P0
dependencies: [T003]
---
# Private Gallery Security Foundation

## Ziel

Den bestätigten Kundenwunsch nach einem geschützten Event-Fotobereich so weit umsetzen, wie es ohne Festlegung auf Link-vs.-Passwort-vs.-Code, ohne privaten Objektspeicher und ohne produktive Kundendaten sicher möglich ist.

## Umgesetzt

- `src/domain/gallery-access.ts` enthält einen plattformneutralen Security-Kern.
- Persönliche Link-Tokens werden mit `crypto.getRandomValues` aus 32 Zufallsbytes erzeugt (256 Bit Entropie).
- Persistierbar ist nur SHA-256 des hochentropischen Tokens; der Klartexttoken ist kein Grant-Feld.
- Tokenwerte werden nicht stillschweigend getrimmt oder normalisiert.
- Grants unterstützen Ablauf und Widerruf und werden fail-closed auf Scope-/Zeit-/Hashdaten geprüft.
- Autorisierung verlangt neben dem gültigen Token ausdrücklich die angeforderte `galleryId`; ein Token für Event A kann Event B nicht autorisieren.
- Assets werden danach erneut auf exakt denselben Gallery-Scope geprüft; Cross-Event-Zugriff wird verweigert.
- Kurze menschlich eingegebene Codes/Passwörter sind ausdrücklich **nicht** durch diesen SHA-256-Pfad abgedeckt; dafür wären KDF, Rate Limit und Lockout separat zu entwerfen.
- `scripts/test-gallery-access.mjs` ist im vollständigen `npm run verify` verankert.
- Architektur-/Sicherheitsgrenzen stehen in `docs/private-gallery-security.md`.

## Nicht umgesetzt / weiterhin T025

- kein R2 oder anderer privater Objektspeicher
- keine produktiven Gallery-/Asset-/Grant-Tabellen
- kein öffentliches Galerie-/Login-/Code-UI
- kein Versand von Zugängen
- keine echten Bilder/Kundendaten
- keine Download-/Originaldateirechte
- keine Aufbewahrungs-/Löschautomatik
- keine Festlegung auf persönlicher Link vs. Passwort/Code

## Evidenz

Implementierung:
- `ace206f933e787c39795a4f58490f8960a9a75e8` — `feat: add gallery security and legal foundations`
- `142796fe11b96146d07c60fb5f03bb366633eb47` — `fix: bind gallery access to requested event`

Validierung:
- finaler kompletter Regressionslauf Grabowski-Task `f06334ec0f6443feaa6204fa` → PASS für `test:gallery-access`, `test:domain`, `test:form`, `test:quality`, `test:demo`, `check`, `build`, `verify` und `git diff --check`.
- `test:gallery-access` → `gallery-access-domain-ok`; dabei werden insbesondere falscher Token, falscher Event-Scope, falsches Asset, Ablauf, Widerruf, ungültige Grant-/Zeitdaten und Klartextpersistenz negativ geprüft.
- `npm run verify` enthält zusätzlich Inquiry-Smoke sowie Worker-/Site-Dry-Runs und blieb PASS.
- Demo-Isolation bleibt unverändert: `launchStatus=draft`, `noindex`, `apiCalls=0`, Demo-CSS `28659` Byte.

## Abschluss

T026 ist `done`. Der wiederverwendbare Sicherheitskern ist vorhanden; der vollständige kundenseitige Fotobereich bleibt dedupliziert in T025 und wartet nur auf die dort genannten Produkt-/Betriebsentscheidungen.
