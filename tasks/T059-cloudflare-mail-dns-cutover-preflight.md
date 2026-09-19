---
id: T059
status: active
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
- bekannte DMARC-/Autoconfig-/Autodiscover-/Wildcard-Mailrecords bleiben erhalten;
- keine Mail- oder Service-Records sind proxied;
- Parent-DS/DNSSEC-Ausgangszustand ist frisch belegt;
- `scripts/dns-zone-cutover.mjs` liefert für die revisionsgebundenen Snapshots PASS;
- offene Unterschiede oder Vollständigkeitszweifel bleiben fail-closed dokumentiert;
- STRATO-Nameserver wurden durch T059 nicht verändert.

## Nicht-Ziel

- kein Nameserverwechsel;
- keine Mailmigration weg von STRATO;
- kein produktives Inquiry-Backend;
- kein HSTS;
- keine kostenpflichtige Cloudflare-Erweiterung ohne separate Freigabe.
