# Hall of Memory

Kanonisches Arbeitsrepository für den Kundenauftrag **Hall of Memory**.

## Ziel

Eine hochwertige, moderne und erweiterbare Event-Website mit Schwerpunkt auf Fotobox, Fotospiegel und Magazinbox. Die erste Version soll geringe laufende Kosten, vollständige Kundenhoheit und spätere Erweiterbarkeit um weitere Mietangebote sowie Verfügbarkeits-/Buchungsfunktionen sicherstellen.

## Repository- und Eigentumsmodell

Hall of Memory wird für ein **öffentliches, kundenkontrolliertes kanonisches GitHub-Repository** vorbereitet. Der erste kanonische Git-Remote soll direkt in einer GitHub-Organisation des Kunden liegen; ein temporäres Quellrepo unter Entwicklerhoheit ist nicht vorgesehen.

Der öffentliche GitHub-Stand verwendet eine bereinigte Veröffentlichungshistorie: private Designer-Arbeitsdateien und historische lokale Branches werden nicht publiziert; die Website nutzt ausschließlich die bestätigten Web-Exports unter `public/`. T043 dokumentiert den Cutover und die verbleibende Codex-Abnahme.

GitHub dient Quellcode, Collaboration, CI und Preview. Die vorgesehene Produktionsarchitektur bleibt Cloudflare gemäß T009 und [`docs/deployment-handover.md`](docs/deployment-handover.md).

Private Designer-/Kundenquellen, Eventmedien und produktive Secrets gehören ausdrücklich **nicht** in dieses öffentliche Repository.

## Verbindliche Arbeitsregel

**Alle Aufgaben, Restpunkte, Entscheidungen und Folgethemen dieses Kundenauftrags werden ausschließlich in diesem Repository verwaltet.**

- Kein Bureau als Aufgabenquelle für diesen Auftrag.
- GitHub Issues sind kein paralleles Taskregister.
- `tasks/` ist die kanonische Task-Registry.
- Architekturentscheidungen stehen in `decisions/`.
- Kundenanforderungen und Primärevidenz stehen in `docs/` bzw. `assets/reference/`.
- Keine Secrets, Zugangsdaten, personenbezogenen Kundendaten oder privaten Eventmedien committen.
- Keine Assets mit ungeklärtem Recht zur öffentlichen Weiterverbreitung in die öffentliche Historie aufnehmen.

## Entwicklung

Voraussetzung: Node.js 22.

```bash
npm ci
npm run dev
```

Kanonischer Volltest:

```bash
npm run verify
```

Der gleiche Volltest wird in GitHub Actions für Pull Requests und `main` ausgeführt.

## Zusammenarbeit mit Menschen und Codex

- [`AGENTS.md`](AGENTS.md) enthält den operativen Vertrag für Coding-Agenten.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) beschreibt den einfachen Branch-/PR-Workflow.
- Für normale Inhaltsänderungen sollen die Zod-validierten Dateien unter `src/content/` bevorzugt werden.
- Ein Merge ist keine automatische Produktionsfreigabe.

## Aktueller Stand

Siehe [`tasks/INDEX.md`](tasks/INDEX.md), [`tasks/T043-public-collaboration-readiness.md`](tasks/T043-public-collaboration-readiness.md) und [`docs/project-brief.md`](docs/project-brief.md).

## Lizenzstatus

Solange keine `LICENSE`-Datei eine ausdrückliche Lizenz erteilt, wird durch die öffentliche Sichtbarkeit des Quellcodes keine zusätzliche Open-Source-Lizenz zugesagt. Marken- und Drittanbieterassets können davon unabhängige Rechtebedingungen haben.
