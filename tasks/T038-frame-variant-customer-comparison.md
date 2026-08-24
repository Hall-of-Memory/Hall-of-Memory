# T038 — Frame-Variant Customer Comparison

Status: active
Abhängigkeit: keine aktive; T037 war der historische Pilot und ist inzwischen superseded/cancelled

## Ziel

Sechs inhaltlich identische Demo-Varianten unter `/demo/rahmen/1/` bis `/demo/rahmen/6/` bereitstellen und unter `/demo/rahmen/` eine neutrale Rahmenauswahl anbieten. Die Übersicht zeigt bewusst nur die Rahmen selbst: kein Beispielbild und keine Bildlagen-/Zusatzkasten-Steuerung. Auf den Einzelvariantenseiten wird die Bildgröße nun stufenlos zwischen der inneren und äußeren Rahmenlinie eingestellt; der frühere Zusatzkasten ist aus der Kundensteuerung entfernt. V6 verwendet den am 14.08.2026 in Google Drive bereitgestellten Ersatzrahmen als vollständige, transparente Rahmenquelle; die frühere Vier-Ecken-Sonderkonstruktion ist entfernt und der Bildmittelpunkt bleibt frei. V1 bis V5 erhalten zusätzlich eine statische, physisch plausible Tiefenfassung als gewölbte Gold-Metallprofile mit einer gemeinsamen Lichtquelle oben links; V1/V2 sind bewusst stärker ausgeprägt, V3–V5 zurückhaltender. V6 behält die eigene Licht- und Materialmodellierung des floralen Masters und wird nicht durch den linearen Bevel-Consumer gezwungen. `/demo/` selbst wird vor der Kundenauswahl nicht umgestellt.

## Quelle und Zuordnung

`frames.zip` SHA-256: `b40bc684bde8dd0bbab7b5b72806dbb6af6ab349a763aebdb865c030f2263811`.

- V1: `hall-of-memory.stellar-frame.01`, bestehender T037-Kandidat.
- V2: `.02`, Source `dcbbd40a83a96cb52be6f7f28a7b176f25b8606b8566358642462fe5eff559a5`, Raster-Build `18e05a8e583f0cf023d9b6f12e1c3fdff3bfa5602b3533d30494122f6246b5b0`.
- V3: `.03`, Source `6bbc65014245563eb3161b7b0422eaeb76f633fb77ca4a35db50870d6321a01f`, Alpha-Mask-Build `9f1ae5ed2349365adc6cf5ff3e666edc31cf4826202e5e86cbcf64baab7ea72d`.
- V4: `.04`, Source `1f80f65c0bb1d636c494be72819d91aebcebcf51a293408f919dc00dee7bd864`, Raster-Build `af5f16e5df0dc264b4ac5754aebd5cccecee301fbd917ea4e5cd4296862bcd2f`.
- V5: `.05`, Source `f95b62f18939cd4400bdd115a5e5542b87326be2df63b989ba5b103afe33889f`, Alpha-Mask-Build `fc3d7ce3b4e19772240e14d025232488d39a3a6c90915b622d0541ca2fa039aa`.
- V6: Ersatzquelle `hall of memory/floraler rahmen`, PNG 1254×1254 RGB, SHA-256 `dc11a118ca661f932a93b6c0b292ab13bf5be6ff9c5d5522b2edb78fee43c045`. Die Quelle besitzt schwarzen Hintergrund und eigene Gold-/Lichtmodellierung. Für den Browser wird daraus deterministisch eine RGBA-Ableitung erzeugt: RGB bleibt aus der Quelle erhalten; die Graustufenhelligkeit wird mit `level 1%,42%` als Alphakanal verwendet. Consumer: `public/fundus/hall-of-memory-botanical-frame-06.png`, SHA-256 `9a961aff9e1987b9802a3e5a453c3b8edbe4e516ff2ee8f9c3f11e49c6e7481e`. Das zentrale 40%-Quadrat besitzt danach exakt Alpha 0; der Rahmen kann die Bildmitte nicht überdecken.

## Eventfoto

Das bestehende Eventfoto bleibt unverändert auf `/demo/` und den sechs Einzelvariantenseiten in Verwendung. Auf der Rahmenauswahl `/demo/rahmen/` wird es bewusst nicht gerendert:

- Drive-Bild-ID: `1Fw0VAOeNHH8-nuBP2i7VWjUfW7ulkcVS`
- Original: PNG, 1122×1402, 3.487.151 Byte, SHA-256 `8d70b3d40303742bd658c64a49485821efd530d2a0b86d4a931fa27635a4e775`
- Web-Ableitung: `public/demo/hall-of-memory-example-event.webp`, 1122×1402, SHA-256 `528fbcd86c497faf759ac54316b360931ed2e2569c1a143ceac8629021a58e23`

Der frühere Logo-/Placeholder-Hinweis bleibt entfernt.

## Consumer-Korrektur 14.08.2026

### V6 floral — Ersatzmodell 14.08.2026

Die frühere V6-Quelle und die daraus notwendige Vier-Ecken-Sonderkonstruktion sind superseded. Der neue Drive-Master ist bereits als vollständiger Randrahmen gestaltet und besitzt eine freie Mitte. Deshalb rendert `data-frame-kind="floral-source"` die transparente Web-Ableitung direkt über `background-image`; es gibt weder `.demo-floral-frame` noch vier Corner-Crops. Die eigene Gold-, Licht- und Schattierungsinformation des Masters bleibt erhalten.

Quellprüfung: Im RGB-Master ist das zentrale 40%-Quadrat praktisch schwarz (Maximalwert 1/255). Nach der Alpha-Ableitung ist dieses Quadrat vollständig transparent (`center_alpha_max=0`, `center_nonzero_ratio=0`). Rund 18,94% der Gesamtfläche besitzen Alpha > 0; 5,85% sind voll deckend. Damit ist der Rahmen sichtbar, ohne die Bildmitte zu belegen. Die sichtbare Quellgeometrie reicht bei 99,5% der nichtschwarzen Pixel höchstens rund 16,59% von einer Außenkante nach innen; daraus folgt die konservative V6-Innenkalibrierung 17%.

### V1/V2 — räumliche Materialfassung

V1 und V2 erhalten bewusst ohne zusätzliche JavaScript-Bewegung eine stärkere räumliche Fassung. Der bestehende Rahmenmaster bleibt die Geometrieautorität; der Consumer ergänzt lediglich Material- und Lichtwirkung:

- differenzierter Altgold-/Champagner-Verlauf statt gleichförmiger Goldfläche;
- V1 mit kräftigerem, V2 mit zurückhaltenderem Relief-/Drop-Shadow-Profil;
- eine schmale innere Kehle samt Kontakt-/Ambient-Occlusion-Schatten folgt über `--demo-photo-inset` stufenlos der aktuellen Bildgröße;
- eine sehr schwache Lichtreflex-/Glasebene liegt an der Bildkante, ohne eine sichtbare Glasscheibe zu simulieren;
- das Foto erhält nur eine kleine lokale Tiefenstaffelung;
- keine Parallaxe, kein Pointer-Tilt und keine laufende Animation: die zusätzliche Immersion bleibt statisch, performant und vergleichbar.

### Frühere Zwei Bildlagen — superseded

Default ist `Innenlinie`. Das Foto wird pro Rahmen so weit eingerückt, dass es innerhalb der inneren Rahmenzone endet. Die Kalibrierung verwendet die vorhandenen Maskengeometrien; V2–V5 wurden aus den Alpha-Randhüllen abgeleitet, V1 und V6 sind konservativ auf den Consumer kalibriert:

- V1: 9% Inset
- V2: 11%
- V3: 15,5%
- V4: 12,25%
- V5: 16,25%
- V6: 12%

`Bis Außenlinie` setzt den Foto-Inset auf 0 und die Bildgröße auf 100%. Der Modus wird als `?bild=full` geführt; ohne Parameter gilt `Innenlinie`. Diese Steuerung existiert nur auf den Einzelvariantenseiten; die neutrale Übersicht `/demo/rahmen/` zeigt keine Bildlage und keinen Modusschalter.

### Früherer Zusatzkasten — aus Kundensteuerung entfernt

Die frühere äußere `border`-/`box-shadow`-Fassung konkurriert auf den Einzelvariantenseiten nicht mehr implizit mit dem Rahmen. Sie ist dort explizit sekundär und standardmäßig aus (`Zusatzkasten: aus`). Nur bei `?kasten=an` werden Border und Shadow zugeschaltet. Bildmodus und Zusatzkasten sind dort unabhängig kombinierbar. Auf der Übersicht gibt es keinen Zusatzkasten-Schalter.

### Stufenlose Bildgröße

Die binäre Umschaltung `Innenlinie` / `Bis Außenlinie` war semantisch zu grob und koppelte `Bis Außenlinie` fälschlich an die Hero-Außenkante. Sie ist ersetzt durch einen einzigen Range-Slider `Bildgröße` (`0..100`, Schritt 1). Der Rahmen bleibt unverändert; nur das Foto wächst bzw. schrumpft zentriert darunter.

Die Endpunkte sind pro Rahmen auf die vorhandene Liniengeometrie kalibriert: `0` entspricht der bisherigen sicheren inneren Bildlage, `100` reicht bis ungefähr zur äußeren dekorativen Linie, aber **nicht** bis zur Außenkante der Hero-Fläche. Kalibrierung inner → außen: V1 9% → 5%, V2 11% → 4%, V3 15,5% → 6%, V4 12,25% → 3%, V5 16,25% → 6%, V6 17% → 5%. Der Default liegt jeweils mittig bei Sliderwert 50.

Die Auswahl ist teilbar: nach Änderung wird `?bildgroesse=<0..100>` geschrieben. Alte `?bild=inner|full`-Links werden beim Laden in Slider-Endpunkte überführt. `?kasten=an` wird entfernt; ein zusätzlicher Außenkasten ist kein Kundenparameter mehr.

### Pfadauflösung

Alle Rahmenmasken werden nun aus `import.meta.env.BASE_URL` plus `fundus/...` gebildet. Lokal ergibt das `/fundus/...`; der GitHub-Pages-Build erzeugt `/hall-of-memory-preview/fundus/...`. Das ist absichtlich absolut zur jeweiligen Deployment-Basis: Ein externer Browser-Readback zeigte, dass relative Custom-Property-URLs der Übersicht beim Verbrauch aus dem kompilierten Stylesheet gegen `/_astro/` statt gegen die Dokumentroute aufgelöst werden können. Der BASE_URL-Vertrag beseitigt diese CSS-Origin-Mehrdeutigkeit für Übersicht und Einzelvarianten gleichermaßen.


## Übersichtskorrektur 14.08.2026

Auf Nutzerfeedback wurde die Rahmenauswahl `/demo/rahmen/` auf ihre eigentliche Aufgabe reduziert:

- Bildlage-Schalter `Innenlinie` / `Bis Außenlinie` entfernt;
- Zusatzkasten-Schalter entfernt;
- `frame-comparison.js` wird auf der Übersicht nicht mehr geladen;
- das Beispiel-Eventfoto wird auf der Übersicht nicht gerendert;
- alle sechs Karten zeigen nur den jeweiligen Rahmen auf neutralem dunklem Grund;
- die Einzelvariantenseiten `/demo/rahmen/1/` bis `/6/` behielten in dieser Zwischenstufe Eventfoto, Bildlagen und optionalen Zusatzkasten; diese Detailsteuerung wurde anschließend durch die stufenlose Bildgröße ersetzt.

## Lokale Validierung

- [x] Slider-Finaltest `npm run test:demo --silent -- --slider-final` PASS; alle sechs Einzelvarianten besitzen genau den Range-Controller `Bildgröße` 0–100 und kein `Innenlinie`-/`Bis Außenlinie`-/`Zusatzkasten`-UI; Übersicht bleibt ohne Foto und ohne Controls
- [x] Slider-Finalcheck `npm run check --silent -- --slider-final` PASS: 36 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise
- [x] Slider-Finalbuild PASS: 11 statische Seiten
- [x] lokaler Browser-Readback V1: Default 50 = 7% Inset, Slider 0 = 9% / 82% Bildgröße, Slider 100 = 5% / 90%; URL wird als `?bildgroesse=0|100` geschrieben; alte `?bild=full&kasten=an`-URL wird zu `?bildgroesse=100` normalisiert und erzeugt keinen Zusatzkasten
- [x] früherer lokaler Browser-Readback V1–V6 vor V6-Ersatz: Insets 9→5 / 11→4 / 15,5→6 / 12,25→3 / 16,25→6 / 12→5 Prozent; V6-Corner-Consumer durch den Ersatzmaster superseded
- [x] Mobile 390×844: 0 px horizontaler Overflow; Sliderleiste liegt vollständig im Viewport, nutzbare Range-Breite rund 215 px
- [x] Übersichtskorrektur: `npm run test:demo` PASS, Receipt `grabowski-job-b10a44aff890`; Test erzwingt 0 Bildlage-/Zusatzkasten-Controls und 0 Eventfoto-Images auf `/demo/rahmen/`, zugleich Eventfoto + Controls auf allen sechs Einzelvarianten
- [x] Übersichtskorrektur: `astro check` PASS, Receipt `grabowski-job-439f9305f882`, 36 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise
- [x] Übersichtskorrektur: `astro build` PASS, Receipt `grabowski-job-428f1a96d224`, 11 statische Seiten
- [x] früherer lokaler HTTP-Readback vor Slider-/V6-Ersatz `http://127.0.0.1:4339/demo/rahmen/`: damaliger Zustand belegt; Detailsteuerung und V6-Corner-Consumer sind inzwischen superseded
- [x] finaler `astro build` PASS nach BASE_URL-Fix, Receipt `grabowski-job-f7b285d955cf`
- [x] finaler fokussierter Demo-Test PASS, `grabowski-job-58603a6e5a49`; Demo-Budget unverändert bei HTML 20.886 Byte, CSS 28.087 Byte, JS 1.057 Byte, gzip 14.190 Byte
- [x] finaler `astro check` PASS, `grabowski-job-c9c7002a5daf`
- [x] separater GitHub-Pages-Build mit Base `/hall-of-memory-preview` PASS, `grabowski-job-203eb9e8f66e`
- [x] lokale Review-Preview: `http://127.0.0.1:4339/demo/rahmen/`
- [x] Desktop-Browsermatrix V1–V6: Innenmodus-Bildbreite relativ zum Hero 0,817 / 0,777 / 0,688 / 0,752 / 0,673 / 0,757; Full-Bleed jeweils 0,997; damit sichtbar unterschiedliche Modi
- [x] früherer V6-Corner-Consumer: superseded durch Ersatzmaster; dessen zentraler 40%-Bereich ist in der aktuellen Web-Ableitung exakt transparent
- [x] Desktop: 0 px horizontaler Overflow auf Übersicht und allen Einzelvarianten
- [x] Mobile 390×844: V6 Innenmodus aktiv, zentraler Corner-Box-Hit 0, 0 px horizontaler Overflow; Übersicht 390 px Layoutbreite bei 390 px Viewport
- [x] Zusatzkasten Default `off`; explizites Einschalten erzeugt `?kasten=an` und stellt Border/Shadow getrennt wieder her
- [x] `noindex,nofollow` lokal auf Übersicht und Einzelvarianten bestätigt
- [x] frühere GitHub-Pages-Iteration publiziert und extern readbackt: Source `bcd219983cf27233634e694f68c4943c8105e8a7`, Preview `e575bd88a58747f5e504670b504a0ad51334dc91`, Pages-Buildstatus `built`; durch die spätere Übersichtskorrektur superseded
- [x] früherer öffentlicher Vergleich vor Übersichtskorrektur: `https://alexdermohr.github.io/hall-of-memory-preview/demo/rahmen/` HTTP 200, sechs Karten, beide Bildmodi, Zusatzkasten default `off`, `noindex,nofollow`; dieser Zustand ist superseded
- [x] frühere öffentliche V6 vor Slider-Korrektur: `https://alexdermohr.github.io/hall-of-memory-preview/demo/rahmen/6/` HTTP 200; damaliger Innen-/Full-Bleed-Vergleich extern belegt; V6-Corner-Consumer und Masterpfad korrekt; Detailsteuerung inzwischen superseded
- [x] externer Mobil-Readback 390×844: V6 und Übersicht ohne horizontalen Overflow; V6-Masterpfad korrekt; `noindex,nofollow` erhalten
- [x] GitHub-Pages-Base-Build der Übersichtskorrektur PASS, Receipt `grabowski-job-2210835c1bd4`, Base `/hall-of-memory-preview`, 11 statische Seiten
- [x] Preview-Publikation/Validierung PASS, Receipt `grabowski-job-ea1be5ba6f7d`: 31 generierte Dateien, `bad_root_refs=0`, Übersicht ohne Foto/Controls, Detailseiten mit Foto/Controls, Published-Tree `793168b959bcd81ec04de857f574552ba3b7fce4cdd0d0c5a60be0985a6ea25c`
- [x] frühere GitHub-Pages-Publikation der Übersichtskorrektur: Source `ce995d096f635f295b77c3e976217de52a880fbd`, Preview `1a6e80258fc94b9269715a55c66dd3a0ed5aedf9`, Pages-Buildstatus `built`; durch Slider-Korrektur superseded
- [x] früherer externer HTTP-Readback der Übersichtskorrektur: Übersicht ohne Foto/Controls und `noindex,nofollow`; Detailseiten damals noch mit binären Bildlagen/Zusatzkasten; durch Slider-Korrektur superseded
- [x] erster Preview-Commit `b61532c496db68b4c342317f98a57f8a1189c96f` wurde nach externem Readback verworfen/superseded, weil die V6-Maske der Übersicht CSS-relativ außerhalb des Pages-Unterpfads auflöste; `e575bd88…` schließt diesen Befund über `BASE_URL`
- [x] Slider-GitHub-Pages-Base-Build von Source `f8ac00c787c9f8595accc00727545aaf768a302c` PASS: Base `/hall-of-memory-preview`, 11 statische Seiten
- [x] Slider-Preview-Mirror validiert: 31 generierte Dateien, `bad_root_refs=0`, Published-Tree `b996fed3e6ab1452782bc3812d4c26e3336520c6bd20456911b4ef2925dea5f8`; Übersicht ohne Foto/Controls, Detailseiten mit Eventfoto + Slider, kein Zusatzkasten-Control
- [x] aktuelle GitHub-Pages-Publikation: Source `f8ac00c787c9f8595accc00727545aaf768a302c`, Preview `d5f0d261d19c03ad8931e6019ebd75f480e6a993`, manuell angestoßener Pages-Build exakt auf diesem Preview-Commit `built`
- [x] aktueller externer Browser-Readback: V1 `?bildgroesse=0` = 9% Inset, `?bildgroesse=100` = 5% Inset; V6 bei 100 = 5% Inset und Eventfoto/Corners bleiben erhalten; keine alten Bildlage-/Zusatzkasten-Controls; `noindex,nofollow` überall
- [x] aktueller externer Mobil-Readback 390×844: 0 px horizontaler Overflow, Sliderbreite rund 215 px und vollständig im Viewport; Übersicht weiterhin exakt sechs Rahmenkarten, kein Beispielbild und kein Slider
- [ ] Kundenauswahl Variante 1–6; Bildgröße anschließend auf der gewählten Einzelvariantenseite stufenlos festlegen

T038 bleibt bis zur Kundenauswahl `active`.

## V6-Ersatz + V1/V2-Tiefenfassung — Validierung 14.08.2026

- [x] Drive-Quelle `floraler rahmen`: PNG 1254×1254 RGB, SHA-256 `dc11a118ca661f932a93b6c0b292ab13bf5be6ff9c5d5522b2edb78fee43c045`.
- [x] transparente Consumer-Ableitung: 1254×1254 RGBA, SHA-256 `9a961aff9e1987b9802a3e5a453c3b8edbe4e516ff2ee8f9c3f11e49c6e7481e`; zentrales 40%-Quadrat Alpha max 0 / Nonzero-Ratio 0.
- [x] V6-Sondermarkup entfernt: kein `.demo-floral-frame`, kein `.frame-comparison-floral`; Einzelansicht und Übersicht konsumieren `floral-source` direkt.
- [x] V6-Slider neu auf 17% → 5% kalibriert; V1/V2 bestehende Kalibrierungen 9% → 5% bzw. 11% → 4% bleiben erhalten.
- [x] V1/V2-Tiefenfassung implementiert: differenzierte Materialprofile, Rahmenkörper-Schatten, dynamische Innenkehle/Kontaktschatten und subtile Lichtreflexion; keine zusätzliche JavaScript-Animation.
- [x] fokussierter Demo-Test PASS: `grabowski-job-0e4e6c8d98c1`, Finalization Receipt `77c1d997c6890e2186e2776a103f58f11647c7eeba3bf21e8e0b9ae120ba9710`.
- [x] `astro check` PASS: `grabowski-job-344a56e6c06e`, Finalization Receipt `8c05159831b6edc2353fd6677aa452b645f9c44dffb4f9748199712a99f19efe`.
- [x] `astro build` PASS: `grabowski-job-693f8fb3c416`, Finalization Receipt `42d4d7f542d25b5d0838b924a4446a0249d9b2993b54bd609ec919b865113d87`.

## Öffentlicher Readback — V6-Ersatz / V1-V2-Tiefe

- [x] GitHub-Pages-Mirror Commit `e0dbe89fab987c37a4a5cf90b6bd4b0e7010b610` erfolgreich gebaut; Pages-Build Status `built` für genau diesen Commit.
- [x] öffentliches Manifest liefert Source `a8ee19f01e03e09f214712c2781c271eb17fe073`, 31 generierte Dateien, `bad_root_refs=0`, Published-Tree `cdb04e72d986f972842e8d63756e1b2b8af52ae0facbe69007a6f26abed37b95`.
- [x] externer HTTP-Readback: `/demo/rahmen/`, `/1/`, `/2/`, `/6/` jeweils HTTP 200; Übersicht ohne Eventfoto/Slider; V1/V2 mit Tiefenprofil; V6 mit `floral-source`, ohne `.demo-floral-frame`, Insets 17% → 5%.
- [x] öffentlich ausgeliefertes V6-Consumer-PNG HTTP 200, SHA-256 `9a961aff9e1987b9802a3e5a453c3b8edbe4e516ff2ee8f9c3f11e49c6e7481e`.

## Gewölbte 3D-Metallprofile — Umsetzung und Readback 14.08.2026

### Varianten und Lichtmodell

Die linearen/geometrischen Varianten V1–V5 verwenden nun denselben statischen Reliefvertrag. V1 und V2 tragen das Profil sichtbar stärker; V3–V5 verwenden dieselbe Physik in reduzierter Stärke, damit deren feinere Geometrie nicht überladen wird. V6 bleibt bewusst außerhalb dieses Stacks, weil der florale Ersatzmaster bereits eine eigene Gold-, Licht- und Schattierungsinformation besitzt.

Die gedachte Lichtquelle liegt für den gesamten linearen Rahmen **oben links**. Daraus folgen in jeder Maskengeometrie dieselben Richtungen:

- Highlightkante nach oben links (negative X-/Y-Verschiebung);
- warmer Goldkörper als mehrstufiger Materialverlauf;
- dunkle Gegenkante nach unten rechts (positive X-/Y-Verschiebung);
- weiter nach unten rechts versetzte, weichere Kontaktverschattung zum Foto;
- die Fotoebene liegt über eine kleine Innenkehle/Einzug optisch etwas zurückgesetzt.

Consumer-Prinzip: dieselbe Alpha-Maske wird als vier deckungsgleiche Layer konsumiert (`contact`, `shadow`, `highlight`, `body`). Die Reliefwirkung entsteht aus kleinen gegensinnigen Versätzen der **gleichen Geometrie**, nicht aus einem bloß stärkeren Drop-Shadow. Dadurch erhalten auch Kreise, Sterne, Doppellinien und Ecken sichtbare Profilkanten, ohne den Rahmenmaster neu zu zeichnen. Es gibt weiterhin keine Pointer-Tilt-, Parallax- oder Animationsabhängigkeit.

Profilstärken Desktop:

- V1: Highlight `-1,35/-1,35 px`, Gegenkante `+1,35/+1,35 px`, Kontakt `+3/+3,6 px`;
- V2: Highlight `-1,15/-1,15 px`, Gegenkante `+1,15/+1,15 px`, Kontakt `+2,7/+3,2 px`;
- V3–V5: Highlight `-0,9/-0,9 px`, Gegenkante `+0,9/+0,9 px`, Kontakt `+2,2/+2,7 px`;
- Mobile reduziert nur den weiter außen liegenden Kontaktschatten auf `+2/+2,4 px`; die Licht-/Schattenrichtung des Profils bleibt unverändert.

### Validierungsbelege

- [x] Implementierungs-Source `829417f6b294c01af65597aea7629bd09e71aa17` (`feat(demo): sculpt frame metal profiles`).
- [x] `npm run test:demo` PASS, `grabowski-job-1322b45b4719`, Finalization Receipt `0489cbd35ba634d9bcafe888b86ba33434b379234a6f0bf34b2a05d9305e5156`. Die Regressionstests erzwingen je einen vierlagigen Metallprofil-Stack auf V1–V5 und explizit keinen linearen Stack auf V6; die Übersicht erzwingt exakt fünf Metallprofile.
- [x] `astro check` PASS: 36 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise.
- [x] `astro build` PASS: 11 statische Seiten.
- [x] `git diff --check` PASS.
- [x] lokaler HTTP-Readback auf reserviertem Port 4340: `/demo/rahmen/` und `/demo/rahmen/1/` bis `/6/` jeweils HTTP 200; fremde laufende Preview-Prozesse blieben unberührt.
- [x] lokaler CDP-Readback Desktop: V1/V2 berechnen exakt die oben dokumentierten Highlight-/Gegenkanten-/Kontaktversätze; V3–V5 jeweils `±0,9 px` plus `+2,2/+2,7 px` Kontakt. Übersicht enthält fünf Metallprofil-Stacks, V6 keinen.
- [x] lokaler CDP-Readback Mobile 390×844: V1/V2 ohne horizontalen Overflow (`bodyScrollWidth=390`), Metallprofil und Bildgrößen-Slider bleiben im mobilen Consumer intakt.
- [x] separater GitHub-Pages-Build mit Base `/hall-of-memory-preview` PASS: `grabowski-job-09aca2b648a0`, Finalization Receipt `880f3314823833ea562cf63d2e91ed455e4056ece0518f4f005ce984ef64fe39`.
- [x] Preview-Mirror-Synchronisierung und Root-Path-Validierung PASS: `grabowski-job-83fb8803aed3`, Finalization Receipt `4f113b79103530c4fd3a8bb48687a459200cddccc0401dfce2369ebdfdfd7dac`; 32 generierte Dateien, `bad_root_refs=0`, Published-Tree `36f9eee839f7b507618157c8d022f10c16ad01e641ca8531538ac62e38aeab6c`.
- [x] GitHub-Pages-Mirror Commit `84d230d5f913e6e38aaa05ecaa4cdc1e192aefce`; GitHub Pages meldet `built` exakt für diesen Commit.
- [x] öffentlicher HTTP-Readback von Übersicht sowie V1–V6: alle ausgelieferten HTML-Dateien sind SHA-256-identisch zum validierten Mirror; Übersicht = fünf Metallprofil-Markups, kein Eventfoto/Slider; V1–V5 = je ein Metallprofil + Eventfoto + Slider; V6 = kein linearer Metallprofil-Stack; `noindex,nofollow` und Pages-Basis auf allen Seiten erhalten.
- [x] öffentlicher CDP-Readback V1: Highlight `-1,35/-1,35 px`, Gegenkante `+1,35/+1,35 px`, Kontakt `+3/+3,6 px`; Rahmenmaske HTTP 200, Eventfoto HTTP 200.
- [x] öffentlicher CDP-Readback V2: Highlight `-1,15/-1,15 px`, Gegenkante `+1,15/+1,15 px`, Kontakt `+2,7/+3,2 px`; Rahmenmaske HTTP 200, Eventfoto HTTP 200.
- [x] öffentlicher Mobile-CDP-Readback V1 bei 390×844: `bodyScrollWidth=390`, Kontakt `+2/+2,4 px`, Profilrichtungen unverändert, Maske und Foto HTTP 200.

Öffentliche Vergleichsseite: `https://alexdermohr.github.io/hall-of-memory-preview/demo/rahmen/`.

## Neue ChatGPT-Rahmenmaster V1–V5 — 14.08.2026

Auf Nutzerwunsch wurden die bisherigen V1–V5 aus dem Rahmenvergleich entfernt und durch neue, transparente PNG-Master aus `hall of memory/rahmen` ersetzt. **V6 bleibt unverändert erhalten.**

Aus zehn neuen PNGs wurden fünf unterschiedliche, technisch saubere Kandidaten gewählt. Auswahlkriterien: vollständig freie zentrale 50%-Zone, stabile Zentrierung, geringe unbeabsichtigte Links-/Rechts-Asymmetrie und unterschiedliche Gestaltungsdichte statt nahezu identischer Dubletten.

- V1 ← `F5A37316-B43F-4487-A0B8-80E3EF837571.PNG` → `public/fundus/hall-of-memory-frame-01.png`, SHA-256 `d89c86e00c18f1eb3b12d2119e46bde77316c4e0d232e8cf341a8fe65be045e7`
- V2 ← `03B1D594-0C26-4058-921B-E6555CBFC9D1.PNG` → `public/fundus/hall-of-memory-frame-02.png`, SHA-256 `bf2911574e5b0d563d525214938819fbf46817c26f53de3549d238de96aab0fb`
- V3 ← `B7B5728C-785D-4D41-9317-3581FA0361ED.PNG` → `public/fundus/hall-of-memory-frame-03.png`, SHA-256 `0e322025da2a81785e1a09e741a9e0f6c0fccd53b8a5354f705d7daae4e8b950`
- V4 ← `A5F32D20-2AB9-4859-A804-7078975AB934.PNG` → `public/fundus/hall-of-memory-frame-04.png`, SHA-256 `ac899316d62360fee7da1fa28d11ffb83a337bd50eaa72014fdad27b84cb88cb`
- V5 ← `0B54327C-591C-4891-A444-3A3BF78A3A81.PNG` → `public/fundus/hall-of-memory-frame-05.png`, SHA-256 `d038a69ce9c239728b84241fa85025238d3b56b161297fe9c8dff486c6f41170`
- V6 unverändert: `public/fundus/hall-of-memory-botanical-frame-06.png`, SHA-256 `9a961aff9e1987b9802a3e5a453c3b8edbe4e516ff2ee8f9c3f11e49c6e7481e`

### Consumer-Korrektur

V1–V5 werden nun wie V6 als **fertige transparente Asset-Master direkt** gerendert. Der frühere synthetische Vier-Layer-Metall-Bevel (`contact/shadow/highlight/body`) ist aus den neuen Varianten vollständig entfernt. Dadurch bleibt die vom Bildmaster erzeugte Gold-/3D-Wirkung exakt zentriert; der Consumer verschiebt keine Kopien der Rahmengeometrie mehr. `background-position: 50% 50%`, `background-size: 100% 100%`, `transform: none`, `filter: none`, `mask: none`.

Die Bildgrößen-Slider bleiben erhalten und wurden auf die neuen Randgeometrien neu kalibriert: V1 10→4%, V2 12→5%, V3 11→4%, V4 12→4%, V5 15→5%; V6 bleibt 17→5%.

### Validierung

- [x] `npm run test:demo` PASS; Regressionstest erzwingt V1–V5 `asset-source`, V6 `floral-source`, bei allen sechs 0 synthetische Metallprofil-Stacks.
- [x] `astro check` PASS: 36 Dateien, 0 Fehler, 0 Warnungen, 0 Hinweise.
- [x] `astro build` PASS: 11 Seiten.
- [x] `git diff --check` PASS.
- [x] lokaler HTTP-Readback auf isoliertem Port 4342: Übersicht + V1–V6 jeweils HTTP 200. Port 4341 war außerhalb des Lease-Registers bereits belegt und wurde ausdrücklich nicht übernommen oder gestoppt.
- [x] lokaler CDP-Readback V1: `asset-source`, exakte Quelle `/fundus/hall-of-memory-frame-01.png`, 50%/50% zentriert, 100%/100%, kein Transform/Filter/Mask, 0 Metall-Layer.
- [x] lokaler CDP-Readback V6: unveränderte botanische Quelle, ebenfalls direkt und ohne synthetischen Metall-Layer.
- [x] Übersicht: kein Eventfoto, kein Metall-Layer; V1 direkt zentriert.
- [x] Mobile V2 390×844: `bodyScrollWidth=390`, kein horizontaler Overflow, direkter Asset-Consumer unverändert zentriert.
- [x] `/demo/` selbst verwendet nun ebenfalls den neuen V1-Master direkt; Browser-Readback: `asset-source`, 50%/50%, 100%/100%, kein Transform/Filter/Mask.
- [x] Die sechs supersedierten `hall-of-memory-stellar-frame-*` Public-Assets wurden aus dem Repository entfernt; lokaler Readback des früheren V1-Pfads liefert HTTP 404. V6 bleibt als `hall-of-memory-botanical-frame-06.png` mit unverändertem SHA-256 erhalten.

### Öffentliche Publikation — neue V1–V5 / V6 erhalten

- [x] finaler Source-Stand für die veröffentlichte Preview: `ceea9f86b9917062bbc70dc2b5d8fc5d1b85be62`.
- [x] Preview-Mirror validiert: 30 generierte Dateien, `bad_root_refs=0`, Published-Tree `27a72af3c3f7529c767a5c91c35b7cb1a1c0417248b87e6b0584ee96f1001f2b`; alte Stellar-Assets nicht mehr Bestandteil des veröffentlichten Baums.
- [x] GitHub-Pages-Mirror Commit `76e730929e05bb1866611654901cfbdd122a4bda`; Pages-Buildstatus `built` exakt für diesen Commit.
- [x] öffentlicher HTTP-Readback: `/demo/`, `/demo/rahmen/` und V1–V6 jeweils HTTP 200 und byteidentisch zum validierten lokalen Mirror.
- [x] öffentliche V1–V5 Assets jeweils HTTP 200 und SHA-256-identisch zu den ausgewählten GDrive-Mastern; V6 HTTP 200 mit unverändertem SHA-256 `9a961aff9e1987b9802a3e5a453c3b8edbe4e516ff2ee8f9c3f11e49c6e7481e`.
- [x] alle sechs supersedierten `hall-of-memory-stellar-frame-*` URLs liefern öffentlich HTTP 404.
- [x] öffentlicher CDP-Readback V1: `asset-source`, `background-position: 50% 50%`, `background-size: 100% 100%`, `transform: none`, `filter: none`, `mask: none`, 0 synthetische Metall-Layer.
- [x] öffentlicher CDP-Readback V6: `floral-source`, bisheriges `hall-of-memory-botanical-frame-06.png`, 0 synthetische Metall-Layer.
- [x] öffentlicher Mobile-CDP-Readback V2 bei 390×844: `scrollWidth=390`, direkte neue Assetquelle, kein horizontaler Overflow.

Aktuelle Vergleichsseite: `https://alexdermohr.github.io/hall-of-memory-preview/demo/rahmen/`.


## GitHub-Pages-Härtung der Rahmenübersicht — 23.08.2026

Nutzerfeedback auf der aktuellen kundenkontrollierten GitHub-Pages-Deployment-URL: Die Vergleichskarten unter `/Hall-of-Memory/demo/rahmen/` waren sichtbar, die Rahmen wirkten in der realen Nutzeransicht jedoch nicht mitgeladen.

### Belegter Live-Befund vor der Härtung

- Deployment-Source `7b702822376cc45ab78b3f766ec2d556bd854fe5`; die Vergleichsseite selbst war erreichbar und enthielt V1–V10.
- Repräsentative direkte Asset-Readbacks V1, V6, V9 und V10 lieferten jeweils HTTP 200 mit `content-type: image/png` und nichtleerer Payload; der verschachtelte V10-Pfad war damit ebenfalls erreichbar.
- Ein direkter Browser-Ladetest auf der Live-Seite lud V1 als echtes `Image` mit `naturalWidth=1254` und `naturalHeight=1254` erfolgreich.
- Frische Headless-Readbacks mit Google Chrome und Brave berechneten die korrekte Fundus-URL und zeichneten den bisherigen CSS-Pseudoelement-Consumer sichtbar. Damit gibt es keinen Beleg für einen allgemeinen 404-, BASE_URL-, CSP- oder Chromium/Brave-Fehler.
- Die genaue client-/cache-/darstellungsspezifische Ursache der gemeldeten Nutzeransicht blieb nicht reproduzierbar. Dieser Unsicherheitsrest wird nicht als falsche Root-Cause geschlossen.

### Robusterer Übersicht-Consumer

Die Rahmenübersicht verwendet V1–V10 nun als echte `<img>`-Elemente statt über `--comparison-frame` + `::before` + `background-image`. Die bestehenden `import.meta.env.BASE_URL`-gebundenen Assetpfade bleiben die Pfadautorität. V10 behält über `object-fit: contain` die Portrait-Sonderbehandlung; die übrigen Varianten füllen die quadratische Vergleichsfläche wie zuvor. Die neutrale dunkle Vergleichsfläche wurde nur leicht angehoben. Detailseiten und Fundus-Assets bleiben unverändert.

Nutzen: Der Browser besitzt jetzt einen expliziten Bild-Lifecycle (`src`, `complete`, `naturalWidth`), und Tests können nicht mehr nur CSS-Text prüfen, sondern die tatsächlich erzeugten Bildreferenzen und Dateien im Pages-Artefakt. Trade-off: Der Consumer ist semantisch etwas expliziter im DOM, vermeidet dafür eine unnötige CSS-Indirektion.

### Regressionssicherung

- [x] `npm run test:demo -- --frame-image-consumer` PASS, Receipt `17a07da6ff88b008dd2b97ad0b1dfe229ca1703d8fb3da7bd23d9e3935d96f59`: Übersicht erzwingt 10 echte `.frame-comparison-image`-Elemente, korrekte lokale Quellen und keinen Rückfall auf `--comparison-frame`.
- [x] `npm run check` PASS, Receipt `1489eb6f9396cdab5147f1090aada72b482b8f7cbb1934b47b8479ee950b06c5`.
- [x] `npm run test:pages-artifact -- --frame-image-consumer-v2` PASS, Receipt `63ec0f42bba774bac88eb05eacde86efa4fa06581447ba315f6fd31316c7dd3e`: Build-Basis ist exakt `/Hall-of-Memory`; alle zehn `img src` liegen darunter, jede referenzierte Datei existiert nichtleer im Build und nach dem Pages-Packaging, einschließlich des verschachtelten V10-Pfads.

### Post-Merge-Readback — 24.08.2026

- [x] Öffentliche Deployment-Receipt frisch und cache-busted gelesen: `sourceRevision=137df9a2149ff5583d64a700c06acb2b9ccb9ced`, `verifyRunId=32672725279`, Channel `github-pages-preview`. Damit ist der geprüfte Browserzustand an den zu diesem Zeitpunkt aktuellen `main`-Deploy gebunden.
- [x] Echter Google-Chrome/CDP-Readback auf `https://hall-of-memory.github.io/Hall-of-Memory/demo/rahmen/`: exakt 10 `.frame-comparison-image`-Elemente; alle zehn `complete=true`, `naturalWidth>0` und `naturalHeight>0`; kein horizontaler Overflow.
- [x] V1–V9 melden jeweils `1254×1254` natürliche Pixelmaße. V10 meldet `1122×1402` und lädt aus dem erwarteten verschachtelten Fundus-Package-Pfad.
- [x] Dauerhafter Grabowski-Verifikationsjob `grabowski-job-075e98a93fcb` terminal `succeeded`; Finalization Receipt SHA-256 `99dd9949fce105bc7eac3a95cd784834fe9dad72304b2579ac3c60d697d01095`.

Der technische Post-Merge-Acceptancepunkt der Pages-Härtung ist damit erfüllt. T038 bleibt dennoch `active`: die bewusste Kundenauswahl eines Rahmens und die anschließende finale Bildgrößenfestlegung sind weiterhin offen und werden durch diesen Runtime-Nachweis nicht vorweggenommen.
