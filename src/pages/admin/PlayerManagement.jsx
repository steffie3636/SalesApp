import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { usePlayers } from '../../lib/useData'
import { useToast } from '../../context/ToastContext'
import Avatar from '../../components/Avatar'
import Modal from '../../components/Modal'
import Field from '../../components/Field'

export default function PlayerManagement() {
  const { players, loading, refetch } = usePlayers()
  const { showToast } = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [name, setName] = useState('')
  const [initials, setInitials] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // F-SP-05: Fallback Kürzel
  function deriveInitials(playerName) {
    const trimmed = (playerName || '').trim()
    if (trimmed.length <= 3) return trimmed.toUpperCase()
    return trimmed.slice(0, 2).toUpperCase()
  }

  function openAdd() {
    setEditingPlayer(null)
    setName('')
    setInitials('')
    setModalOpen(true)
  }

  function openEdit(player) {
    setEditingPlayer(player)
    setName(player.name)
    setInitials(player.initials || '')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingPlayer(null)
    setName('')
    setInitials('')
  }

  // F-SP-04: Auto-Grossbuchstaben
  function handleInitialsChange(value) {
    setInitials(value.toUpperCase().slice(0, 3))
  }

  async function handleSave() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      showToast('Bitte einen Namen eingeben.')
      return
    }

    // F-SP-05: Kürzel-Fallback
    const finalInitials = initials.trim() || deriveInitials(trimmedName)
    if (finalInitials.length < 2 || finalInitials.length > 3) {
      showToast('Kürzel muss 2-3 Zeichen lang sein.')
      return
    }

    setSaving(true)
    try {
      if (editingPlayer) {
        // F-SP-02: Spieler bearbeiten
        const { error } = await supabase
          .from('players')
          .update({ name: trimmedName, initials: finalInitials })
          .eq('id', editingPlayer.id)
        if (error) throw error
        showToast(`Spieler "${trimmedName}" aktualisiert.`)
      } else {
        // F-SP-01 / F-SP-06: Neuen Spieler anlegen
        const { error } = await supabase.from('players').insert({
          name: trimmedName,
          initials: finalInitials,
          points: 0,
          level: 1,
          revenue: 0,
          new_customers: 0,
          calls: 0,
        })
        if (error) throw error
        showToast(`Spieler "${trimmedName}" hinzugefügt.`)
      }
      closeModal()
      refetch()
    } catch (err) {
      console.error(err)
      showToast('Fehler beim Speichern: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // F-SP-03: Spieler entfernen
  async function handleDelete(player) {
    setSaving(true)
    try {
      // Zuerst zugeordnete Badges entfernen
      await supabase.from('player_badges').delete().eq('player_id', player.id)
      // Dann Spieler löschen
      const { error } = await supabase.from('players').delete().eq('id', player.id)
      if (error) throw error
      showToast(`Spieler "${player.name}" gelöscht.`)
      setDeleteConfirm(null)
      refetch()
    } catch (err) {
      console.error(err)
      showToast('Fehler beim Löschen: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-24">
      <div className="flex items-center justify-between">
        <div>
          <h2>Spieler-Verwaltung</h2>
          <p className="text-sm text-muted mt-8">
            Spieler hinzufügen, bearbeiten oder entfernen.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Spieler hinzufügen
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Lade Spieler...</p>
        </div>
      ) : players.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">👥</div>
          <p>Noch keine Spieler vorhanden.</p>
        </div>
      ) : (
        <div className="card p-0" style={{ overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th>Spieler</th>
                <th>Kürzel</th>
                <th style={{ textAlign: 'right' }}>Punkte</th>
                <th style={{ textAlign: 'right' }}>Level</th>
                <th style={{ textAlign: 'right' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id}>
                  <td>
                    <div className="flex items-center gap-12">
                      <Avatar
                        name={player.name}
                        initials={player.initials}
                        avatarUrl={player.avatar_url}
                        size={36}
                      />
                      <span style={{ fontWeight: 600 }}>{player.name}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="font-mono"
                      style={{
                        background: 'var(--bg-input)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 13,
                      }}
                    >
                      {player.initials}
                    </span>
                  </td>
                  <td className="text-right font-mono">{player.points || 0}</td>
                  <td className="text-right font-mono">{player.level || 1}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-8">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(player)}
                        title="Bearbeiten"
                      >
                        Bearbeiten
                      </button>
                      {deleteConfirm === player.id ? (
                        <div className="flex items-center gap-4">
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(player)}
                            disabled={saving}
                          >
                            Bestätigen
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            Abbrechen
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteConfirm(player.id)}
                          style={{ color: 'var(--color-red)' }}
                          title="Löschen"
                        >
                          Löschen
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Spieler hinzufügen / bearbeiten */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingPlayer ? 'Spieler bearbeiten' : 'Neuer Spieler'}
      >
        <Field label="Name">
          <input
            className="form-input"
            type="text"
            placeholder="Vor- und Nachname"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </Field>

        <Field label="Kürzel (2-3 Buchstaben)" hint="Wird automatisch in Grossbuchstaben umgewandelt. Leer lassen für automatisches Kürzel.">
          <input
            className="form-input"
            type="text"
            placeholder={name ? deriveInitials(name) : 'z.B. MK'}
            value={initials}
            onChange={e => handleInitialsChange(e.target.value)}
            maxLength={3}
          />
        </Field>

        <div className="flex gap-12" style={{ marginTop: 20 }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Wird gespeichert...' : editingPlayer ? 'Aktualisieren' : 'Hinzufügen'}
          </button>
          <button className="btn btn-secondary" onClick={closeModal}>
            Abbrechen
          </button>
        </div>
      </Modal>
    </div>
  )
}
