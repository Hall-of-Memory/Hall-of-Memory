# Hall of Memory

Kanonisches Arbeitsrepository für **Hall of Memory**.

## Website

**Produktions- und Primärdomain:** `https://hallofmemory.de`

Die Domain liegt auf STRATO. Der aktuelle DNS-Cutover zur Zielplattform ist in T045 dokumentiert. Bis der Domain-Readback vollständig grün ist, bleibt die GitHub-Pages-Preview nur als technischer Übergangs-Fallback bestehen.

## Ziel

Eine hochwertige, moderne und erweiterbare Event-Website mit Schwerpunkt auf Fotobox, Fotospiegel und Magazinbox. Die Architektur soll geringe laufende Kosten, vollständige Kundenhoheit und spätere Erweiterbarkeit um weitere Mietangebote sowie Verfügbarkeits-/Buchungsfunktionen ermöglichen.

## Eigentum und technische Rollen

- **Domain/Registrar:** STRATO.
- **GitHub:** Quellcode, Pull Requests, CI und nachvollziehbare Änderungshistorie.
- **Cloudflare:** vorgesehene produktive Auslieferung und später die serverseitigen Produktbausteine gemäß T009.
- **GitHub Pages:** nur Übergangs-Preview; nicht die Produktionsplattform.
- **`tasks/`:** einzige kanonische Task-Registry dieses Kundenauftrags.

Das Source-Repo soll langfristig so privat wie sinnvoll sein. Die Repository-Sichtbarkeit wird aber nicht auf Kosten von Branchschutz und CI-Sicherheit geändert. Solange der eingesetzte GitHub-Organisationstarif Schutzregeln für private Repositories nicht nachweislich unterstützt, bleibt die bereinigte Veröffentlichungshistorie ohne vertrauliche Quellen zulässig öffentlich. T045 hält diese Sichtbarkeitsentscheidung revisionsgebunden fest.

Unabhängig von der GitHub-Sichtbarkeit gilt: produktive Secrets, Zugangsdaten, private Eventfotos, Daten, Verträge und nicht zur Veröffentlichung bestimmte Designer-Originaldateien gehören **nicht** in Git.

## Verbindliche Arbeitsregel

**Alle Aufgaben, Restpunkte, Entscheidungen und Folgethemen werden ausschließlich in diesem Repository verwaltet.**

- Kein Bureau als Aufgabenquelle für diesen Auftrag.
- GitHub Issues sind kein paralleles Taskregister.
- `tasks/` ist die kanonische Task-Registry.
- Architekturentscheidungen stehen in `decisions/`.
- Kundenanforderungen und Primärevidenz stehen in `docs/` bzw. `assets/reference/`.
- Geschäftsangaben, Preise, Kontaktdaten und Produktregeln niemals erfinden.
- Keine Secrets, personenbezogenen Kundendaten oder privaten Eventmedien committen.
- Web-Assets dürfen öffentlich ausgeliefert werden; private Source-Master bleiben außerhalb des öffentlichen Webpfads.

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

Der gleiche Volltest läuft in GitHub Actions für Pull Requests und `main`.

## Deployment

Produktiver Ziel-Origin ist `https://hallofmemory.de`. Ein Produktions-Build setzt `PUBLIC_SITE_URL` auf genau diesen HTTPS-Origin. Deployment, DNS-Cutover, Rollback und Readback sind in [`docs/deployment-handover.md`](docs/deployment-handover.md), T009 und T045 geregelt.

Ein Merge allein ist keine Behauptung eines erfolgreichen Produktivdeployments. Ein Livegang gilt erst nach revisionsgebundenem Deployment und HTTP-/Browser-Readback der echten Domain als erfolgt.

## Zusammenarbeit mit Menschen und Codex

- [`AGENTS.md`](AGENTS.md) enthält den operativen Vertrag für Coding-Agenten.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) beschreibt den Branch-/PR-Workflow.
- Für normale Inhaltsänderungen werden die Zod-validierten Dateien unter `src/content/` bevorzugt.
- Private Eventmedien bleiben auch bei einem privaten Source-Repo in einer dafür vorgesehenen privaten Speicher-/Zugriffsschicht und nicht in Git.

## Aktueller Stand

Siehe [`tasks/INDEX.md`](tasks/INDEX.md), [`tasks/T009-deploy-handover.md`](tasks/T009-deploy-handover.md), [`tasks/T043-public-collaboration-readiness.md`](tasks/T043-public-collaboration-readiness.md), [`tasks/T045-production-domain-cutover.md`](tasks/T045-production-domain-cutover.md) und [`docs/project-brief.md`](docs/project-brief.md).

## Lizenzstatus

Es gibt derzeit keine allgemeine Open-Source-Lizenz. Repository-Sichtbarkeit und Lizenzierung sind getrennte Entscheidungen; Marken- und Drittanbieterassets können eigene Rechtebedingungen haben.
