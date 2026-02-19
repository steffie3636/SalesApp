import { useState, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { usePlayers, useActivityLog } from '../../lib/useData'
import { formatNumber, formatCHF, formatTimestamp } from '../../lib/format'
import { calculatePoints, calculateLevel } from '../../lib/points'
import { useToast } from '../../context/ToastContext'
import Avatar from '../../components/Avatar'
import Field from '../../components/Field'

export default function DealEntry() {
  const { players, loading: playersLoading, refetch: refetchPlayers } = usePlayers()
  const { data: activityLog, loading: logLoading, refetch: refetchLog } = useActivityLog(10)
  const { showToast } = useToast()

  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [revenue, setRevenue] = useState('')
  const [newCustomers, setNewCustomers] = useState('')
  const [calls, setCalls] = useState('')
  const [saving, setSaving] = useState(false)

  // F-DE-03: Live-Vorschau der Punkte
  const revenueNum = Number(revenue) || 0
  const newCustomersNum = Number(newCustomers) || 0
  const callsNum = Number(calls) || 0
  const previewPoints = calculatePoints(revenueNum, newCustomersNum, callsNum)

  const selectedPlayer = useMemo(
    () => players.find(p => p.id === selectedPlayerId),
    [players, selectedPlayerId]
  )

  // F-DE-04: Speichern
  async function handleSave() {
    if (!selectedPlayerId) {
      showToast('Bitte einen Spieler auswählen.')
      return
    }
    if (revenueNum === 0 && newCustomersNum === 0 && callsNum === 0) {
      showToast('Bitte mindestens einen Wert eingeben.')
      return
    }

    setSaving(true)
    try {
      const player = selectedPlayer
      if (!player) throw new Error('Spieler nicht gefunden')

      // Aktivitätslog eintragen
      const { error: logError } = await supabase.from('activity_log').insert({
        player_id: selectedPlayerId,
        revenue: revenueNum,
        new_customers: newCustomersNum,
        calls: callsNum,
        points_earned: previewPoints,
      })
      if (logError) throw logError

      // Spieler-Totale aktualisieren
      const newRevenue = (player.revenue || 0) + revenueNum
      const newNewCustomers = (player.new_customers || 0) + newCustomersNum
      const newCalls = (player.calls || 0) + callsNum
      const newPoints = calculatePoints(newRevenue, newNewCustomers, newCalls)
      const newLevel = calculateLevel(newPoints)

      const { error: updateError } = await supabase
        .from('players')
        .update({
          revenue: newRevenue,
          new_customers: newNewCustomers,
          calls: newCalls,
          points: newPoints,
          level: newLevel,
        })
        .eq('id', selectedPlayerId)
      if (updateError) throw updateError

      showToast(`${player.name}: +${formatNumber(previewPoints)} Punkte gespeichert!`)

      // Felder zurücksetzen
      setRevenue('')
      setNewCustomers('')
      setCalls('')

      // Daten neu laden
      refetchPlayers()
      refetchLog()
    } catch (err) {
      console.error(err)
      showToast('Fehler beim Speichern: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-24">
      <div>
        <h2>Deal-Erfassung</h2>
        <p className="text-sm text-muted mt-8">
          Umsätze, Neukunden und Anrufe für Spieler erfassen.
        </p>
      </div>

      <div className="grid-2">
        {/* Eingabeformular */}
        <div className="card">
          <h3 className="mb-16">Neue Erfassung</h3>

          {/* F-DE-01: Spieler-Dropdown */}
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

          {/* F-DE-02: Eingabefelder */}
          <Field label="Umsatz (CHF)">
            <input
              className="form-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={revenue}
              onChange={e => setRevenue(e.target.value)}
            />
          </Field>

          <Field label="Neukunden">
            <input
              className="form-input"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={newCustomers}
              onChange={e => setNewCustomers(e.target.value)}
            />
          </Field>

          <Field label="Anrufe">
            <input
              className="form-input"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={calls}
              onChange={e => setCalls(e.target.value)}
            />
          </Field>

          {/* F-DE-03 / F-DE-06: Punkte-Vorschau mit Formel */}
          <div
            className="card"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Punkte-Vorschau
            </div>
            <div
              className="font-mono font-bold"
              style={{ fontSize: 28, color: 'var(--color-primary)' }}
            >
              +{formatNumber(previewPoints)}
            </div>
            <div className="font-mono text-sm" style={{ color: 'var(--text-muted)', marginTop: 6 }}>
              CHF {formatNumber(revenueNum)} &times;0.02 + Neukunde {newCustomersNum} &times;150 + Anruf {callsNum} &times;5
            </div>
          </div>

          <button
            className="btn btn-primary w-full"
            onClick={handleSave}
            disabled={saving || !selectedPlayerId}
          >
            {saving ? 'Wird gespeichert...' : 'Speichern'}
          </button>
        </div>

        {/* F-DE-05: Aktivitätslog */}
        <div className="card">
          <h3 className="mb-16">Letzte Einträge</h3>

          {logLoading ? (
            <div className="empty-state">
              <p>Lade Einträge...</p>
            </div>
          ) : activityLog.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>Noch keine Einträge vorhanden.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {activityLog.map((entry, i) => (
                <div
                  key={entry.id}
                  className="stagger-item"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: i < activityLog.length - 1 ? '1px solid var(--border-color-light)' : 'none',
                  }}
                >
                  <Avatar
                    name={entry.player?.name}
                    initials={entry.player?.initials}
                    size={36}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center justify-between gap-8">
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {entry.player?.name || 'Unbekannt'}
                      </span>
                      <span
                        className="font-mono"
                        style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}
                      >
                        +{formatNumber(entry.points_earned || 0)}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {formatCHF(entry.revenue || 0)}, {entry.new_customers || 0} NK, {entry.calls || 0} Anrufe
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {formatTimestamp(entry.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
