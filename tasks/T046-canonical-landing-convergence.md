---
id: T046
status: planned
priority: P0
dependencies: [T038]
---
# Kanonische Landingpage: Demo und Produktion konvergieren

## Ziel

Die gestalterisch reife `/demo/`-Website und die technische Produktionsseite `/` werden auf einen gemeinsamen Landingpage-Kern und ein gemeinsames validiertes Contentmodell gestellt. Preview und Produktion dürfen unterschiedliche Betriebsmodi besitzen, aber keine zweite Produkt-, Text- oder Seitenwahrheit mehr pflegen.

T046 beginnt erst, wenn T038 seine noch offene Rahmen-/Kundenabnahme abgeschlossen oder die verbleibende Rahmenarbeit klar von der Landingpage entkoppelt hat. Dadurch wird `DemoExperience.astro` nicht parallel von zwei Schreib-Lanes umgebaut.

## Ausgangsbefund

- `src/pages/index.astro` verwendet das kanonische Contentmodell, bildet aber noch den technischeren Scaffold-/Entwurfsstand ab.
- `/demo/` rendert `DemoExperience.astro`, das den kundennahen Designstand enthält, aber eigene Demo-Daten und umfangreiche Frame-/Layoutlogik mitführt.
- `DemoExperience.astro` bündelt Hero, Angebote, Benefits, Pakete, Galerie, Ablauf, Kundenbereich, Anfrage, FAQ/Kontakt und Rahmenlogik in einer großen Komponente.
- Der Stage-1-Vertrag aus T045 bleibt während T046 unverändert: `/` darf auf Cloudflare weiter per temporärem `302` nach `/demo/` führen; `/demo/` bleibt `noindex` und das Anfrageformular bleibt fail-closed.

## Umsetzung

1. Einen gemeinsamen Landingpage-Kern einführen, der von `/` und `/demo/` verwendet werden kann.
2. `DemoExperience.astro` entlang sinnvoller Seitensektionen zerlegen, ohne kleinteilige Komponentenexplosion.
3. Frame-Consumer-/Vergleichslogik aus der allgemeinen Landingpage-Struktur lösen; `/demo/rahmen/` bleibt isoliertes Designwerkzeug.
4. Das Zod-validierte Contentmodell so erweitern, dass die akzeptierte Demo-Struktur ohne parallele `src/data/demo`-Geschäftswahrheit darstellbar ist. Mindestens prüfen: Highlights, Detailtexte, Benefits, Prozessschritte, CTA-/Kontakttexte und notwendige Medienmetadaten.
5. Preview- und Produktionsunterschiede nur noch über explizite Mode-/Konfigurationsparameter ausdrücken: insbesondere `noindex`, Inquiry-Aktivierung und Preview-Hinweise.
6. Keine Preise, Kontaktdaten, Rechtsangaben, Bildrechte oder Geschäftsregeln erfinden. Extern fehlende Inhalte bleiben den bestehenden Tasks T008/T010/T011 zugeordnet.
7. Bestehende Stage-1-Routing-, Pages-, Frame-, Security- und Performanceverträge während der Migration erhalten.

## Nicht-Ziel

- kein Cloudflare-/DNS-Cutover;
- keine Aktivierung echter Anfragen;
- keine neue Buchungsengine;
- keine CMS-Einführung;
- keine neue Rahmenrunde;
- keine generelle Frameworkmigration.

## Akzeptanz

- [ ] `/` und `/demo/` verwenden denselben Landingpage-Seitenkern.
- [ ] Preview-/Produktionsunterschiede sind explizite Konfiguration, keine duplizierte Seitengeschäftslogik.
- [ ] Produkt-/Landingtexte besitzen keine zweite kanonische Wahrheit in `src/data/demo`.
- [ ] `DemoExperience.astro` ist auf sinnvolle Sektionen bzw. Orchestrierung reduziert.
- [ ] `/demo/rahmen/` und seine Einzelvarianten bleiben funktional und vom Landingpage-Refactor isoliert.
- [ ] T045 Stage 1 bleibt fail-closed: Preview `noindex`, kein produktiver Demo-Submit, temporärer Root-Redirect unverändert bis Stage 2.
- [ ] bestehende Accessibility-, Asset-, Performance- und Security-Invarianten bleiben grün.
- [ ] `npm ci` und `npm run verify` PASS.
- [ ] Diff und Browser-Readback für Desktop, Tablet und Mobile revisionsgebunden dokumentiert.

## Folge

T047 darf erst nach T046 beginnen. Der echte Stage-2-Launch bleibt zusätzlich von T008, T010, T011, T045 und den tatsächlichen Produkt-/Rechts-/Providerfreigaben abhängig.
