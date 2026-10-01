---
id: T060
status: cancelled
priority: P0
dependencies: [T009]
---
# Produktionsdomain-Pivot auf `memoraevent.de`


## Superseded — 30.09.2026

Der Kunde hat die Primärdomain auf `memoraevents.de` korrigiert. Der weitere operative Domainpfad liegt ausschließlich in T061. Die nachfolgenden Abschnitte bleiben unverändert als historische Evidenz des tatsächlich umgesetzten und gemergten `memoraevent.de`-Zwischenstands erhalten.


## Ziel

Die am 27.09.2026 vom Kunden neu registrierte Domain `https://memoraevent.de` wird zur neuen Produktions- und Primärdomain von Hall of Memory. Die bestehende Cloudflare-Workers-Architektur bleibt erhalten; gewechselt werden Domain, Registrar-/DNS-Ausgangslage und die darauf gebundenen Produktionsverträge.

T060 supersediert **nur den operativen Domainpfad** aus T045. Die dort und in T059 dokumentierten Provider-/Cutover-Nachweise zu `hallofmemory.de` bleiben historische Evidenz und werden nicht nachträglich umgeschrieben.

`hallofmemory.de` wird nicht vorschnell abgeschaltet. Erst nachdem `memoraevent.de` revisionsgebunden live und vollständig read-backbar ist, wird für die alte Domain eine kontrollierte Legacy-/Redirect-Strategie umgesetzt.

## Kundenentscheidung — 27.09.2026

Der Kunde hat `memoraevent.de` neu bei INWX registriert und diese Domain als neuen Namen für die öffentliche Website gewählt. Damit ist die frühere Entscheidung zugunsten von `hallofmemory.de` als Primärdomain für die weitere Umsetzung superseded.

## Frischer Livezustand — 27.09.2026

Öffentlich und gegen die aktuelle Domain geprüft:

- autoritative Nameserver: `ns.inwx.de`, `ns2.inwx.de`, `ns3.inwx.eu`;
- Apex `A = 185.181.104.242`, TTL 3600;
- `www A = 185.181.104.242`, TTL 3600;
- ein zufälliger Hostname unterhalb der Zone liefert ebenfalls `185.181.104.242`; der vorhandene Wildcard-`A` ist damit extern bestätigt;
- Apex `MX`, Apex `TXT`, `_dmarc TXT` und Apex `CAA` sind aktuell leer;
- beim `.de`-Parent ist kein DS veröffentlicht;
- es gibt daher aktuell keine belegte Mail-DNS-Migration wie beim früheren STRATO-Pfad.

Cloudflare wurde im kundeneigenen Account frisch geprüft:

- der bestehende Worker `hall-of-memory` bleibt die Zielruntime;
- `memoraevent.de` ist noch **keine** Cloudflare-Zone;
- der aktuelle delegierte Operator besitzt weiterhin `Workers Platform Admin` und `Domain DNS`, aber keine zusätzliche `Domain Administrator`-Rolle;
- der sichtbare Cloudflare-Pfad `Domains -> Add domain -> Connect a domain` wurde bis zum Provider-Gate geprüft;
- die Zonenerstellung wurde **nicht** ausgeführt: Cloudflare blockiert mit `Requires permission "com.cloudflare.api.account.zone.create" to create zones for the selected account`;
- keine kostenpflichtige Option wurde aktiviert;
- `I monetize pages that serve ads` blieb aus;
- `Enable Bot Preference Sync` wurde vor dem versuchten Setup deaktiviert, damit der Domain-Pivot nicht nebenbei `robots.txt` verändert;
- die DNS-Importoption blieb auf automatischem Scan, wäre aber vor jeder Delegationsmutation vollständig gegen INWX zu prüfen.

## Architekturentscheidung

Zielbild:

```text
memoraevent.de
      |
      v
Cloudflare DNS + TLS
      |
      v
Cloudflare Worker hall-of-memory
      |
      v
Hall-of-Memory-Website
```

Cloudflare bleibt Produktionsplattform. INWX bleibt Registrar. Für eine Worker Custom Domain wird die neue Domain als Cloudflare-Zone angelegt und anschließend bei INWX auf die von Cloudflare **frisch ausgegebenen** autoritativen Nameserver delegiert.

Der einfachere Alternativpfad, INWX-DNS beizubehalten und die Produktion auf eine andere Plattform wie Vercel zu verlagern, wurde vor dem Architektur-Lock gegengeprüft. Er würde die bereits etablierte Worker-/Cloudflare-Architektur ohne Produktnutzen wechseln und wird deshalb nicht gewählt.

## Least-Privilege-Grenze

Der aktuelle Cloudflare-Zugang darf die neue Zone nicht erzeugen. Daraus folgt **nicht**, dass dauerhaft breitere Accountrechte benötigt werden.

Bevorzugter Pfad:

1. Aram legt `memoraevent.de` einmal selbst als neue Cloudflare-Zone im bestehenden Account an.
2. Die von Cloudflare zugewiesenen Nameserver werden frisch read-backen.
3. Falls weitere Arbeiten delegiert werden sollen, erhält Alex anschließend `Domain Administrator` **nur für `memoraevent.de`**.
4. Bestehende Rollen werden nicht unnötig verbreitert.

Alternativ kann Aram bewusst eine kurzfristige accountweite Berechtigung erteilen, die `account.zone.create` umfasst; dieser breitere Pfad ist aber nicht die Standardempfehlung.

## Umsetzung

1. Aktuelle Produktionsverträge im Repo auf `https://memoraevent.de` umstellen:
   - README / AGENTS / CONTRIBUTING;
   - Deployment-Runbook und T009;
   - Production-Readiness-Origin;
   - Security-/Readiness-Regressionen;
   - vertrauenswürdiger `main`-Build in GitHub Actions;
   - Routing-Kommentar.
2. T045 auf `cancelled` setzen und mit einem kurzen Superseded-Vermerk auf T060 verweisen; historischen Inhalt nicht umschreiben.
3. `PUBLIC_SITE_URL=https://memoraevent.de npm run build` und `npm run verify` grün belegen.
4. Neue Cloudflare-Zone im kundeneigenen Account anlegen — ohne Paid-Upgrade und ohne unbeauftragte AI-/robots.txt-Nebenwirkung.
5. Cloudflare-DNS **vor** Delegation gegen den vollständigen aktuellen INWX-Zustand prüfen:
   - `@ A 185.181.104.242`;
   - `www A 185.181.104.242`;
   - `* A 185.181.104.242`;
   - keine unerklärten zusätzlichen Inhalts-RRsets;
   - Parent-DS weiterhin passend zum DNSSEC-Migrationszustand.
6. Erst nach PASS die bei Cloudflare frisch ausgegebenen Nameserver bei INWX als externe Nameserver setzen.
7. Parentdelegation und öffentliche Resolver auf Cloudflare konvergieren lassen und Cloudflare-`Active` read-backen.
8. `memoraevent.de` an exakt den geprüften Worker `hall-of-memory` als Custom Domain binden.
9. `www.memoraevent.de` eindeutig auf den Apex kanonisieren/redirecten; in Stage 1 temporär, pfaderhaltend und ohne konkurrierende Hauptadresse.
10. TLS/HTTP/Assets/Security-Header/`noindex` extern prüfen:
    - `/ -> 302 /demo/`;
    - `/demo/ -> 200`;
    - `/demo/rahmen/ -> 200`.
11. Erst nach stabilem neuen Primärhost die Legacy-Strategie für `hallofmemory.de` umsetzen; bis dahin keine vorschnelle Abschaltung.
12. GitHub Pages erst nach erfolgreichem Primärdomain-Readback aus der notwendigen Primärpreview-Rolle nehmen.

## Akzeptanz

- T060 ist die einzige operative Domain-Cutover-Wahrheit; T045/T059 bleiben historische Evidenz.
- alle aktuellen Produktionsverträge im Repo referenzieren `https://memoraevent.de`;
- `npm run verify` ist auf dem exakten Pivot-Head grün;
- Cloudflare-Zone `memoraevent.de` liegt im kundeneigenen Account und nutzt keinen ungefragt aktivierten kostenpflichtigen Dienst;
- vollständiger INWX->Cloudflare-DNS-/DNSSEC-Preflight ist PASS;
- INWX delegiert autoritativ auf die frisch zugewiesenen Cloudflare-Nameserver;
- Cloudflare meldet die Zone `Active`;
- Worker-Custom-Domain und `www`-Strategie sind eindeutig gebunden;
- TLS und Stage-1-Webreadback sind vollständig grün;
- keine Mail-, Secret-, robots.txt-, AI-Crawler- oder sonstige Nebenwirkung wurde stillschweigend eingeführt;
- `hallofmemory.de` bleibt bis zum erfolgreichen neuen Primärhost kontrolliert erhalten.

## Aktueller externer Blocker

**Fehlt:** Cloudflare-Berechtigung `account.zone.create` oder eine einmalige Zonenerstellung durch Aram.

**Nötig für:** Erzeugung der neuen Zone, frische Cloudflare-Nameserver und damit den nachfolgenden INWX-Delegationswechsel.

Bis dieses Gate erfüllt ist, werden bei INWX **keine Nameserver geändert**.