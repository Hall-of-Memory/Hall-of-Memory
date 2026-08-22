---
id: T044
status: planned
priority: P1
dependencies: [T038]
---
# Preview-Legacy-Sternenrahmen V7–V9 in Fundus überführen oder bewusst ausmustern

## Ausgangslage

Beim Fundus-Integration-Readback für `hall-of-memory.stellar-frame.primary` wurde festgestellt, dass die öffentliche GitHub-Pages-Preview bereits drei zusätzliche Sternenrahmen als Varianten V7–V9 enthielt, die im damaligen kanonischen Hall-Source-Stand nicht vorhanden waren.

Sie wurden deshalb für die konfliktfreie V10-Publikation byteidentisch in den Hall-Source-Stand übernommen, aber ausdrücklich **nicht** nachträglich als Fundus-Assets deklariert:

- V7 `hall-of-memory-star-frame-07.png` — SHA-256 `4c710d3f13484f887a0df5fcd2674ab4d6cb12fd8c629087683ba9740fb7cd1a`
- V8 `hall-of-memory-star-frame-08.png` — SHA-256 `ffed21020a351c3c1969891392dc4744b7614844099e435fd5e85608b4f2741b`
- V9 `hall-of-memory-star-frame-09.png` — SHA-256 `bdb9e070bf4c9bf641efbd07e130af5ee8fd28ec955dcd6b764f63fb31172d28`

Der Preview-Publikationsvertrag bezeichnet diese drei Revisionen deshalb korrekt als `preview-legacy-unfundused`.

## Ziel

Für jede der drei exakten Revisionen eine bewusste Entscheidung treffen:

1. **Fundus-Migration**: Herkunft und Rechte klären, Image Brief bzw. zulässige Legacy-Source-Bindung herstellen, exakte Source-Digests ingestieren, Build/technische Prüfung, Preview und neue revisionsgebundene visuelle Acceptance durchführen, immutable Package erzeugen und den Hall-Consumer auf das Package umstellen; oder
2. **Ausmusterung**: Variante aus der aktiven Kundenauswahl entfernen, ohne Historie oder bisherige Preview-Evidenz umzudeuten.

## Harte Regeln

- Keine nachträgliche erfundene Herkunft oder Acceptance.
- Keine Acceptance von V10 oder anderen Assets auf V7–V9 übertragen.
- Keine Byteänderung der aktuell gebundenen Legacy-Revisionen vor einer neuen Source-Revision.
- Produktive Wiederverwendung nur aus einem akzeptierten immutable Fundus-Package.
- Historische Preview-Evidenz und SHA-256-Bindungen bleiben erhalten.

## Akzeptanz

- [ ] Entscheidung Migration oder Ausmusterung für V7, V8 und V9 einzeln dokumentiert.
- [ ] Bei Migration: Herkunft/Rechte, exakter Source-Digest, technische Prüfung und visuelle Acceptance belegt.
- [ ] Bei Migration: Hall konsumiert ausschließlich die akzeptierten immutable Packages ohne Fundus-Runtime-Abhängigkeit.
- [ ] Bei Ausmusterung: aktive Auswahl und Tests aktualisiert; historische Preview-Revisionen bleiben nachvollziehbar.
- [ ] Kein Asset wird allein aufgrund seiner bisherigen öffentlichen Sichtbarkeit als Fundus-konform bezeichnet.
