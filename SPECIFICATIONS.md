# SalesArena – Spezifikationen

## 1. Übersicht

**Produktname:** SalesArena
**Typ:** Single-Page Application (SPA)
**Zielgruppe:** Verkaufsteams / Sales Manager
**Sprache:** Deutsch (Schweiz)
**Zweck:** Gamification von Vertriebsaktivitäten zur Steigerung der Motivation und Transparenz im Team

---

## 2. Funktionale Anforderungen

### 2.1 Leaderboard

| Anforderung | Beschreibung |
|-------------|-------------|
| F-LB-01 | Rangliste aller Spieler, sortiert nach gewähltem KPI |
| F-LB-02 | Sortieroptionen: Punkte, Umsatz, Neukunden |
| F-LB-03 | Anzeige von Rang (1–N), Avatar, Name, KPI-Wert, Fortschrittsbalken |
| F-LB-04 | Bis zu 3 Badges pro Spieler in der Listenansicht |
| F-LB-05 | Streak-Anzeige (Flammen-Badge) bei Streak > 4 Tage |
| F-LB-06 | Platz 1 wird visuell hervorgehoben (Gold-Gradient) |

### 2.2 Challenges

| Anforderung | Beschreibung |
|-------------|-------------|
| F-CH-01 | Kartenansicht aller aktiven Challenges |
| F-CH-02 | Anzeige: Icon, Titel, Beschreibung, Punktebelohnung, Deadline |
| F-CH-03 | Fortschrittsbalken mit Prozentanzeige |
| F-CH-04 | Werte-Anzeige: aktueller Stand / Zielwert |
| F-CH-05 | Grid-Layout mit responsiven Karten (min. 300px Breite) |

### 2.3 Achievements

| Anforderung | Beschreibung |
|-------------|-------------|
| F-AC-01 | Übersicht aller definierten Badges im System |
| F-AC-02 | Visuelle Unterscheidung: verdient (farbig) vs. nicht verdient (grau, 40% Opazität) |
| F-AC-03 | Top-3-Performer-Sektion mit Avatar und Badges |

### 2.4 Mein Profil

| Anforderung | Beschreibung |
|-------------|-------------|
| F-PR-01 | Profilkarte mit Avatar, Name, Level, Rang, Badges, Gesamtpunkte, Streak |
| F-PR-02 | KPI-Ziele mit Fortschrittsbalken: Umsatz, Neukunden, Aktivitäten |
| F-PR-03 | Statistik-Karten: Umsatz, Neukunden, Anrufe, Punkte (animierter Zähler) |

### 2.5 Ziele-Dashboard

| Anforderung | Beschreibung |
|-------------|-------------|
| F-ZD-01 | Team-Gesamtfortschritt pro KPI-Kategorie (BE Neukunden, Anz. Neukunden, BE Total) |
| F-ZD-02 | Anzeige: Ist-Wert, Zielwert, Erreichungsgrad (%), Fortschrittsbalken |
| F-ZD-03 | Pro-Spieler-Aufschlüsselung mit anteiligem Ziel (Teamziel / Anzahl Spieler) |
| F-ZD-04 | Anzeige erfasster Monate pro Spieler (X/12) |
| F-ZD-05 | Automatische Neuberechnung bei Datenänderungen |

### 2.6 Admin: Deal erfassen

| Anforderung | Beschreibung |
|-------------|-------------|
| F-DE-01 | Spieler aus Dropdown auswählen |
| F-DE-02 | Eingabefelder: Umsatz (CHF), Neukunden, Anrufe |
| F-DE-03 | Live-Vorschau der zu vergebenden Punkte mit Formelanzeige |
| F-DE-04 | Speichern aktualisiert sofort Punkte, Level und Leaderboard |
| F-DE-05 | Aktivitätslog der letzten 10 Einträge mit Zeitstempel |
| F-DE-06 | Anzeige der Punkteformel (CHF ×0.02, Neukunde ×150, Anruf ×5) |

### 2.7 Admin: Spielerverwaltung

| Anforderung | Beschreibung |
|-------------|-------------|
| F-SP-01 | Spieler hinzufügen: Name + Kürzel (2–3 Buchstaben) |
| F-SP-02 | Spieler bearbeiten: Name und Kürzel ändern |
| F-SP-03 | Spieler entfernen |
| F-SP-04 | Kürzel wird automatisch in Grossbuchstaben konvertiert |
| F-SP-05 | Fallback: Wenn kein Kürzel angegeben, werden die ersten 2–3 Buchstaben des Namens verwendet |
| F-SP-06 | Neue Spieler starten mit 0 Punkten, Level 1, keinen Badges |

### 2.8 Admin: Challenge-Verwaltung

| Anforderung | Beschreibung |
|-------------|-------------|
| F-CV-01 | Challenge erstellen: Titel, Beschreibung, Belohnung, Zielwert, Fortschritt, Deadline |
| F-CV-02 | Icon-Auswahl aus 10 vordefinierten Emojis |
| F-CV-03 | Farbauswahl aus 10 vordefinierten Farben |
| F-CV-04 | Challenge bearbeiten und löschen |

### 2.9 Admin: Badge-Verwaltung

| Anforderung | Beschreibung |
|-------------|-------------|
| F-BV-01 | Eigene Badges erstellen mit Name, Beschreibung, Farbe |
| F-BV-02 | Badge-Bild: Upload eigener Bilder (alle Bildformate) oder Emoji-Eingabe |
| F-BV-03 | Bildvorschau vor dem Speichern |
| F-BV-04 | Badges an Spieler vergeben (Duplikate werden verhindert) |
| F-BV-05 | Badges von Spielern entziehen (Klick auf Badge mit ✕) |
| F-BV-06 | Badges löschen (entfernt Badge auch von allen Spielern) |
| F-BV-07 | Übersicht aller Badges pro Spieler |
| F-BV-08 | Bild-Badges werden überall in der App als Bild statt Emoji dargestellt |

### 2.10 Admin: Jahresziele & Monatliche Ist-Werte

| Anforderung | Beschreibung |
|-------------|-------------|
| F-ZV-01 | Jahresziele definieren: Jahr, BE Neukunden (CHF), Anz. Neukunden, BE Total (CHF) |
| F-ZV-02 | Jahresziele jederzeit anpassbar |
| F-ZV-03 | Monatliche Ist-Werte pro Spieler und Monat erfassen |
| F-ZV-04 | Drei Ist-Werte pro Monat: BE Neukunden (CHF), Anz. Neukunden, BE Total (CHF) |
| F-ZV-05 | Beim Wechsel von Spieler/Monat werden bestehende Werte automatisch geladen |
| F-ZV-06 | Bestehende Werte können überschrieben werden |
| F-ZV-07 | Übersichtstabelle pro Spieler mit allen 12 Monaten |
| F-ZV-08 | Kumulierte Anzeige: Jeder Monat zeigt die laufende Summe (Jan bis aktueller Monat) |
| F-ZV-09 | Monatlicher Delta-Wert wird unter dem kumulierten Wert angezeigt (+Wert) |
| F-ZV-10 | Ziel-Spalte: Anteiliger Zielwert pro Spieler (Teamziel / Anzahl Spieler) |
| F-ZV-11 | Erreichungsgrad-Spalte (%) mit Farbcodierung: grün >=100%, gelb >=50%, rot <50% |
| F-ZV-12 | Alle Summen aktualisieren sich sofort bei Änderungen |

---

## 3. Punktesystem

### 3.1 Punkteberechnung

```
Punkte = (Umsatz × 0.02) + (Neukunden × 150) + (Anrufe × 5)
```

Ergebnis wird auf ganze Zahlen gerundet (`Math.round`).

### 3.2 Level-Berechnung

```
Level = max(1, floor(Punkte / 1000) + 1)
```

Minimum-Level ist 1. Jede 1'000 Punkte = 1 Level.

### 3.3 Zielberechnung (Jahresziele)

```
Spieler-Anteil = Teamziel / Anzahl aktiver Spieler
Erreichungsgrad = (Ist-Wert kumuliert / Spieler-Anteil) × 100%
```

---

## 4. Nicht-funktionale Anforderungen

### 4.1 Performance

| Anforderung | Beschreibung |
|-------------|-------------|
| NF-PE-01 | Animierte Zahlenzähler (Count-Up) mit 900–1200ms Dauer |
| NF-PE-02 | Fortschrittsbalken mit CSS-Transition (0.8s ease) |
| NF-PE-03 | Fade-In-Animationen für Listenelemente (gestaffelt) |
| NF-PE-04 | Toast-Benachrichtigungen verschwinden nach 2.6 Sekunden |

### 4.2 Design

| Anforderung | Beschreibung |
|-------------|-------------|
| NF-DE-01 | Dark Theme (Hintergrund: #0a0e1a) |
| NF-DE-02 | Schriftarten: DM Sans (UI) und DM Mono (Zahlen/Code) |
| NF-DE-03 | Farbpalette: Indigo (#6366f1) als Primärfarbe |
| NF-DE-04 | Abgerundete Ecken (8–24px Radius) |
| NF-DE-05 | Glassmorphism-Effekte (Blur, transparente Hintergründe) |
| NF-DE-06 | Schweizer Zahlenformat (de-CH): 1'000.00 |

### 4.3 Responsivität

| Anforderung | Beschreibung |
|-------------|-------------|
| NF-RE-01 | CSS Grid mit auto-fill und minmax für adaptive Layouts |
| NF-RE-02 | Flexbox mit flex-wrap für mobile Ansichten |
| NF-RE-03 | Sticky Header mit Backdrop-Blur |
| NF-RE-04 | Übersichtstabellen horizontal scrollbar bei engem Viewport |

### 4.4 Datenhaltung

| Anforderung | Beschreibung |
|-------------|-------------|
| NF-DA-01 | Client-Side State (React useState) – kein Backend |
| NF-DA-02 | Seed-Daten beim App-Start für Demonstrationszwecke |
| NF-DA-03 | Badge-Bilder als Base64 Data-URLs im State |
| NF-DA-04 | Alle Änderungen wirken sich sofort auf alle Ansichten aus |

---

## 5. UI-Komponenten

| Komponente | Beschreibung |
|------------|-------------|
| `Avatar` | Kreisförmiger Avatar mit Farbverlauf basierend auf Kürzel-Buchstaben. Unterstützt 2–3 Zeichen mit automatischer Schriftgrössenanpassung. |
| `BadgeDisplay` | Rendert Badge als Emoji oder Bild (wenn eigenes Bild hochgeladen). |
| `RankBadge` | Rang-Anzeige mit Gold/Silber/Bronze-Gradient für Plätze 1–3. |
| `ProgressBar` | Animierter Fortschrittsbalken mit konfigurierbarer Farbe und Höhe. |
| `StatCard` | KPI-Karte mit animiertem Zahlenzähler und dekorativem Hintergrund-Element. |
| `Field` | Label-Wrapper für Formulareingaben. |
| `Toast` | Erfolgsbenachrichtigung (fixiert unten rechts, auto-dismiss). |
| `Modal` | Dialog-Overlay mit Blur-Hintergrund für Formulare. |

---

## 6. Seed-Daten

Die App startet mit folgenden Demodaten:

- **6 Spieler** mit unterschiedlichen Umsatz-, Neukunden- und Anruf-Werten
- **4 Challenges** (Deal Crusher, Cold Call King, New Blood, Revenue Rocket)
- **8 Badges** (On Fire, Diamond, Sharpshooter, Speed Demon, Rising Star, Champion, Rocket, New Blood)
- **Jahresziel 2025:** BE Neukunden CHF 500'000, Anz. Neukunden 50, BE Total CHF 2'000'000
- **Monatliche Ist-Werte:** Leer (im Admin zu erfassen)
