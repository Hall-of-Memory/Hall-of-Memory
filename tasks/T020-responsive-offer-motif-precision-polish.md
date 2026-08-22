---
id: T020
status: done
priority: P2
dependencies: [T019]
---
# Responsive Offer-Motif Precision Polish

## Anlass

Der unabhängige Full-Demo-Visual-Review von T019 (`309ce4e4cadb4d399861b497`) bewertete die Demo als kundenpräsentabel, nannte aber beim `834×1112`-Viewport das Fotobox-Motiv in der seitlichen Angebotsfläche als etwas quadratisch/gedrungen.

## Befund

Der Hinweis war reproduzierbar. Die bisherige prozentuale `inset`-Geometrie koppelte Breite und Höhe des Kameragehäuses an die hohe Tablet-Art-Fläche und verzerrte dadurch nur im schmalen Zweispaltenlayout die Proportionen.

Gemessene Breite:Höhe-Verhältnisse vor dem Fix:

- `1440×1000`: `1.51`
- `1080×900`: `1.58`
- `834×1112`: `0.97`
- `768×1024`: `0.97`
- `621×900`: `0.87`
- `620×900`: `2.24` im bereits gestapelten Mobile-Layout
- `390×844`: `1.53`

Evidenz: Grabowski-Task `b77a56e4c7d94355bd095412`.

## Umsetzung

Für genau den Bereich `621px–860px` erhält nur das äußere Fotobox-Kameragehäuse eine explizite, zentrierte `aspect-ratio: 1.5`-Geometrie. Desktop und das vorhandene Mobile-Layout bleiben unverändert.

Implementierung:

- Commit `1c3dbba6083f686721414ba3aeb07380ea159183` — `fix(demo): refine tablet offer motif`
- Datei `src/styles/demo.css`

Der nicht-mutierende A/B-Test `d5e7084cd0984ad2bae386ea` ergab:

- `834×1112`: `0.97` → `1.39`
- `768×1024`: `0.97` → `1.39`
- `621×900`: `0.87` → `1.39`
- Desktop und Mobile blieben geometrisch unverändert
- Kameragehäuse blieb in allen Fällen vollständig innerhalb seiner Art-Fläche
- horizontaler Overflow blieb `0`

Vergleichsscreenshots wurden vor der Mutation für `1440`, `834` und `390` px erzeugt; Task `fa412a05663b4c10bee6a560`. Der 1440-Vergleich war pixelidentisch, der 834-Vergleich zeigte die beabsichtigte Änderung.

## Validierung

- kompletter Regressionslauf `86180ef288884ff8b2898fb4` → PASS für `test:demo`, `test:quality`, `check`, `build`, vollständiges `verify` und `git diff --check`
- Demo-Isolation weiterhin `noindex`, `launchStatus=draft`, `apiCalls=0`
- Demo-CSS nach Fix: `23733` Byte und damit weiterhin unter dem 26-KiB-Headroom-Gate aus T028
- finaler Browser-Readback `fb8fd8404b4f45c4bd92d63e` bei `1440×1000`, `834×1112`, `768×1024`, `621×900`, `620×900`, `390×844`, `340×844`: überall HTTP 200, `overflow=0`, keine fehlgeschlagenen Requests, Console- oder Page-Errors
- externer Preview-Readback `2ad80fb1fedf4eeb86cb918e`: `/demo/` HTTP 200, `noindex=true`; beide referenzierten CSS-Assets HTTP 200

## Abschluss

T020 ist `done`. Der reale Tablet-Proportionsfehler ist gezielt behoben, ohne Desktop, Mobile, Anfragepfad, T018 oder die Art-Direction unnötig umzubauen.
