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
- Gallery-Assets fail-closed auf lokale, unter `BASE_URL` verbleibende Pfade begrenzen; auch codierte Traversalpfade ablehnen
- nichtleere Gallery count-adaptiv darstellen, ohne den geschützten `demo.css`-Headroom zu verbrauchen und ohne den einspaltigen Mobile-Vertrag bis 640 px zu brechen
- sichtbare Angebot↔Package-Zuordnung im Showcase
- offergebundene Package-Auswahl im Anfrageformular mit Reset bei Offer-Wechsel
- reale DOM-Ziele `#angebot-<slug>` für strukturierte Angebots-URLs
- T055-Fail-Closed-Bootstrap einschließlich Package-Initialisierung vor Submit-Freischaltung
- synthetische Fixtures in puren Tests sowie zusätzliche temporäre Builds; kanonische Contentdateien wurden danach hash-identisch wiederhergestellt und bleiben außerhalb des T056-Diffs

## Akzeptanz

- [x] leere Package-/Gallery-Dateien bleiben unverändert und erzeugen die bisherigen ehrlichen Platzhalter
- [x] nichtleere Package-Projektion erhält Angebotbindung und alle Darstellungsfelder
- [x] nichtleere Gallery-Projektion erhält `src`, `alt` und optionale Caption
- [x] Gallery-Quellen bleiben lokal/CSP-kompatibel; rohe, codierte und doppelt codierte Traversalpfade werden fail-closed abgelehnt
- [x] sparse Gallery erzeugt keine festen Leertracks und bleibt bis 640 px einspaltig
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
- `node --no-warnings --experimental-strip-types scripts/test-inquiry-contract.mjs`: deckt synthetische Nichtleer-Projektion, Offer↔Package-Filterung, lokale Gallery-Auflösung, codierte Traversalpfade und den Mobile-Einspaltenvertrag ab
- temporärer Nonempty-Build: Package-/Gallery-Projektion sichtbar; anschließend `packages.json` und `gallery.json` jeweils auf SHA-256 `37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570` zurückgerollt
- `npm run check`: 69 Astro-Dateien ohne Fehler, Warnungen oder Hinweise; die Loader-Meldungen für die bewusst leeren Package-/Gallery-Dateien bleiben erwartete Content-Wahrheit
- `npm run test:form`: T055-Fail-Closed-Vertrag und Formularprojektion
- `npm run test:demo`: Default-Empty-State, bestehende vier Bilder und CSS-Budget unverändert
- `npm run verify`: wird auf dem finalen Arbeitsbaum **einschließlich dieser Journalfassung** unmittelbar vor dem finalen Commit erneut vollständig ausgeführt

## Publication Gate

Der Repo-Task darf nach vollständiger Implementierung und lokaler Vollprüfung `done` bleiben. Die unveränderliche Commitbindung kann nicht selbstreferenziell in denselben Commit zurückgeschrieben werden: Ein nach Commit/Push erzeugter Receipt- oder CI-Identifier würde beim Eintragen sofort einen neuen, ungeprüften Head erzeugen. Deshalb wird hier bewusst keine ältere Receipt-ID als „final“ fortgeschrieben.

Die finale Beweiskette ist stattdessen zweistufig und fail-closed:

1. `npm run verify` läuft auf dem finalen Arbeitsbaum nach der letzten Journaländerung und vor dem Commit.
2. Nach dem Push muss der Required Check `verify` auf **genau dem daraus entstandenen PR-Head** erfolgreich sein; Review-Threads müssen auf demselben Head geklärt sein.

Captain-Merge und Main-Runtime bleiben danach bindende operative Veröffentlichungsgates und werden außerhalb dieses selbstreferenziellen Journals als revisionsgebundene Receipts belegt. Nach erfolgreichem Merge wird kein künstlicher Doc-only-Closeout-PR erzeugt.
