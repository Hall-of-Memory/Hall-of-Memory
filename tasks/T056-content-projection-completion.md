# T056 — Content Projection Completion

Status: done

## Diagnose

Die validierten öffentlichen Contentquellen für Packages und Gallery waren vorhanden, aber nicht vollständig bis in die gemeinsame Landing-Oberfläche projiziert. Packages verloren in `src/data/demo.ts` ihre `offerId`- und Darstellungsfelder; `gallery.json` wurde dort gar nicht projiziert. Dadurch war die Paketauswahl im Anfrageformular global statt an das gewählte Angebot gebunden. Gleichzeitig erzeugte `src/lib/seo.ts` Angebotsfragmente, für die den gerenderten Angebotskarten stabile DOM-Ziele fehlten.

`src/content/packages.json` und `src/content/gallery.json` sind weiterhin leer. Dieser leere Zustand ist autoritative Contentwahrheit und darf nicht durch erfundene Kundeninhalte ersetzt werden. Die Production-Allowlist in `shared/inquiry-contract.ts` bleibt eine getrennte, explizite Sicherheitsgrenze.

## Ziel

Die bestehende Contentarchitektur vollständig und ohne zweite Inhaltsquelle bis in Landingpage und Anfrageformular projizieren, dabei Empty-States ehrlich erhalten und den synthetischen Nichtleer-Pfad deterministisch beweisen.

## Scope

- vollständige Package-Projektion inklusive `offerId`, Summary, optionalem Preislabel und Features
- Gallery-Projektion inklusive lokaler `BASE_URL`-Auflösung
- sichtbare Angebot↔Package-Zuordnung im Showcase
- offergebundene Package-Auswahl im Anfrageformular mit Reset bei Offer-Wechsel
- reale DOM-Ziele `#angebot-<slug>` für strukturierte Angebots-URLs
- T055-Fail-Closed-Bootstrap einschließlich Package-Initialisierung vor Submit-Freischaltung
- synthetische Fixtures in puren Tests sowie ein zusätzlicher temporärer Build; kanonische Contentdateien wurden danach hash-identisch wiederhergestellt und bleiben außerhalb des T056-Diffs

## Akzeptanz

- [x] leere Package-/Gallery-Dateien bleiben unverändert und erzeugen die bisherigen ehrlichen Platzhalter
- [x] nichtleere Package-Projektion erhält Angebotbindung und alle Darstellungsfelder
- [x] nichtleere Gallery-Projektion erhält `src`, `alt` und optionale Caption
- [x] Angebotwechsel invalidiert eine unpassende Package-Auswahl
- [x] Angebot ohne Package hält die Package-Auswahl deaktiviert
- [x] ohne gewähltes Angebot ist keine Package-Auswahl möglich
- [x] Angebotskarten besitzen stabile `angebot-<slug>`-IDs
- [x] Worker/Shared-Contract importieren keine öffentlichen Contentdateien; Production-Allowlist bleibt explizit
- [x] vollständiges `npm run verify` auf dem Implementierungsbaum grün

## Abgrenzung

Keine Provider-, DNS-, Cloudflare-, STRATO-, Legal-, Retention-, Kundenfoto-, CMS-, Buchungs-, Dependency- oder Production-Allowlist-Freigabearbeit. Keine erfundenen Pakete, Preise oder Kundenbilder in `src/content/*`.

## Lokale Evidenz

- `npm ci`: PASS, 0 Vulnerabilities
- `node --no-warnings --experimental-strip-types scripts/test-inquiry-contract.mjs`: PASS (`projection=synthetic-nonempty`)
- temporärer Nonempty-Build: PASS (`t056-synthetic-visible-projection-ok package=fotobox gallery=1 offerFragments=3`); anschließend `packages.json` und `gallery.json` jeweils auf SHA-256 `37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570` zurückgerollt
- `npm run check`: PASS, 69 Dateien, 0 Fehler / 0 Warnungen / 0 Hinweise
- `npm run test:form`: PASS (`inquiry-form-ui-ok`)
- `npm run test:demo`: PASS; Default-Empty-State unverändert, 4 bestehende Bilder, CSS wieder auf 25.542 Bytes
- `npm run verify`: PASS — 23 PASS / 0 FAIL / 0 BLOCKED; dauerhafter Finalization-Receipt `fa90c7625fe3db0f1e7b5108f0dddb0c4a3e413b64c67b9cfb55cd53c03da57b`

## Publication Gate

Der Repo-Task ist nach vollständiger Implementierung und lokaler Vollprüfung `done`. Exact-Head-PR-Review, Required CI, Captain-Merge und Main-Runtime bleiben bindende operative Veröffentlichungsgates und werden als externe Receipts belegt. Dafür wird nach erfolgreichem Merge kein künstlicher Doc-only-Closeout-PR erzeugt.
