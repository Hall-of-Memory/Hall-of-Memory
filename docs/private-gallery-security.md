# Private Event Gallery — Security Foundation

Stand: 2026-08-12

Diese Grundlage setzt ausschließlich die bereits sichere gemeinsame Schnittmenge des Kundenwunsches um. Sie entscheidet **nicht**, ob der spätere Zugang als persönlicher Link, Link plus Passwort/Code oder über einen anderen Ablauf gestaltet wird.

## Bereits implementierbar

`src/domain/gallery-access.ts` erzeugt opake Bearer-Tokens mit 32 kryptographisch zufälligen Bytes (256 Bit) und modelliert sie als technische Zugriffsgrundlage für persönliche Links. Der Klartexttoken wird nicht in einem Grant gespeichert; persistierbar ist nur sein SHA-256-Digest. Ablauf und Widerruf werden geprüft. Ein erfolgreicher Grant ist zusätzlich an die ausdrücklich angeforderte `galleryId` gebunden; ein gültiger Token für Event A autorisiert daher keinen Zugriff auf Event B. Ein Asset ist nur autorisiert, wenn seine `galleryId` exakt mit dem bereits autorisierten Event-Scope übereinstimmt.

Der Token-Hash ist ausdrücklich nur für **zufällig erzeugte hochentropische Tokens** gedacht. Er ist kein Passwort-/PIN-Hashing. Falls der Kunde einen kurzen menschlich eingegebenen Code wählt, braucht dieser vor Aktivierung ein eigenes KDF-/Rate-Limit-/Lockout-Modell. Der Hashvergleich läuft über die vollständige feste Digestlänge ohne bewusstes Early-Exit; eine formale Constant-Time-Garantie kann eine JavaScript-Laufzeit trotzdem nicht zusichern.

## Sicherheitsinvarianten

- Gallery-IDs allein gewähren keinen Zugriff.
- Neue technische Link-Tokens werden mit 256 Bit Zufallsentropie erzeugt.
- Tokenwerte werden nicht stillschweigend getrimmt oder normalisiert; ungültige Zeichen bzw. Längen werden abgewiesen.
- Ein widerrufener oder abgelaufener Grant autorisiert nichts.
- Ein gültiger Grant für Event A autorisiert weder Event B noch ein Asset von Event B.
- Ungültige Grants, ungültige Zeitwerte und ungültige Asset-Scope-Daten werden fail-closed abgewiesen.
- Ein gespeicherter Grant enthält keinen Bearer-Token im Klartext.
- Die spätere Medienauslieferung muss dieselbe Gallery-Scope-Grenze erzwingen; eine direkte öffentliche Objekt-URL darf sie nicht umgehen.

## Bewusst noch nicht implementiert

- R2 oder anderer privater Objektspeicher
- produktive D1-Tabellen für Galleries/Assets/Grants
- öffentliche Gallery-Route oder Login-/Code-Formular
- Versand/Freigabe von Tokens an Veranstaltungskunden
- menschliche Passwörter/PINs
- Download-/Originaldateirechte
- Aufbewahrungs-/Löschautomatik

Diese Punkte bleiben in T025, bis Kunden- und Betriebsentscheidungen vorliegen. T026 belegt nur den wiederverwendbaren Security-Kern.
