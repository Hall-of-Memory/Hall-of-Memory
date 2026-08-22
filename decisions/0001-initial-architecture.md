# ADR 0001 — Astro SSG + Cloudflare Workers Static Assets

Status: PROVISIONAL — REVIEW REQUIRED
Datum: 2026-08-11

## Entscheidung

Hall of Memory startet mit Astro 7.2 im statischen Modus. Der Build-Output `dist/` wird als Cloudflare Workers Static Assets ausgeliefert. Im Basissystem gibt es bewusst kein Worker-Script und keinen Astro-Cloudflare-Adapter.

## Warum

- öffentliche Marketingseiten sind statisch, schnell und cachefreundlich
- minimale Plattformkopplung und minimale laufende Infrastruktur
- keine vorsorglichen KV-/Session-/Image-Bindings
- Quellcode bleibt portabel
- ein Worker-Script, Astro-Adapter, D1/R2 oder andere Bindings können später exakt dann ergänzt werden, wenn Anfrage-, Admin- oder Verfügbarkeitsfunktionen sie benötigen

## Trade-off

Dynamische Funktionen sind im Basissystem noch nicht implementiert. Das ist Absicht: ihre technische Form soll aus dem tatsächlichen Datenmodell und Buchungsprozess folgen, statt jetzt unnötige Infrastruktur festzuschreiben.

## Bewusst noch offen

- Auth-Modell für Admin
- Datenbankschema
- Anfrage-/Mail-Zustellung
- verbindliche Buchung vs. unverbindliche Verfügbarkeitsanfrage
- Medienablage

Diese Entscheidungen gehören in T003–T006 und werden dort mit Primärevidenz getroffen.

## Review 2026-08-11

Die Entscheidung bleibt als getestete static-first Baseline gültig, ist aber nicht mehr die abschließende Full-Stack-Entscheidung. Siehe `docs/architecture-review-2026-08-11.md` und T011.
