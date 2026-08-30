# T045 — `hallofmemory.de` als Arbeits-/Produktionsdomain aktivieren und Source-Privatsphäre sauber trennen

Status: active
Priorität: P0

## Ziel

Hall of Memory soll ab jetzt unter der kundeneigenen Domain `https://hallofmemory.de` erreichbar sein und dort weiterentwickelt werden. Bis Inhalte, Rechtstexte und produktive Anfrageinfrastruktur final freigegeben sind, ist dies bewusst ein öffentlicher **Entwicklungsstand mit `noindex`**, kein SEO-Launch.

GitHub Pages ist danach nur noch ein entbehrlicher Übergangs-Fallback.

Die öffentliche Website und die Vertraulichkeit des Source-Repositories sind getrennte Schichten:

- `hallofmemory.de` ist öffentlich erreichbar;
- das Source-Repo soll so privat wie sinnvoll sein;
- private Eventfotos, Kundendaten, Secrets und nicht öffentliche Source-Master bleiben unabhängig von der GitHub-Sichtbarkeit außerhalb des normalen Git-/Webpfads.

## Kundenentscheidung — 2026-08-22

Der Kunde möchte die Website jetzt direkt auf der vorhandenen Domain veröffentlichen und anschließend dort weiterentwickeln. Die Domain wurde fotografisch als `hallofmemory.de` im kundeneigenen STRATO-Konto belegt.

## Live-Evidenz — 2026-08-22

- Domain: `hallofmemory.de`.
- Autoritative Nameserver: `docks09.rzone.de` und `shades16.rzone.de` — STRATO/rzone.
- Apex-A-Record: `217.160.0.152`.
- `www.hallofmemory.de` ist CNAME auf `hallofmemory.de`.
- Das GitHub-Repo `Hall-of-Memory/Hall-of-Memory` liegt unter Kundenhoheit; aktueller Zugriff des Entwicklungsaccounts ist Repo-`ADMIN`, aber keine Organisations-Administration.
- `main` besitzt Branch Protection mit Required Check `verify`, PR-Pflicht, Conversation Resolution, Admin-Enforcement sowie deaktiviertem Force-Push und Branch-Löschen.
- GitHub dokumentiert Branch Protection/Rulesets für private Repositories nicht für GitHub Free for organizations, sondern für passende bezahlte Pläne. Die Repository-Sichtbarkeit darf daher nicht blind auf `private` gestellt werden, solange kein passender Tarif live belegt ist.
- GitHub Pages wurde extern mit HTTP 200 auf `/demo/` und `/demo/rahmen/` bestätigt.
- Wrangler ist auf dem Heim-PC derzeit nicht an ein Cloudflare-Kundenkonto authentifiziert.
- Cloudflare Workers Custom Domains erfordern eine Domain/Zone, deren Nameserver von Cloudflare verwaltet werden. STRATO kann Registrar bleiben; für den Cloudflare-Cutover werden die autoritativen Nameserver nach dem Anlegen der kundeneigenen Zone kontrolliert auf die von Cloudflare ausgegebenen Werte umgestellt.

## Bereits umgesetzte Vorbereitung
- README-Terminologie auf die Projekt-/Betreiberperspektive bereinigt: Meta-Bezeichnungen wie `kundeneigen` oder `Kundenauftrag` entfallen dort. Die operative Zuständigkeitsgrenze bleibt erhalten, indem STRATO als Registrar und Hall of Memory als Inhaber des Registrarzugriffs benannt wird; die Datenschutzgrenze ist präzise als `personenbezogene Eventdaten` formuliert statt pauschal als `Daten`.

- README, AGENTS, CONTRIBUTING, T009 und Deployment-Runbook auf `hallofmemory.de` als Primärziel aktualisiert.
- `PUBLIC_SITE_URL=https://hallofmemory.de npm run build` erfolgreich ausgeführt.
- `public/_redirects` eingeführt mit exakt:

  ```text
  / /demo/ 302
  ```

  Damit führt die echte Domainwurzel auf Cloudflare vorläufig auf die aktuell gepflegte Kundenwebsite, ohne den intern sicherheitsgehärteten Root-Scaffold und seine Formularverträge zu ersetzen.
- Quality-Gate von „keine Redirect-Datei erlaubt“ auf „genau diese eine revisionsgebundene Redirect-Regel erlaubt“ gehärtet; zusätzliche/abweichende Regeln bleiben rot.
- Vollständiges `npm run verify` nach dieser Routingänderung erfolgreich.
- Der Redirect ist absichtlich `302`: solange die Website gemeinsam weiterentwickelt wird, wird noch keine permanente URL-/SEO-Entscheidung behauptet.
- Aktueller Codex-Review auf dem Domain-Cutover-Head verlangte zu Recht zwei zusätzliche Gates: Impressum/Datenschutz müssen vom neuen primären `/demo/`-Einstieg erreichbar bleiben, und der spätere Anfrage-Worker braucht einen Dry-Run gegen die tatsächlich befüllte Produktionskonfiguration statt gegen die lokale Dummy-Konfiguration. Beide Punkte werden in demselben PR umgesetzt und regressionsgesichert.
- Der anschließende Codex-Review auf dem Fix-Head präzisierte den Worker-Pfad: Die produktive Konfiguration muss **vor** Export/Migration der Remote-D1 existieren und deren `DB`-Target binden. Das Runbook ordnet deshalb Config-Erstellung + Dry-Run vor alle D1-Operationen und verwendet bei Export, Migration-Readback und Migration-Apply explizit dieselbe `wrangler.production.jsonc`.
- Der nächste Codex-Review fand einen kritischeren Stage-1-Punkt: Der bisherige Demo-Submit sah auf der echten Domain wie ein nutzbares Anfrageformular aus, verwarf die Daten aber nur lokal. Der öffentliche Arbeitsstand macht den Anfragebereich daher sichtbar **disabled**, entfernt den Mock-Submit-/Preselection-Pfad und weist klar darauf hin, dass bis Stage 2 keine Anfragen übermittelt werden.
- Der Review auf dem darauf folgenden Fix-Head stellte zu Recht klar, dass diese Stage-1-Deaktivierung nicht dauerhaft hinter dem Root-Redirect bleiben darf: Stage 2 bekommt deshalb einen eigenen verpflichtenden Routing-/UI-Commit. Vor einem aktiven Site-Build muss `/ /demo/ 302` entfernt oder auf einen tatsächlich aktiven Anfragepfad ersetzt sein; API-/Turnstile-Variablen allein können Stage 2 nicht freischalten.
- Der aktuelle Codex-Review präzisierte zusätzlich die Secret-Bindung: `TURNSTILE_SECRET_KEY` muss mit `--config spikes/inquiry-worker/wrangler.production.jsonc` ausdrücklich am Inquiry-Worker gesetzt werden; ein configloser Root-Befehl könnte sonst den statischen Site-Worker treffen. Der Quality-Gate prüft diese Bindung und die Reihenfolge Secret vor Worker-Deploy.
- Der darauf folgende Review fand einen DNS-Cutover-P1: Apex-`A` und `www` reichen vor einem Nameserverwechsel nicht als Sicherung. T045 verlangt deshalb vor jeder Delegationsmutation einen vollständigen autoritativen STRATO-Zonen-Snapshot einschließlich Mail-/Verifikationsrecords und DNSSEC/DS-Zustand, vollständige Abbildung in Cloudflare und einen recordweisen Vergleich; erst ein `PASS` dieses Vollzonen-/DNSSEC-Gates erlaubt den Nameserverwechsel.

## Technische Hardening-Evidenz — 24.08.2026

Frischer Readback auf `main` `a0dfa8f4c46da7be1c8ecff6a95a955e843ffe3c` bestätigt weiterhin die externe Cutover-Grenze:

- `wrangler 4.124.0` ist auf dem Heim-PC nicht am Cloudflare-Kundenkonto authentifiziert.
- Der isolierte vorhandene Cloudflare-Browserpfad konnte die gespeicherte Google-Kontoidentität wiedererkennen, verlangte aber eine erneute Geräte-/Identitätsbestätigung. Es wurde kein Passwort gelesen oder eingegeben und keine Provider-Mutation ausgelöst.
- Die öffentliche DNS-Sicht zeigt weiterhin STRATO/rzone als Autorität: `docks09.rzone.de` und `shades16.rzone.de`; Apex `A=217.160.0.152`, `AAAA=2001:8d8:100f:f000::200`, `MX 5 smtpin.rzone.de`, `www` als CNAME zum Apex und `_dmarc` mit `p=reject`. Öffentlich war kein DS sichtbar. Dieser öffentliche Readback ist ausdrücklich **kein vollständiger autoritativer Zonenexport** und entsperrt keinen Nameserverwechsel.

Die zuvor nur dokumentierte Vollzonen-/DNSSEC-Anforderung besitzt deshalb jetzt einen echten fail-closed Prüfpfad:

- `scripts/dns-zone-cutover.mjs` vergleicht deklarierte vollständige STRATO-/Cloudflare-Snapshots owner-/typgebunden.
- `NS`/`SOA` müssen in beiden Vollsnapshots am Zonenapex als Authority-Evidenz vorhanden sein; nur diese Apex-RRsets werden als providerverwaltete Unterschiede aus dem Inhaltsvergleich ausgenommen. Delegierte oder sonstige subdomainbezogene `NS`/`SOA` sowie alle übrigen RRsets müssen vorhanden und erklärbar sein.
- Absolute Ownernamen außerhalb der Zone sowie nicht ISO-8601-/zeitzonengebundene Zeitstempel werden abgewiesen; Snapshots über sechs Stunden Alter sowie Quell-/Zielsnapshots mit mehr als einer Stunde Abstand blockieren; der PASS-Report bindet beide normalisierten Snapshots über SHA-256.
- Cloudflare-Webrecords müssen ihren Proxyzustand explizit deklarieren und jeder tatsächlich proxied Owner muss zusätzlich in `proxiedWebOwners` allowlist-gebunden sein; damit bleiben auch Mail-/Verifikations-Aliases fail-closed. Von `MX`/`SRV` referenzierte Ziele müssen DNS-only bleiben.
- Bewusste Webzieländerungen sind nur eng für `A`/`AAAA`/`CNAME` mit begründetem Snapshot-Eintrag zulässig; Mail-/Serviceziele können so nicht freigegeben werden.
- Vorhandene STRATO-DS-Records blockieren, solange Cloudflare-DNSSEC-Migrationsreife nicht explizit bestätigt ist.
- Der Prüfbericht gibt keine RRset-Werte, TXT-Verifikationstokens oder Freigabegründe aus; malformed JSON wird mit generischer Parse-/Read-Fehlerklasse statt roher Parserdiagnose gemeldet. Ungenutzte Web- oder Proxy-Ausnahmen blockieren statt als stille Dauerfreigabe liegenzubleiben.
- Regressionen für fehlende Authority-/RRsets, stale oder zeitlich auseinanderliegende Snapshots, unerklärte Werte, unerwartete Records, Proxyfehler, unsichere/ungenutzte Web-Ausnahmen, DNSSEC-Blockade, Digest-Bindung und Report-Redaktion sind Bestandteil des kanonischen `npm run verify`.

Damit ist die technische Vorbedingung für den späteren Zonenvergleich gehärtet. Der reale Cutover bleibt dennoch bis zum authentifizierten Cloudflare-Readback und zur autorisierten STRATO-Mutation offen.

## Frischer Provider-/Domain-Readback — 29.08.2026

Der Cutover wurde erneut ausschließlich read-only gegen die aktuellen externen Autoritäten geprüft. Es gab keine DNS-, Nameserver-, Cloudflare- oder STRATO-Mutation.

- Die `.de`-Parent-Delegation wurde direkt bei DENIC gelesen und nennt `docks09.rzone.de` sowie `shades16.rzone.de`. Eine direkte Abfrage der STRATO-Zone liefert dieselben NS; Parent und Child sind damit aktuell konsistent. Ein zuvor über einen rekursiven Resolver beobachtetes altes Paar `docks18.rzone.de`/`shades10.rzone.de` war Cache-/Resolverzustand und ist **keine** aktuelle Delegationswahrheit.
- STRATO-SOA: `shades16.rzone.de`, Serial `2026081916`.
- Direkt autoritativ bestätigte öffentliche RRsets: Apex `A=217.160.0.152`, Apex `AAAA=2001:8d8:100f:f000::200`, `MX 5 smtpin.rzone.de`, `www` als CNAME zum Apex und `_dmarc` als `v=DMARC1;p=reject;`. Apex-TXT und Apex-CAA liefern derzeit keine Records.
- DENIC liefert für `hallofmemory.de` keinen DS-Record. Es existiert damit aktuell kein Parent-DS, der einen Nameserverwechsel unmittelbar durch eine alte DNSSEC-Delegation blockiert. Der spätere Cloudflare-DNSSEC-Zustand muss trotzdem im vorgesehenen Cutover-Gate belegt werden.
- Ein autoritativer AXFR gegen STRATO wird verweigert. Der externe DNS-Readback bleibt deshalb absichtlich **unvollständig** und ersetzt nicht den vorgeschriebenen Provider-Zonenexport; insbesondere unbekannte Subdomains, TXT-Verifikationen, SRV-Records oder weitere RRsets dürfen nicht aus ihrem Nichtfund abgeleitet werden.
- `http://hallofmemory.de/` liefert derzeit HTTP 200 von Apache und eine STRATO-Parkseite mit „Domain reserviert“/„keine Inhalte hinterlegt“. Die Wunschdomain liefert also noch nicht Hall of Memory.
- `https://hallofmemory.de/` scheitert aktuell bereits im TLS-Handshake (`tlsv1 alert internal error`). Die Domain ist damit derzeit auch technisch nicht als sichere Arbeitsdomain nutzbar.
- `wrangler whoami` bestätigt weiterhin, dass die lokale Wrangler-Installation nicht am kundeneigenen Cloudflare-Kontext authentifiziert ist.
- Die früher im Provider-Setup beobachteten Cloudflare-Nameserver `ignat.ns.cloudflare.com` und `rose.ns.cloudflare.com` antworten für `hallofmemory.de` aktuell jeweils `REFUSED` mit `Not Authoritative`. Diese historischen Werte sind daher **veraltet und dürfen nicht für einen Nameserverwechsel wiederverwendet werden**. Die tatsächlich aktuelle Cloudflare-Zone und ihre neu ausgegebenen Nameserver müssen nach authentifiziertem Provider-Readback frisch bestimmt werden.
- Ein isolierter, lokal kopierter Chrome-Profilsnapshot erreichte `dash.cloudflare.com`, blieb im headless Readback aber an Cloudflares Sicherheitsüberprüfung stehen. Diese Schutzprüfung wurde nicht umgangen; nach dem Test wurde der isolierte Profilsnapshot wieder entfernt. Aus diesem Versuch folgt ausdrücklich keine Cloudflare-Authentifizierungswahrheit.
- Der vorhandene `scripts/dns-zone-cutover.mjs` bleibt das maßgebliche technische Vollzonen-/DNSSEC-Gate. Mit den extern sichtbaren Teilrecords allein darf er nicht künstlich auf `complete:true` gefüttert werden.

**Folge:** Die Repo-seitige Cutover-Härtung ist vorhanden; der nächste echte Hebel liegt beim Providerzugriff. Vor jeder Nameservermutation sind weiterhin ein authentifizierter Cloudflare-Zonenreadback, ein vollständiger STRATO-Zonenexport bzw. gleichwertig vollständiger Provider-Snapshot, die vollständige Cloudflare-Abbildung samt Comparator-PASS und anschließend die autorisierte STRATO-Delegationsänderung erforderlich.

## Zielarchitektur

```text
Besucher
  |
  v
https://hallofmemory.de/
  |
  | 302
  v
https://hallofmemory.de/demo/
  |
  v
Cloudflare Workers Static Assets

GitHub (kundenkontrolliert)
  +-- Source / PR / CI
  +-- keine produktiven Secrets
  +-- keine privaten Eventmedien
  +-- Pages nur Übergangs-Fallback

STRATO
  +-- Registrar / Vertrag
  +-- Nameserverdelegation an kundeneigene Cloudflare-Zone nach Cutover
```

## Umsetzung ab hier

1. Aktuellen Branch/PR mit Domainstrategie, kontrolliertem Root-Redirect und Dokumentationskorrekturen grün integrieren.
2. Kundeneigenen Cloudflare-Account/Zone und kostenrelevanten Planstatus live lesen; keine kostenpflichtige Zusatznutzung ohne Freigabe aktivieren.
3. Statische Site revisionsgebunden auf Cloudflare deployen und zunächst auf dem Cloudflare-Standardhost read-backen.
4. `hallofmemory.de` als Custom Domain an genau dieses Deployment binden.
5. Vor jeder Delegationsmutation die **vollständige autoritative STRATO-Zone** inventarisieren/exportieren: alle benötigten RRsets/Subdomains inklusive `A`/`AAAA`/`CNAME`/`MX`/`TXT`/`SRV`/`CAA`, TTL/Priorität sowie `NS`/`SOA` und DNSSEC/DS-Ausgangszustand separat dokumentieren.
6. Sämtliche weiterhin benötigten Records in der kundeneigenen Cloudflare-Zone anlegen/importieren; Mail-/Verifikationsrecords bleiben DNS-only. Cloudflare-Zone anschließend normalisiert recordweise gegen den STRATO-Snapshot vergleichen und unerklärte Abweichungen blockieren.
7. CAA/TLS-Kompatibilität und DNSSEC-Migrationszustand prüfen; bei altem inkompatiblem DS keinen Nameserverwechsel durchführen.
8. Die von Cloudflare tatsächlich ausgegebenen Nameserver revisionsgebunden lesen.
9. **Nur bei PASS von Vollzonenvergleich und DNSSEC-Gate** die STRATO-Nameserver kontrolliert auf die Cloudflare-Werte umstellen.
10. DNS-Propagation, Webrecords, Mail-/Verifikationsrecords, TLS und `https://hallofmemory.de`/`www` extern lesen.
11. Exakten `302 /demo/`, anschließend HTTP 200, Security-Header, Assets, Navigation sowie Demo-/Rahmenseiten auf der echten Domain prüfen.
12. Erst nach erfolgreichem Domain-Readback GitHub Pages aus der Primärrolle nehmen und den Legacy-Mirror aus T018/T043 archivieren/deaktivieren.
13. Repository-Sichtbarkeit separat entscheiden:
   - bei nachgewiesenem GitHub-Plan mit Branch Protection für private Repositories: Repo auf privat umstellen und Schutzregeln vollständig read-backen;
   - ohne diesen Nachweis: bereinigtes Repo vorerst öffentlich lassen, statt Schutzregeln zu verlieren oder ungefragt einen kostenpflichtigen Plan zu aktivieren.

## Akzeptanz Arbeitsdomain

- `https://hallofmemory.de/` liefert revisionsgebunden `302` auf `/demo/`.
- `https://hallofmemory.de/demo/` und `/demo/rahmen/` liefern HTTP 200.
- TLS ist gültig und DNS-Ziel/Nameserver sind dokumentiert.
- `www` hat eine definierte Redirect-/Canonical-Strategie ohne unkontrollierte Doppeladresse.
- Die Seite bleibt bis zur Launchfreigabe `noindex` und behauptet kein produktives Anfragebackend.
- GitHub Pages ist nach erfolgreichem Cutover nicht mehr notwendige Produktions- oder Primärpreview-Infrastruktur.
- Source-Repo-Sichtbarkeit ist als eigene Sicherheits-/Kostenentscheidung belegt; Branchschutz wird nicht stillschweigend geopfert.
- Private Eventfotos und Secrets befinden sich weiterhin nicht im Source-Repo.

## Späterer SEO-/V1-Launch

Erst nach finalen Inhalten, Rechtstexten und T008/T010/T011 wird `launchStatus: production` bewusst gesetzt, `noindex` entfernt, Canonical/Sitemap gegen `https://hallofmemory.de` geprüft und das produktive Anfragebackend aktiviert.

## Externe Grenze

Für den eigentlichen Domain-Cutover fehlen derzeit zwei Autoritäten:

1. authentifizierter Zugriff auf den **kundeneigenen Cloudflare-Kontext**;
2. autorisierte STRATO-Nameservermutation.

Ohne diese Provider-Autorität werden weder Zone noch Nameserver geraten oder blind verändert. Neue kostenpflichtige Pläne/Dienste bleiben genehmigungspflichtig.
