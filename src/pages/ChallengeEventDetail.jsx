import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePlayers } from '../lib/useData'
import ProgressBar from '../components/ProgressBar'
import Confetti from '../components/Confetti'

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDeadline(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getDeadlineColor(dateString) {
  if (!dateString) return 'var(--text-muted)'
  const now = new Date()
  const deadline = new Date(dateString)
  const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'var(--color-red)'
  if (diffDays <= 30) return 'var(--color-coral)'
  return 'var(--text-muted)'
}

export default function ChallengeEventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { showToast } = useToast()
  const { players } = usePlayers()

  const [challenge, setChallenge] = useState(null)
  const [participations, setParticipations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const [eventTitle, setEventTitle] = useState('')
  const [eventDate, setEventDate] = useState('')

  const myPlayerId = profile?.player_id

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [challengeRes, participationsRes] = await Promise.all([
      supabase.from('challenges').select('*').eq('id', id).single(),
      supabase
        .from('event_participations')
        .select('*, player:players(id, name, initials)')
        .eq('challenge_id', id)
        .order('event_date', { ascending: false }),
    ])

    if (challengeRes.error) {
      showToast('Challenge nicht gefunden.')
      navigate('/challenges')
      return
    }

    setChallenge(challengeRes.data)
    setParticipations(participationsRes.data || [])
    setLoading(false)
  }, [id, navigate, showToast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const myParticipations = participations.filter(p => p.player_id === myPlayerId)
  const target = challenge?.target_value || 4
  const myCount = myParticipations.length
  const myPercent = Math.min((myCount / target) * 100, 100)
  const myIsComplete = myCount >= target

  async function handleAddEvent() {
    if (!eventTitle.trim()) {
      showToast('Bitte einen Eventtitel eingeben.')
      return
    }
    if (!eventDate) {
      showToast('Bitte ein Datum eingeben.')
      return
    }
    if (!myPlayerId) {
      showToast('Kein Spielerprofil verknüpft. Bitte Admin kontaktieren.')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.from('event_participations').insert({
        challenge_id: id,
        player_id: myPlayerId,
        event_title: eventTitle.trim(),
        event_date: eventDate,
      })

      if (error) throw error

      setEventTitle('')
      setEventDate('')
      setShowConfetti(true)
      showToast('Event erfolgreich eingetragen! 🎉')
      await fetchData()
    } catch (err) {
      console.error(err)
      showToast('Fehler beim Speichern: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteEvent(participationId) {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('event_participations')
        .delete()
        .eq('id', participationId)

      if (error) throw error

      showToast('Event gelöscht.')
      setDeleteConfirm(null)
      await fetchData()
    } catch (err) {
      console.error(err)
      showToast('Fehler beim Löschen: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Statistik pro Spieler für das Team-Diagramm
  const playerStats = players
    .map(player => ({
      ...player,
      eventCount: participations.filter(p => p.player_id === player.id).length,
    }))
    .sort((a, b) => b.eventCount - a.eventCount)

  const maxBarValue = Math.max(target, ...playerStats.map(p => p.eventCount), 1)

  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎪</div>
        <p>Wird geladen...</p>
      </div>
    )
  }

  if (!challenge) return null

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 900, margin: '0 auto' }}>
      <Confetti active={showConfetti} onDone={() => setShowConfetti(false)} />

      {/* Zurück-Link */}
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => navigate('/challenges')}
        style={{ marginBottom: 24, paddingLeft: 0 }}
      >
        ← Zurück zu Challenges
      </button>

      {/* Challenge Header */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-16" style={{ marginBottom: 16 }}>
          <span
            style={{
              fontSize: 48,
              width: 72,
              height: 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              background: `${challenge.color || '#8b5cf6'}15`,
              flexShrink: 0,
            }}
          >
            {challenge.icon || '🎪'}
          </span>
          <div style={{ flex: 1 }}>
            <h2 style={{ marginBottom: 4 }}>{challenge.title}</h2>
            <p className="text-sm text-muted">{challenge.description}</p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: 18,
                color: 'var(--color-yellow)',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                marginBottom: 6,
              }}
            >
              +{challenge.reward_points} Pkt. / Event
            </div>
            <div
              style={{
                fontSize: 13,
                color: getDeadlineColor(challenge.deadline),
              }}
            >
              Deadline: {formatDeadline(challenge.deadline)}
            </div>
          </div>
        </div>

        {/* Mein Fortschritt */}
        {myPlayerId && (
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              background: myIsComplete
                ? 'rgba(16, 185, 129, 0.06)'
                : 'rgba(99, 102, 241, 0.06)',
              border: `1px solid ${myIsComplete ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.15)'}`,
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <span className="text-sm font-bold" style={{ color: myIsComplete ? 'var(--color-mint)' : 'var(--text-primary)' }}>
                {myIsComplete ? '✅ Ziel erreicht!' : `Mein Fortschritt`}
              </span>
              <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
                {myCount} / {target} Events
                {myCount > target && (
                  <span style={{ color: 'var(--color-mint)', marginLeft: 6 }}>
                    (+{myCount - target} extra)
                  </span>
                )}
              </span>
            </div>
            <ProgressBar
              value={myCount}
              max={target}
              color={myIsComplete ? 'var(--color-mint)' : (challenge.color || 'var(--color-primary)')}
              height={10}
            />
            <p className="text-sm text-muted" style={{ marginTop: 8 }}>
              Max. {target} × {challenge.reward_points} = <strong>{target * challenge.reward_points} Punkte</strong>
              {myIsComplete && '. Übererfüllung möglich, aber ohne zusätzliche Punkte.'}
            </p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* Meine Events */}
        <div>
          {myPlayerId ? (
            <>
              {/* Formular: Event eintragen */}
              <div className="card" style={{ marginBottom: 20 }}>
                <h4 style={{ marginBottom: 16 }}>Event eintragen</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label className="text-sm font-bold" style={{ display: 'block', marginBottom: 4, color: 'var(--text-secondary)' }}>
                      Eventtitel
                    </label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="z.B. Schweizer Messe Basel"
                      value={eventTitle}
                      onChange={e => setEventTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddEvent()}
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold" style={{ display: 'block', marginBottom: 4, color: 'var(--text-secondary)' }}>
                      Datum
                    </label>
                    <input
                      className="form-input"
                      type="date"
                      value={eventDate}
                      onChange={e => setEventDate(e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleAddEvent}
                    disabled={saving || !eventTitle.trim() || !eventDate}
                    style={{ width: '100%' }}
                  >
                    {saving ? 'Wird gespeichert...' : '+ Event speichern'}
                  </button>
                </div>
              </div>

              {/* Meine Einträge */}
              <div className="card">
                <h4 style={{ marginBottom: 16 }}>
                  Meine Events
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      color: myIsComplete ? 'var(--color-mint)' : 'var(--color-primary)',
                      background: myIsComplete ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {myCount}
                  </span>
                </h4>

                {myParticipations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                    Noch keine Events eingetragen.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {myParticipations.map((p, idx) => (
                      <div
                        key={p.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-input)',
                          gap: 12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                          <span
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 'var(--radius-full)',
                              background: idx < target
                                ? `${challenge.color || '#8b5cf6'}20`
                                : 'rgba(148,163,184,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 11,
                              fontWeight: 700,
                              color: idx < target
                                ? (challenge.color || 'var(--color-violet)')
                                : 'var(--text-muted)',
                              flexShrink: 0,
                            }}
                          >
                            {idx + 1}
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: 14,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {p.event_title}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {formatDate(p.event_date)}
                            </div>
                          </div>
                        </div>

                        {idx < target && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: 'var(--color-yellow)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            +{challenge.reward_points} Pkt.
                          </span>
                        )}

                        {deleteConfirm === p.id ? (
                          <div className="flex items-center gap-4">
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteEvent(p.id)}
                              disabled={saving}
                            >
                              Löschen
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Nein
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDeleteConfirm(p.id)}
                            style={{ color: 'var(--color-red)', flexShrink: 0 }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="card">
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
                <p>Kein Spielerprofil verknüpft.</p>
                <p className="text-sm" style={{ marginTop: 4 }}>Bitte Admin kontaktieren.</p>
              </div>
            </div>
          )}
        </div>

        {/* Team-Übersicht / Diagramm */}
        <div className="card">
          <h4 style={{ marginBottom: 20 }}>Team-Übersicht</h4>

          {players.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              Keine Spieler gefunden.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {playerStats.map(player => {
                const count = player.eventCount
                const isMe = player.id === myPlayerId
                const isComplete = count >= target
                const barColor = isComplete
                  ? 'var(--color-mint)'
                  : count > 0
                  ? (challenge.color || 'var(--color-primary)')
                  : 'var(--border-color)'
                const barWidth = `${Math.min((count / maxBarValue) * 100, 100)}%`

                return (
                  <div key={player.id}>
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: 5 }}
                    >
                      <div className="flex items-center gap-8">
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 'var(--radius-full)',
                            background: isMe
                              ? 'linear-gradient(135deg, var(--color-primary), var(--color-violet))'
                              : 'var(--bg-input)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            fontWeight: 700,
                            color: isMe ? 'white' : 'var(--text-secondary)',
                            flexShrink: 0,
                          }}
                        >
                          {player.initials}
                        </div>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: isMe ? 700 : 500,
                            color: isMe ? 'var(--text-primary)' : 'var(--text-secondary)',
                          }}
                        >
                          {player.name}
                          {isMe && (
                            <span style={{ fontSize: 11, color: 'var(--color-primary)', marginLeft: 4 }}>
                              (ich)
                            </span>
                          )}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isComplete && (
                          <span style={{ fontSize: 14 }}>✅</span>
                        )}
                        <span
                          className="font-mono"
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: isComplete ? 'var(--color-mint)' : 'var(--text-muted)',
                          }}
                        >
                          {count}/{target}
                        </span>
                      </div>
                    </div>

                    {/* Balken */}
                    <div
                      style={{
                        height: 10,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-input)',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {/* Ziel-Markierung */}
                      <div
                        style={{
                          position: 'absolute',
                          right: `${((maxBarValue - target) / maxBarValue) * 100}%`,
                          top: 0,
                          bottom: 0,
                          width: 2,
                          background: 'rgba(148,163,184,0.4)',
                          zIndex: 1,
                        }}
                      />
                      <div
                        style={{
                          height: '100%',
                          width: barWidth,
                          background: barColor,
                          borderRadius: 'var(--radius-full)',
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>
                )
              })}

              {/* Legende */}
              <div
                style={{
                  marginTop: 8,
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-color-light)',
                  display: 'flex',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div className="flex items-center gap-6" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--color-mint)' }} />
                  Ziel erreicht
                </div>
                <div className="flex items-center gap-6" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: challenge.color || 'var(--color-primary)' }} />
                  In Bearbeitung
                </div>
                <div
                  style={{
                    marginLeft: 'auto',
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  Ziel: {target} Events
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
