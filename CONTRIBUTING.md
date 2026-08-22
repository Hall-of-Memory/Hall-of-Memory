# Mitwirken an Hall of Memory

Hall of Memory liegt in einem kundenkontrollierten GitHub-Repository. Die öffentliche Website und die Sichtbarkeit des Source-Repositories werden bewusst getrennt behandelt; T045 dokumentiert die aktuelle Privatsphäre-/Tarifentscheidung.

## Kanonischer Ablauf

1. In `tasks/INDEX.md` den passenden Task finden oder einen deduplizierten neuen Task unter `tasks/` anlegen.
2. Einen kleinen Branch für genau diese Änderung verwenden.
3. Die Änderung umsetzen. Inhalte nach Möglichkeit über `src/content/*.json` pflegen.
4. `npm run verify` ausführen.
5. Pull Request erstellen und die Wirkung knapp beschreiben.
6. Diff, Preview und Checks prüfen.
7. Erst danach nach `main` mergen.
8. Bei einer für Produktion vorgesehenen Änderung zusätzlich den revisionsgebundenen Deploy-/Domain-Readback aus T045 durchführen.

`tasks/` bleibt die einzige Aufgabenquelle. GitHub Issues ersetzen die Task-Dateien nicht.

## Für den Kunden mit Codex

Für normale Inhaltsänderungen muss Git nicht im Detail bedient werden. Ein guter Auftrag an Codex beschreibt eng, was geändert werden soll und was unverändert bleiben muss, zum Beispiel:

> Ändere nur den Text der bestehenden FAQ-Antwort X. Verändere kein Layout und keine anderen Inhalte. Beachte AGENTS.md, führe die vorgeschriebenen Tests aus und erstelle einen Pull Request.

Für Preise, Angebote und Pakete nur bestätigte Werte verwenden. Codex darf fehlende Geschäftsdaten nicht erfinden.

## Datenschutz- und Veröffentlichungsgrenze

Nicht committen:

- Secrets, Tokens, Zugangsdaten oder echte `.env`-Dateien,
- private Eventfotos oder personenbezogene Eventkundendaten,
- interne Verträge, Rechnungen oder private Korrespondenz,
- nicht zur Veröffentlichung bestimmte Designer-/Stock-/Font-Source-Master.

Auch ein privates Repository ist keine Freigabe für private Betriebsdaten. Produktive Secrets und private Eventmedien bleiben außerhalb von Git. Öffentliche Web-Exports dürfen nach den projektseitig geklärten Nutzungsrechten über `hallofmemory.de` ausgeliefert werden.

## Branches und Pull Requests

- `main` soll jederzeit stabil bleiben.
- Branches kurzlebig und auf einen Task begrenzen.
- Keine ungeprüften Sammel-Pushes alter lokaler Branches.
- Kein Force-Push auf `main`.
- Architektur-, Security-, Dependency- und Deployment-Änderungen brauchen besonders sorgfältige Review.
- Repository-Sichtbarkeit nur ändern, wenn der Schutz von `main` danach weiterhin nachweislich funktioniert.

## Verifikation

Kanonischer Volltest:

```bash
npm run verify
```

Die GitHub-CI führt denselben Befehl aus. Lokale und Remote-Prüfung sollen nicht auseinanderlaufen.

## Deployment

Produktiver Primär-Origin ist `https://hallofmemory.de`; Zielplattform ist Cloudflare gemäß T009/T045 und `docs/deployment-handover.md`. GitHub Pages ist nur noch Übergangs-Fallback bis zum erfolgreichen Domain-Cutover.

Die Kundenentscheidung vom 22.08.2026 autorisiert den statischen Domain-Livegang. Neue kostenpflichtige Dienste oder produktive Backend-Ressourcen werden dadurch nicht pauschal freigegeben.

## Lizenz

Es gibt derzeit keine allgemeine Open-Source-Lizenz. Repository-Sichtbarkeit und Lizenzierung sind getrennte Entscheidungen; Marken- und Drittanbieterassets können eigene Rechtebedingungen haben.
