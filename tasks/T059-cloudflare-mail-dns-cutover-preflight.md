---
id: T059
status: done
priority: P0
dependencies: []
---
# Cloudflare-Mail-DNS-Cutover-Preflight für `hallofmemory.de`

## Ziel

Die noch fehlenden Provider-Voraussetzungen für den späteren Nameserverwechsel von STRATO zu Cloudflare vollständig und fail-closed herstellen, ohne die STRATO-Delegation in diesem Task bereits zu verändern.

T059 ist der operative Provider-Preflight unter T045. Der eigentliche Nameserverwechsel bleibt T045 vorbehalten und darf erst nach einem expliziten PASS dieses Tasks erfolgen.

## Ausgangslage — Read-only-Audit 19.09.2026

Direkt im STRATO-Kundenkonto für `hallofmemory.de` belegt:

- STRATO Standard Nameserver sind aktiv.
- A- und AAAA-Record verwenden die STRATO-Standardziele.
- Primärer MX ist der STRATO-Mailserver; ein Backup-MX ist deaktiviert.
- STRATO Standard DMARC ist aktiv.
- Es ist keine STRATO-SPF-Regel aktiviert.
- Es sind keine zusätzlichen benutzerdefinierten TXT-/CNAME-Records in der STRATO-Oberfläche eingetragen.
- Benutzerdefinierte SRV-Records sind deaktiviert.
- Dynamic DNS ist deaktiviert.
- In der Domainverwaltung sind keine angelegten Subdomains sichtbar.
- Die Oberfläche bietet für dieses Paket keinen erkennbaren vollständigen DNS-Zonenexport.
- STRATO verweigert autoritativen AXFR; ein klassischer externer Vollzonenexport ist daher nicht verfügbar.

Autoritativ gegen STRATO und die vorbereitete Cloudflare-Zone gelesen:

- öffentliche STRATO-Autorität: `docks09.rzone.de`, `shades16.rzone.de`;
- vorbereitete Cloudflare-Autorität: `quentin.ns.cloudflare.com`, `tia.ns.cloudflare.com`;
- die bekannten Inhalts-RRsets stimmen zwischen STRATO und Cloudflare für Apex `A`, Apex `AAAA`, Apex `MX`, `www CNAME`, `_dmarc TXT`, `_domainkey TXT`, `_autodiscover._tcp SRV`, `autoconfig CNAME` und Wildcard-`MX` überein;
- ein zufälliger nicht angelegter Hostname bestätigt nur den erwarteten Wildcard-MX, aber keine unerkannten Wildcard-A/AAAA/TXT/CNAME;
- beim Parent ist kein DS veröffentlicht; auch autoritativ ist derzeit kein DNSKEY belegt.

## Gefundener Blocker

STRATO verlangt bei externen Nameservern und weitergenutztem STRATO-Maildienst, dass die dafür nötigen Mail-DNS-Records im externen DNS selbst gepflegt werden.

In der vorbereiteten Cloudflare-Zone fehlen derzeit mindestens:

```text
TXT @
v=spf1 redirect=_spf.strato.com

CNAME strato-dkim-0002._domainkey
strato-dkim-0002._domainkey.rzone.de.

CNAME strato-dkim-0003._domainkey
strato-dkim-0003._domainkey.rzone.de.
```

Diese Records müssen vor einer Delegationsänderung in Cloudflare vorhanden und DNS-only sein. Die jeweils aktuellen STRATO-DKIM-Selectoren sind unmittelbar vor dem Cutover erneut gegen die dann aktuelle STRATO-Dokumentation bzw. Providerwahrheit zu prüfen, weil STRATO Key-Rollover durchführen kann.

## Umsetzung

1. Kundeneigenen Cloudflare-Account und die Zone `hallofmemory.de` authentifiziert read-backen:
   - Zone/Account eindeutig binden;
   - Plan/Kostenstatus prüfen;
   - aktuelle zugewiesene Nameserver frisch lesen;
   - keine kostenpflichtigen Zusatzdienste ohne Freigabe aktivieren.
2. Aktuellen statischen Hall-of-Memory-Build revisionsgebunden auf Cloudflare Workers Static Assets deployen und zunächst auf dem Cloudflare-Standardhost read-backen.
3. Cloudflare-DNS vor dem Cutover vervollständigen:
   - STRATO-Mail-MX unverändert DNS-only erhalten;
   - SPF `v=spf1 redirect=_spf.strato.com` ergänzen;
   - aktuelle STRATO-DKIM-Selectoren `0002` und `0003` als DNS-only CNAME ergänzen;
   - DMARC, `_domainkey`, Autoconfig/Autodiscover und Wildcard-MX unverändert erhalten;
   - keine Mail-/Serviceziele proxien.
4. Webzieländerungen ausdrücklich von Mailrecords trennen:
   - die derzeitigen STRATO-A/AAAA-Werte sind Quell-/Rollbackevidenz, nicht das endgültige Cloudflare-Webziel;
   - spätere Cloudflare-Worker-Custom-Domain-DNS-Änderungen nur als begründete `allowedWebValueChanges` im bestehenden T045-Gate zulassen.
   - die erst bei externen Nameservern erforderlichen SPF-/DKIM-RRsets als eng begründete `allowedTargetAdditions` binden; nur DNS-only `TXT` bzw. nicht-proxied `CNAME` sind dafür zulässig.
5. Einen neuen, zeitnahen STRATO- und Cloudflare-Snapshot für `scripts/dns-zone-cutover.mjs` erzeugen. Weil STRATO keinen Zonefile-Export liefert, muss die verwendete Ersatzinventur transparent als Provider-UI + autoritative DNS-Readbacks dokumentiert werden; `complete: true` darf nur gesetzt werden, wenn diese Evidenz den Taskvertrag tatsächlich erfüllt.
6. Comparator und DNSSEC-Gate aus T045 ausführen. Jede unerklärte Abweichung blockiert.
7. Ergebnis revisionsgebunden in T045 dokumentieren.
8. **Keinen Nameserverwechsel in T059 durchführen.** Bei PASS endet T059 mit einer kurzen, exakten STRATO-Anweisung für die spätere autorisierte Delegationsmutation in T045.

## Reihenfolge nach T059-PASS

Cloudflare Worker auf Standardhost grün
→ Cloudflare-Zone inkl. Mailrecords vollständig
→ T045-Vollzonen-/DNSSEC-Gate PASS
→ erst dann STRATO-Nameserver umstellen
→ Cloudflare-Zone aktiv abwarten/read-backen
→ Worker-Custom-Domain für `hallofmemory.de` binden
→ `www`-Strategie binden
→ TLS/HTTP/DNS/Mail extern read-backen

Cloudflare Workers Custom Domains benötigen eine aktive Cloudflare-Zone. Deshalb wird nicht behauptet, dass die finale Custom-Domain-Bindung bereits vor der Nameserverdelegation vollständig aktiviert werden kann.

## Akzeptanz

- authentifizierte aktuelle Cloudflare-Zone und aktuelle Nameserver sind belegt;
- Standardhost des exakten Site-Deployments liefert den erwarteten Build;
- STRATO-Mail-MX, SPF und aktuelle DKIM-Selectoren sind in Cloudflare korrekt und DNS-only vorhanden;
- die target-only SPF-/DKIM-RRsets sind im Comparator explizit und typgebunden als `allowedTargetAdditions` akzeptiert; andere zusätzliche Cloudflare-RRsets bleiben blockierend;
- bekannte DMARC-/Autoconfig-/Autodiscover-/Wildcard-Mailrecords bleiben erhalten;
- keine Mail- oder Service-Records sind proxied;
- Parent-DS/DNSSEC-Ausgangszustand ist frisch belegt;
- `scripts/dns-zone-cutover.mjs` liefert für die revisionsgebundenen Snapshots PASS;
- offene Unterschiede oder Vollständigkeitszweifel bleiben fail-closed dokumentiert;
- STRATO-Nameserver wurden durch T059 nicht verändert.


## Abschluss — 19.09.2026

T059 ist technisch terminal abgeschlossen. Die STRATO-Delegation wurde dabei nicht verändert.

Belegte Provider-/Deployment-Wahrheit:

- der authentifizierte Cloudflare-Kontext ist Arams kundeneigener Account; Tarifstatus ist `free`;
- Wrangler ist ausschließlich auf diesen Account gebunden und verwendet den minimierten OAuth-Scope-Satz `account:read`, `user:read`, `workers:write`, `workers_scripts:write`, `zone:read` plus `offline_access`;
- der aktuelle `main`-Build wurde auf den bestehenden Worker `hall-of-memory` deployt; Cloudflare-Version `e0f1f829-5ca9-44b3-a502-4ec447ed250f`;
- `https://hall-of-memory.aram21.workers.dev/` liefert `302` nach `/demo/`, `/demo/` liefert `200`; das ausgelieferte Demo-HTML ist byte-identisch zum geprüften Build (`sha256 27fe8a420e4829880607caa2d665f2a703ff6041997ec401622a1064f58e0ddd`);
- SPF `v=spf1 redirect=_spf.strato.com` sowie `strato-dkim-0002._domainkey` und `strato-dkim-0003._domainkey` sind in Cloudflare vorhanden; beide DKIM-CNAMEs und `autoconfig` sind DNS-only;
- beide Cloudflare-Autoritäten `quentin.ns.cloudflare.com` und `tia.ns.cloudflare.com` liefern die SPF-/DKIM-/Mailrecords konsistent;
- STRATO bleibt öffentlich autoritativ auf `docks09.rzone.de` und `shades16.rzone.de`; keine Delegationsmutation fand statt.

Vollständigkeitsbegründung des gleichwertigen STRATO-Provider-Snapshots:

- im STRATO-Kundenkonto wurden NS, A, AAAA, MX, TXT/CNAME, SRV, Dynamic DNS, DNSSEC/Domain-Guard-Zustand und die Subdomainverwaltung vollständig durchgesehen;
- es existieren keine angelegten Subdomains und keine zusätzlichen benutzerdefinierten TXT-/CNAME- oder SRV-Einträge; Standard-NS/A/AAAA/MX sind belegt;
- beide autoritativen STRATO-Nameserver liefern denselben Bestand; ein frischer zufälliger, nicht angelegter Host bestätigt ausschließlich den erwarteten Wildcard-MX und keine Wildcard-A/AAAA/TXT/CNAME/NS/SRV/CAA;
- AXFR wird von beiden STRATO-Nameservern verweigert und im verwendeten Paket ist kein klassischer Zonefile-Export vorhanden; STRATO dokumentiert Domain-Daten stattdessen als im Kundenlogin einsehbar/speicherbar;
- die providerseitig erzeugten Standardrecords `autoconfig`, `_autodiscover._tcp`, `_domainkey`, DMARC und Wildcard-MX wurden zusätzlich autoritativ read-backen;
- Parent-DS, autoritativer DNSKEY und Apex-CAA sind nicht vorhanden.

Finales T045-Gate:

- Snapshot-Zeit: `2026-09-19T10:34:00Z` für beide Seiten;
- STRATO-Snapshot-SHA-256: `fd9264379380fcf575da5211db4c44ccbd48a33d778834f9a5a1d629f0af5519`;
- Cloudflare-Snapshot-SHA-256: `ec896cbf6ef039ff4c7b29cba852531c3369bb35da74db3bdce7557444d1aa9c`;
- 9 STRATO-Inhalts-RRsets gegen 12 Cloudflare-Inhalts-RRsets;
- `passed: true`, keine Errors, nur erwartete TTL-Warnungen;
- DNSSEC-Gate `passed: true` bei `sourceDsCount: 0`;
- akzeptierte Target-Additions sind exakt Apex-SPF sowie DKIM-Selector `0002` und `0003`;
- keine `allowedWebValueChanges` erforderlich, weil die vorbereiteten Web-RRset-Werte noch den STRATO-Ausgangswerten entsprechen.

**Übergabe an T045:** Die nächste Änderung ist ausschließlich die autorisierte STRATO-Delegation auf `quentin.ns.cloudflare.com` und `tia.ns.cloudflare.com`. Nach Cloudflare-`Active` werden Worker-Custom-Domain, `www`-Strategie sowie TLS/Web/Mail extern read-backen.


## Nicht-Ziel

- kein Nameserverwechsel;
- keine Mailmigration weg von STRATO;
- kein produktives Inquiry-Backend;
- kein HSTS;
- keine kostenpflichtige Cloudflare-Erweiterung ohne separate Freigabe.
