# Missbrauchsschutz und Benachrichtigung — V1-Architektur

Stand: 2026-08-11

## Rate Limiting
Der öffentliche Anfragepfad kombiniert Größen-/Schema-Prüfung und Turnstile mit einem groben ortslokalen Route-Limiter (`120/min`) und einem zweiten Limiter (`5/min`) auf einen SHA-256-Digest aus Angebot + normalisierter E-Mail. Die Klartextadresse wird nicht als Rate-Limit-Schlüssel weitergegeben. Absichtlich kein IP-basierter Primärschlüssel: geteilte IPs können sonst legitime Nutzer gemeinsam treffen. Die Workers Rate Limiting API ist ortslokal und permissiv/eventually-consistent; sie ist Missbrauchsschutz, kein exaktes Abrechnungssystem.

Der lokale Spike besitzt zusätzlich `SMOKE_LIMITER` (`2/10s`), nur um den 429-Pfad reproduzierbar zu testen.

## Benachrichtigung
Die Anfrage und ein `inquiry_notifications`-Outbox-Datensatz werden zuerst in D1 geschrieben. Danach wird die Betreiberbenachrichtigung asynchron versandt. Sie enthält nur Anfrage-ID, Angebot und Wunschdatum; Kontaktdaten und Nachricht bleiben im geschützten Admin. Der Admin sieht `pending/sending/sent/failed`, fehlgeschlagene Zustellungen können erneut angestoßen werden, und ein `sending`-Zustand darf nach 15 Minuten wieder übernommen werden. Details stehen in `docs/privacy-data-flow.md`.

Der Spike nutzt Cloudflare Email Service über ein `send_email`-Binding. Lokal simuliert Wrangler den Versand; es geht keine echte Nachricht nach außen.

## Kostenentscheidung
Für V1 reicht eine Betreiberbenachrichtigung an eine verifizierte Destination Address. Cloudflare dokumentiert diesen Versand auf allen Plänen als kostenlos und außerhalb der normalen Sendequoten. Eine automatische Bestätigung an beliebige Interessenten ist getrennt zu betrachten: Beim Cloudflare Email Service verlangt dieser Pfad derzeit Workers Paid. Daher wird er nicht stillschweigend in die kostenneutrale V1 aufgenommen.

## Warum noch keine Queue
Cloudflare Queues ist inzwischen auch auf Workers Free verfügbar und bietet garantierte Zustellung/Retry. Für das erwartete kleine Anfragevolumen wäre eine zusätzliche Queue-Ressource momentan dennoch mehr Infrastruktur als nötig. D1-Outbox + `waitUntil` + sichtbarer Status + manueller Retry ist die kleinere V1. Bei geschäftskritischer oder höherer Last ist Queues der bevorzugte Eskalationspfad.

## Produktions-Gate
Vor Aktivierung fehlen Betreiber-Zieladresse, Absenderdomain/-adresse, echte Turnstile-Keys/Hostname-Regeln, produktive D1-/Worker-/Access-Ressourcen sowie Aufbewahrungs-/Löschregeln. Keine dieser Ressourcen wird durch den Spike angelegt.
