import { useState, useMemo } from 'react'
import { usePlayers } from '../lib/useData'
import { formatNumber, formatCHF } from '../lib/format'
import { calculateLevel } from '../lib/points'
import Avatar from '../components/Avatar'
import RankBadge from '../components/RankBadge'
import BadgeDisplay from '../components/BadgeDisplay'
import ProgressBar from '../components/ProgressBar'

const SORT_OPTIONS = [
  { key: 'points', label: 'Punkte', format: (v) => formatNumber(v), color: 'var(--color-primary)' },
  { key: 'revenue', label: 'Umsatz', format: (v) => formatCHF(v), color: 'var(--color-mint)' },
  { key: 'new_customers', label: 'Neukunden', format: (v) => formatNumber(v), color: 'var(--color-coral)' },
]

export default function Leaderboard() {
  const { players, loading } = usePlayers()
  const [sortKey, setSortKey] = useState('points')

  const activeSortOption = SORT_OPTIONS.find((o) => o.key === sortKey)

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0))
  }, [players, sortKey])

  // Determine max value for progress bar scaling
  const maxValue = useMemo(() => {
    if (sortedPlayers.length === 0) return 1
    return sortedPlayers[0]?.[sortKey] || 1
  }, [sortedPlayers, sortKey])

  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-icon">...</div>
        <p>Rangliste wird geladen...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-24">
        <div>
          <h2>Rangliste</h2>
          <p className="text-sm text-muted" style={{ marginTop: 4 }}>
            Alle Spieler im Vergleich
          </p>
        </div>
        <div className="flex gap-8">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.key}
              className={`btn btn-sm ${sortKey === option.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSortKey(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {sortedPlayers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <p>Noch keine Spieler vorhanden.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {sortedPlayers.map((player, index) => {
            const rank = index + 1
            const value = player[sortKey] || 0
            const badges = (player.player_badges || [])
              .map((pb) => pb.badge)
              .filter(Boolean)
              .slice(0, 3)
            const level = calculateLevel(player.points)

            return (
              <div
                key={player.id}
                className={`card stagger-item ${rank === 1 ? 'rank-gold' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 24px',
                }}
              >
                {/* Rang */}
                <RankBadge rank={rank} />

                {/* Avatar */}
                <Avatar
                  name={player.name}
                  initials={player.initials}
                  avatarUrl={player.avatar_url}
                  size={44}
                />

                {/* Name & Level */}
                <div style={{ minWidth: 140 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{player.name}</div>
                  <div className="text-sm text-muted">Level {level}</div>
                </div>

                {/* KPI-Wert */}
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: 16,
                    color: activeSortOption.color,
                    minWidth: 120,
                    textAlign: 'right',
                  }}
                >
                  {activeSortOption.format(value)}
                </div>

                {/* Fortschrittsbalken */}
                <div style={{ flex: 1, minWidth: 100 }}>
                  <ProgressBar
                    value={value}
                    max={maxValue}
                    color={activeSortOption.color}
                    height={6}
                  />
                </div>

                {/* Badges */}
                <div className="flex gap-4" style={{ minWidth: 100, justifyContent: 'flex-end' }}>
                  {badges.map((badge) => (
                    <BadgeDisplay key={badge.id} badge={badge} size={28} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
