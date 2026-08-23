---
id: T046
status: active
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
- Für T046 wird deshalb der bestehende Frame-Consumer-Vertrag eingefroren: Varianten, Assetpfade, Insets, Sliderparameter und `/demo/rahmen/` werden nicht gestalterisch verändert.
- Damit ist die im Zieltext vorgesehene Alternative „verbleibende Rahmenarbeit klar von der Landingpage entkoppelt“ erfüllt. Eine spätere Kundenauswahl kann auf dem erhaltenen Frame-Interface erfolgen, ohne den Landingpage-Kern erneut zu spalten.

## Ausgangsbefund

- `src/pages/index.astro` verwendete das kanonische Contentmodell, bildete aber noch den technischeren Scaffold-/Entwurfsstand ab.
- `/demo/` renderte `DemoExperience.astro` mit dem kundennahen Designstand und einer früher separaten Demo-Datenprojektion.
- `DemoExperience.astro` bündelt weiterhin Hero, Angebote, Benefits, Pakete, Galerie, Ablauf, Kundenbereich, Anfrage, FAQ/Kontakt und Rahmenlogik in einer großen Komponente.
- Der Stage-1-Vertrag aus T045 bleibt während T046 unverändert: `/` darf auf Cloudflare weiter per temporärem `302` nach `/demo/` führen; `/demo/` bleibt `noindex` und das Anfrageformular bleibt fail-closed.

## Umsetzung

1. Einen gemeinsamen Landingpage-Kern einführen, der von `/` und `/demo/` verwendet werden kann.
2. `DemoExperience.astro` entlang sinnvoller Seitensektionen zerlegen, ohne kleinteilige Komponentenexplosion.
3. Frame-Consumer-/Vergleichslogik aus der allgemeinen Landingpage-Struktur lösen; `/demo/rahmen/` bleibt isoliertes Designwerkzeug.
4. Das Zod-validierte Contentmodell so erweitern, dass die akzeptierte Demo-Struktur ohne parallele `src/data/demo`-Geschäftswahrheit darstellbar ist. Mindestens prüfen: Highlights, Detailtexte, Benefits, Prozessschritte, CTA-/Kontakttexte und notwendige Medienmetadaten.
5. Preview- und Produktionsunterschiede nur noch über explizite Mode-/Konfigurationsparameter ausdrücken: insbesondere `noindex`, Inquiry-Aktivierung und Preview-Hinweise.
6. Keine Preise, Kontaktdaten, Rechtsangaben, Bildrechte oder Geschäftsregeln erfinden. Extern fehlende Inhalte bleiben den bestehenden Tasks T008/T010/T011 zugeordnet.
7. Bestehende Stage-1-Routing-, Pages-, Frame-, Security- und Performanceverträge während der Migration erhalten.

## Shared-Core-Evidenz — 2026-08-23

- Der erste T046-Slice wurde über PR #6 gemergt: Angebote, Benefits, Prozessschritte und FAQ besitzen nun eine einzige Zod-validierte Wahrheit unter `src/content/`; `src/data/demo.ts` ist nur noch eine temporäre Formprojektion und enthält keine eigenständigen Produkttexte.
- Der zweite Slice stellt `/` und `/demo/` auf denselben `DemoExperience`-Kern. `/` setzt explizit `mode="production"`; `/demo/` und die Rahmenvarianten verwenden weiterhin den fail-closed Preview-Default.
- Preview/Production unterscheiden sich nur noch explizit in Betriebsaspekten: Preview-Bar, `noindex`, Canonical/Structured Data, CSP-`form-action` sowie Inquiry-/Turnstile-Aktivierung. Die inhaltliche Landingpage-Struktur ist gemeinsam.
- `public/_redirects` bleibt unverändert auf dem Stage-1-Vertrag `/ /demo/ 302`; der Pages-Artefakttest pinnt diesen Redirect weiterhin revisionsgebunden und beweist zugleich, dass Source-Root und Preview-Root unterschiedliche Betriebsmodi desselben Kerns bleiben.
- Production-spezifische Consent-/Turnstile-/Feedback-Regeln liegen in `src/styles/inquiry-production.css`; der Preview-/Frame-Vertrag wird dadurch nicht fachlich verändert.
- Required-`verify`-Lauf `32626529351` auf Head `d0e24a629953fae505c9e98f2a51a84f84375a90`: PASS. Enthalten sind Inquiry-/Migration-/Domain-/Gallery-/Form-/Quality-/Demo-/Fundus-/Preview-/Pages-Gates, Astro Check, Build sowie Worker- und Site-Dry-Runs.
- Revisionsgebundene Messwerte des grünen Laufs: Production HTML 23.219 B, CSS 26.601 B, JS 6.779 B, initial gzip 16.653 B; Preview HTML 20.415 B, CSS 26.601 B, JS 0 B, initial gzip 13.275 B. Damit bleibt der Preview-CSS-Vertrag unter 26 KiB und besitzt 2.071 B Abstand zum T042-Hard-Max von 28 KiB; der 20-KiB-gzip-Deckel bleibt deutlich eingehalten.
- Astro Check im gleichen Lauf: 43 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise.
- Noch offen innerhalb T046: `DemoExperience.astro` in sinnvolle gröbere Sektionen zerlegen und den finalen Desktop-/Tablet-/Mobile-Browser-Readback für den konvergierten Root/Preview-Kern dokumentieren. Deshalb bleibt T046 `active`.

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
- [ ] `DemoExperience.astro` ist auf sinnvolle Sektionen bzw. Orchestrierung reduziert.
- [x] `/demo/rahmen/` und seine Einzelvarianten bleiben funktional und vom Landingpage-Refactor isoliert.
- [x] T045 Stage 1 bleibt fail-closed: Preview `noindex`, kein produktiver Demo-Submit, temporärer Root-Redirect unverändert bis Stage 2.
- [x] bestehende Accessibility-, Asset-, Performance- und Security-Invarianten bleiben grün.
- [x] `npm ci` und `npm run verify` PASS.
- [ ] Diff und Browser-Readback für Desktop, Tablet und Mobile revisionsgebunden dokumentiert.

## Folge

T047 darf erst nach T046 beginnen. Der echte Stage-2-Launch bleibt zusätzlich von T008, T010, T011, T045 und den tatsächlichen Produkt-/Rechts-/Providerfreigaben abhängig.
