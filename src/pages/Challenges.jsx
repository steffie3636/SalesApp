import { useChallenges } from '../lib/useData'
import { formatNumber, formatPercent } from '../lib/format'
import ProgressBar from '../components/ProgressBar'

function formatDeadline(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('de-CH', {
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
  if (diffDays <= 7) return 'var(--color-coral)'
  return 'var(--text-muted)'
}

export default function Challenges() {
  const { data: challenges, loading } = useChallenges()

  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-icon">...</div>
        <p>Challenges werden geladen...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-24">
        <h2>Challenges</h2>
        <p className="text-sm text-muted" style={{ marginTop: 4 }}>
          Aktuelle Herausforderungen und Belohnungen
        </p>
      </div>

      {challenges.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <p>Aktuell keine Challenges vorhanden.</p>
        </div>
      ) : (
        <div className="grid-auto">
          {challenges.map((challenge) => {
            const progress = challenge.current_progress || 0
            const target = challenge.target_value || 1
            const percent = Math.min((progress / target) * 100, 100)
            const isComplete = percent >= 100

            return (
              <div
                key={challenge.id}
                className="card stagger-item"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {/* Kopfzeile: Icon & Belohnung */}
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 36 }}>{challenge.icon || '🎯'}</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: 14,
                      color: 'var(--color-yellow)',
                      background: 'rgba(245, 158, 11, 0.1)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    +{formatNumber(challenge.reward_points || 0)} Pkt.
                  </span>
                </div>

                {/* Titel & Beschreibung */}
                <div>
                  <h4 style={{ marginBottom: 4 }}>{challenge.title}</h4>
                  <p className="text-sm text-muted">{challenge.description}</p>
                </div>

                {/* Fortschritt */}
                <div style={{ marginTop: 'auto' }}>
                  <div className="flex items-center justify-between mb-8">
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: isComplete ? 'var(--color-mint)' : 'var(--text-primary)',
                      }}
                    >
                      {formatPercent(percent)}
                    </span>
                    <span className="text-sm text-muted font-mono">
                      {formatNumber(progress)} / {formatNumber(target)}
                    </span>
                  </div>
                  <ProgressBar
                    value={progress}
                    max={target}
                    color={isComplete ? 'var(--color-mint)' : 'var(--color-primary)'}
                    height={8}
                  />
                </div>

                {/* Deadline */}
                <div
                  className="flex items-center gap-8"
                  style={{
                    fontSize: 13,
                    color: getDeadlineColor(challenge.deadline),
                  }}
                >
                  <span>Frist: {formatDeadline(challenge.deadline)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
