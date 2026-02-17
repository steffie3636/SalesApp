# SalesArena – Sales Gamification App

Eine interaktive Gamification-Plattform für Verkaufsteams, die Vertriebsaktivitäten in ein motivierendes Wettbewerbserlebnis verwandelt. Gebaut mit React und Vite.

## Schnellstart

```bash
npm install
npm run dev
```

Die App startet unter `http://localhost:5173`.

### Build erstellen

```bash
npm run build
npm run preview   # Build lokal testen
```

## Tech-Stack

| Technologie | Version | Zweck |
|-------------|---------|-------|
| React | 18.2 | UI-Framework |
| Vite | 5.1 | Build-Tool & Dev-Server |
| DM Sans / DM Mono | – | Google Fonts (via CDN) |

Keine weiteren externen Abhängigkeiten. Styling erfolgt vollständig über Inline-CSS (CSS-in-JS).

## Projektstruktur

```
SalesApp/
├── index.html                          # HTML-Einstiegspunkt
├── package.json                        # Abhängigkeiten & Scripts
├── vite.config.js                      # Vite-Konfiguration
└── src/
    ├── main.jsx                        # React-Einstiegspunkt
    └── SalesGamificationApp.jsx        # Gesamte Applikationslogik
```

## Features

### Benutzeroberfläche (5 Haupt-Tabs)

**Leaderboard** – Sortierbare Rangliste nach Punkten, Umsatz oder Neukunden mit animierten Fortschrittsbalken, Rang-Badges und Streak-Anzeige.

**Challenges** – Aktive Team-Herausforderungen mit Fortschrittsanzeige, Deadline und Punktebelohnung.

**Achievements** – Übersicht aller verfügbaren Badges mit Earned/Unearned-Status und Top-Performer-Sektion.

**Mein Profil** – Persönliche KPI-Übersicht mit Umsatz-, Neukunden- und Aktivitätszielen, Level-Anzeige und Streak.

**Ziele** – Dashboard mit Jahreszielen und kumulierten Fortschritten pro Spieler:
- Team-Gesamtfortschritt für BE Neukunden, Anz. Neukunden, BE Total
- Pro-Spieler-Aufschlüsselung mit anteiligem Ziel und Fortschrittsbalken

### Admin Panel (5 Admin-Tabs)

Das Admin Panel wird über den "Admin"-Button im Header aktiviert.

**Deal erfassen** – Verkaufsaktivitäten (Umsatz, Neukunden, Anrufe) pro Spieler buchen mit Punkte-Vorschau und Aktivitätslog.

**Spieler** – Spieler hinzufügen, bearbeiten und entfernen. Kürzel (2–3 Buchstaben) wird als Avatar angezeigt.

**Challenges** – Herausforderungen erstellen und verwalten mit Icon- und Farbauswahl, Zielwert, Fortschritt und Deadline.

**Badges** – Eigene Badges erstellen (mit Bild-Upload oder Emoji), Badges an Spieler vergeben und entziehen, Badge-Übersicht pro Spieler.

**Ziele** – Jahresziele definieren und monatliche Ist-Werte pro Spieler erfassen:
- Jahresziele für BE Neukunden (CHF), Anz. Neukunden, BE Total (CHF)
- Monatliche Ist-Erfassung pro Spieler und Monat
- Übersichtstabelle mit kumulierten Werten, Ziel und Erreichungsgrad (%)

### Punktesystem

Die Punkteberechnung basiert auf drei Faktoren:

| Aktivität | Faktor | Beispiel |
|-----------|--------|----------|
| Umsatz (CHF) | ×0.02 | CHF 100'000 = 2'000 Punkte |
| Neukunde | ×150 | 5 Neukunden = 750 Punkte |
| Anruf | ×5 | 80 Anrufe = 400 Punkte |

**Level-Berechnung:** `Level = floor(Punkte / 1000) + 1`

## Datenmodell

### Spieler

```js
{
  id: number,
  name: string,
  avatar: string,          // 2–3 Buchstaben Kürzel
  revenue: number,         // Umsatz in CHF
  newClients: number,      // Anzahl Neukunden
  calls: number,           // Anzahl Anrufe
  points: number,          // Berechnete Punkte
  level: number,           // Berechnetes Level
  badges: string[],        // Badge-Identifikatoren
  streak: number           // Tage-Streak
}
```

### Challenge

```js
{
  id: number,
  title: string,
  desc: string,            // Beschreibung (DE)
  reward: number,          // Punktebelohnung
  progress: number,        // Aktueller Fortschritt
  total: number,           // Zielwert
  icon: string,            // Emoji
  deadline: string,        // z.B. "3 Tage"
  color: string            // Hex-Farbe
}
```

### Badge

```js
{
  icon: string,            // Emoji oder generierte ID (img_...)
  name: string,
  desc: string,            // Beschreibung (DE)
  color: string,           // Hex-Farbe
  image: string | null     // Base64 Data-URL bei eigenem Bild
}
```

### Jahresziele

```js
{
  year: number,            // z.B. 2025
  beNeukunden: number,     // Bestelleingang Neukunden (CHF)
  anzNeukunden: number,    // Anzahl Neukunden
  beTotal: number          // Bestelleingang Total (CHF)
}
```

### Monatliche Ist-Werte

```js
// Struktur: monthlyData[spielerId][monatIndex] = { ... }
{
  beNeukunden: number,     // BE Neukunden im Monat (CHF)
  anzNeukunden: number,    // Anz. Neukunden im Monat
  beTotal: number          // BE Total im Monat (CHF)
}
```

## Hinweise

- Alle Daten werden im Browser-State gehalten (kein Backend/Persistenz)
- Die App ist vollständig auf Deutsch lokalisiert (de-CH Zahlenformat)
- Badge-Bilder werden als Base64 Data-URLs im State gespeichert
- Responsive Layout mit CSS Grid und Flexbox
