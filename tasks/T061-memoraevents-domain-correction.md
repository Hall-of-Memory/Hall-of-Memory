---
id: T061
status: active
priority: P0
dependencies: [T009]
---
# Produktionsdomain-Korrektur auf `memoraevents.de`

## Ziel

Die vom Kunden korrigierte Domain `https://memoraevents.de` wird zur neuen Produktions- und Primärdomain von Hall of Memory.

T061 supersediert den operativen Domainpfad aus T060. T060 bleibt unverändert als historische Evidenz des zwischenzeitlichen `memoraevent.de`-Pivots erhalten. `memoraevent.de` wird nicht gelöscht, sondern nach erfolgreichem Livegang der neuen Primärdomain als Legacy-/Tippfehlerdomain kontrolliert auf `memoraevents.de` weitergeleitet.

Cloudflare bleibt Produktionsplattform, INWX Registrar und der bestehende Worker `hall-of-memory` die Zielruntime.

## Kundenentscheidung — 30.09.2026

Der Kunde hat die zuvor gewählte Domain `memoraevent.de` auf `memoraevents.de` korrigiert und ausdrücklich bestätigt, dass die Variante mit `s` am Ende die gewünschte Hauptdomain ist.

## Frischer Livezustand — 01.10.2026

Öffentlich für `memoraevents.de` belegt:

- autoritative Nameserver: `ns.inwx.de`, `ns2.inwx.de`, `ns3.inwx.eu`;
- Apex `A = 185.181.104.242`, TTL 3600;
- `www A = 185.181.104.242`, TTL 3600;
- Apex `MX`, Apex `TXT`, `_dmarc TXT` und Apex `CAA` sind leer;
- beim `.de`-Parent ist kein DS veröffentlicht;
- die Registrierung ist damit öffentlich aktiv und normal delegiert.

Cloudflare im kundeneigenen Aram-Account:

- Zone `memoraevents.de` existiert bereits;
- Plan: `Free Website`;
- Status: `pending`;
- zugewiesene Cloudflare-Nameserver:
  - `quentin.ns.cloudflare.com`
  - `tia.ns.cloudflare.com`
- Cloudflare kennt als ursprüngliche Nameserver genau `ns.inwx.de`, `ns2.inwx.de`, `ns3.inwx.eu`;
- importierte Inhalts-RRsets sind exakt:
  - `@ A 185.181.104.242`
  - `www A 185.181.104.242`
  - `* A 185.181.104.242`
- alle drei A-RRsets sind aktuell in Cloudflare proxied;
- `activated_on` ist leer, weil die INWX-Delegation noch nicht auf Cloudflare zeigt;
- der bestehende Worker `hall-of-memory` bleibt die Zielruntime.

## Aktuelles Cutover-Gate

Cloudflare-Ziel und öffentliche INWX-Sicht stimmen für die bekannten Inhalts-RRsets überein. Vor einer Nameservermutation bleibt trotzdem ein vollständiger INWX-Provider-Readback verpflichtend.

Der aktuelle Provider-Browser ist bei INWX **nicht authentifiziert**. AXFR gegen `ns.inwx.de` ist nicht verfügbar. Deshalb ist die öffentliche DNS-Sicht allein kein vollständiger Zonenexport und entsperrt den Nameserverwechsel noch nicht.

**Bis zum authentifizierten INWX-Readback werden bei INWX keine Nameserver geändert.**

## Umsetzung

1. Aktuelle Produktionsverträge im Repo auf `https://memoraevents.de` umstellen:
   - README / AGENTS / CONTRIBUTING;
   - Deployment-Runbook und T009;
   - Production-Readiness-Origin;
   - Security-/Readiness-Regressionen;
   - vertrauenswürdiger `main`-Build in GitHub Actions;
   - Routing-Kommentar.
2. T060 auf `cancelled` setzen und ausschließlich mit einem Superseded-Vermerk auf T061 verweisen; historischen Inhalt unverändert lassen.
3. `PUBLIC_SITE_URL=https://memoraevents.de npm run build` und `npm run verify` grün belegen.
4. INWX authentifiziert read-backen:
   - Domainstatus;
   - vollständige DNS-Zone bzw. vollständige UI-Inventur;
   - Nameserver;
   - DNSSEC/DS-Einstellungen.
5. Cloudflare-Zielzone nochmals read-backen und mit dem INWX-Snapshot vergleichen.
6. Nur bei PASS die INWX-Nameserver auf `quentin.ns.cloudflare.com` und `tia.ns.cloudflare.com` umstellen.
7. Parentdelegation und öffentliche Resolver auf Cloudflare konvergieren lassen.
8. Cloudflare-`Active` read-backen.
9. `memoraevents.de` an den geprüften Worker `hall-of-memory` als Custom Domain binden.
10. `www.memoraevents.de` eindeutig auf den Apex kanonisieren/redirecten.
11. TLS/HTTP/Assets/Security-Header/`noindex` extern prüfen:
    - `/ -> 302 /demo/`;
    - `/demo/ -> 200`;
    - `/demo/rahmen/ -> 200`.
12. Erst danach Legacy-Redirects für `memoraevent.de` und später `hallofmemory.de` umsetzen.
13. GitHub Pages erst nach erfolgreichem Primärdomain-Readback aus der notwendigen Primärpreview-Rolle nehmen.

## Akzeptanz

- T061 ist die einzige operative Domain-Cutover-Wahrheit;
- T045/T059/T060 bleiben historische Evidenz;
- alle aktuellen Produktionsverträge referenzieren `https://memoraevents.de`;
- Stage-1-Build und `npm run verify` sind revisionsgebunden grün;
- vollständiger INWX→Cloudflare-DNS-/DNSSEC-Preflight ist PASS;
- INWX delegiert auf `quentin.ns.cloudflare.com` und `tia.ns.cloudflare.com`;
- Cloudflare meldet `memoraevents.de` als `Active`;
- Worker-Custom-Domain und `www`-Strategie sind eindeutig gebunden;
- TLS und Stage-1-Webreadback sind vollständig grün;
- `memoraevent.de` bleibt bis zum erfolgreichen neuen Primärhost erhalten und wird anschließend kontrolliert weitergeleitet;
- keine Mail-, Secret-, robots.txt-, AI-Crawler- oder kostenpflichtige Nebenwirkung wurde stillschweigend eingeführt.

## Aktueller externer Blocker

**Fehlt:** authentifizierter INWX-Provider-Readback für `memoraevents.de`.

**Nötig für:** vollständiges Quellzonen-Gate und sichere Nameservermutation.

Cloudflare selbst ist bereits vorbereitet; die neue Zone existiert und wartet ausschließlich auf die Registrar-Delegation.
