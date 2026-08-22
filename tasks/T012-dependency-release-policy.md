---
id: T012
status: done
priority: P1
dependencies: [T011]
---
# Reproduzierbare Dependency- und Release-Policy

## Befund

`package-lock.json` pinnt den aktuell getesteten Build, aber `@astrojs/check`, `typescript` und `wrangler` stehen in `package.json` weiterhin auf `latest`. Das ist für einen frühen Scaffold bequem, als langfristige Kundenbasis aber zu offen: eine Lockfile-Neuerzeugung oder bewusste Aktualisierung kann ungeprüft auf neue Major-Versionen springen.

## Ziel

Reproduzierbare Builds und kontrollierte Updates, ohne notwendige Sicherheits-/Kompatibilitätsupdates dauerhaft einzufrieren.

## Akzeptanz

- Versionierungsstrategie für Runtime- und Dev-Dependencies festgelegt
- keine ungebundenen `latest`-Specs in der Produktionsbasis
- `npm ci` als kanonischer reproduzierbarer Installationspfad geprüft
- Updateprozess mit Check/Build/Dry-Run festgelegt
- Node-Version bzw. Engine/Toolchain dokumentiert oder gepinnt
- automatisierte Dependency-Updates nur mit Tests und Review

## Abschluss-Evidenz — 2026-08-11

- Alle direkten Dependency-Specs sind kontrolliert gepinnt; kein `latest`.
- Node-Version in `.nvmrc` und Engine-Grenze dokumentiert.
- Frische Installation mit `npm ci` erfolgreich.
- `npm run check`, `npm run build` und Wrangler-Dry-Run erfolgreich.
