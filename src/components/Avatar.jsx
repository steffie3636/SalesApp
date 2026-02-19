import { getAvatarColor, getAvatarEmoji } from '../lib/avatars'

export default function Avatar({ name, initials, avatarUrl, size = 44 }) {
  const emoji = getAvatarEmoji(avatarUrl)
  const [color1, color2] = getAvatarColor(name || '')
  const fontSize = size < 36 ? 12 : size < 48 ? 14 : 18
  const emojiSize = size < 36 ? 18 : size < 48 ? 22 : 28

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: emoji ? 'var(--bg-input)' : `linear-gradient(135deg, ${color1}, ${color2})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: emoji ? undefined : 'white',
        fontSize: emoji ? emojiSize : fontSize,
        fontWeight: 700,
        flexShrink: 0,
        border: '2px solid white',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {emoji || (initials || (name || '?').slice(0, 2)).toUpperCase()}
    </div>
  )
}
