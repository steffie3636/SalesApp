const RANK_STYLES = {
  1: {
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    shadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
  },
  2: {
    background: 'linear-gradient(135deg, #d1d5db, #9ca3af)',
    shadow: '0 2px 8px rgba(156, 163, 175, 0.3)',
  },
  3: {
    background: 'linear-gradient(135deg, #d97706, #b45309)',
    shadow: '0 2px 8px rgba(180, 83, 9, 0.3)',
  },
}

export default function RankBadge({ rank }) {
  const style = RANK_STYLES[rank]

  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontWeight: 700,
        fontSize: 14,
        color: style ? 'white' : 'var(--text-secondary)',
        background: style ? style.background : 'var(--bg-input)',
        boxShadow: style ? style.shadow : 'none',
        flexShrink: 0,
      }}
    >
      {rank}
    </div>
  )
}
