---
id: T057
status: active
priority: P0
dependencies: [T027]
---
# Business + Legal Ground Truth für V1

## Ziel

Die mehrfach verteilten externen Blocker aus T008, T011 und T049 in **eine einzige fachliche Wahrheitsquelle** überführen, ohne Rechts-, Vertrags- oder Geschäftsregeln zu erfinden.

T057 erzeugt keine neue Runtime und keine neue Plattform. Der Task hält ausschließlich fest:

1. was für V1 bereits bestätigt und technisch belegt ist;
2. welche Betreiber-/Geschäftsentscheidungen für den Livegang wirklich noch fehlen;
3. welche Themen bewusst auf spätere Produktstufen verschoben bleiben;
4. welche Evidenz anschließend T008/T049/T011 zum Entblocken verwenden dürfen.

Kanonische Arbeitsdatei: `docs/business-legal-ground-truth.md`.

## Bestätigte V1-Grenze

- V1 bleibt **inquiry-only**: Eine Website-Anfrage ist keine Reservierung, keine Buchung und keine Zahlungszusage.
- Der bestehende Pfad Browser → Worker → Validierung/Turnstile → D1 → Outbox → Betreiberbenachrichtigung bleibt die technische Basis.
- D1 bleibt für Anfragen die fachliche Wahrheit; E-Mail ist nur Benachrichtigung.
- Es gibt in V1 keine automatische Kundenmail, solange sie nicht ausdrücklich fachlich beschlossen wird.
- Der öffentliche Build erhält keine prophylaktische Analyse-, Marketing-, Social-Embed- oder Consent-Schicht.
- Git + Codex bleibt der bevorzugte Basispfad für klassische öffentliche Inhalte, solange reale Benutzung keine Bedienlücke belegt.
- Der private Event-Fotobereich bleibt ein getrenntes Produktziel in T025 und wird nicht stillschweigend Teil des Inquiry-V1-Livegangs.
- Eine verbindliche Sofortbuchung bleibt T013 und darf nicht aus T057 abgeleitet werden.

## Noch fehlende V1-Entscheidungen

Die folgenden Punkte sind echte externe Inputs. Solange sie fehlen, bleiben die jeweiligen Production-Gates fail-closed:

1. **Betreiberidentität für Impressum und Datenschutz**
   - Name/Firma bzw. Rechtsform
   - ladungsfähige Anschrift
   - vertretungsberechtigte Person, soweit einschlägig
   - öffentliche Kontaktangaben
   - Register-/Steuer-/USt.-Angaben nur, soweit tatsächlich einschlägig und belegt

2. **Produktive Kontakt- und Betriebsziele**
   - Betreiber-Zieladresse für Benachrichtigungen
   - freigegebene Absender-/Reply-to-Regel
   - berechtigte Adminidentitäten

3. **Inquiry-Retention und Löschung**
   - konkrete Aufbewahrungsfrist für unverbindliche Anfragen
   - Lösch-/Lifecycle-Regel für erledigte, abgelehnte oder unbeantwortete Anfragen
   - Behandlung von Outbox-/Notification-Metadaten
   - Behandlung von Betreiberpostfach, Exporten und gegebenenfalls Backups innerhalb derselben Policy
   - revisionsgebundene Enforcement-Evidenz für T049

4. **Produktions-Dienstleisterinventar**
   - tatsächlich aktivierte Cloudflare-Dienste/Bingungen im personenbezogenen Pfad
   - realer E-Mail-/Benachrichtigungsdienst und dessen Rolle
   - Bestätigung, dass Preview-/Entwicklungssysteme keine produktiven Anfragedaten erhalten
   - weitere Drittanbieter nur, wenn sie real eingesetzt werden

5. **Freigabe der öffentlichen Rechtstexte**
   - finale Impressumsangaben
   - finale Datenschutzinformationen auf Basis des belegten Datenflusses
   - konkrete Consent-Entscheidung auf Basis des realen Dienstleisterinventars

## Bewusst nicht als V1-Blocker behandeln

Diese Punkte sind wichtig, werden aber nicht in den Inquiry-V1-Livegang hineinerfunden:

- verbindliche Buchungs-, Reservierungs-, Zahlungs-, Storno- und Umbuchungslogik → T013/T011;
- private Eventgalerie einschließlich Upload, Downloadrechten, Widerruf, Aufbewahrung und Bildrechtsfragen → T025;
- n8n, Cloudflare Workflows oder andere Orchestrierungsplattformen → nur bei später belegtem Automationsbedarf;
- vollumfängliche AGB → erst nach bestätigten realen Vertrags- und Betriebsregeln.

## Arbeitsjournal — 2026-09-14

Vor der Mutation wurde der Livezustand frisch gelesen:

- `main` stand auf dem Merge von PR #51/T056;
- es gab keine offene PR-Lane, die für diesen Scope autoritativ weiterzuverwenden war;
- `tasks/INDEX.md`, T008, T011, T027, T049, `docs/legal-privacy-baseline.md` und der fail-closed Inquiry-Datenpolicy-Stand wurden gegengeprüft;
- die wiederkehrenden externen Blocker wurden als echte Doppelung bestätigt: Betreiberidentität, produktive Kontakt-/Adminziele, Retention/Löschung, reales Dienstleisterinventar und Legal-Freigabe.

Umsetzung:

- Branch `docs/t057-business-legal-ground-truth` wurde vom frisch gelesenen `main` erstellt;
- `docs/business-legal-ground-truth.md` als kanonische Entscheidungsmatrix ergänzt;
- T058 als spätere, evidenzgetriebene Automationsbewertung registriert;
- `tasks/INDEX.md` und `docs/legal-privacy-baseline.md` auf die neue Ground-Truth-Lane ausgerichtet;
- PR #55 enthält ausschließlich Dokumentations-/Taskänderungen und keine Runtime- oder Production-Mutation.

Verifikationsgrenze:

- ein unabhängiger lokaler Clone/Verify war in der ausführenden Containerumgebung wegen fehlender DNS-/GitHub-Netzauflösung nicht möglich;
- deshalb bleibt gemäß `AGENTS.md` der Required-GitHub-`verify` auf dem **exakten finalen PR-Head** das kanonische Merge-Gate;
- nach diesem Journaleintrag wird der Diff für den Review-/CI-Closeout eingefroren; ein Merge darf nur nach grünem Exact-Head-Verify erfolgen.

## Akzeptanz

- [x] bestehende technische und fachliche V1-Wahrheiten sind aus T008/T011/T027/T049 dedupliziert;
- [x] `docs/business-legal-ground-truth.md` trennt `confirmed`, `decision-required` und `deferred`;
- [x] keine Retentionfrist, Rechtsform, Dienstleisterrolle oder Vertragsregel wird erfunden;
- [x] T008/T049/T011 bleiben ausführende Tasks und werden nicht dupliziert;
- [x] spätere Automationsbewertung ist als eigene Folgetask registriert;
- [x] Branch/PR und Verifikationsgrenze sind im Task-Journal dokumentiert;
- [ ] Betreiber-/Geschäftsentscheidungen in der Ground-Truth-Datei sind mit Primärevidenz befüllt;
- [ ] T008 kann die finalen öffentlichen Rechtstexte daraus ableiten;
- [ ] T049 kann daraus eine konkrete Retention-/Löschpolicy samt Enforcement-Evidenz ableiten;
- [ ] T011 kann die verbleibenden V1-Produktentscheidungen schließen bzw. bewusst auf spätere Stufen begrenzen.

## Abschlussregel

T057 wird erst `done`, wenn **keine V1-relevante Betreiber-/Daten-/Legal-Entscheidung mehr implizit oder widersprüchlich über mehrere Tasks verteilt ist**. Spätere Buchungs- und Galeriefragen dürfen danach weiterhin ausdrücklich in T013/T025 verbleiben.
