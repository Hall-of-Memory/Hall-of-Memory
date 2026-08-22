---
id: T005
status: done
priority: P1
dependencies: [T003, T004]
---
# Verfügbarkeit und Reservierungslogik

## Akzeptanz
- Verfügbarkeit pro Angebot modellierbar
- Doppelbelegung technisch verhindert oder klar als Anfrage statt Sofortbuchung behandelt
- Erweiterung zu verbindlicher Buchung ohne Neubau möglich

## Abschluss-Evidenz — 2026-08-11

- `src/domain/availability.ts` modelliert Verfügbarkeit fachneutral pro Angebot über explizite Ressourcen-IDs und Zeitfenster. Mehrere, deaktivierte und einem anderen Angebot zugeordnete Einheiten sowie bestätigte Belegungen, manuelle Sperren und Wartung sind abbildbar.
- `scripts/test-availability.mjs` belegt unbekanntes Inventar, die `inquiry-only`-Policy, freie und vollständig gesperrte Kapazität, alternative Einheiten, fehlende aktivierte Kapazität, angrenzende/nicht angrenzende Intervalle und ungültige Zeitfenster.
- Doppelbelegung wird in der vorhandenen V1 nicht als Sofortbuchung behandelt: Unbekanntes Inventar oder `inquiry-only` liefert ausschließlich `requires-review`. Selbst `appears-available` ist nur ein unverbindlicher Prüfhinweis; Frontend und Worker erzeugen nachweislich nur `received` mit `bookingCreated: false`.
- Das Ressourcen-/Blockmodell kann später mit belegten Stückzahlen und Regeln gespeist werden. Eine verbindliche Reservierungsoperation mit atomaren Holds wird getrennt in T013 ergänzt, ohne die Anfrage- oder Ressourcenrepräsentation neu bauen zu müssen.

Damit sind alle drei Akzeptanzpunkte erfüllt. Echte Stückzahlen, Puffer, Personal-/Transportabhängigkeiten und Fahrtregeln sind fachliche Eingaben für T013 beziehungsweise spätere Konfiguration und kein Grund, T005 künstlich offen zu halten.
