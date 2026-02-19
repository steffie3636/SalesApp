import { useMemo } from 'react'
import { usePlayers, useBadges } from '../lib/useData'
import Avatar from '../components/Avatar'
import BadgeDisplay from '../components/BadgeDisplay'

export default function Achievements() {
  const { players, loading: playersLoading } = usePlayers()
  const { data: allBadges, loading: badgesLoading } = useBadges()

  const loading = playersLoading || badgesLoading

  // Top 3 Spieler nach Punkten
  const topPlayers = useMemo(() => {
    return [...players]
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 3)
  }, [players])

  // Sammle alle Badge-IDs, die irgendein Spieler verdient hat
  const earnedBadgeIds = useMemo(() => {
    const ids = new Set()
    players.forEach((player) => {
      (player.player_badges || []).forEach((pb) => {
        if (pb.badge) ids.add(pb.badge.id)
      })
    })
    return ids
  }, [players])

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
          Badges und Top-Performer im Team
        </p>
      </div>

      {/* Sektion 1: Top 3 Performer */}
      <div className="card mb-24">
        <div className="card-header">
          <h3 className="card-title">Top 3 Performer</h3>
        </div>

        {topPlayers.length === 0 ? (
          <div className="empty-state">
            <p>Noch keine Spieler vorhanden.</p>
          </div>
        ) : (
          <div
            className="flex justify-center gap-24"
            style={{ padding: '16px 0' }}
          >
            {topPlayers.map((player, index) => {
              const badges = (player.player_badges || [])
                .map((pb) => pb.badge)
                .filter(Boolean)
              const rankLabels = ['1. Platz', '2. Platz', '3. Platz']

              return (
                <div
                  key={player.id}
                  className="stagger-item flex flex-col items-center text-center"
                  style={{ gap: 12, minWidth: 120 }}
                >
                  <Avatar
                    name={player.name}
                    initials={player.initials}
                    avatarUrl={player.avatar_url}
                    size={index === 0 ? 72 : 56}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{player.name}</div>
                    <div
                      className="text-sm"
                      style={{
                        color:
                          index === 0
                            ? 'var(--color-yellow)'
                            : index === 1
                              ? 'var(--text-muted)'
                              : 'var(--color-coral)',
                        fontWeight: 600,
                      }}
                    >
                      {rankLabels[index]}
                    </div>
                  </div>
                  {badges.length > 0 && (
                    <div className="flex gap-4 flex-wrap justify-center">
                      {badges.map((badge) => (
                        <BadgeDisplay key={badge.id} badge={badge} size={28} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Sektion 2: Alle Badges */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Alle Badges</h3>
          <span className="text-sm text-muted">
            {earnedBadgeIds.size} von {allBadges.length} freigeschaltet
          </span>
        </div>

        {allBadges.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏅</div>
            <p>Noch keine Badges im System.</p>
          </div>
        ) : (
          <div className="grid-auto" style={{ gap: 16 }}>
            {allBadges.map((badge) => {
              const isEarned = earnedBadgeIds.has(badge.id)

              return (
                <div
                  key={badge.id}
                  className="flex items-center gap-12"
                  style={{
                    padding: 16,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-input)',
                    opacity: isEarned ? 1 : 0.4,
                    filter: isEarned ? 'none' : 'grayscale(100%)',
                    transition: 'all var(--transition-normal)',
                  }}
                >
                  <BadgeDisplay badge={badge} size={40} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{badge.name}</div>
                    {badge.description && (
                      <div className="text-sm text-muted" style={{ marginTop: 2 }}>
                        {badge.description}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
