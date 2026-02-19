import { useState, useMemo, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { usePlayers, useBadges } from '../../lib/useData'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/Modal'
import Field from '../../components/Field'
import BadgeDisplay from '../../components/BadgeDisplay'
import Avatar from '../../components/Avatar'

const COLORS = [
  '#6366f1', '#f97316', '#10b981', '#8b5cf6', '#0ea5e9',
  '#ec4899', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16',
]

export default function BadgeManagement() {
  const { players, loading: playersLoading, refetch: refetchPlayers } = usePlayers()
  const { data: badges, loading: badgesLoading, refetch: refetchBadges } = useBadges()
  const { showToast } = useToast()

  // Badge-Formular
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBadge, setEditingBadge] = useState(null)
  const [badgeName, setBadgeName] = useState('')
  const [badgeDescription, setBadgeDescription] = useState('')
  const [badgeColor, setBadgeColor] = useState(COLORS[0])
  const [badgeEmoji, setBadgeEmoji] = useState('')
  const [badgeImageUrl, setBadgeImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Zuweisung
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignPlayerId, setAssignPlayerId] = useState('')
  const [assignBadgeId, setAssignBadgeId] = useState('')

  const fileInputRef = useRef(null)

  function resetForm() {
    setBadgeName('')
    setBadgeDescription('')
    setBadgeColor(COLORS[0])
    setBadgeEmoji('')
    setBadgeImageUrl('')
    setImagePreview('')
  }

  function openAdd() {
    setEditingBadge(null)
    resetForm()
    setModalOpen(true)
  }

  function openEdit(badge) {
    setEditingBadge(badge)
    setBadgeName(badge.name || '')
    setBadgeDescription(badge.description || '')
    setBadgeColor(badge.color || COLORS[0])
    setBadgeEmoji(badge.emoji || '')
    setBadgeImageUrl(badge.image_url || '')
    setImagePreview(badge.image_url && badge.image_url.startsWith('data:') ? badge.image_url : '')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingBadge(null)
    resetForm()
  }

  // F-BV-02: Bild-Upload zu Base64
  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      const dataUrl = evt.target.result
      setBadgeImageUrl(dataUrl)
      setImagePreview(dataUrl)
      // Emoji leeren, da Bild Vorrang hat
      setBadgeEmoji('')
    }
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setBadgeImageUrl('')
    setImagePreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // F-BV-01: Badge erstellen / bearbeiten
  async function handleSave() {
    if (!badgeName.trim()) {
      showToast('Bitte einen Badge-Namen eingeben.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: badgeName.trim(),
        description: badgeDescription.trim(),
        color: badgeColor,
        emoji: badgeImageUrl ? '' : badgeEmoji.trim(),
        image_url: badgeImageUrl || null,
      }

      if (editingBadge) {
        const { error } = await supabase
          .from('badges')
          .update(payload)
          .eq('id', editingBadge.id)
        if (error) throw error
        showToast(`Badge "${badgeName}" aktualisiert.`)
      } else {
        const { error } = await supabase.from('badges').insert(payload)
        if (error) throw error
        showToast(`Badge "${badgeName}" erstellt.`)
      }

      closeModal()
      refetchBadges()
      refetchPlayers()
    } catch (err) {
      console.error(err)
      showToast('Fehler beim Speichern: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // F-BV-06: Badge löschen (entfernt auch von allen Spielern)
  async function handleDelete(badge) {
    setSaving(true)
    try {
      await supabase.from('player_badges').delete().eq('badge_id', badge.id)
      const { error } = await supabase.from('badges').delete().eq('id', badge.id)
      if (error) throw error
      showToast(`Badge "${badge.name}" gelöscht.`)
      setDeleteConfirm(null)
      refetchBadges()
      refetchPlayers()
    } catch (err) {
      console.error(err)
      showToast('Fehler beim Löschen: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // F-BV-04: Badge einem Spieler zuweisen (ohne Duplikate)
  async function handleAssign() {
    if (!assignPlayerId || !assignBadgeId) {
      showToast('Bitte Spieler und Badge auswählen.')
      return
    }

    // Duplikat prüfen
    const player = players.find(p => p.id === assignPlayerId)
    const alreadyHas = player?.player_badges?.some(pb => pb.badge?.id === assignBadgeId)
    if (alreadyHas) {
      showToast('Dieser Spieler hat diesen Badge bereits.')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.from('player_badges').insert({
        player_id: assignPlayerId,
        badge_id: assignBadgeId,
      })
      if (error) throw error
      showToast('Badge zugewiesen.')
      setAssignModalOpen(false)
      setAssignPlayerId('')
      setAssignBadgeId('')
      refetchPlayers()
    } catch (err) {
      console.error(err)
      showToast('Fehler beim Zuweisen: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // F-BV-05: Badge von Spieler entfernen
  async function handleRemoveBadge(playerBadgeId) {
    try {
      const { error } = await supabase.from('player_badges').delete().eq('id', playerBadgeId)
      if (error) throw error
      showToast('Badge entfernt.')
      refetchPlayers()
    } catch (err) {
      console.error(err)
      showToast('Fehler beim Entfernen: ' + err.message)
    }
  }

  const loading = playersLoading || badgesLoading

  return (
    <div className="flex flex-col gap-24">
      <div className="flex items-center justify-between">
        <div>
          <h2>Badge-Verwaltung</h2>
          <p className="text-sm text-muted mt-8">
            Badges erstellen, bearbeiten und Spielern zuweisen.
          </p>
        </div>
        <div className="flex gap-8">
          <button className="btn btn-secondary" onClick={() => setAssignModalOpen(true)}>
            Badge zuweisen
          </button>
          <button className="btn btn-primary" onClick={openAdd}>
            + Badge erstellen
          </button>
        </div>
      </div>

      {/* Alle Badges */}
      {loading ? (
        <div className="empty-state">
          <p>Lade Badges...</p>
        </div>
      ) : (
        <>
          <div className="card">
            <h3 className="mb-16">Alle Badges</h3>
            {badges.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏅</div>
                <p>Noch keine Badges vorhanden.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-16">
                {badges.map(badge => (
                  <div
                    key={badge.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                    }}
                  >
                    <BadgeDisplay badge={badge} size={36} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{badge.name}</div>
                      {badge.description && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {badge.description}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4" style={{ marginLeft: 8 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openEdit(badge)}
                      >
                        Bearbeiten
                      </button>
                      {deleteConfirm === badge.id ? (
                        <>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(badge)}
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
                        </>
                      ) : (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteConfirm(badge.id)}
                          style={{ color: 'var(--color-red)' }}
                        >
                          Löschen
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* F-BV-07: Übersicht aller Badges pro Spieler */}
          <div className="card">
            <h3 className="mb-16">Badges pro Spieler</h3>
            {players.length === 0 ? (
              <div className="empty-state">
                <p>Keine Spieler vorhanden.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-16">
                {players.map(player => (
                  <div
                    key={player.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '12px 0',
                      borderBottom: '1px solid var(--border-color-light)',
                    }}
                  >
                    <Avatar
                      name={player.name}
                      initials={player.initials}
                      avatarUrl={player.avatar_url}
                      size={40}
                    />
                    <div style={{ minWidth: 120, fontWeight: 600 }}>{player.name}</div>
                    <div className="flex flex-wrap gap-8" style={{ flex: 1 }}>
                      {(!player.player_badges || player.player_badges.length === 0) ? (
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          Keine Badges
                        </span>
                      ) : (
                        player.player_badges.map(pb => (
                          <button
                            key={pb.id}
                            onClick={() => handleRemoveBadge(pb.id)}
                            title={`${pb.badge?.name} entfernen`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              background: `${pb.badge?.color || '#6366f1'}10`,
                              cursor: 'pointer',
                              fontSize: 13,
                              fontFamily: 'var(--font-sans)',
                              transition: 'all var(--transition-fast)',
                            }}
                          >
                            <BadgeDisplay badge={pb.badge} size={22} />
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                              {pb.badge?.name}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--color-red)', marginLeft: 2 }}>
                              ✕
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal: Badge erstellen / bearbeiten */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingBadge ? 'Badge bearbeiten' : 'Neuer Badge'}
        width={480}
      >
        <Field label="Name">
          <input
            className="form-input"
            type="text"
            placeholder="z.B. Top Seller"
            value={badgeName}
            onChange={e => setBadgeName(e.target.value)}
            autoFocus
          />
        </Field>

        <Field label="Beschreibung">
          <input
            className="form-input"
            type="text"
            placeholder="Kurze Beschreibung"
            value={badgeDescription}
            onChange={e => setBadgeDescription(e.target.value)}
          />
        </Field>

        <Field label="Farbe">
          <div className="flex flex-wrap gap-8">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setBadgeColor(c)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  background: c,
                  border: badgeColor === c ? '3px solid var(--text-primary)' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  outline: badgeColor === c ? `2px solid ${c}` : 'none',
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </Field>

        {/* F-BV-02: Emoji oder Bild-Upload */}
        <Field label="Badge-Bild" hint="Entweder ein Emoji eingeben oder ein Bild hochladen. Bild hat Vorrang.">
          <div className="flex flex-col gap-12">
            <div className="flex gap-12 items-center">
              <input
                className="form-input"
                type="text"
                placeholder="Emoji, z.B. 🏅"
                value={badgeEmoji}
                onChange={e => {
                  setBadgeEmoji(e.target.value)
                  if (e.target.value) clearImage()
                }}
                style={{ flex: 1 }}
                disabled={!!badgeImageUrl}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>oder</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Bild wählen
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* F-BV-03: Bildvorschau */}
            {imagePreview && (
              <div className="flex items-center gap-12">
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-input)',
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Vorschau"
                    style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 4 }}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={clearImage}
                  style={{ color: 'var(--color-red)' }}
                >
                  Bild entfernen
                </button>
              </div>
            )}
          </div>
        </Field>

        {/* Vorschau des Badges */}
        <div
          style={{
            padding: 16,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-input)',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Vorschau</div>
          <BadgeDisplay
            badge={{
              name: badgeName || 'Badge',
              emoji: badgeImageUrl ? '' : badgeEmoji,
              image_url: badgeImageUrl || null,
              color: badgeColor,
            }}
            size={36}
            showLabel
          />
        </div>

        <div className="flex gap-12" style={{ marginTop: 20 }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Wird gespeichert...' : editingBadge ? 'Aktualisieren' : 'Erstellen'}
          </button>
          <button className="btn btn-secondary" onClick={closeModal}>
            Abbrechen
          </button>
        </div>
      </Modal>

      {/* Modal: Badge zuweisen */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => { setAssignModalOpen(false); setAssignPlayerId(''); setAssignBadgeId('') }}
        title="Badge zuweisen"
      >
        <Field label="Spieler">
          <select
            className="form-select"
            value={assignPlayerId}
            onChange={e => setAssignPlayerId(e.target.value)}
          >
            <option value="">-- Spieler wählen --</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Badge">
          <select
            className="form-select"
            value={assignBadgeId}
            onChange={e => setAssignBadgeId(e.target.value)}
          >
            <option value="">-- Badge wählen --</option>
            {badges.map(b => (
              <option key={b.id} value={b.id}>{b.emoji || '🏅'} {b.name}</option>
            ))}
          </select>
        </Field>

        <div className="flex gap-12" style={{ marginTop: 20 }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={handleAssign}
            disabled={saving}
          >
            {saving ? 'Wird zugewiesen...' : 'Zuweisen'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => { setAssignModalOpen(false); setAssignPlayerId(''); setAssignBadgeId('') }}
          >
            Abbrechen
          </button>
        </div>
      </Modal>
    </div>
  )
}
