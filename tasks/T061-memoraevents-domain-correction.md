---
id: T061
status: done
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

## Cutover-Readback — 01.10.2026

Der frühere INWX-Blocker ist erledigt und das Produktions-Cutover-Gate ist **PASS**.

Providerseitig belegt:

- INWX-Domainstatus `OK`, ursprüngliche Nameserver `ns.inwx.de`, `ns2.inwx.de`, `ns3.inwx.eu`;
- vollständige INWX-Zone: genau `* A 185.181.104.242`, `@ A 185.181.104.242`, `www A 185.181.104.242` plus providerverwaltete Apex-`NS`/`SOA`;
- INWX-DNSSEC-Seite: `Aktuell ist DNSSEC für keine Domain eingerichtet`; Parent-DS leer;
- vollständiger maschinenlesbarer INWX→Cloudflare-Vergleich: `passed: true`, `sourceRrsetCount=3`, `targetRrsetCount=3`, keine Fehler; Source-Snapshot `105037b495d1e5c43452292c5d1f51ca5abdec7c0b7b53d4b30398937346bf72`, Target-Snapshot `8cb9a669fb637d7d849ce2b7cd0b9d4c196a90ac64086c1d077b8d747b95fca4`;
- anschließend INWX-Nameserver exakt auf `quentin.ns.cloudflare.com` und `tia.ns.cloudflare.com` umgestellt; frischer INWX-Reload bestätigt nur dieses Paar;
- DENIC sowie `1.1.1.1` und `8.8.8.8` delegieren anschließend auf `quentin`/`tia`; Parent-DS bleibt leer;
- Cloudflare-Aktivierungscheck: HTTP 200 / `success: true`; Zone seit `2026-10-01T04:42:50.559740Z` `active`;
- Apex-Legacy-A wurde ausschließlich für die Worker-Custom-Domain entfernt; `www` und Wildcard blieben erhalten;
- Worker-Custom-Domain `memoraevents.de` ist an Production/`hall-of-memory` gebunden;
- revisionsgebundener Worker-Deploy: Version `077c864f-3e7c-433f-94c5-a7597a90de70`;
- Edge-Readback: `/ -> 302 /demo/`, `/demo/ -> 200`, `/demo/rahmen/ -> 200`;
- Live-`/demo/` ist byte-identisch zu `dist/demo/index.html`, SHA-256 `27fe8a420e4829880607caa2d665f2a703ff6041997ec401622a1064f58e0ddd`;
- `noindex,nofollow` bleibt aktiv; repräsentative CSS-/Logo-/Eventbild-Assets liefern HTTP 200;
- Security Header am Apex: CSP `frame-ancestors 'none'`, Permissions-Policy, Referrer-Policy, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`;
- `www.memoraevents.de` wird über Cloudflare Single Redirects per `302` auf den Apex kanonisiert; Ruleset `d0e0eb3bf2964c0da4c790db1b753fd4`, Regel `e8b02adcaeca4ff69ad03344a002ec19`, Pfad und Query werden erhalten;
- `www`-Readback: Root, `/demo/rahmen/` und Query-Beispiel redirecten jeweils korrekt auf `https://memoraevents.de`.

Damit ist die neue Primärdomain technisch live. Der lokale Resolver auf dem Heim-PC hielt zeitweise noch den alten INWX-Apex im Cache; autoritative Cloudflare-Server und öffentliche Resolver liefern bereits Cloudflare-Anycast und sind die maßgebliche Produktionswahrheit.

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
- `memoraevent.de` wurde nach erfolgreichem Primär-Livegang kundenseitig zur Löschung eingereicht; der frühere Legacy-Redirect-Plan ist damit superseded;
- keine Mail-, Secret-, robots.txt-, AI-Crawler- oder kostenpflichtige Nebenwirkung wurde stillschweigend eingeführt.

## Legacy-Domain-Entscheidung — 01.10.2026

Der zuvor vorgesehene Redirect für `memoraevent.de` wird **nicht** umgesetzt, weil der Kunde die Domain inzwischen aktiv zur Löschung eingereicht hat.

Frischer INWX-Readback:

- Domainstatus `DELETE SCHEDULED`;
- `Terminauftrag: 01.10.2026 17:48`;
- Domainlog: `30.09.2026 21:48 DELETE REQUESTED` durch `aram222`, danach `DELETE SCHEDULED`;
- die Domain delegiert bis zur Löschung weiter auf INWX und besitzt keinen funktionsfähigen HTTPS-Legacy-Redirect.

Diese explizite Provideraktion supersediert die frühere vorsorgliche Annahme, `memoraevent.de` dauerhaft als Tippfehlerdomain zu behalten. Der Löschauftrag wird nicht storniert oder umgangen. T061 ist damit terminal: die neue Primärdomain ist vollständig live; die alte Zwischen-Domain wird gemäß Kundenentscheidung auslaufen.
