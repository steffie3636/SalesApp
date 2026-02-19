export default function BadgeDisplay({ badge, size = 28, showLabel = false }) {
  if (!badge) return null

  const isImage = badge.image_url && badge.image_url.startsWith('data:')

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
      title={badge.name}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          borderRadius: 'var(--radius-sm)',
          background: `${badge.color}15`,
          fontSize: isImage ? undefined : size * 0.6,
          overflow: 'hidden',
        }}
      >
        {isImage ? (
          <img
            src={badge.image_url}
            alt={badge.name}
            style={{ width: size - 4, height: size - 4, objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          badge.emoji || '🏅'
        )}
      </span>
      {showLabel && (
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{badge.name}</span>
      )}
    </div>
  )
}
