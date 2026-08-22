# Architekturvalidierung — T001

Stand: 2026-08-11

## Ergebnis

Für den Ausgangsstand wird **Astro 7.2 als statischer Site-Generator (SSG) auf Cloudflare Workers Static Assets** verwendet.

- Die öffentliche Website wird vollständig beim Build erzeugt.
- Für eine rein statische Astro-Seite ist kein Cloudflare-Astro-Adapter nötig; dieser wird deshalb erst ergänzt, falls ein späterer Task tatsächlich Astro-On-Demand-Routen benötigt.
- `wrangler.jsonc` zeigt direkt auf `./dist`; für einen rein statischen Worker ist kein Worker-Script erforderlich.
- Dadurch entstehen im Basissystem weder vorsorgliche Session-/KV- noch Image-Bindings.
- D1, R2, Authentifizierung und serverseitige APIs werden erst in den zuständigen Tasks ausgewählt und provisioniert, nachdem Datenmodell und V1-Funktionsumfang feststehen.

## Primäre Live-Evidenz

- Installierter Astro-Stand im Repo: 7.2.x.
- `astro check`: 0 Fehler, 0 Warnungen, 0 Hinweise.
- `astro build`: statischer Build erfolgreich.
- Wrangler-Konfiguration: Assets-Verzeichnis `./dist`, kein `main`-Worker-Script.

## Primärquellen

- Cloudflare Workers Static Assets: für rein statische Sites ist kein Worker-Script nötig; `assets.directory` kann direkt auf den Build-Output zeigen.
- Cloudflare Workers Astro Guide: statische Astro-Projekte können als Assets deployt werden; der Adapter wird für On-Demand-Rendering benötigt.
- Astro Cloudflare Adapter Docs: ein Adapter ist bei rein statischer Verwendung von Astro nicht erforderlich.

## Korrektur gegenüber dem ersten Scaffold

Der erste Scaffold hatte `@astrojs/cloudflare` bereits eingebunden und die Dokumentation fälschlich mit „Astro 6“ bezeichnet, obwohl npm live Astro 7.2 installiert hatte. Der Build war zwar erfolgreich, der Adapter aktivierte aber unnötig Cloudflare-Image- und Session-Bindings. Das wurde entfernt; die Dokumentation entspricht jetzt dem tatsächlich installierten und getesteten Zustand.
