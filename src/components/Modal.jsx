import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, width = 480 }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <div
        className="card animate-fade-in-up"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: width,
          maxHeight: '85vh',
          overflowY: 'auto',
          zIndex: 1,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <h3>{title}</h3>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            style={{ fontSize: 18 }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
