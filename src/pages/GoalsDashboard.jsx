import { useState, useMemo } from 'react'
import { useAnnualGoals, useMonthlyActuals, usePlayers } from '../lib/useData'
import { formatNumber, formatCHF, formatPercent } from '../lib/format'
import { calculatePlayerShare, calculateAchievementRate, rateColor } from '../lib/points'
import ProgressBar from '../components/ProgressBar'
import Avatar from '../components/Avatar'

const CURRENT_YEAR = new Date().getFullYear()

// KPI-Definitionen
const KPI_CONFIG = [
  {
    key: 'be_neukunden',
    label: 'BE Neukunden',
    goalField: 'be_neukunden',
    actualField: 'be_neukunden',
    format: formatCHF,
    color: 'var(--color-mint)',
  },
  {
    key: 'anz_neukunden',
    label: 'Anz. Neukunden',
    goalField: 'anz_neukunden',
    actualField: 'anz_neukunden',
    format: formatNumber,
    color: 'var(--color-coral)',
  },
  {
    key: 'be_total',
    label: 'BE Total',
    goalField: 'be_total',
    actualField: 'be_total',
    format: formatCHF,
    color: 'var(--color-primary)',
  },
]


export default function GoalsDashboard() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const { data: annualGoals, loading: goalsLoading } = useAnnualGoals(year)
  const { data: monthlyActuals, loading: actualsLoading } = useMonthlyActuals(year)
  const { players, loading: playersLoading } = usePlayers()

  const loading = goalsLoading || actualsLoading || playersLoading

  // Team-Gesamtwerte pro KPI (Summe aller monatlichen Ist-Werte)
  const teamTotals = useMemo(() => {
    const totals = {}
    KPI_CONFIG.forEach((kpi) => {
      totals[kpi.key] = (monthlyActuals || []).reduce(
        (sum, row) => sum + (row[kpi.actualField] || 0),
        0
      )
    })
    return totals
  }, [monthlyActuals])

  // Spieler-Aufschluesselung: Ist-Werte pro Spieler und Monate erfasst
  const playerBreakdown = useMemo(() => {
    if (!players.length) return []

    return players.map((player) => {
      const playerActuals = (monthlyActuals || []).filter(
        (row) => row.player_id === player.id
      )
      const monthsTracked = playerActuals.length

      const kpis = {}
      KPI_CONFIG.forEach((kpi) => {
        const actual = playerActuals.reduce(
          (sum, row) => sum + (row[kpi.actualField] || 0),
          0
        )
        const teamGoal = annualGoals?.[kpi.goalField] || 0
        const playerShare = calculatePlayerShare(teamGoal, players.length)
        const rate = calculateAchievementRate(actual, playerShare)

        kpis[kpi.key] = {
          actual,
          playerShare,
          rate,
        }
      })

      return {
        player,
        monthsTracked,
        kpis,
      }
    })
  }, [players, monthlyActuals, annualGoals])

  // Jahres-Auswahl: letztes Jahr, dieses Jahr, naechstes Jahr
  const yearOptions = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1]

  if (loading) {
    return (
      <div className="empty-state">
        <div className="empty-icon">...</div>
        <p>Jahresziele werden geladen...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-24">
        <div>
          <h2>Jahresziele</h2>
          <p className="text-sm text-muted" style={{ marginTop: 4 }}>
            Team-Gesamtfortschritt und individuelle Zielerreichung
          </p>
        </div>
        <div className="flex gap-8">
          {yearOptions.map((y) => (
            <button
              key={y}
              className={`btn btn-sm ${year === y ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Team-Gesamtfortschritt */}
      <div className="card mb-24">
        <div className="card-header">
          <h3 className="card-title">Team-Gesamtfortschritt {year}</h3>
        </div>

        {!annualGoals ? (
          <div className="empty-state">
            <p>Keine Jahresziele fuer {year} definiert.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-24">
            {KPI_CONFIG.map((kpi) => {
              const goal = annualGoals[kpi.goalField] || 0
              const actual = teamTotals[kpi.key] || 0
              const rate = calculateAchievementRate(actual, goal)
              const barColor = rateColor(rate)

              return (
                <div key={kpi.key}>
                  <div className="flex items-center justify-between mb-8">
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{kpi.label}</span>
                    <span
                      className="font-mono font-bold"
                      style={{ fontSize: 16, color: rateColor(rate) }}
                    >
                      {formatPercent(rate)}
                    </span>
                  </div>
                  <ProgressBar value={actual} max={goal} color={barColor} height={10} />
                  <div className="flex items-center justify-between mt-8">
                    <span className="text-sm text-muted">
                      Ist-Wert: <strong className="font-mono">{kpi.format(actual)}</strong>
                    </span>
                    <span className="text-sm text-muted">
                      Zielwert: <strong className="font-mono">{kpi.format(goal)}</strong>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Spieler-Aufschluesselung */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Aufschluesselung pro Spieler</h3>
          <span className="text-sm text-muted">
            Anteiliges Ziel = Teamziel / {players.length} Spieler
          </span>
        </div>

        {playerBreakdown.length === 0 ? (
          <div className="empty-state">
            <p>Keine Spielerdaten vorhanden.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Spieler</th>
                  <th style={{ textAlign: 'center' }}>Monate</th>
                  {KPI_CONFIG.map((kpi) => (
                    <th key={kpi.key} style={{ textAlign: 'right' }}>
                      {kpi.label}
                    </th>
                  ))}
                  {KPI_CONFIG.map((kpi) => (
                    <th key={`${kpi.key}-rate`} style={{ textAlign: 'right' }}>
                      {kpi.label} %
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {playerBreakdown.map(({ player, monthsTracked, kpis }) => (
                  <tr key={player.id} className="stagger-item">
                    <td>
                      <div className="flex items-center gap-12">
                        <Avatar
                          name={player.name}
                          initials={player.initials}
                          avatarUrl={player.avatar_url}
                          size={32}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{player.name}</div>
                          <div className="text-sm text-muted">
                            Ziel: {KPI_CONFIG.map((k) =>
                              k.format(kpis[k.key].playerShare)
                            ).join(' / ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="font-mono">{monthsTracked}/12</span>
                    </td>
                    {KPI_CONFIG.map((kpi) => (
                      <td
                        key={kpi.key}
                        className="font-mono"
                        style={{ textAlign: 'right', fontSize: 14 }}
                      >
                        {kpi.format(kpis[kpi.key].actual)}
                      </td>
                    ))}
                    {KPI_CONFIG.map((kpi) => {
                      const rate = kpis[kpi.key].rate
                      return (
                        <td
                          key={`${kpi.key}-rate`}
                          className="font-mono font-bold"
                          style={{
                            textAlign: 'right',
                            fontSize: 14,
                            color: rateColor(rate),
                          }}
                        >
                          {formatPercent(rate)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
