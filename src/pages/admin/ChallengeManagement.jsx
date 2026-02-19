import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useChallenges } from '../../lib/useData'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/Modal'
import Field from '../../components/Field'
import ProgressBar from '../../components/ProgressBar'

const ICONS = ['🎯', '💪', '📞', '🩸', '🚀', '💎', '⚡', '🏆', '⭐', '🔥']
const COLORS = [
  '#6366f1', '#f97316', '#10b981', '#8b5cf6', '#0ea5e9',
  '#ec4899', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16',
]

export default function ChallengeManagement() {
  const { data: challenges, loading, refetch } = useChallenges()
  const { showToast } = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Formular-State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [reward, setReward] = useState('')
  const [target, setTarget] = useState('')
  const [progress, setProgress] = useState('')
  const [deadline, setDeadline] = useState('')
  const [icon, setIcon] = useState(ICONS[0])
  const [color, setColor] = useState(COLORS[0])

  function resetForm() {
    setTitle('')
    setDescription('')
    setReward('')
    setTarget('')
    setProgress('')
    setDeadline('')
    setIcon(ICONS[0])
    setColor(COLORS[0])
  }

  function openAdd() {
    setEditingChallenge(null)
    resetForm()
    setModalOpen(true)
  }

  function openEdit(challenge) {
    setEditingChallenge(challenge)
    setTitle(challenge.title || '')
    setDescription(challenge.description || '')
    setReward(String(challenge.reward_points || ''))
    setTarget(String(challenge.target_value || ''))
    setProgress(String(challenge.current_progress || 0))
    setDeadline(challenge.deadline || '')
    setIcon(challenge.icon || ICONS[0])
    setColor(challenge.color || COLORS[0])
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingChallenge(null)
    resetForm()
  }

  // F-CV-01: Challenge erstellen / bearbeiten
  async function handleSave() {
    if (!title.trim()) {
      showToast('Bitte einen Titel eingeben.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        reward_points: Number(reward) || 0,
        target_value: Number(target) || 0,
        current_progress: Number(progress) || 0,
        deadline: deadline || null,
        icon,
        color,
      }

      if (editingChallenge) {
        const { error } = await supabase
          .from('challenges')
          .update(payload)
          .eq('id', editingChallenge.id)
        if (error) throw error
        showToast(`Challenge "${title}" aktualisiert.`)
      } else {
        const { error } = await supabase.from('challenges').insert(payload)
        if (error) throw error
        showToast(`Challenge "${title}" erstellt.`)
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

  // F-CV-04: Challenge löschen
  async function handleDelete(challenge) {
    setSaving(true)
    try {
      const { error } = await supabase.from('challenges').delete().eq('id', challenge.id)
      if (error) throw error
      showToast(`Challenge "${challenge.title}" gelöscht.`)
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
          <h2>Challenge-Verwaltung</h2>
          <p className="text-sm text-muted mt-8">
            Team-Challenges erstellen, bearbeiten und löschen.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Challenge erstellen
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <p>Lade Challenges...</p>
        </div>
      ) : challenges.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">🎯</div>
          <p>Noch keine Challenges vorhanden.</p>
        </div>
      ) : (
        <div className="grid-auto">
          {challenges.map(challenge => (
            <div key={challenge.id} className="card" style={{ position: 'relative' }}>
              <div className="flex items-center gap-12 mb-16">
                <span
                  style={{
                    fontSize: 28,
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)',
                    background: `${challenge.color || COLORS[0]}15`,
                  }}
                >
                  {challenge.icon || '🎯'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{challenge.title}</div>
                  {challenge.reward_points > 0 && (
                    <div style={{ fontSize: 13, color: challenge.color || 'var(--color-primary)' }}>
                      +{challenge.reward_points} Punkte
                    </div>
                  )}
                </div>
              </div>

              {challenge.description && (
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {challenge.description}
                </p>
              )}

              {challenge.target_value > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <ProgressBar
                    value={challenge.current_progress || 0}
                    max={challenge.target_value}
                    color={challenge.color || 'var(--color-primary)'}
                    showLabel
                  />
                  <div className="font-mono text-sm" style={{ marginTop: 4, color: 'var(--text-muted)' }}>
                    {challenge.current_progress || 0} / {challenge.target_value}
                  </div>
                </div>
              )}

              {challenge.deadline && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Deadline: {new Date(challenge.deadline).toLocaleDateString('de-CH')}
                </div>
              )}

              <div className="flex items-center gap-8" style={{ marginTop: 16 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => openEdit(challenge)}
                >
                  Bearbeiten
                </button>
                {deleteConfirm === challenge.id ? (
                  <div className="flex items-center gap-4">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(challenge)}
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
                    onClick={() => setDeleteConfirm(challenge.id)}
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

      {/* Modal: Challenge erstellen / bearbeiten */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingChallenge ? 'Challenge bearbeiten' : 'Neue Challenge'}
        width={520}
      >
        <Field label="Titel">
          <input
            className="form-input"
            type="text"
            placeholder="z.B. 100 Anrufe diese Woche"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
        </Field>

        <Field label="Beschreibung">
          <textarea
            className="form-textarea"
            placeholder="Was muss erreicht werden?"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </Field>

        <div className="form-row">
          <Field label="Belohnung (Punkte)">
            <input
              className="form-input"
              type="number"
              min="0"
              placeholder="z.B. 500"
              value={reward}
              onChange={e => setReward(e.target.value)}
            />
          </Field>

          <Field label="Deadline">
            <input
              className="form-input"
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </Field>
        </div>

        <div className="form-row">
          <Field label="Ziel">
            <input
              className="form-input"
              type="number"
              min="0"
              placeholder="z.B. 100"
              value={target}
              onChange={e => setTarget(e.target.value)}
            />
          </Field>

          <Field label="Aktueller Fortschritt">
            <input
              className="form-input"
              type="number"
              min="0"
              placeholder="0"
              value={progress}
              onChange={e => setProgress(e.target.value)}
            />
          </Field>
        </div>

        {/* F-CV-02: Icon-Auswahl */}
        <Field label="Icon">
          <div className="flex flex-wrap gap-8">
            {ICONS.map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                style={{
                  width: 44,
                  height: 44,
                  fontSize: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-sm)',
                  border: icon === emoji ? `2px solid ${color}` : '2px solid var(--border-color)',
                  background: icon === emoji ? `${color}15` : 'var(--bg-card)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </Field>

        {/* F-CV-03: Farbauswahl */}
        <Field label="Farbe">
          <div className="flex flex-wrap gap-8">
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: c,
                  border: color === c ? '3px solid var(--text-primary)' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  outline: color === c ? `2px solid ${c}` : 'none',
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>
        </Field>

        <div className="flex gap-12" style={{ marginTop: 20 }}>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Wird gespeichert...' : editingChallenge ? 'Aktualisieren' : 'Erstellen'}
          </button>
          <button className="btn btn-secondary" onClick={closeModal}>
            Abbrechen
          </button>
        </div>
      </Modal>
    </div>
  )
}
