# T040 — Customer Preview Conversion Polish

Status: done
Datum: 2026-08-14

## Ziel

Die private `/demo/`-Preview soll sich wie die spätere Hall-of-Memory-Website lesen und nicht wie eine interne Entwicklungsansicht. Bereits bestätigte Kundenwünsche bleiben vollständig sichtbar; fehlende Kundendaten werden nicht erfunden. Der Rahmenvergleich unter `/demo/rahmen/` bleibt ein separater Entscheidungsraum.

## Umgesetzt

- interne Projekt-/Implementierungssprache aus Hero, Angeboten, Paketen, Galerie, Anfrage und Kontakt entfernt; Preview-Hinweise in der oberen Designpreview-Leiste konzentriert
- `Mehr erfahren` von `Jetzt anfragen` semantisch getrennt: jedes Angebot besitzt nun einen eigenen aufklappbaren Detailbereich; nur der Anfrage-CTA springt zum Formular und übernimmt die Produktauswahl
- Paketbereich auf einen glaubwürdigen, nicht erfundenen Beratungs-/Vergleichszustand reduziert statt drei scheinbar fertige Paketkarten ohne bestätigte Preise zu zeigen
- Galerie textlich von einem Layout-/Asset-Platzhalter zu einer kundenorientierten Eventgalerie-Vorschau umgestellt, ohne synthetische Bilder als echte Kundenfotos auszugeben
- Kundenbereich verständlicher formuliert und mit einem kleinen aufklappbaren Beispielablauf für den persönlichen Galeriezugang ergänzt
- mobile Hauptnavigation bei <=860 px bleibt vollständig erreichbar; eine beim ersten öffentlichen Readback entdeckte CSS-Spezifitätsregression wurde in `834144c114c8038dce9c8e7adc13d48ff9f14748` korrigiert und regressionsgesichert
- `/demo/` übernimmt keine noch nicht ausgewählte Rahmenvariante mehr; der neutrale vorhandene Hero-Rahmen bleibt bis zur Kundenauswahl bestehen; `/demo/rahmen/1..6/` bleibt unverändert der Variantenvergleich
- externe Lücken weiterhin fail-closed: keine erfundenen Preise, Pakete, WhatsApp-Nummer, Betreiberangaben oder echten Produktfotos
- GitHub-Pages-Unterpfade wurden in T041 quellseitig über `BASE_URL` abgesichert; kein nachträglicher Mirror-Rewrite erforderlich
- das bestehende harte 28-KiB-CSS-Maximum wurde nicht gelockert

## Externe Restpunkte

Diese Punkte sind nicht durch UI-Polish sinnvoll lösbar und bleiben in den bestehenden Tasks T006/T007/T008/T009/T010/T025/T011: echte Produkt-/Eventbilder, konkrete Pakete und Preise, WhatsApp-Businessnummer, Betreiber-/Domain-/Kontaktangaben, finaler Selbstpflege-Workflow sowie der produktive private Galerieablauf inklusive Aufbewahrung/Downloadregeln.

## Validierung

- Implementierungs-Commit: `01c9e305fe495e2a1713c91ce350c474537c910b`
- Base-Path-Härtung: `cf416a8c682b4f89307e6f546ec2951bd5bbca30`
- finaler Mobile-Spezifitätsfix: `834144c114c8038dce9c8e7adc13d48ff9f14748`
- finaler lokaler Validierungslauf `60e289c15df143fe9eee2f3e`: `npm run test:demo`, `npm run test:preview-base`, `npm run check`, `npm run build` und `git diff --check` PASS; Astro-Check 37 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise
- finale Demo-Budgets: HTML 20.253 B, CSS 28.653 B, JS 1.057 B, initial 14.159 B gzip; das 28-KiB-CSS-Limit von 28.672 B bleibt eingehalten
- finaler Preview-Base-Build: 30 Dateien, `bad_root_refs=0`, Regression-Tree `35270b8196a7f71ed7e38c05901f998e51c3079ac956bb9060964276ba903ac5`
- finaler öffentlicher Mirror-Commit: `11d2ccc5748812c8162abfccabdd8192ab03f406`; ausgelieferter Baum `f62a29d8010034c407d70bff8e113f7d4a023e8d9f1a00c82d832a603a1729c7`
- öffentliches Manifest bestätigt exakt Source `834144c114c8038dce9c8e7adc13d48ff9f14748`, finalen Baum und `mobile_nav_specificity_fix=true`; Readback-Task `cff0224fb05643359d9ce16f`, Receipt `d6493aa9dbef68d0668957467900f46ee253cf35f060ad08a2b30a478f5c6599`
- neun öffentliche Kernartefakte sind HTTP 200 und byteidentisch zum final validierten Unterpfad-Build, einschließlich `/demo/`, Rahmenübersicht, V1/V6, CSS, Skripte, Logo und Beispiel-Eventfoto
- finaler öffentlicher Chrome-CDP-Readback bei exakt 390×844: `bodyScrollWidth=390`, `docScrollWidth=390`; alle fünf Navigationsziele berechnet sichtbar (`display:flex`), drei `Mehr erfahren`-Bereiche, drei direkte Produkt-Anfrage-CTAs; nach Scroll alle vier Bilder vollständig geladen und alle lokalen Pfade unter `/hall-of-memory-preview/`; Task `518a975366fc49ab90bcb1e4`, Receipt `d03e19143f1b3fff80efe6086047e694a6f3b4b084fe3df1be036c6a94e5ec94`
- isolierter Browser-Worker nach Readback gestoppt und Profil-/Port-Leases freigegeben

## Restbefund

Die CSS-Reserve beträgt nach dem finalen Mobile-Fix nur noch 19 Byte unter dem bestehenden 28-KiB-Maximum. Das ist kein aktueller Auslieferungsfehler, aber erneut zu wenig Wartungsreserve. Die eigenständige Folgearbeit ist unter T042 registriert; das Budget wurde für diesen Closeout bewusst nicht aufgeweicht.

Hinweis: Die Build-Hinweise zu leeren `packages`, `faqs` und `gallery` sind erwartete externe Inhaltslücken und entsprechen den bestehenden blockierten Kundenzulieferungen; sie sind keine neuen Codefehler.
