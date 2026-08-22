# Toolchain und reproduzierbare Builds

Stand: 2026-08-11

- Node: 22.23.2 (`.nvmrc`)
- Astro: 7.2.0
- @astrojs/check: 0.9.10
- TypeScript: 6.0.3
- Wrangler: 4.120.1

`package-lock.json` ist verbindlich. Frische Installationen verwenden `npm ci`. Versionssprünge werden nicht über ungebundenes `latest` eingeführt, sondern bewusst aktualisiert und anschließend mit Check, Build und Wrangler-Dry-Run geprüft.
