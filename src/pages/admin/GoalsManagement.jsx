import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { usePlayers, useAnnualGoals, useMonthlyActuals } from '../../lib/useData'
import { formatCHF, formatNumber, getMonthName, getMonthShort } from '../../lib/format'
import { calculatePlayerShare, calculateAchievementRate } from '../../lib/points'
import { useToast } from '../../context/ToastContext'
import Avatar from '../../components/Avatar'
import Field from '../../components/Field'

const CURRENT_YEAR = new Date().getFullYear()
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

export default function GoalsManagement() {
  const { players, loading: playersLoading } = usePlayers()
  const { showToast } = useToast()

  const [year, setYear] = useState(CURRENT_YEAR)
  const { data: annualGoal, loading: goalLoading, refetch: refetchGoal } = useAnnualGoals(year)
  const { data: monthlyActuals, loading: actualsLoading, refetch: refetchActuals } = useMonthlyActuals(year)

  // Jahresziele-Formular
  const [goalBeNeukunden, setGoalBeNeukunden] = useState('')
  const [goalAnzNeukunden, setGoalAnzNeukunden] = useState('')
  const [goalBeTotal, setGoalBeTotal] = useState('')
  const [savingGoal, setSavingGoal] = useState(false)

  // Monatswerte-Erfassung
  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [monthBeNeukunden, setMonthBeNeukunden] = useState('')
  const [monthAnzNeukunden, setMonthAnzNeukunden] = useState('')
  const [monthBeTotal, setMonthBeTotal] = useState('')
  const [savingActual, setSavingActual] = useState(false)

  // Übersicht-Spieler
  const [overviewPlayerId, setOverviewPlayerId] = useState('')

  // Jahresziele laden wenn vorhanden
  useEffect(() => {
    if (annualGoal) {
      setGoalBeNeukunden(annualGoal.be_neukunden || '')
      setGoalAnzNeukunden(annualGoal.anz_neukunden || '')
      setGoalBeTotal(annualGoal.be_total || '')
    } else {
      setGoalBeNeukunden('')
      setGoalAnzNeukunden('')
      setGoalBeTotal('')
    }
  }, [annualGoal])

  // F-ZV-05 / F-ZV-06: Monatswerte laden wenn Spieler/Monat wechselt
  useEffect(() => {
    if (!selectedPlayerId || !selectedMonth || !monthlyActuals) {
      setMonthBeNeukunden('')
      setMonthAnzNeukunden('')
      setMonthBeTotal('')
      return
    }
    const existing = monthlyActuals.find(
      a => a.player_id === selectedPlayerId && a.month === selectedMonth
    )
    if (existing) {
      setMonthBeNeukunden(existing.be_neukunden || '')
      setMonthAnzNeukunden(existing.anz_neukunden || '')
      setMonthBeTotal(existing.be_total || '')
    } else {
      setMonthBeNeukunden('')
      setMonthAnzNeukunden('')
      setMonthBeTotal('')
    }
  }, [selectedPlayerId, selectedMonth, monthlyActuals])

  // F-ZV-01 / F-ZV-02: Jahresziele speichern
  async function handleSaveGoal() {
    setSavingGoal(true)
    try {
      const payload = {
        year,
        be_neukunden: Number(goalBeNeukunden) || 0,
        anz_neukunden: Number(goalAnzNeukunden) || 0,
        be_total: Number(goalBeTotal) || 0,
      }

      const { error } = await supabase
        .from('annual_goals')
        .upsert(payload, { onConflict: 'year' })
      if (error) throw error

      showToast(`Jahresziele ${year} gespeichert.`)
      refetchGoal()
    } catch (err) {
      console.error(err)
      showToast('Fehler beim Speichern: ' + err.message)
    } finally {
      setSavingGoal(false)
    }
  }

  // F-ZV-03 / F-ZV-04: Monatswerte speichern (Upsert)
  async function handleSaveActual() {
    if (!selectedPlayerId) {
      showToast('Bitte einen Spieler auswählen.')
      return
    }

    setSavingActual(true)
    try {
      const payload = {
        player_id: selectedPlayerId,
        year,
        month: selectedMonth,
        be_neukunden: Number(monthBeNeukunden) || 0,
        anz_neukunden: Number(monthAnzNeukunden) || 0,
        be_total: Number(monthBeTotal) || 0,
      }

      const { error } = await supabase
        .from('monthly_actuals')
        .upsert(payload, { onConflict: 'player_id,year,month' })
      if (error) throw error

      showToast(`Monatswerte ${getMonthName(selectedMonth)} gespeichert.`)
      refetchActuals()
    } catch (err) {
      console.error(err)
      showToast('Fehler beim Speichern: ' + err.message)
    } finally {
      setSavingActual(false)
    }
  }

  // F-ZV-07 / F-ZV-08: Kumulative Werte berechnen
  const overviewPlayer = useMemo(() => {
    if (!overviewPlayerId || !monthlyActuals) return null
    return players.find(p => p.id === overviewPlayerId)
  }, [overviewPlayerId, players, monthlyActuals])

  const overviewData = useMemo(() => {
    if (!overviewPlayerId || !monthlyActuals) return []
    const playerActuals = monthlyActuals.filter(a => a.player_id === overviewPlayerId)

    let cumBeNeukunden = 0
    let cumAnzNeukunden = 0
    let cumBeTotal = 0

    return MONTHS.map(month => {
      const actual = playerActuals.find(a => a.month === month)
      const deltaBeNeukunden = actual?.be_neukunden || 0
      const deltaAnzNeukunden = actual?.anz_neukunden || 0
      const deltaBeTotal = actual?.be_total || 0

      cumBeNeukunden += deltaBeNeukunden
      cumAnzNeukunden += deltaAnzNeukunden
      cumBeTotal += deltaBeTotal

      return {
        month,
        deltaBeNeukunden,
        deltaAnzNeukunden,
        deltaBeTotal,
        cumBeNeukunden,
        cumAnzNeukunden,
        cumBeTotal,
      }
    })
  }, [overviewPlayerId, monthlyActuals])

  // F-ZV-10: Spieler-Anteil am Teamziel
  const playerCount = players.length || 1
  const playerGoalBeNeukunden = calculatePlayerShare(Number(goalBeNeukunden) || 0, playerCount)
  const playerGoalAnzNeukunden = calculatePlayerShare(Number(goalAnzNeukunden) || 0, playerCount)
  const playerGoalBeTotal = calculatePlayerShare(Number(goalBeTotal) || 0, playerCount)

  // F-ZV-11: Erreichungsgrad
  const totalCumBeNeukunden = overviewData.length > 0 ? overviewData[overviewData.length - 1].cumBeNeukunden : 0
  const totalCumAnzNeukunden = overviewData.length > 0 ? overviewData[overviewData.length - 1].cumAnzNeukunden : 0
  const totalCumBeTotal = overviewData.length > 0 ? overviewData[overviewData.length - 1].cumBeTotal : 0

  const rateBeNeukunden = calculateAchievementRate(totalCumBeNeukunden, playerGoalBeNeukunden)
  const rateAnzNeukunden = calculateAchievementRate(totalCumAnzNeukunden, playerGoalAnzNeukunden)
  const rateBeTotal = calculateAchievementRate(totalCumBeTotal, playerGoalBeTotal)

  function rateColor(rate) {
    if (rate >= 100) return 'var(--color-mint)'
    if (rate >= 50) return 'var(--color-yellow)'
    return 'var(--color-red)'
  }

  const loading = playersLoading || goalLoading || actualsLoading

  return (
    <div className="flex flex-col gap-24">
      <div className="flex items-center justify-between">
        <div>
          <h2>Ziel-Verwaltung</h2>
          <p className="text-sm text-muted mt-8">
            Jahresziele definieren und Monatswerte pro Spieler erfassen.
          </p>
        </div>
        <Field>
          <select
            className="form-select"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{ width: 120 }}
          >
            {[CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid-2">
        {/* F-ZV-01 / F-ZV-02: Jahresziele */}
        <div className="card">
          <h3 className="mb-16">Jahresziele {year} (Team)</h3>

          <Field label="BE Neukunden (CHF)">
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={goalBeNeukunden}
              onChange={e => setGoalBeNeukunden(e.target.value)}
            />
          </Field>

          <Field label="Anz. Neukunden">
            <input
              className="form-input"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={goalAnzNeukunden}
              onChange={e => setGoalAnzNeukunden(e.target.value)}
            />
          </Field>

          <Field label="BE Total (CHF)">
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={goalBeTotal}
              onChange={e => setGoalBeTotal(e.target.value)}
            />
          </Field>

          <button
            className="btn btn-primary w-full"
            onClick={handleSaveGoal}
            disabled={savingGoal}
          >
            {savingGoal ? 'Wird gespeichert...' : 'Jahresziele speichern'}
          </button>

          {players.length > 0 && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                fontSize: 13,
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                Ziel pro Spieler ({players.length} Spieler):
              </div>
              <div>BE Neukunden: {formatCHF(playerGoalBeNeukunden)}</div>
              <div>Anz. Neukunden: {formatNumber(Math.round(playerGoalAnzNeukunden))}</div>
              <div>BE Total: {formatCHF(playerGoalBeTotal)}</div>
            </div>
          )}
        </div>

        {/* F-ZV-03 / F-ZV-04: Monatswerte erfassen */}
        <div className="card">
          <h3 className="mb-16">Monatswerte erfassen</h3>

          <div className="form-row">
            <Field label="Spieler">
              <select
                className="form-select"
                value={selectedPlayerId}
                onChange={e => setSelectedPlayerId(e.target.value)}
              >
                <option value="">-- Spieler wählen --</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.initials})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Monat">
              <select
                className="form-select"
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
              >
                {MONTHS.map(m => (
                  <option key={m} value={m}>{getMonthName(m)}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="BE Neukunden (CHF)">
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={monthBeNeukunden}
              onChange={e => setMonthBeNeukunden(e.target.value)}
            />
          </Field>

          <Field label="Anz. Neukunden">
            <input
              className="form-input"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={monthAnzNeukunden}
              onChange={e => setMonthAnzNeukunden(e.target.value)}
            />
          </Field>

          <Field label="BE Total (CHF)">
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={monthBeTotal}
              onChange={e => setMonthBeTotal(e.target.value)}
            />
          </Field>

          <button
            className="btn btn-primary w-full"
            onClick={handleSaveActual}
            disabled={savingActual || !selectedPlayerId}
          >
            {savingActual ? 'Wird gespeichert...' : 'Monatswerte speichern'}
          </button>
        </div>
      </div>

      {/* F-ZV-07: Übersichtstabelle pro Spieler */}
      <div className="card">
        <div className="flex items-center justify-between mb-16">
          <h3>Jahresübersicht pro Spieler</h3>
          <Field>
            <select
              className="form-select"
              value={overviewPlayerId}
              onChange={e => setOverviewPlayerId(e.target.value)}
              style={{ width: 220 }}
            >
              <option value="">-- Spieler wählen --</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
        </div>

        {!overviewPlayerId ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <p>Bitte einen Spieler auswählen, um die Jahresübersicht anzuzeigen.</p>
          </div>
        ) : loading ? (
          <div className="empty-state">
            <p>Lade Daten...</p>
          </div>
        ) : (
          <>
            {/* BE Neukunden */}
            <div style={{ marginBottom: 24 }}>
              <h4 className="mb-8">BE Neukunden (CHF)</h4>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Kennzahl</th>
                      {MONTHS.map(m => (
                        <th key={m} style={{ textAlign: 'right', minWidth: 80 }}>{getMonthShort(m)}</th>
                      ))}
                      <th style={{ textAlign: 'right', minWidth: 100, background: 'var(--bg-input)', fontWeight: 700 }}>
                        Ziel
                      </th>
                      <th style={{ textAlign: 'right', minWidth: 80, background: 'var(--bg-input)', fontWeight: 700 }}>
                        Erreichung
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Kumuliert</td>
                      {overviewData.map(d => (
                        <td key={d.month} className="font-mono text-right" style={{ fontSize: 13 }}>
                          {formatNumber(d.cumBeNeukunden)}
                        </td>
                      ))}
                      <td className="font-mono text-right" style={{ fontSize: 13, fontWeight: 600 }}>
                        {formatNumber(Math.round(playerGoalBeNeukunden))}
                      </td>
                      <td
                        className="font-mono text-right font-bold"
                        style={{ fontSize: 13, color: rateColor(rateBeNeukunden) }}
                      >
                        {rateBeNeukunden.toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>Monatswert</td>
                      {overviewData.map(d => (
                        <td key={d.month} className="font-mono text-right" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {d.deltaBeNeukunden > 0 ? `+${formatNumber(d.deltaBeNeukunden)}` : '-'}
                        </td>
                      ))}
                      <td />
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Anz. Neukunden */}
            <div style={{ marginBottom: 24 }}>
              <h4 className="mb-8">Anz. Neukunden</h4>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Kennzahl</th>
                      {MONTHS.map(m => (
                        <th key={m} style={{ textAlign: 'right', minWidth: 80 }}>{getMonthShort(m)}</th>
                      ))}
                      <th style={{ textAlign: 'right', minWidth: 100, background: 'var(--bg-input)', fontWeight: 700 }}>
                        Ziel
                      </th>
                      <th style={{ textAlign: 'right', minWidth: 80, background: 'var(--bg-input)', fontWeight: 700 }}>
                        Erreichung
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Kumuliert</td>
                      {overviewData.map(d => (
                        <td key={d.month} className="font-mono text-right" style={{ fontSize: 13 }}>
                          {formatNumber(d.cumAnzNeukunden)}
                        </td>
                      ))}
                      <td className="font-mono text-right" style={{ fontSize: 13, fontWeight: 600 }}>
                        {formatNumber(Math.round(playerGoalAnzNeukunden))}
                      </td>
                      <td
                        className="font-mono text-right font-bold"
                        style={{ fontSize: 13, color: rateColor(rateAnzNeukunden) }}
                      >
                        {rateAnzNeukunden.toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>Monatswert</td>
                      {overviewData.map(d => (
                        <td key={d.month} className="font-mono text-right" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {d.deltaAnzNeukunden > 0 ? `+${formatNumber(d.deltaAnzNeukunden)}` : '-'}
                        </td>
                      ))}
                      <td />
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* BE Total */}
            <div>
              <h4 className="mb-8">BE Total (CHF)</h4>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Kennzahl</th>
                      {MONTHS.map(m => (
                        <th key={m} style={{ textAlign: 'right', minWidth: 80 }}>{getMonthShort(m)}</th>
                      ))}
                      <th style={{ textAlign: 'right', minWidth: 100, background: 'var(--bg-input)', fontWeight: 700 }}>
                        Ziel
                      </th>
                      <th style={{ textAlign: 'right', minWidth: 80, background: 'var(--bg-input)', fontWeight: 700 }}>
                        Erreichung
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Kumuliert</td>
                      {overviewData.map(d => (
                        <td key={d.month} className="font-mono text-right" style={{ fontSize: 13 }}>
                          {formatNumber(d.cumBeTotal)}
                        </td>
                      ))}
                      <td className="font-mono text-right" style={{ fontSize: 13, fontWeight: 600 }}>
                        {formatNumber(Math.round(playerGoalBeTotal))}
                      </td>
                      <td
                        className="font-mono text-right font-bold"
                        style={{ fontSize: 13, color: rateColor(rateBeTotal) }}
                      >
                        {rateBeTotal.toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>Monatswert</td>
                      {overviewData.map(d => (
                        <td key={d.month} className="font-mono text-right" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {d.deltaBeTotal > 0 ? `+${formatNumber(d.deltaBeTotal)}` : '-'}
                        </td>
                      ))}
                      <td />
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
