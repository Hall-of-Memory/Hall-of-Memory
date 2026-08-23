---
id: T046
status: done
priority: P0
dependencies: [T038]
---
# Kanonische Landingpage: Demo und Produktion konvergieren

## Ziel

Die gestalterisch reife `/demo/`-Website und die technische Produktionsseite `/` werden auf einen gemeinsamen Landingpage-Kern und ein gemeinsames validiertes Contentmodell gestellt. Preview und Produktion dürfen unterschiedliche Betriebsmodi besitzen, aber keine zweite Produkt-, Text- oder Seitenwahrheit mehr pflegen.

T046 beginnt erst, wenn T038 seine noch offene Rahmen-/Kundenabnahme abgeschlossen oder die verbleibende Rahmenarbeit klar von der Landingpage entkoppelt hat. Dadurch wird `DemoExperience.astro` nicht parallel von zwei Schreib-Lanes umgebaut.

## Entkopplungs-Readback — 2026-08-23

- T038 ist technisch implementiert und mehrfach gegen Build, Astro Check, Desktop/Mobile-Readback, GitHub Pages sowie den Slider-/Frame-Vertrag validiert.
- Sein dokumentierter Restpunkt ist ausschließlich die visuelle Kundenauswahl einer Variante und der gewünschten Bildgröße; diese Entscheidung ist keine aktuell ausführbare Code-Mutation.
- T037 ist technisch ebenfalls validiert und wartet nur auf ästhetische Abnahme/Fundus-Acceptance.
- Für T046 wurde deshalb der bestehende Frame-Consumer-Vertrag eingefroren: Varianten, Assetpfade, Insets, Sliderparameter und `/demo/rahmen/` wurden nicht gestalterisch verändert.
- Damit war die im Zieltext vorgesehene Alternative „verbleibende Rahmenarbeit klar von der Landingpage entkoppelt“ erfüllt. Eine spätere Kundenauswahl kann auf dem erhaltenen Frame-Interface erfolgen, ohne den Landingpage-Kern erneut zu spalten.

## Ausgangsbefund

- `src/pages/index.astro` verwendete das kanonische Contentmodell, bildete aber noch den technischeren Scaffold-/Entwurfsstand ab.
- `/demo/` renderte `DemoExperience.astro` mit dem kundennahen Designstand und einer früher separaten Demo-Datenprojektion.
- `DemoExperience.astro` bündelte ursprünglich Hero, Angebote, Benefits, Pakete, Galerie, Ablauf, Kundenbereich, Anfrage, FAQ/Kontakt und Rahmenlogik in einer großen Komponente.
- Der Stage-1-Vertrag aus T045 blieb während T046 unverändert: `/` darf auf Cloudflare weiter per temporärem `302` nach `/demo/` führen; `/demo/` bleibt `noindex` und das Anfrageformular bleibt fail-closed.

## Umsetzung

1. Einen gemeinsamen Landingpage-Kern einführen, der von `/` und `/demo/` verwendet werden kann.
2. `DemoExperience.astro` entlang sinnvoller Seitensektionen zerlegen, ohne kleinteilige Komponentenexplosion.
3. Frame-Consumer-/Vergleichslogik aus der allgemeinen Landingpage-Struktur lösen; `/demo/rahmen/` bleibt isoliertes Designwerkzeug.
4. Das Zod-validierte Contentmodell so erweitern, dass die akzeptierte Demo-Struktur ohne parallele `src/data/demo`-Geschäftswahrheit darstellbar ist. Mindestens prüfen: Highlights, Detailtexte, Benefits, Prozessschritte, CTA-/Kontakttexte und notwendige Medienmetadaten.
5. Preview- und Produktionsunterschiede nur noch über explizite Mode-/Konfigurationsparameter ausdrücken: insbesondere `noindex`, Inquiry-Aktivierung und Preview-Hinweise.
6. Keine Preise, Kontaktdaten, Rechtsangaben, Bildrechte oder Geschäftsregeln erfinden. Extern fehlende Inhalte bleiben den bestehenden Tasks T008/T010/T011 zugeordnet.
7. Bestehende Stage-1-Routing-, Pages-, Frame-, Security- und Performanceverträge während der Migration erhalten.

## Shared-Core-Evidenz — 2026-08-23

- PR #6 wurde gemergt: Angebote, Benefits, Prozessschritte und FAQ besitzen nun eine einzige Zod-validierte Wahrheit unter `src/content/`; `src/data/demo.ts` ist nur noch eine Formprojektion und enthält keine eigenständigen Produkttexte.
- PR #7 wurde gemergt: `/` und `/demo/` rendern denselben `DemoExperience`-Kern. `/` setzt explizit `mode="production"`; `/demo/` und die Rahmenvarianten verwenden weiterhin den fail-closed Preview-Default.
- Preview/Production unterscheiden sich nur noch explizit in Betriebsaspekten: Preview-Bar, `noindex`, Canonical/Structured Data, CSP-`form-action` sowie Inquiry-/Turnstile-Aktivierung. Die inhaltliche Landingpage-Struktur ist gemeinsam.
- `public/_redirects` blieb unverändert auf dem Stage-1-Vertrag `/ /demo/ 302`; der Pages-Artefakttest pinnt diesen Redirect weiterhin revisionsgebunden und beweist zugleich, dass Source-Root und Preview-Root unterschiedliche Betriebsmodi desselben Kerns bleiben.
- Production-spezifische Consent-/Turnstile-/Feedback-Regeln liegen in `src/styles/inquiry-production.css`; der Preview-/Frame-Vertrag wurde dadurch nicht fachlich verändert.
- Required-`verify`-Lauf `32626529351` auf Head `d0e24a629953fae505c9e98f2a51a84f84375a90`: PASS. Enthalten sind Inquiry-/Migration-/Domain-/Gallery-/Form-/Quality-/Demo-/Fundus-/Preview-/Pages-Gates, Astro Check, Build sowie Worker- und Site-Dry-Runs.
- Revisionsgebundene Messwerte dieses Laufs: Production HTML 23.219 B, CSS 26.601 B, JS 6.779 B, initial gzip 16.653 B; Preview HTML 20.415 B, CSS 26.601 B, JS 0 B, initial gzip 13.275 B. Damit bleibt der Preview-CSS-Vertrag unter 26 KiB und besitzt 2.071 B Abstand zum T042-Hard-Max von 28 KiB; der 20-KiB-gzip-Deckel bleibt deutlich eingehalten.
- Astro Check im gleichen Lauf: 43 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise.
- PR #8 wurde gemergt, Merge-Commit `954878f4805e890098cf6f52fa5fc8784a6b933b`: `DemoExperience.astro` ist auf Orchestrierung plus sensible Mode-/Hero-/Frame-Logik reduziert. Angebote/Benefits/Pakete/Galerie/Ablauf/Kundenbereich liegen in `LandingShowcase.astro`, Preview-/Production-Anfrage in `LandingInquiry.astro`, FAQ/Kontakt in `LandingFaqContact.astro`. Der vollständige Verify-Vertrag blieb dabei grün.

## Browser-Closeout — 2026-08-23

Der letzte offene Akzeptanzpunkt wurde auf Head `6cbfaf6fd7a8c300929b2cf915f768b51b0fe2b1` in echtem Headless-Chrome 151 über einen temporären CDP-Readback geschlossen. Vor jedem Full-Page-Capture wurden alle Hauptsektionen durchscrollt und die Bildladezustände geprüft.

Browser-Run `32628933712`: PASS.

| Route | Viewport | Full-Page-Capture | overflowX | outsideCards | Bilder unvollständig | Screenshot SHA-256 |
|---|---:|---:|---:|---:|---:|---|
| production | 1440×1000 | 1440×9549 | 0 | 0 | 0 | `867b65d83fead97889d54a7f449ab1fa2aa84764336df2b1a7a50dad4335deed` |
| preview | 1440×1000 | 1440×9307 | 0 | 0 | 0 | `3215232859b9c3d7f0c49b6653f8cb0aef6a4cfed65262072086e858cc8257f3` |
| production | 834×1112 | 834×11412 | 0 | 0 | 0 | `39ef9086d6dc5f991ce6c32d9066865faa504d71a86467ee79f694fcb64d1d29` |
| preview | 834×1112 | 834×11188 | 0 | 0 | 0 | `cc9dbc1cc18c26cf23e8d04b94ee9754be11bf4af74893602dad89817c0e5ca7` |
| production | 390×844 | 390×13508 | 0 | 0 | 0 | `bd6257db476decb74c9e914238d334f80bdeb60e705d7ab8c35ced1ccdf15276` |
| preview | 390×844 | 390×13221 | 0 | 0 | 0 | `0b7528e2fb1bf789d741eaaf32352c51919750614c47015bfaf502acf7693c8d` |

Zusätzlich bestanden in allen sechs Fällen H1/Nav/Main-, Hero-, Abschnitts-, Preview-/Production-Modustrennungs-, fail-closed Submit- sowie Production-Consent-/Turnstile-Assertions.

Das vollständige Evidenzpaket wurde als GitHub-Actions-Artefakt gespeichert:

- Name: `t046-browser-readback-6cbfaf6fd7a8c300929b2cf915f768b51b0fe2b1`
- Artifact ID: `9490494602`
- 7 Dateien: sechs Full-Page-PNGs plus `manifest.json`
- Größe: 11.385.113 B
- ZIP SHA-256: `d908d5b5e8f9d8d2befb3cab9e766691af26f68b52457d7e6e487c45d6ba34e1`
- Retention bis 2026-09-06T08:43:00Z

Der normale Required-`verify`-Lauf `32628933774` auf demselben Head: PASS.

Die Browserprobe und ihr temporärer Workflow werden vor dem Merge dieses Closeouts wieder aus dem Repository entfernt. Die revisionsgebundene Evidenz bleibt über Run, Artifact ID, Digests und dieses Journal nachvollziehbar.

## Nicht-Ziel

- kein Cloudflare-/DNS-Cutover;
- keine Aktivierung echter Anfragen;
- keine neue Buchungsengine;
- keine CMS-Einführung;
- keine neue Rahmenrunde;
- keine generelle Frameworkmigration.

## Akzeptanz

- [x] `/` und `/demo/` verwenden denselben Landingpage-Seitenkern.
- [x] Preview-/Produktionsunterschiede sind explizite Konfiguration, keine duplizierte Seitengeschäftslogik.
- [x] Produkt-/Landingtexte besitzen keine zweite kanonische Wahrheit in `src/data/demo`.
- [x] `DemoExperience.astro` ist auf sinnvolle Sektionen bzw. Orchestrierung reduziert.
- [x] `/demo/rahmen/` und seine Einzelvarianten bleiben funktional und vom Landingpage-Refactor isoliert.
- [x] T045 Stage 1 bleibt fail-closed: Preview `noindex`, kein produktiver Demo-Submit, temporärer Root-Redirect unverändert bis Stage 2.
- [x] bestehende Accessibility-, Asset-, Performance- und Security-Invarianten bleiben grün.
- [x] `npm ci` und `npm run verify` PASS.
- [x] Diff und Browser-Readback für Desktop, Tablet und Mobile revisionsgebunden dokumentiert.

## Folge

T046 ist terminal `done`. T047 darf nun beginnen. Der echte Stage-2-Launch bleibt zusätzlich von T008, T010, T011, T045 und den tatsächlichen Produkt-/Rechts-/Providerfreigaben abhängig.
