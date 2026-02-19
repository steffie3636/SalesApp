// Punkteberechnung: (BE Total × 0.02) + (Anz. Neukunden × 150) + (BE Neukunden × 0.02)
export function calculatePoints(revenue = 0, newCustomers = 0, beNeukunden = 0) {
  return Math.round((revenue * 0.02) + (newCustomers * 150) + (beNeukunden * 0.02))
}

// Level-Berechnung: max(1, floor(Punkte / 1000) + 1)
export function calculateLevel(points = 0) {
  return Math.max(1, Math.floor(points / 1000) + 1)
}

// Erreichungsgrad in Prozent
export function calculateAchievementRate(actual, target) {
  if (!target || target === 0) return 0
  return (actual / target) * 100
}

// Spieler-Anteil am Teamziel
export function calculatePlayerShare(teamGoal, playerCount) {
  if (!playerCount || playerCount === 0) return 0
  return teamGoal / playerCount
}
