---
id: T061
status: active
priority: P0
dependencies: [T010, T060]
---
# Öffentliche Markenmigration auf `Memora Event`

## Ziel

Die öffentliche Website wird textlich von **Hall of Memory** auf **Memora Event** umgestellt. Die technische Domain- und Deployment-Architektur aus T060 bleibt unverändert.

## Kundenentscheidung — 30.09.2026

Der Kunde hat die Umbenennung der Website auf **Memora Event** ausdrücklich freigegeben.

## Scope dieses Changes

- kanonischer Website-Name in `src/content/site.json`;
- Seitentitel, Meta-/SEO-Ausgaben und sichtbare Startseitentexte;
- Produkttexte und Nutzenargumente;
- WhatsApp-Vorbelegung und Accessibility-Labels;
- Impressum-/Datenschutz-Entwurfsseiten;
- interne Rahmenvorschau.

## Bewusst nicht verändert

Bestehende Grafikdateien mit dem alten Hall-of-Memory-Logo werden **nicht eigenmächtig nachgezeichnet oder verändert**. Das ist nach `AGENTS.md` unzulässig und wartet auf ein freigegebenes Memora-Event-Logo-Asset. Interne Dateinamen, CSS-Klassen, Workername und Repositoryname bleiben ebenfalls unverändert, solange sie nicht öffentlich als Markenname auftreten.

## Akzeptanz

- öffentlich sichtbare Textreferenzen verwenden `Memora Event`;
- `memoraevent.de` und der bestehende Cloudflare-/Worker-Pfad aus T060 bleiben unverändert;
- altes Logo-Asset wird nach Lieferung/Freigabe separat ersetzt;
- `npm run verify` ist vor Merge grün.
