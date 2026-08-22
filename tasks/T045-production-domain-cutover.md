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
