---
id: T063
status: active
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

- [ ] Labroute baut lokal und unter `--base /memoraevents`
- [ ] `noindex,nofollow` ist im erzeugten HTML vorhanden
- [ ] alle Materialglyphen referenzieren den GitHub-Pages-Basispfad
- [ ] alle referenzierten PNGs liegen im Pages-Artefakt
- [ ] kanonischer Repo-Verify ist auf dem Implementierungs-Head grün
- [ ] PR ist auf aktuellem `main` konfliktfrei und CI-grün
- [ ] Merge auf `main`
- [ ] `pages-runtime` ist auf exakt dem Merge-Commit grün
- [ ] öffentliche GitHub-Pages-Labroute liefert HTTP 200
- [ ] Cloudflare-Production bleibt unangetastet

## Arbeitsjournal

- 2026-10-02: T063 auf `main` @ `81efb366dd39d03ee80d1fc05475dd2568654172` isoliert begonnen.
- 2026-10-02: PR #70 nicht wiederverwendet, weil er auf einem alten Vor-Rename-Stand basiert und aktuell konfliktbehaftet ist.
- 2026-10-02: neun benötigte Materialglyphen in den isolierten T063-Worktree übernommen und SHA-256 read-back erfasst.
