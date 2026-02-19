import { useMemo } from 'react'
import { usePlayers, useBadges } from '../lib/useData'
import BadgeDisplay from '../components/BadgeDisplay'

export default function Achievements() {
  const { players, loading: playersLoading } = usePlayers()
  const { data: allBadges, loading: badgesLoading } = useBadges()

  const loading = playersLoading || badgesLoading

  // Für jeden Badge die zugewiesenen Spieler sammeln
  const badgesWithPlayers = useMemo(() => {
    return allBadges.map(badge => {
      const assignedPlayers = players.filter(player =>
        (player.player_badges || []).some(pb => pb.badge?.id === badge.id)
      )
      return { badge, assignedPlayers }
    })
  }, [allBadges, players])

  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-icon">...</div>
        <p>Auszeichnungen werden geladen...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-24">
        <h2>Auszeichnungen</h2>
        <p className="text-sm text-muted" style={{ marginTop: 4 }}>
          Vergebene Badges im Team
        </p>
      </div>

      {allBadges.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🏅</div>
            <p>Noch keine Badges im System.</p>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 20,
          }}
        >
          {badgesWithPlayers.map(({ badge, assignedPlayers }) => (
            <div
              key={badge.id}
              className="card"
              style={{
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 12,
                opacity: assignedPlayers.length > 0 ? 1 : 0.4,
                filter: assignedPlayers.length > 0 ? 'none' : 'grayscale(100%)',
              }}
            >
              <BadgeDisplay badge={badge} size={72} />
              <div style={{ fontWeight: 700, fontSize: 15 }}>{badge.name}</div>
              {badge.description && (
                <div className="text-sm text-muted">{badge.description}</div>
              )}
              {assignedPlayers.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    marginTop: 4,
                    width: '100%',
                  }}
                >
                  {assignedPlayers.map(player => (
                    <div
                      key={player.id}
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: `${badge.color}10`,
                      }}
                    >
                      {player.name}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Noch nicht vergeben
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
