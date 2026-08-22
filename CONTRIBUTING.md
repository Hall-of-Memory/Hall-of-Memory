# Mitwirken an Hall of Memory

Hall of Memory wird als kundenkontrolliertes, öffentliches Quellrepository vorbereitet. Der Arbeitsprozess soll für kleine menschliche und Codex-gestützte Änderungen einfach bleiben.

## Kanonischer Ablauf

1. In `tasks/INDEX.md` den passenden Task finden oder einen deduplizierten neuen Task unter `tasks/` anlegen.
2. Einen kleinen Branch für genau diese Änderung verwenden.
3. Die Änderung umsetzen. Inhalte nach Möglichkeit über `src/content/*.json` pflegen.
4. `npm run verify` ausführen.
5. Pull Request erstellen und die Wirkung knapp beschreiben.
6. Diff, Preview und Checks prüfen.
7. Erst danach nach `main` mergen.

`tasks/` bleibt die einzige Aufgabenquelle. GitHub Issues ersetzen die Task-Dateien nicht.

## Für den Kunden mit Codex

Für normale Inhaltsänderungen muss Git nicht im Detail bedient werden. Ein guter Auftrag an Codex beschreibt eng, was geändert werden soll und was unverändert bleiben muss, zum Beispiel:

> Ändere nur den Text der bestehenden FAQ-Antwort X. Verändere kein Layout und keine anderen Inhalte. Beachte AGENTS.md, führe die vorgeschriebenen Tests aus und erstelle einen Pull Request.

Für Preise, Angebote und Pakete nur bestätigte Werte verwenden. Codex darf fehlende Geschäftsdaten nicht erfinden.

## Öffentlichkeitsgrenze

Vor jedem Commit gilt: Der Inhalt muss für eine dauerhaft öffentliche Git-Historie geeignet sein.

Nicht committen:

- Secrets, Tokens, Zugangsdaten oder echte `.env`-Dateien,
- private Eventfotos oder personenbezogene Eventkundendaten,
- interne Verträge, Rechnungen oder private Korrespondenz,
- Assets mit ungeklärtem Recht zur öffentlichen Weiterverbreitung.

Die Sichtbarkeit eines Repositorys ist keine Freigabe für private Betriebsdaten. Produktive Secrets und private Medien bleiben außerhalb von Git.

## Branches und Pull Requests

- `main` soll jederzeit stabil bleiben.
- Branches kurzlebig und auf einen Task begrenzen.
- Keine ungeprüften Sammel-Pushes alter lokaler Branches.
- Force-Push auf `main` vermeiden.
- Architektur-, Security-, Dependency- und Deployment-Änderungen brauchen besonders sorgfältige Review.

## Verifikation

Kanonischer Volltest:

```bash
npm run verify
```

Die GitHub-CI führt denselben Befehl aus. Lokale und Remote-Prüfung sollen nicht auseinanderlaufen.

## Deployment

Ein Merge ist keine Produktionsfreigabe. Die vorgesehene Produktionsarchitektur bleibt Cloudflare gemäß T009 und `docs/deployment-handover.md`. GitHub Pages dient nur der öffentlichen Preview, solange die kanonischen Tasks nichts anderes festlegen.

## Lizenz

Solange keine `LICENSE`-Datei eine ausdrückliche Lizenz erteilt, wird durch die öffentliche Sichtbarkeit des Quellcodes keine zusätzliche Open-Source-Lizenz zugesagt. Marken- und Drittanbieterassets können davon unabhängige Rechtebedingungen haben.
