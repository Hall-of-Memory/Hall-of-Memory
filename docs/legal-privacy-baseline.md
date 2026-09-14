# Legal-/Privacy-Baseline

Stand: 2026-09-14

Dieses Dokument beschreibt nur den technisch belegbaren Projektstand. Es ist keine Rechtsberatung und ersetzt keine freigegebenen Rechtstexte.

## Technisch bereits festgelegt

- Die Website erhält echte Routen für Impressum und Datenschutz.
- Solange die Kunden-/Rechtsangaben fehlen, kennzeichnen diese Seiten ihren Entwurfsstatus sichtbar und werden nicht als finale Rechtstexte dargestellt.
- Der aktuelle öffentliche Build enthält keine Analyse-, Marketing- oder Social-Embed-Integration.
- Cloudflare Turnstile ist ausschließlich für den Anfragepfad vorgesehen und wird erst viewport-/fokusnah geladen, wenn das Anfrageformular produktiv konfiguriert ist.
- Das Anfrageformular speichert den Turnstile-Token nicht als Fachdaten; der technische Datenfluss ist in `docs/privacy-data-flow.md` dokumentiert.
- Eine Cookie-/Consent-Oberfläche wird nicht vorsorglich erfunden. Vor Livegang wird anhand der tatsächlich eingesetzten Dienste geprüft und fachlich/rechtlich entschieden, welche Einwilligung erforderlich ist.

## Vor Livegang weiterhin erforderlich

- vollständige, freigegebene Impressumsangaben
- freigegebener Datenschutz-/Einwilligungstext
- konkrete Aufbewahrungs- und Löschregeln
- vollständiges Inventar tatsächlich eingesetzter Drittanbieter, Analyse-, Marketing- und Einbettungsdienste
- daraus abgeleitete Cookie-/Consent-Entscheidung
- Produktionsreadback gegen die echte Kundendomain

## Kanonischer externer Entscheidungsinput

T027 hat die technische Legal-/Privacy-Struktur abgeschlossen. Die früher über T008, T011 und T049 verteilten fehlenden Betreiber-/Geschäftsentscheidungen werden ab T057 in `docs/business-legal-ground-truth.md` kanonisch dedupliziert.

- T057 erfindet keine Rechtsform, Retentionfrist, Dienstleisterrolle oder Vertragsregel.
- T008 verwendet die freigegebenen Betreiber-/Dienstleisterangaben anschließend für finale öffentliche Rechtstexte und Consent-Entscheidung.
- T049 verwendet die freigegebene Retention-/Löschentscheidung für die bereits vorhandenen fail-closed Production-Gates und deren Enforcement-Evidenz.
- Private Eventgalerie und verbindliche Buchung bleiben getrennte spätere Produktpfade in T025 bzw. T013.

Bis die T057-Entscheidungen mit Primärevidenz befüllt sind, bleiben T008 und T049 korrekt `blocked_external` und die Legal-Routen im Entwurfszustand.
