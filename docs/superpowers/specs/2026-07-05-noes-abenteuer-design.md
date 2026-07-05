# Noés Abenteuer — Game Design Spec

## Spielübersicht

**Genre:** 3D-Fantasy-Brettspiel im Browser
**Spieler:** 1-2 (Solo oder Koop)
**Zielgruppe:** Kinder ab 8 Jahren
**Plattform:** Webbrowser (PC + iPad über LAN)
**Visueller Stil:** Fantasy/Magisch — leuchtende Effekte, Partikel, mystische Atmosphäre
**Perspektive:** Dritte Person, von hinten-oben
**Steuerung:** Nur Maus/Touch (Klick zum Würfeln, Klick für Richtung, Klick für Kampf)

## Spielprinzip

Der Spieler wählt eine Figur (Mensch oder Tiger) und bewegt sich durch 10 Level mit je einer einzigartigen Fantasiewelt. In jedem Level gibt es einen verzweigten Pfad — nur ein Weg führt zum Ziel. Man bewegt sich per Würfelwurf (1-10) über Felder. Manche Felder sind Spezialfelder (teils getarnt), manche enthalten Gegner. Am Ende jedes Levels wartet ein Endgegner. Ziel: Alle 10 Level schaffen.

## Figuren

- **Mensch:** Fantasy-Charakter mit Rüstung
- **Tiger:** Magischer Tiger

Wahl erfolgt im Hauptmenü vor Spielstart.

## Spielfeld & Bewegung

### Der Weg
- Jedes Level besteht aus einem verzweigten Pfad mit einzelnen Feldern
- Nur ein Weg führt tatsächlich ins Ziel (andere enden in Sackgassen oder Schleifen)
- Der Spieler sieht den Weg vor sich (Felder sind sichtbar)

### Würfel
- 10-seitiger Würfel (Augenzahl 1-10)
- Klick auf den Würfel zum Werfen
- Die Figur bewegt sich animiert über die entsprechende Anzahl Felder

### Abzweigungen
- Bei einer Gabelung erscheinen klickbare Richtungspfeile
- Der Spieler entscheidet frei welchen Weg er nimmt
- Manche Wege sind kürzer aber gefährlicher, manche länger aber sicherer

## Feldtypen

| Feld | Sichtbarkeit | Effekt |
|------|--------------|--------|
| Normal | Standard | Nichts passiert |
| Schnecke | Getarnt oder sichtbar | 1 Minute warten |
| Rakete | Getarnt oder sichtbar | 6 Felder vorwärts |
| Auto | Getarnt oder sichtbar | 4 Felder vorwärts |
| Gegner | Sichtbar (Figur auf Feld) | Kampf auslösen |
| Endgegner | Sichtbar (groß, vor dem Ziel) | Muss besiegt werden |
| Loot | Sichtbar (Truhe) oder getarnt | Zufällige Waffe/Ausrüstung |

Getarnte Felder sehen aus wie normale Felder und werden erst beim Betreten enthüllt.

## Kampfsystem

### Mechaniken (zufällig gewählt)

Bei jedem Kampf wird zufällig eine der drei Mechaniken ausgewählt:

**1. Schnelles Klicken**
- So oft wie möglich auf den Gegner klicken in 5 Sekunden
- Schwelle muss erreicht werden um zu gewinnen
- Endgegner: Kürzere Zeit, höhere Schwelle

**2. Würfel-Duell**
- Spieler und Gegner würfeln je einen 10er-Würfel
- Höhere Zahl gewinnt (bei Gleichstand: neu würfeln)
- Endgegner: Gegner hat Bonus auf seinen Wurf

**3. Reaktions-Klick**
- Ein Zielkreis erscheint und schrumpft
- Klick im richtigen Moment (grüner Bereich) → Sieg
- Endgegner: Grüner Bereich ist kleiner

### Endgegner
- Gleiche 3 Mechaniken, aber schwerer
- Braucht mehrere Runden (z.B. 3 Treffer nötig)
- Thematisch passend zur Welt

### Kampf-Ergebnis
- Sieg: Gegner verschwindet, evtl. Loot-Drop
- Niederlage: -1 Leben

## Loot & Ausrüstung

### Fundorte
- Sichtbare Schatztruhen auf dem Weg
- Getarnte Loot-Felder
- Drop nach gewonnenen Kämpfen
- Seltene Items eher in späteren Leveln

### Ausrüstungs-Slots

| Slot | Beispiel-Items | Effekt |
|------|----------------|--------|
| Waffe | Schwert +1, Flammenschwert +3 | Bonus beim Würfel-Duell |
| Handschuhe | Schnelle Handschuhe, Blitz-Handschuhe | Bonus beim Klick-Spiel |
| Amulett | Magisches Auge, Seherkristall | Bonus beim Reaktions-Klick |
| Stiefel | Raketenboots, Federstiefel | Bewegungs-Bonus (+1 auf Würfel) |
| Schild | Holzschild, Kristallschild | Einmal pro Level: kein Lebensverlust |

### Seltenheitsstufen
- Gewöhnlich (weiß) — kleine Boni (+1)
- Selten (blau) — mittlere Boni (+2)
- Episch (lila) — starke Boni (+3) oder Spezialeffekte
- Legendär (gold) — nur bei Endgegnern/versteckten Feldern

### Inventar
- Sichtbar als Leiste am unteren Bildschirmrand
- Items anklicken zum Ausrüsten
- Items bleiben bei Level-Neustart erhalten
- Im Koop: Items können dem Partner geschenkt werden

## Leben-System

- 2 Leben pro Spieler zu Beginn jedes Levels (wird bei jedem Level-Start auf 2 aufgefüllt)
- Bei Kampf-Niederlage: -1 Leben
- Bei 0 Leben: Spieler wartet am Level-Start
- Im Koop: Partner kann Leben schicken (min. 1 behalten)
- Alle Leben verloren (beide Spieler im Koop): Level-Neustart, Ausrüstung bleibt

## Die 10 Level-Welten

| Level | Welt | Thema |
|-------|------|-------|
| 1 | Dunkler Wald | Mystische Bäume, Glühwürmchen |
| 2 | Pilz-Sumpf | Nebel, giftige Pilze, glitschiger Boden |
| 3 | Fledermaus-Höhle | Dunkelheit, leuchtende Kristalle |
| 4 | Wüste | Sandstürme, verborgene Fallen |
| 5 | Unterwasser-Welt | Korallenriffe, Tiefseewesen |
| 6 | Eisberg / Schneewelt | Eisige Winde, rutschige Pfade |
| 7 | Vulkan / Lava-Welt | Glühende Felsen, Lavaströme |
| 8 | Geisterburg | Spukende Rüstungen, Falltüren |
| 9 | Wolkenstadt | Schwebende Plattformen, Blitze |
| 10 | Sternenwelt | Finale im Weltall, magische Portale |

Schwierigkeit steigt: Mehr Gegner, stärkere Endgegner, weniger hilfreiche Spezialfelder, längere Wege.

## Koop-Modus

### Am selben PC
- Splitscreen (links/rechts)
- Abwechselnd würfeln (Spieler 1, dann Spieler 2)
- Bei Kämpfen: Aktiver Spieler kämpft, Partner kann helfen (≤3 Felder Abstand)

### Über LAN (iPad/zweiter PC)
- Host erstellt Spiel, zweiter Spieler tritt über lokale IP bei
- Beide spielen gleichzeitig auf eigenem Gerät
- Jeder sieht seinen eigenen Bildschirm

### Gemeinsame Mechaniken
- Beide starten auf dem gleichen Feld
- Bei Abzweigungen: Unabhängige Richtungswahl
- Leben teilen: Klick auf Herz-Symbol → an Partner senden (min. 1 behalten)
- Hilfe im Kampf: Nur möglich wenn ≤3 Felder entfernt
- Entfernungsanzeige immer sichtbar
- Ein Spieler stirbt: Wartet am Start, Partner kann Leben schicken oder weiterspielen
- Beide sterben: Level-Neustart für beide

## Benutzeroberfläche

### Hauptmenü
- Titel "Noés Abenteuer" mit magischem Leuchteffekt
- Neues Spiel / Spiel laden
- Einzelspieler / Koop (LAN beitreten)
- Figurenwahl: Mensch oder Tiger

### HUD (im Spiel)
- Oben links: Leben (Herz-Symbole)
- Oben rechts: Level + Weltname
- Unten: Inventar-Leiste
- Mitte unten: Würfel (klickbar)
- Bei Abzweigung: Richtungspfeile auf dem 3D-Pfad
- Im Koop: Partner-Leben + Entfernungsanzeige

### Spielablauf eines Levels
1. Level-Intro (Weltname + Animations-Einblendung)
2. Figur am Start → Würfel klicken
3. Figur bewegt sich animiert
4. Feld-Effekt wird ausgelöst
5. Bei Abzweigung: Richtung wählen
6. Wiederholen bis Endgegner erreicht
7. Endgegner-Kampf (mehrere Runden)
8. Sieg → Nächstes Level freigeschaltet
9. Niederlage → Neustart mit Ausrüstung

### Zwischen den Leveln
- Ergebnis-Bildschirm (Items, Zeit, Leben)
- Levelauswahl-Karte (freigeschaltete Welten)

## Audio

- Hintergrundmusik passend zur Welt (mystisch, dramatisch, ruhig je nach Setting)
- Soundeffekte: Würfeln, Kampf-Treffer, Item finden, Spezialfeld-Aktivierung
- Sieges-Jingle bei Endgegner-Sieg
- Level-Abschluss-Fanfare

## Technische Architektur

### Tech-Stack
- **Framework:** React + TypeScript + Vite
- **3D-Engine:** React Three Fiber (Three.js)
- **UI:** HTML/CSS-Overlay über 3D-Canvas
- **State Management:** Zustand
- **Multiplayer:** WebSocket-Server (Node.js)
- **Audio:** Howler.js
- **Speicherstand:** LocalStorage (Solo) + Server-State (Koop)

### Projektstruktur
```
noes-abenteuer/
├── src/
│   ├── components/       # React UI (Menü, HUD, Inventar)
│   ├── game/             # Spiellogik (Würfeln, Kampf, Loot)
│   ├── world/            # 3D-Welten, Felder, Pfade
│   ├── multiplayer/      # WebSocket Client
│   ├── assets/           # 3D-Modelle, Texturen, Sounds
│   └── App.tsx
├── server/               # LAN-Multiplayer WebSocket-Server
└── public/
```

### 3D-Assets
- Low-Poly-Fantasy-Modelle (Kenney.nl, Quaternius, Sketchfab)
- Partikeleffekte für Magie
- Animationen für Figur-Bewegung

### Performance (iPad-tauglich)
- Low-Poly-Geometrie
- Einfache Schatten (kein Raytracing)
- Texturkompression für mobile Geräte
- Max. eine Lichtquelle + Ambient Light pro Szene

### Netzwerk (LAN)
- Host startet lokalen WebSocket-Server
- Zweiter Spieler verbindet über ws://192.168.x.x:PORT
- Synchronisiert: Würfel, Position, Leben, Inventar, Kampf-Events
- LAN-Latenz <5ms

## Speicherstand

- Automatisch nach jedem abgeschlossenen Level
- Speichert: Aktuelles Level, Inventar, freigeschaltete Level
- LocalStorage im Browser (pro Gerät)
- Im Koop: Host-Gerät ist Quelle der Wahrheit
