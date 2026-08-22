# AGENTS.md

Diese Datei ist der operative Arbeitsvertrag für Coding-Agenten in Hall of Memory.

## 1. Autorität und Kontext

- `tasks/` ist die einzige Aufgabenquelle. GitHub Issues, Chats, Bureau oder andere Systeme sind kein paralleles Taskregister.
- Vor einer Änderung `tasks/INDEX.md`, den betroffenen Task und relevante ADRs unter `decisions/` lesen.
- Kundenanforderungen und Primärevidenz stehen in `docs/` und den dafür vorgesehenen Referenzbereichen. Keine Annahme darf eine dokumentierte Kundenentscheidung überschreiben.
- Fremde Dirty-States, Worktrees, Leases oder laufende Prozesse niemals resetten, übernehmen oder bereinigen.

## 2. Änderungsprinzip

- Kleine, klar begrenzte Branches und Pull Requests bevorzugen.
- Bestehende Architektur erweitern statt unnötig neu schreiben.
- Strukturierte Website-Inhalte bevorzugt über die Zod-validierten Dateien unter `src/content/` pflegen.
- Keine Preise, Pakete, Domains, Telefonnummern, E-Mail-Adressen, Geschäftsregeln oder Kundendaten erfinden.
- Markenassets nicht eigenmächtig nachzeichnen, umfärben oder inhaltlich verändern.
- T042 beachten: Styling-Erweiterungen dürfen das Demo-CSS-Budget nicht weiter unter Druck setzen, solange die dort geforderte Reserve nicht wiederhergestellt ist.

## 3. Datenschutz- und Veröffentlichungsgrenze

Die Repository-Sichtbarkeit kann sich gemäß T045 ändern. Deshalb gilt unabhängig von `public` oder `private` fail-closed:

- Keine Secrets, Tokens, Passwörter, `.env`-Dateien oder produktiven Zugangsdaten committen.
- Keine personenbezogenen Eventkundendaten oder privaten Eventmedien committen.
- Keine internen Verträge, Rechnungen, privaten Korrespondenzen oder sonstigen nicht zur Veröffentlichung bestimmten Unterlagen committen.
- Designer-/Stock-/Font-Source-Master nur dann in eine öffentliche Historie aufnehmen, wenn ihre Weiterverbreitung geklärt ist. Web-Exports für die öffentliche Website sind davon getrennt zu beurteilen.
- `.env.example` darf nur leere bzw. offensichtlich nicht produktive Beispielwerte enthalten.
- Ein privates Git-Repo ist kein Ersatz für eine private Eventmedien-/Secret-Schicht.

## 4. Verifikation

Vor Abschluss einer Code- oder Content-Änderung grundsätzlich:

```bash
npm ci
npm run verify
```

Wenn eine Änderung nur Dokumentation betrifft, darf `npm ci` entfallen, wenn die installierte Dependency-Lage bereits reproduzierbar vorhanden ist; vor Merge bleibt `npm run verify` der kanonische Volltest, sofern der Task nichts Strengeres verlangt.

`npm run verify` umfasst die bestehenden Inquiry-, Domain-, Gallery-Security-, Formular-, Quality-, Demo-, Preview-Base-, Astro- und Wrangler-Dry-Run-Prüfungen. Keine zweite divergierende CI-Logik einführen.

## 5. GitHub- und Review-Vertrag

- `main` soll stabil und veröffentlichbar bleiben.
- Normalfall: Task -> kleiner Branch -> Änderung -> `npm run verify` -> Pull Request -> Review -> Merge.
- Direkte Pushes auf `main`, Force-Pushes und ungeprüfte Merges vermeiden; vorhandenen Branchschutz nicht für eine Sichtbarkeitsänderung opfern.
- Alte lokale Branches/Worktrees nicht mit `--all` oder `--mirror` ungeprüft in das Kundenrepo publizieren.
- GitHub Issues dürfen für Diskussion oder externe Referenzen genutzt werden, aber nicht als zweite Task-Wahrheit.

## 6. Deployment-Grenze

- Produktiver Primär-Origin ist gemäß T045 `https://hallofmemory.de`.
- Cloudflare bleibt die vorgesehene Produktionsplattform; GitHub Pages ist nur Übergangs-Fallback bis zum erfolgreichen Domain-Cutover.
- Die Kundenentscheidung vom 22.08.2026 autorisiert den statischen Domain-Livegang und die weitere Entwicklung auf dieser Domain, sobald kundeneigene Cloudflare-/DNS-Autorität technisch verfügbar ist und keine neue kostenpflichtige Zusatznutzung ohne Freigabe entsteht.
- Produktive Backend-Ressourcen wie D1, Turnstile, Access, Email-Bindings oder neue kostenpflichtige Dienste bleiben an T009/T011 und ihre Freigaben gebunden.
- Nach Deployment immer revisionsgebundenen HTTP-/Browser-Readback durchführen; ein Merge allein beweist keinen erfolgreichen Livegang.

## 7. Definition of Done

Eine Änderung ist erst abgeschlossen, wenn:

1. der Scope dem kanonischen Task entspricht,
2. keine fremde Arbeit überschrieben wurde,
3. relevante Tests inklusive `npm run verify` grün sind,
4. Diff und Auswirkungen selbst geprüft wurden,
5. Task-Journal/Evidenz aktualisiert ist,
6. keine Datenschutz-, Rechte-, Repository-Sichtbarkeits- oder Deployment-Grenze verletzt wurde.
