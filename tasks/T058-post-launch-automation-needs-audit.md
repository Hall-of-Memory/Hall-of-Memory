---
id: T058
status: planned
priority: P2
dependencies: [T057, T049]
---
# Post-Launch Automation Needs Audit

## Ziel

Automatisierung erst nach real beobachteter Betriebsarbeit einführen. T058 verhindert sowohl vorschnelle n8n-Einführung als auch vorschnellen Eigenbau einer Workflow-Engine.

## Startbedingung

T058 beginnt erst, wenn der Inquiry-V1-Pfad produktiv stabil läuft und wiederholte manuelle Arbeit tatsächlich beobachtbar ist. Eine feste Anzahl von Anfragen wird nicht erfunden; entscheidend ist reproduzierbarer Aufwand oder ein belegtes Fehlerrisiko.

## Vorgehen

Für jeden wiederkehrenden manuellen Schritt erfassen:

- Auslöser;
- heutige manuelle Aktion;
- Häufigkeit;
- Zeitaufwand;
- Fehler-/Vergessensrisiko;
- betroffene personenbezogene Daten;
- benötigte Fremdsysteme;
- gewünschte Änderbarkeit durch den Betreiber.

Danach immer vom kleinsten Mittel aus entscheiden:

1. keine Automation;
2. normaler TypeScript-/Worker-Code;
3. vorhandene Plattformbausteine wie Cron oder Queue, wenn zeitversetzte/asynchrone Verarbeitung nötig ist;
4. langlebige Orchestrierung nur bei nachgewiesenem Zustands-/Retry-/Approval-Bedarf;
5. n8n nur, wenn visuelle Betreiber-Selbstpflege oder viele externe SaaS-Integrationen einen messbaren Vorteil gegenüber Repo-Code erzeugen.

## Akzeptanz

- kein Tool wird allein wegen möglicher zukünftiger Nutzung eingeführt;
- jede Automation besitzt einen belegten manuellen Ausgangsprozess;
- Kosten, Betriebsaufwand, Lock-in, Datenschutz und Testbarkeit werden gemeinsam bewertet;
- D1 bzw. die jeweils kanonische Fachdatenquelle bleibt Wahrheit; Automationssysteme werden nicht zur Schatten-Datenbank;
- relevante Entscheidungen werden als ADR/Task-Evidenz dokumentiert.

## Nicht-Ziel

- keine Änderung am aktuellen Inquiry-V1-Pfad;
- keine vorsorgliche n8n-Instanz;
- keine vorsorgliche Cloudflare-Workflows-Schicht;
- keine Buchungsengine.
