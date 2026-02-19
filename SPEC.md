# SalesArena – Technische Spezifikation

## 1. Uebersicht

SalesArena ist eine webbasierte Gamification-Plattform fuer Sales-Teams. Vertriebsmitarbeiter ("Spieler") werden anhand von drei KPIs bewertet:

- **BE Total** – Gesamter Beratungsertrag in CHF
- **Anz. Neukunden** – Anzahl gewonnener Neukunden
- **BE Neukunden** – Beratungsertrag aus Neukunden in CHF

Aus diesen KPIs werden Punkte berechnet, Levels vergeben und eine Rangliste erstellt. Admins koennen zusaetzlich Badges und Challenges vergeben.

---

## 2. Architektur

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Browser    │────>│  Vite Dev/Build  │────>│   Vercel     │
│   (React)    │     │  (SPA)           │     │   (Hosting)  │
└──────┬───────┘     └──────────────────┘     └──────────────┘
       │
       │ HTTPS (REST + Auth)
       │
┌──────▼───────┐
│   Supabase   │
│  - Auth      │
│  - PostgreSQL│
│  - Row-Level │
│    Security  │
└──────────────┘
```

**Client:** React 18 SPA mit React Router v6
**Backend:** Supabase (kein eigener Server noetig)
**Build:** Vite 5 mit @vitejs/plugin-react
**Deployment:** Vercel mit SPA-Rewrites

---

## 3. Datenbank-Schema

### 3.1 Tabelle `profiles`

Wird automatisch bei Supabase-Auth angelegt und erweitert.

| Spalte      | Typ     | Beschreibung                           |
| ----------- | ------- | -------------------------------------- |
| `id`        | uuid PK | = auth.users.id                        |
| `role`      | text    | `'user'` oder `'admin'`               |
| `player_id` | uuid FK | Verknuepfung zu `players.id` (nullable)|

### 3.2 Tabelle `players`

| Spalte          | Typ      | Beschreibung                    |
| --------------- | -------- | ------------------------------- |
| `id`            | uuid PK  | Automatisch generiert           |
| `name`          | text     | Vor- und Nachname               |
| `initials`      | text     | 2-3 Grossbuchstaben             |
| `avatar_url`    | text     | Avatar-ID oder null             |
| `points`        | integer  | Berechnete Gesamtpunkte         |
| `level`         | integer  | Berechnetes Level               |
| `revenue`       | numeric  | Kumulierter BE Total (CHF)      |
| `new_customers` | integer  | Kumulierte Anz. Neukunden       |
| `be_neukunden`  | numeric  | Kumulierter BE Neukunden (CHF)  |
| `calls`         | integer  | (Legacy, nicht aktiv verwendet)  |

### 3.3 Tabelle `badges`

| Spalte        | Typ      | Beschreibung                         |
| ------------- | -------- | ------------------------------------ |
| `id`          | uuid PK  | Automatisch generiert                |
| `name`        | text     | Badge-Name                           |
| `description` | text     | Optionale Beschreibung               |
| `emoji`       | text     | Emoji-Zeichen (z.B. "⭐")           |
| `image_url`   | text     | Base64-Data-URL oder null            |
| `color`       | text     | Hex-Farbe (z.B. "#6366f1")          |
| `created_at`  | timestamp| Erstellungszeitpunkt                 |

### 3.4 Tabelle `player_badges` (Junction)

| Spalte      | Typ     | Beschreibung           |
| ----------- | ------- | ---------------------- |
| `id`        | uuid PK | Automatisch generiert  |
| `player_id` | uuid FK | -> players.id          |
| `badge_id`  | uuid FK | -> badges.id           |

Unique-Constraint auf `(player_id, badge_id)` zur Duplikat-Vermeidung.

### 3.5 Tabelle `challenges`

| Spalte        | Typ      | Beschreibung                  |
| ------------- | -------- | ----------------------------- |
| `id`          | uuid PK  | Automatisch generiert         |
| `title`       | text     | Challenge-Titel               |
| `description` | text     | Beschreibung                  |
| `icon`        | text     | Emoji-Icon                    |
| `color`       | text     | Hex-Farbe                     |
| `reward`      | integer  | Belohnungspunkte              |
| `target`      | numeric  | Zielwert                      |
| `progress`    | numeric  | Aktueller Fortschritt         |
| `deadline`    | date     | Frist                         |

### 3.6 Tabelle `annual_goals`

| Spalte          | Typ      | Beschreibung                  |
| --------------- | -------- | ----------------------------- |
| `year`          | integer PK | Jahreszahl (z.B. 2026)     |
| `be_neukunden`  | numeric  | Team-Ziel BE Neukunden (CHF)  |
| `anz_neukunden` | integer  | Team-Ziel Anz. Neukunden      |
| `be_total`      | numeric  | Team-Ziel BE Total (CHF)      |

### 3.7 Tabelle `monthly_actuals`

| Spalte          | Typ      | Beschreibung                  |
| --------------- | -------- | ----------------------------- |
| `player_id`     | uuid FK  | -> players.id                 |
| `year`          | integer  | Jahreszahl                    |
| `month`         | integer  | 1-12                          |
| `be_neukunden`  | numeric  | Ist-Wert BE Neukunden (CHF)   |
| `anz_neukunden` | integer  | Ist-Wert Anz. Neukunden       |
| `be_total`      | numeric  | Ist-Wert BE Total (CHF)       |

Unique-Constraint auf `(player_id, year, month)`.

### 3.8 Tabelle `activity_log`

| Spalte       | Typ       | Beschreibung              |
| ------------ | --------- | ------------------------- |
| `id`         | uuid PK   | Automatisch generiert     |
| `player_id`  | uuid FK   | -> players.id             |
| `action`     | text      | Beschreibung der Aktion   |
| `created_at` | timestamp | Zeitstempel               |

---

## 4. Berechnungslogik

### 4.1 Punkteberechnung

```
Punkte = (BE_Total x 0.02) + (Anz_Neukunden x 150) + (BE_Neukunden x 0.02)
```

Das Ergebnis wird gerundet (`Math.round`).

**Beispiel:** Ein Spieler mit CHF 200'000 BE Total, 5 Neukunden und CHF 80'000 BE Neukunden:
```
(200'000 x 0.02) + (5 x 150) + (80'000 x 0.02) = 4'000 + 750 + 1'600 = 6'350 Punkte
```

### 4.2 Level-Berechnung

```
Level = max(1, floor(Punkte / 1000) + 1)
```

| Punkte        | Level |
| ------------- | ----- |
| 0 – 999       | 1     |
| 1'000 – 1'999 | 2     |
| 2'000 – 2'999 | 3     |
| ...           | ...   |
| 9'000 – 9'999 | 10    |

### 4.3 Rang-Titel

| Level  | Titel           |
| ------ | --------------- |
| 1 – 2  | Einsteiger      |
| 3 – 4  | Aufsteiger      |
| 5 – 6  | Profi-Verkaufer |
| 7 – 9  | Top-Performer   |
| 10+    | Sales-Legende   |

### 4.4 Spieler-Anteil am Teamziel

```
Spieler-Ziel = Team-Ziel / Anzahl Spieler
```

### 4.5 Erreichungsgrad

```
Erreichung = (Ist-Wert / Ziel-Wert) x 100%
```

**Farbkodierung:**
- `>= 100%`: Gruen (Mint, `#10b981`)
- `>= 50%`: Gelb (`#f59e0b`)
- `< 50%`: Rot (`#ef4444`)

### 4.6 Neuberechnung der Spieler-Totals

Beim Speichern von Monatswerten werden die kumulierten Werte in der `players`-Tabelle automatisch aktualisiert:

1. Alle `monthly_actuals` des Spielers fuer das aktuelle Jahr laden
2. `revenue`, `new_customers`, `be_neukunden` aufsummieren
3. Punkte und Level neu berechnen
4. `players`-Zeile aktualisieren

Der Admin kann ueber den Button "Punkte neu berechnen" alle Spieler auf einmal aktualisieren.

---

## 5. Authentifizierung

### 5.1 Login-Flow

1. Benutzer gibt E-Mail + Passwort ein
2. `supabase.auth.signInWithPassword()` wird aufgerufen
3. Bei Erfolg: Session wird persistent gespeichert
4. Profil wird aus `profiles`-Tabelle geladen (inkl. `player`-Relation)
5. `isAdmin` wird aus `profile.role === 'admin'` abgeleitet

### 5.2 Passwort-Reset

1. Benutzer gibt E-Mail ein
2. `supabase.auth.resetPasswordForEmail()` sendet Reset-Link
3. Bestaetigung wird angezeigt

### 5.3 Rollenbasierter Zugang

| Rolle   | Zugriff                                             |
| ------- | --------------------------------------------------- |
| `user`  | Rangliste, Auszeichnungen, Jahresziele, Profil      |
| `admin` | Alles von `user` + Spieler/Challenges/Badges/Ziele  |

Admin-Navigation und -Routen werden nur angezeigt/registriert, wenn `isAdmin === true`.

---

## 6. Funktionale Anforderungen

### 6.1 Rangliste (Leaderboard)

| ID     | Anforderung                                                   |
| ------ | ------------------------------------------------------------- |
| F-RL-01 | Alle Spieler absteigend nach gewaehltem KPI anzeigen         |
| F-RL-02 | Sortierung umschaltbar: Punkte, BE Total, Anz. Neukunden    |
| F-RL-03 | Top 3 mit Gold-/Silber-/Bronze-Badge hervorheben             |
| F-RL-04 | Pro Spieler: Avatar, Name, Level, KPI-Wert, Fortschritt, Badges |

### 6.2 Profil

| ID     | Anforderung                                                   |
| ------ | ------------------------------------------------------------- |
| F-PR-01 | Eigenes Profil mit Avatar, Level, Rang-Titel anzeigen        |
| F-PR-02 | Avatar per Picker aenderbar (16 vordefinierte Emojis)        |
| F-PR-03 | KPI-Fortschrittsbalken mit Ist/Ziel-Anzeige                  |
| F-PR-04 | Punkte-Fortschritt zum naechsten Level                        |
| F-PR-05 | Statistik-Karten (BE Total, Neukunden, BE Neukunden, Punkte) |

### 6.3 Auszeichnungen (Achievements)

| ID     | Anforderung                                                   |
| ------ | ------------------------------------------------------------- |
| F-AZ-01 | Alle Badges als Karten-Grid anzeigen                         |
| F-AZ-02 | Vergebene Badges farbig, nicht vergebene ausgegraut           |
| F-AZ-03 | Zugewiesene Spieler unter jedem Badge anzeigen                |

### 6.4 Jahresziele-Dashboard

| ID     | Anforderung                                                   |
| ------ | ------------------------------------------------------------- |
| F-JD-01 | Team-Gesamtfortschritt fuer 3 KPIs mit Fortschrittsbalken   |
| F-JD-02 | Erreichungsgrad in Prozent mit Farbkodierung                 |
| F-JD-03 | Aufschluesselung pro Spieler (Ist-Wert, anteiliges Ziel, %) |
| F-JD-04 | Jahreswechsel (Vorjahr, aktuelles Jahr, naechstes Jahr)      |

### 6.5 Spieler-Verwaltung (Admin)

| ID     | Anforderung                                                   |
| ------ | ------------------------------------------------------------- |
| F-SP-01 | Spieler hinzufuegen (Name + Kuerzel)                         |
| F-SP-02 | Spieler bearbeiten (Name + Kuerzel)                           |
| F-SP-03 | Spieler loeschen (inkl. zugeordnete Badges)                  |
| F-SP-04 | Kuerzel automatisch in Grossbuchstaben umwandeln             |
| F-SP-05 | Kuerzel-Fallback: automatisch aus Name ableiten              |
| F-SP-06 | Neue Spieler starten mit 0 Punkten, Level 1                  |

### 6.6 Badge-Verwaltung (Admin)

| ID     | Anforderung                                                   |
| ------ | ------------------------------------------------------------- |
| F-BV-01 | Badge erstellen/bearbeiten (Name, Beschreibung, Farbe)       |
| F-BV-02 | Badge-Bild: Emoji oder Bild-Upload (Base64)                  |
| F-BV-03 | Bildvorschau im Formular                                      |
| F-BV-04 | Badge einem Spieler zuweisen (ohne Duplikate)                 |
| F-BV-05 | Badge von einem Spieler entfernen                             |
| F-BV-06 | Badge loeschen (entfernt auch alle Zuweisungen)               |
| F-BV-07 | Uebersicht: Alle Badges pro Spieler                           |

### 6.7 Ziel-Verwaltung (Admin)

| ID     | Anforderung                                                   |
| ------ | ------------------------------------------------------------- |
| F-ZV-01 | Jahresziele pro Jahr definieren (3 KPIs)                     |
| F-ZV-02 | Jahresziele speichern (Upsert auf `year`)                    |
| F-ZV-03 | Monatswerte pro Spieler/Monat erfassen                       |
| F-ZV-04 | Monatswerte speichern (Upsert auf `player_id, year, month`)  |
| F-ZV-05 | Beim Wechsel von Spieler/Monat vorhandene Werte laden        |
| F-ZV-06 | Beim Speichern: Spieler-Totals automatisch neu berechnen     |
| F-ZV-07 | Jahresuebersicht: Kumulative Werte pro Monat als Tabelle     |
| F-ZV-08 | Jahresuebersicht: Monatliche Delta-Werte anzeigen            |
| F-ZV-09 | Jahresuebersicht: Ziel und Erreichungsgrad anzeigen          |
| F-ZV-10 | Spieler-Anteil: Teamziel / Anzahl Spieler berechnen          |
| F-ZV-11 | Button "Punkte neu berechnen" fuer alle Spieler              |

---

## 7. Design-System

### 7.1 Farben

| Name     | Hex       | Verwendung                     |
| -------- | --------- | ------------------------------ |
| Primary  | `#6366f1` | Buttons, Links, Akzente        |
| Coral    | `#f97316` | Neukunden-KPI                  |
| Mint     | `#10b981` | Erfolg, >= 100% Erreichung     |
| Violet   | `#8b5cf6` | Sekundaerer Akzent             |
| Sky      | `#0ea5e9` | Informativer Akzent            |
| Yellow   | `#f59e0b` | Warnung, 50-99% Erreichung     |
| Red      | `#ef4444` | Fehler, < 50% Erreichung       |

### 7.2 Typografie

| Schriftart | Verwendung               |
| ---------- | ------------------------ |
| DM Sans    | Fliesstext, UI-Elemente  |
| DM Mono    | Zahlen, Codes, KPI-Werte |

### 7.3 Responsive Breakpoints

| Breakpoint  | Verhalten                              |
| ----------- | -------------------------------------- |
| > 1024px    | Sidebar + Hauptbereich nebeneinander   |
| 769-1024px  | Grid-4 wird Grid-2, Grid-3 wird Grid-2 |
| <= 768px    | Sidebar ausgeblendet, Single-Column    |

### 7.4 Animationen

- `fadeInUp`: Seiten-Einblendung (0.5s)
- `fadeIn`: Modale, Toasts (0.3s)
- `slideInRight`: Seitenleisten-Elemente
- Staggered Animations: Listen-Elemente mit gestaffelter Verzoegerung

---

## 8. Zahlenformatierung

Alle Zahlen werden im Schweizer Format (de-CH) dargestellt:

| Funktion       | Beispiel-Ausgabe      |
| -------------- | --------------------- |
| `formatNumber` | `1'234`               |
| `formatCHF`    | `CHF 1'234.56`        |
| `formatPercent` | `87.5%`              |

---

## 9. Datenfluss

### 9.1 Monatswerte erfassen und Punkte aktualisieren

```
Admin gibt Monatswerte ein
         │
         ▼
Upsert in monthly_actuals (player_id, year, month)
         │
         ▼
Alle monthly_actuals des Spielers fuer das Jahr laden
         │
         ▼
revenue, new_customers, be_neukunden summieren
         │
         ▼
calculatePoints() → calculateLevel()
         │
         ▼
players-Zeile aktualisieren (revenue, new_customers, be_neukunden, points, level)
```

### 9.2 Punkte fuer alle Spieler neu berechnen

```
Admin klickt "Punkte neu berechnen"
         │
         ▼
Fuer jeden Spieler:
  └─ monthly_actuals laden → aggregieren → points/level berechnen → players updaten
```

### 9.3 Rangliste anzeigen

```
usePlayers() → SELECT * FROM players
  JOIN player_badges → badges
  ORDER BY points DESC
         │
         ▼
Client sortiert nach gewaehltem KPI (points | revenue | new_customers)
```
