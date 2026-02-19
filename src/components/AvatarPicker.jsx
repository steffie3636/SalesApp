import { PREDEFINED_AVATARS } from '../lib/avatars'
import Modal from './Modal'

export default function AvatarPicker({ isOpen, onClose, onSelect, currentAvatar }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Avatar wählen">
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        padding: '8px 0',
      }}>
        {PREDEFINED_AVATARS.map(avatar => (
          <button
            key={avatar.id}
            onClick={() => { onSelect(avatar.id); onClose(); }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: 12,
              borderRadius: 'var(--radius-md)',
              border: currentAvatar === avatar.id
                ? '2px solid var(--color-primary)'
                : '2px solid var(--border-color-light)',
              background: currentAvatar === avatar.id
                ? 'rgba(99, 102, 241, 0.05)'
                : 'var(--bg-card)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <span style={{ fontSize: 32 }}>{avatar.emoji}</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{avatar.label}</span>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        <button
          className="btn btn-secondary w-full"
          onClick={() => { onSelect(null); onClose(); }}
        >
          Initialen verwenden
        </button>
      </div>
    </Modal>
  )
}
