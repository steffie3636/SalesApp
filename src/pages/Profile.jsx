import { useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePlayers } from '../lib/useData'
import { formatNumber, formatCHF } from '../lib/format'
import { calculateLevel } from '../lib/points'
import Avatar from '../components/Avatar'
import BadgeDisplay from '../components/BadgeDisplay'
import ProgressBar from '../components/ProgressBar'
import StatCard from '../components/StatCard'
import AvatarPicker from '../components/AvatarPicker'

// Rang-Bezeichnungen nach Level
function getRankTitle(level) {
  if (level >= 10) return 'Sales-Legende'
  if (level >= 7) return 'Top-Performer'
  if (level >= 5) return 'Profi-Verkäufer'
  if (level >= 3) return 'Aufsteiger'
  return 'Einsteiger'
}

export default function Profile() {
  const { profile } = useAuth()
  const { players, refetch } = usePlayers()
  const { showToast } = useToast()
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Aktuellen Spieler anhand des Profils finden
  const player = useMemo(() => {
    if (!profile?.player_id) return null
    return players.find((p) => p.id === profile.player_id) || null
  }, [players, profile])

  // Avatar-Aenderung speichern
  async function handleAvatarChange(avatarId) {
    if (!player) return
    setSaving(true)
    const { error } = await supabase
      .from('players')
      .update({ avatar_url: avatarId })
      .eq('id', player.id)

    if (error) {
      showToast('Fehler beim Speichern des Avatars.')
    } else {
      showToast('Avatar erfolgreich aktualisiert!')
      refetch()
    }
    setSaving(false)
  }

  // Kein verknuepfter Spieler
  if (!profile?.player_id) {
    return (
      <div className="animate-fade-in-up">
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p>Kein Spieler mit deinem Konto verknuepft.</p>
          <p className="text-sm text-muted" style={{ marginTop: 8 }}>
            Bitte wende dich an den Administrator.
          </p>
        </div>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="empty-state">
        <div className="empty-icon">...</div>
        <p>Profil wird geladen...</p>
      </div>
    )
  }

  const level = calculateLevel(player.points)
  const rankTitle = getRankTitle(level)
  const badges = (player.player_badges || []).map((pb) => pb.badge).filter(Boolean)

  // Punkte bis zum naechsten Level
  const pointsForCurrentLevel = (level - 1) * 1000
  const pointsForNextLevel = level * 1000
  const progressToNextLevel = player.points - pointsForCurrentLevel
  const pointsNeeded = pointsForNextLevel - pointsForCurrentLevel

  // KPI-Ziele (beispielhafte Zielwerte)
  const kpiGoals = [
    {
      label: 'BE Total',
      current: player.revenue || 0,
      target: player.revenue_goal || 100000,
      color: 'var(--color-primary)',
      format: formatCHF,
    },
    {
      label: 'Anz. Neukunden',
      current: player.new_customers || 0,
      target: player.new_customers_goal || 20,
      color: 'var(--color-coral)',
      format: formatNumber,
    },
    {
      label: 'BE Neukunden',
      current: player.be_neukunden || 0,
      target: player.be_neukunden_goal || 50000,
      color: 'var(--color-mint)',
      format: formatCHF,
    },
  ]

  return (
    <div className="animate-fade-in-up">
      <div className="mb-24">
        <h2>Mein Profil</h2>
        <p className="text-sm text-muted" style={{ marginTop: 4 }}>
          Persoenliche Statistiken und Einstellungen
        </p>
      </div>

      {/* Profilkarte */}
      <div className="card mb-24">
        <div className="flex items-center gap-20">
          {/* Avatar mit Klick zum Aendern */}
          <div
            style={{ cursor: 'pointer', position: 'relative' }}
            onClick={() => setAvatarPickerOpen(true)}
            title="Avatar aendern"
          >
            <Avatar
              name={player.name}
              initials={player.initials}
              avatarUrl={player.avatar_url}
              size={80}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: 'white',
                border: '2px solid white',
              }}
            >
              ✎
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <h3>{player.name}</h3>
            <div className="flex items-center gap-12" style={{ marginTop: 6 }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: 14,
                  color: 'var(--color-primary)',
                  background: 'rgba(99, 102, 241, 0.1)',
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                Level {level}
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                }}
              >
                {rankTitle}
              </span>
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="flex gap-4 flex-wrap" style={{ marginTop: 12 }}>
                {badges.map((badge) => (
                  <BadgeDisplay key={badge.id} badge={badge} size={28} showLabel />
                ))}
              </div>
            )}

            {/* Gesamtpunkte */}
            <div style={{ marginTop: 12 }}>
              <div className="text-sm text-muted" style={{ marginBottom: 4 }}>
                Gesamtpunkte: <strong className="font-mono">{formatNumber(player.points)}</strong>
              </div>
              <ProgressBar
                value={progressToNextLevel}
                max={pointsNeeded}
                color="var(--color-primary)"
                height={6}
                showLabel
              />
              <div className="text-sm text-muted" style={{ marginTop: 2 }}>
                Noch {formatNumber(pointsNeeded - progressToNextLevel)} Punkte bis Level {level + 1}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI-Ziele */}
      <div className="card mb-24">
        <div className="card-header">
          <h3 className="card-title">KPI-Ziele</h3>
        </div>
        <div className="flex flex-col gap-20">
          {kpiGoals.map((kpi) => {
            const percent = kpi.target > 0 ? (kpi.current / kpi.target) * 100 : 0
            return (
              <div key={kpi.label}>
                <div className="flex items-center justify-between mb-8">
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{kpi.label}</span>
                  <span className="text-sm font-mono text-muted">
                    {kpi.format(kpi.current)} / {kpi.format(kpi.target)}
                  </span>
                </div>
                <ProgressBar value={kpi.current} max={kpi.target} color={kpi.color} height={8} showLabel />
              </div>
            )
          })}
        </div>
      </div>

      {/* Statistik-Karten */}
      <div className="grid-4">
        <StatCard
          label="BE Total"
          value={player.revenue || 0}
          prefix="CHF "
          icon="💰"
          color="var(--color-primary)"
        />
        <StatCard
          label="Anz. Neukunden"
          value={player.new_customers || 0}
          icon="👥"
          color="var(--color-coral)"
        />
        <StatCard
          label="BE Neukunden"
          value={player.be_neukunden || 0}
          prefix="CHF "
          icon="🆕"
          color="var(--color-mint)"
        />
        <StatCard
          label="Punkte"
          value={player.points || 0}
          icon="⭐"
          color="var(--color-primary)"
        />
      </div>

      {/* Avatar-Picker Modal */}
      <AvatarPicker
        isOpen={avatarPickerOpen}
        onClose={() => setAvatarPickerOpen(false)}
        onSelect={handleAvatarChange}
        currentAvatar={player.avatar_url}
      />
    </div>
  )
}
