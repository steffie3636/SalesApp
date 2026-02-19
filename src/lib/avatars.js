// Vordefinierte Avatare für die Auswahl
export const PREDEFINED_AVATARS = [
  { id: 'fox', emoji: '🦊', label: 'Fuchs' },
  { id: 'lion', emoji: '🦁', label: 'Löwe' },
  { id: 'wolf', emoji: '🐺', label: 'Wolf' },
  { id: 'eagle', emoji: '🦅', label: 'Adler' },
  { id: 'shark', emoji: '🦈', label: 'Hai' },
  { id: 'dragon', emoji: '🐉', label: 'Drache' },
  { id: 'unicorn', emoji: '🦄', label: 'Einhorn' },
  { id: 'bear', emoji: '🐻', label: 'Bär' },
  { id: 'panther', emoji: '🐆', label: 'Panther' },
  { id: 'owl', emoji: '🦉', label: 'Eule' },
  { id: 'rocket', emoji: '🚀', label: 'Rakete' },
  { id: 'star', emoji: '⭐', label: 'Stern' },
  { id: 'fire', emoji: '🔥', label: 'Feuer' },
  { id: 'diamond', emoji: '💎', label: 'Diamant' },
  { id: 'crown', emoji: '👑', label: 'Krone' },
  { id: 'trophy', emoji: '🏆', label: 'Pokal' },
]

// Avatar-Farben für Initialen-Fallback
export const AVATAR_COLORS = [
  ['#6366f1', '#818cf8'],
  ['#f97316', '#fb923c'],
  ['#10b981', '#34d399'],
  ['#8b5cf6', '#a78bfa'],
  ['#0ea5e9', '#38bdf8'],
  ['#ec4899', '#f472b6'],
  ['#f59e0b', '#fbbf24'],
  ['#ef4444', '#f87171'],
]

export function getAvatarColor(name) {
  const index = (name || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

export function getAvatarEmoji(avatarUrl) {
  if (!avatarUrl) return null
  const avatar = PREDEFINED_AVATARS.find(a => a.id === avatarUrl)
  return avatar ? avatar.emoji : null
}
