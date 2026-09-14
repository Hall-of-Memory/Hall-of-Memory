# Hall of Memory — Business + Legal Ground Truth

Stand: 2026-09-14
Status: Working Ground Truth für T057

Dieses Dokument ist die kanonische fachliche Eingabe für die noch offenen V1-Legal-/Privacy-/Production-Gates. Es ersetzt keine finale Rechtsprüfung und erfindet keine unbekannten Betreiber-, Vertrags- oder Retentiondaten.

## Statusklassen

- `confirmed`: durch Repo, Kundenanforderung oder technische Evidenz belegt; darf als V1-Prämisse verwendet werden.
- `decision-required`: externe Betreiber-/Geschäftsentscheidung fehlt; abhängige Production-Gates bleiben fail-closed.
- `deferred`: bewusst keine V1-Entscheidung; eigener späterer Task bleibt zuständig.

## 1. Bestätigte V1-Wahrheiten

| Thema | Status | Ground Truth | Evidenz / Folge |
|---|---|---|---|
| V1-Vertragsgrenze | confirmed | Website-Anfrage ist unverbindlich und erzeugt weder Reservierung noch Buchung noch Zahlung. | `docs/inquiry-contract.md`, `docs/customer-requirements.md` |
| Anfragepfad | confirmed | Browser → Cloudflare Worker → Validierung/Turnstile → D1 → Outbox → Betreiberbenachrichtigung. | `docs/inquiry-contract.md`, `docs/privacy-data-flow.md` |
| Fachliche Anfragewahrheit | confirmed | D1 ist fachliche Wahrheit; E-Mail ist nur Benachrichtigung. | `docs/privacy-data-flow.md` |
| Kundenmail | confirmed | V1 sendet keine automatische E-Mail an die anfragende Person. | `docs/privacy-data-flow.md` |
| Adminzugriff | confirmed | Kontakt-/Detaildaten liegen hinter Cloudflare-Access-geschütztem Adminpfad; Listenansicht ist datensparsam. | T049 |
| Tracker/Marketing | confirmed | Aktueller öffentlicher Build enthält keine Analyse-, Marketing- oder Social-Embed-Integration. | T008/T027 |
| Turnstile | confirmed | Turnstile gehört ausschließlich zum Anfragepfad und wird nicht als Fachdaten gespeichert. | T008/T027, `docs/privacy-data-flow.md` |
| Contentpflege | confirmed | Git + Codex ist der bevorzugte Default für klassische öffentliche Inhalte, solange reale Nutzung keine Bedienlücke belegt. | T011 |
| Automationsplattform | confirmed | Für V1 wird keine zusätzliche Automationsplattform vorausgesetzt. Bestehender Worker/D1/Outbox-Pfad bleibt ausreichend, bis wiederkehrender Bedarf belegt ist. | T057; spätere Prüfung T058 |
| Private Eventgalerie | deferred | Der geschützte veranstaltungsbezogene Fotobereich ist ein getrenntes Produktziel und kein stiller Bestandteil des Inquiry-V1-Livegangs. | T025 |
| Verbindliche Buchung | deferred | Sofortbuchung, Holds, Zahlung, Storno und Umbuchung bleiben außerhalb von V1. | T013/T011 |

## 2. V1-Entscheidungsbogen

Nur die folgenden Punkte blockieren den V1-Livegang fachlich. Nicht zutreffende Felder werden ausdrücklich als `nicht einschlägig` dokumentiert statt geraten.

### D1 — Betreiberidentität

Status: `decision-required`

Benötigt:

- vollständiger Name bzw. Unternehmensbezeichnung;
- Rechtsform, falls vorhanden;
- ladungsfähige Anschrift;
- vertretungsberechtigte Person, soweit einschlägig;
- öffentliche E-Mail-/Kontaktangaben;
- Registerangaben nur, soweit tatsächlich vorhanden/einschlägig;
- USt-IdNr./W-IdNr./sonstige Pflichtangaben nur, soweit tatsächlich vorhanden/einschlägig.

Wofür nötig: finales Impressum, Verantwortlicher in Datenschutzinformationen, produktive Kontaktgrenze.

Primärevidenz: Betreiber-/Unternehmensunterlagen oder ausdrücklich freigegebene Angaben des Betreibers.

### D2 — Produktive Kontakt- und Adminziele

Status: `decision-required`

Benötigt:

- Betreiber-Zieladresse für neue Anfragehinweise;
- freigegebene Absender-/Reply-to-Regel;
- berechtigte Adminidentitäten für Cloudflare Access;
- Festlegung, welche dieser Angaben öffentlich sichtbar sein dürfen.

Wofür nötig: produktive Worker-/Mail-/Access-Konfiguration und Datenschutz-Empfänger-/Zugriffsangaben.

### D3 — Inquiry-Retention

Status: `decision-required`

Benötigt:

- konkrete Aufbewahrungsfrist für unverbindliche Anfragen;
- Ereignis, ab dem die Frist läuft (z. B. Eingang, Abschluss/Ablehnung der Bearbeitung);
- Regel für unbeantwortete, abgelehnte und erledigte Anfragen;
- Entscheidung, ob und wann Daten einer späteren tatsächlichen Vertragsbeziehung in einen getrennten Geschäfts-/Nachweispfad überführt werden.

Wichtig: T057 setzt **keine Zahl** ein. Die Frist muss aus realem Betriebsbedarf und der rechtlich freigegebenen Policy stammen.

Wofür nötig: `src/release/inquiry-data-policy.json`, T049 Production-Readiness.

### D4 — Löschumfang und Enforcement

Status: `decision-required`

Benötigt:

- Löschung/Anonymisierung in D1;
- Lebenszyklus von Outbox-/Notification-Metadaten;
- Löschregel für Betreiberpostfach;
- Umgang mit manuellen Exporten;
- Umgang mit Backups, soweit solche im realen Produktionspfad bestehen;
- revisionsgebundener technischer oder betrieblicher Nachweis, dass die Regel tatsächlich durchgesetzt wird.

Wofür nötig: T049 Closeout und produktive Freigabe.

### D5 — Produktions-Dienstleisterinventar

Status: `decision-required`

Für jeden real eingesetzten Dienst festhalten:

| Dienst/Rolle | produktiv aktiv? | verarbeitet personenbezogene Anfragedaten? | Zweck | Datenkategorie | vertragliche/technische Evidenz |
|---|---:|---:|---|---|---|
| Cloudflare Static Assets / Website | noch zu bestätigen | typischer Websitezugriff; konkrete produktive Konfiguration belegen | Websiteauslieferung | technische Zugriffsdaten nach realem Dienst | offen |
| Cloudflare Worker | noch zu bestätigen | ja, sobald Inquiry live | Annahme/Validierung der Anfrage | Formulardaten + kurzlebiger Turnstile-Transport | Repo technisch belegt, Produktivbindung offen |
| Cloudflare D1 | noch zu bestätigen | ja, sobald Inquiry live | fachliche Speicherung | Anfragefelder/Status | Repo technisch belegt, Produktivbindung offen |
| Cloudflare Turnstile | noch zu bestätigen | technischer Prüfdienst | Missbrauchsschutz | kurzlebiger Prüf-/Transportkontext | Produktiv-Key/Hostname offen |
| Cloudflare Access | noch zu bestätigen | Adminidentität/Zugriff | Adminschutz | Auth-/Zugriffskontext | Produktiv-App/Identitäten offen |
| E-Mail-/Notification-Dienst | offen | minimierte Betreiberbenachrichtigung | Betreiberhinweis | Anfrage-ID, Angebot, Wunschdatum nach aktuellem Vertrag | konkreter Anbieter/Ziel offen |

Preview-/Entwicklungssysteme wie GitHub Pages oder Vercel gelten **nicht automatisch** als Teil des produktiven personenbezogenen Inquiry-Pfads. Falls dort später echte Anfragedaten verarbeitet werden, muss diese Tabelle vor Aktivierung entsprechend erweitert werden.

### D6 — Öffentliche Rechtstextfreigabe

Status: `decision-required`

Erst nach D1–D5:

- finales Impressum aus bestätigten Betreiberangaben;
- finale Datenschutzinformation aus realem Datenfluss und realem Dienstleisterinventar;
- Consent-/Cookie-Entscheidung ausschließlich nach tatsächlich aktiven Diensten;
- keine generischen Drittanbieter, Cookies oder Rechtsgrundlagen vorsorglich behaupten.

Wofür nötig: T008 Closeout und Entfernen des Legal-Draft-Status.

## 3. Bewusst vertagte Entscheidungen

### Private Eventgalerie

Status: `deferred` → T025

Vor Aktivierung separat entscheiden und rechtlich/technisch prüfen:

- Uploadprozess;
- Zugriff per Link/Code/Authentifizierung;
- Ansichts-/Downloadrechte;
- Widerruf/Rotation;
- Aufbewahrung/Löschung;
- erwartetes Datenvolumen;
- öffentliche Werbenutzung von Eventbildern;
- Umgang mit Gästen und gegebenenfalls Minderjährigen.

Keine dieser Regeln wird aus dem Inquiry-Datenschutz abgeleitet.

### Verbindliche Buchung und Vertragsbedingungen

Status: `deferred` → T011/T013

Vor einer verbindlichen Onlinebuchung bzw. standardisierten AGB separat entscheiden:

- Vertragszeitpunkt;
- Inventar/Ressourcen;
- Miet-/Leistungsdauer und Puffer;
- Lieferung/Fahrtkosten;
- Anzahlung/Zahlung;
- Storno/Umbuchung;
- Schäden/Ausfall;
- Paket-/Kombinationsregeln.

V1 darf diese Regeln nicht implizit durch UI oder Backend behaupten.

### Automatisierung

Status: `deferred` → T058

Keine zusätzliche Plattform auf Vorrat. Nach realer Nutzung wird nur wiederholte manuelle Arbeit mit belegtem Zeit-/Fehlerrisiko bewertet. Entscheidungsleiter:

1. gar keine Automation;
2. normaler Worker-/TypeScript-Code;
3. vorhandene Cloudflare-Bausteine wie Cron/Queue, wenn das konkrete Problem sie verlangt;
4. langlebige Workflow-Engine erst bei nachgewiesener Orchestrierungskomplexität;
5. n8n erst, wenn visuelle Selbstpflege oder hohe SaaS-Integrationsbreite einen belegten Vorteil erzeugt.

## 4. Externe Rechtsprüfung — Eskalationskriterien

Eine externe anwaltliche Prüfung ist **kein pauschaler V1-Default**, sondern wird gezielt ausgelöst, wenn nach Ground-Truth-Arbeit eine individuelle Hochrisikofrage verbleibt, insbesondere:

- Rechte/Einwilligungen bei Eventfotos, Gästen oder Minderjährigen;
- öffentliche Werbenutzung von Eventbildern;
- individuelle Storno-/Haftungs-/Vermietungsklauseln;
- Widerrufsfragen bei konkreten terminbezogenen Verbraucherleistungen;
- Kombinationen aus Vermietung, Dienstleistung und Fotografie, deren Vertragsgrenze nicht aus den belegten Geschäftsregeln eindeutig ableitbar ist.

Die Übergabe an einen Anwalt soll dann nicht „prüfe alles“ lauten, sondern den belegten Prozess plus wenige konkrete Restfragen enthalten.

## 5. Übergabe an bestehende Tasks

- **T008:** verwendet D1, D2, D5 und D6 für finales Impressum/Datenschutz/Consent und Produktionsreadback.
- **T049:** verwendet D3 und D4 für konkrete Retention-/Löschpolicy und Enforcement-Evidenz.
- **T011:** verwendet die bestätigte V1-Grenze und belässt Buchung/CMS-/Medienfragen nur dort offen, wo reale Geschäftsentscheidungen fehlen.
- **T025:** bleibt alleiniger Owner der privaten Eventgalerie.
- **T013:** bleibt alleiniger Owner einer verbindlichen Buchungsengine.
- **T058:** bewertet erst nach realer Nutzung, ob zusätzliche Automatisierung überhaupt nötig ist.

## 6. Closeout-Kriterium T057

T057 kann geschlossen werden, sobald D1–D6 mit Primärevidenz befüllt sind und T008/T049/T011 die Werte revisionsgebunden übernehmen können. `deferred`-Punkte verhindern den T057-Closeout nicht, solange sie im V1-Livegang technisch und kommunikativ tatsächlich deaktiviert bleiben.
