# T051 – Startseite Redesign V1

Status: active — technisch verifiziert; Preview-Abnahme vor Merge offen

## Ziel

Die bestehende Hall-of-Memory-Landingpage auf der vorhandenen Astro-/Content-Architektur weiterentwickeln, ohne funktionierende Grundlagen neu zu bauen.

## Kundenrichtung

- Marke: Hall of Memory, Claim „Every Star Has a Memory“.
- Hero kurz und direkt; primärer CTA „Unverbindlich anfragen“, sekundär WhatsApp.
- Fotobox, Fotospiegel und Magazinbox sehr früh sichtbar.
- Weniger Schwarz/Gold-Dominanz; größere warme Creme-/Beigeflächen, Champagner-Gold nur als Akzent.
- Keine 1:1-Kopie von Referenzseiten, keine erfundenen Preise/Rabatte/Bewertungen.
- Mobile First und klare Conversion-Wege.

## Scope dieser ersten Iteration

1. Bestehenden Hero und die bestehende Produktsektion visuell in die neue Richtung bringen.
2. Vorhandene Produktdaten mit den vom Kunden gelieferten Kurzbeschreibungen aktualisieren.
3. Bestehende Komponenten und Anfrage-/SEO-/WhatsApp-Grundlagen unverändert weiterverwenden.
4. Noch keine finalen Preise, Pakete, Extras oder Backend-Änderungen einführen.
5. Keine echten Produktfotos erfinden; vorhandene Platzhalter bleiben bis Kundenfotos vorliegen.

## Verifikation

- Änderung nur auf eigenem Branch.
- Pull Request gegen `main`.
- Bestehenden `verify`-Check abwarten.
- Preview vor Merge prüfen.

## Scope-Korrektur und Evidence – 29.08.2026

PR #37 wurde vor der Abnahme gegen diesen Vertrag geprüft. Dabei wurden erfundene Paketnamen/Extras, ein Pseudo-Konfigurator und versteckte Ersatzsektionen gefunden und entfernt.

Der korrigierte Stand:

- zeigt Fotobox, Fotospiegel und Magazinbox wieder sichtbar direkt nach dem Hero;
- hält Pakete und Preise ausdrücklich bis zur Kundenfreigabe offen;
- zeigt Galerie, Ablauf und Kundenbereich als echte sichtbare Abschnitte statt als versteckte Testattrappen;
- verwendet keine erfundenen Produktbilder;
- grenzt das Startseiten-Redesign von `/demo/rahmen/*` ab, damit der Rahmenvergleich seinen eigenen Darstellungsvertrag behält;
- entfernt die ungenutzten Stilschichten `redesign-v3.css` und `demo-visual-contract.css`;
- behebt den 390-px-Horizontal-Overflow ursächlich; der Browser-Test bleibt auch ohne globale Overflow-Maskierung grün.

Finale lokale Evidence auf dem korrigierten Stand:

- `npm run verify`: PASS;
- Sales-/Content-Vertrag: PASS, `html=17611`, `css=25218`, `js=0`, `gzip=12965`;
- Visual Regression: PASS für Desktop, Tablet und 390-px-Mobile, sechs Screenshots, kontrollierter Negativtest erkannt;
- Rahmenvariante 10: PASS;
- Fundus-Corner-Vertrag: PASS;
- Preview-Base-/GitHub-Pages-Artefakt: PASS;
- `astro check`: 0 Fehler, 0 Warnungen, 0 Hinweise;
- Worker- und Site-Deployment-Dry-Run: PASS;
- Scope-Audit: keine verbliebenen erfundenen Paket-/Extra-Begriffe oder toten Redesign-Imports.

Offen bleibt bewusst die visuelle Preview-Abnahme von PR #37 vor dem Merge.