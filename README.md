# SalesArena

Gamification-Plattform fuer Sales-Teams. Spieler sammeln Punkte durch Umsatz und Neukunden, steigen Level auf, erhalten Badges und messen sich auf der Rangliste.

## Tech-Stack

- **Frontend:** React 18, React Router v6, Vite 5
- **Backend:** Supabase (Auth + PostgreSQL)
- **Styling:** Custom CSS Design-System (DM Sans / DM Mono)
- **Hosting:** Vercel (SPA-Routing via `vercel.json`)
- **Sprache:** Deutsch (de-CH), Schweizer Zahlenformat

## Voraussetzungen

- Node.js >= 18
- Ein Supabase-Projekt mit den benoetigten Tabellen (siehe [SPEC.md](./SPEC.md))

## Installation

```bash
# Repository klonen
git clone <repo-url>
cd SalesApp

# Dependencies installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env.local
# VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY eintragen

# Entwicklungsserver starten
npm run dev
```

## Scripts

| Befehl          | Beschreibung                    |
| --------------- | ------------------------------- |
| `npm run dev`   | Vite Dev-Server (HMR)          |
| `npm run build` | Produktions-Build nach `dist/`  |
| `npm run preview` | Build lokal testen            |

## Projektstruktur

```
src/
├── main.jsx                  # Entry-Point (Provider-Stack)
├── App.jsx                   # Router, Layout, Navigation
├── context/
│   ├── AuthContext.jsx        # Supabase-Auth + Profil-Loading
│   └── ToastContext.jsx       # Toast-Benachrichtigungen
├── lib/
│   ├── supabase.js            # Supabase-Client
│   ├── useData.js             # Daten-Hooks (usePlayers, useAnnualGoals, ...)
│   ├── points.js              # Punkte-, Level-, Erreichungsgrad-Berechnung
│   ├── format.js              # Zahlen-/Waehrungs-/Datumsformatierung (de-CH)
│   └── avatars.js             # Avatar-Emojis und Farbverlaeufe
├── pages/
│   ├── Leaderboard.jsx        # Rangliste (sortierbar nach Punkte/Umsatz/Neukunden)
│   ├── Achievements.jsx       # Badge-Uebersicht
│   ├── GoalsDashboard.jsx     # Jahresziele-Dashboard (Team + pro Spieler)
│   ├── Profile.jsx            # Spieler-Profil mit KPIs und Avatar-Wahl
│   └── admin/
│       ├── PlayerManagement.jsx    # Spieler CRUD
│       ├── ChallengeManagement.jsx # Challenges CRUD
│       ├── BadgeManagement.jsx     # Badges CRUD + Zuweisung
│       └── GoalsManagement.jsx     # Jahresziele + Monatswerte erfassen
├── components/
│   ├── LoginScreen.jsx        # Login + Passwort-Reset
│   ├── Avatar.jsx             # Avatar-Anzeige (Emoji oder Initialen)
│   ├── AvatarPicker.jsx       # Avatar-Auswahl-Modal
│   ├── BadgeDisplay.jsx       # Badge-Darstellung (Emoji oder Bild)
│   ├── RankBadge.jsx          # Rang-Badge (Gold/Silber/Bronze)
│   ├── ProgressBar.jsx        # Animierter Fortschrittsbalken
│   ├── StatCard.jsx           # Statistik-Karte mit animiertem Zaehler
│   ├── Modal.jsx              # Wiederverwendbarer Dialog
│   ├── Field.jsx              # Formular-Feld-Wrapper
│   └── Toast.jsx              # Toast-Benachrichtigung
└── styles/
    └── globals.css            # Design-System (Farben, Typografie, Utilities)
```

## Navigation

**Benutzer:**
- `/` – Rangliste
- `/achievements` – Auszeichnungen
- `/goals` – Jahresziele-Dashboard
- `/profile` – Mein Profil

**Admin (Rolle `admin`):**
- `/admin/players` – Spieler-Verwaltung
- `/admin/challenges` – Challenge-Verwaltung
- `/admin/badges` – Badge-Verwaltung
- `/admin/goals` – Ziel-Verwaltung + Monatswerte

## Gamification

**Punkteformel:**
```
Punkte = (BE Total x 0.02) + (Anz. Neukunden x 150) + (BE Neukunden x 0.02)
```

**Level-System:**
```
Level = max(1, floor(Punkte / 1000) + 1)
```

| Level | Titel            |
| ----- | ---------------- |
| 1-2   | Einsteiger       |
| 3-4   | Aufsteiger       |
| 5-6   | Profi-Verkaufer  |
| 7-9   | Top-Performer    |
| 10+   | Sales-Legende    |

**Erreichungsgrad-Farben:**
- Gruen (Mint): >= 100%
- Gelb: >= 50%
- Rot: < 50%

## Umgebungsvariablen

| Variable                  | Beschreibung                |
| ------------------------- | --------------------------- |
| `VITE_SUPABASE_URL`      | Supabase-Projekt-URL        |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anonymous API-Key  |
