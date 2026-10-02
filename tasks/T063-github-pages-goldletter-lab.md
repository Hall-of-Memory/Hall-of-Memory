---
id: T063
status: done
priority: P1
dependencies: [T062]
---
# Goldletter-Versuch auf GitHub Pages veröffentlichen

## Ziel

Die bereits verifizierten gegossenen Goldletter-Master werden auf einer echten öffentlichen GitHub-Pages-Labseite für `MEMORAEVENTS` ausprobiert.

Die Seite ist ausschließlich Designpreview, bleibt `noindex,nofollow` und verändert weder die Cloudflare-Production noch den bestehenden Worker.

## Scope

- Route: `/demo/goldletters/`
- GitHub-Pages-Ziel: `https://hall-of-memory.github.io/memoraevents/demo/goldletters/`
- neun bestätigte A–Z-Materialglyphen: `A E M N O R S T V`
- Signature-, Editorial- und kompakte Headerprobe
- CSS-Gold als Gegenprobe
- alle Assetpfade über `import.meta.env.BASE_URL`, damit `/memoraevents/` korrekt bleibt
- Pages-Artefakt-Test muss Route, `noindex`, Basispfad und Glyphenassets prüfen

## Quelle

Originalmaster SHA-256:

`8555fa52d2aae2fda730c36a53fcafa68486dee73ddf515abfd41b00a99b17b1`

Die neun PNGs werden byteidentisch aus dem verifizierten Livia-Goldletter-Quellbestand übernommen. WebP-/Atlas-/Font-Derivate sind nicht die Quellwahrheit dieses Versuchs.

## Akzeptanz

- [x] Labroute baut lokal und unter `--base /memoraevents`
- [x] `noindex,nofollow` ist im erzeugten HTML vorhanden
- [x] alle Materialglyphen referenzieren den GitHub-Pages-Basispfad
- [x] alle referenzierten PNGs liegen im Pages-Artefakt
- [x] kanonischer Repo-Verify ist auf dem Implementierungs-Head grün
- [x] PR ist auf aktuellem `main` konfliktfrei und CI-grün
- [x] Merge auf `main`
- [x] `pages-runtime` ist auf exakt dem Merge-Commit grün
- [x] öffentliche GitHub-Pages-Labroute liefert HTTP 200
- [x] Cloudflare-Production bleibt unangetastet

## Arbeitsjournal

- 2026-10-02: T063 auf `main` @ `81efb366dd39d03ee80d1fc05475dd2568654172` isoliert begonnen.
- 2026-10-02: PR #70 nicht wiederverwendet, weil er auf einem alten Vor-Rename-Stand basiert und aktuell konfliktbehaftet ist.
- 2026-10-02: neun benötigte Materialglyphen in den isolierten T063-Worktree übernommen und SHA-256 read-back erfasst.

- 2026-10-02: Implementierungs-PR #73 auf Head `cef57c6bccf9c1fa93190acca2fd7e0d34311736` nach grünem `verify` gemergt.
- 2026-10-02: Merge-Commit `2a9d48ac0063ecb2dce129272d6cb6e1fa6a57f9`; Main-Workflow `36961179757` mit `verify=SUCCESS` und `pages-runtime=SUCCESS`.
- 2026-10-02: Öffentlicher Readback `/memoraevents/demo/goldletters/` = HTTP 200, `noindex,nofollow`, 36 Materialglyph-Instanzen aus genau 9 eindeutigen Quellen; alle Quellen unter dem Pages-Basispfad.
- 2026-10-02: Deployment-Receipt öffentlich HTTP 200 und exakt an `sourceRevision=2a9d48ac0063ecb2dce129272d6cb6e1fa6a57f9` sowie `verifyRunId=36961179757` gebunden.
- 2026-10-02: Öffentlicher M-Glyph `u004d.png` = HTTP 200 und SHA-256 `e1fd143cca99bbb2ea28a20f77406e71cb879fcc9389d8d10a43943bd35f0644`, byteidentisch zur Quellglyph.
- 2026-10-02: Es wurde kein Cloudflare-Deploy ausgeführt; T063 betrifft ausschließlich GitHub Pages.
