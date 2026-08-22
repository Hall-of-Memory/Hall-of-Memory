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

## 3. Public-Repository-Grenze

Dieses Projekt ist für ein öffentliches, kundenkontrolliertes kanonisches GitHub-Repository vorgesehen. Deshalb gilt fail-closed:

- Keine Secrets, Tokens, Passwörter, `.env`-Dateien oder produktiven Zugangsdaten committen.
- Keine personenbezogenen Eventkundendaten oder privaten Eventmedien committen.
- Keine internen Verträge, Rechnungen, privaten Korrespondenzen oder sonstigen nicht zur Veröffentlichung bestimmten Unterlagen committen.
- Original-, Stock-, Font- oder Designerassets nur dann in die öffentliche Historie aufnehmen, wenn ihre Weiterverbreitung geklärt ist. Bei unklaren Rechten nicht veröffentlichen und den kanonischen Task blockieren.
- `.env.example` darf nur leere bzw. offensichtlich nicht produktive Beispielwerte enthalten.

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
- Direkte Pushes auf `main`, Force-Pushes und ungeprüfte Merges vermeiden; im späteren öffentlichen Kundenrepo sollen Rulesets/Branch-Protection dies technisch absichern.
- Alte lokale Branches/Worktrees nicht mit `--all` oder `--mirror` ungeprüft in das Kundenrepo publizieren.
- GitHub Issues dürfen für Diskussion oder externe Referenzen genutzt werden, aber nicht als zweite Task-Wahrheit.

## 6. Deployment-Grenze

- GitHub ist Quellcode-, Review- und Preview-Oberfläche; die vorgesehene Produktion bleibt Cloudflare gemäß `docs/deployment-handover.md` und T009.
- Keine produktiven Cloudflare-Ressourcen, Domains, D1-Datenbanken, Turnstile-/Access-/Email-Bindings oder kostenpflichtigen Dienste eigenmächtig anlegen oder aktivieren.
- Kein Merge darf implizit als Freigabe für Produktion interpretiert werden.

## 7. Definition of Done

Eine Änderung ist erst abgeschlossen, wenn:

1. der Scope dem kanonischen Task entspricht,
2. keine fremde Arbeit überschrieben wurde,
3. relevante Tests inklusive `npm run verify` grün sind,
4. Diff und Auswirkungen selbst geprüft wurden,
5. Task-Journal/Evidenz aktualisiert ist,
6. keine neue Public-Repository-, Datenschutz-, Rechte- oder Deployment-Grenze verletzt wurde.
