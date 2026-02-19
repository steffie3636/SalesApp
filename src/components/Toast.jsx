import { useEffect, useState } from 'react'

export default function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) return
    setVisible(true)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 300)
    }, 2600)
    return () => clearTimeout(timer)
  }, [message])

  if (!message) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 2000,
        padding: '14px 24px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--text-primary)',
        color: 'white',
        fontSize: 14,
        fontWeight: 500,
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.3s ease',
        pointerEvents: 'none',
      }}
    >
      <span style={{ fontSize: 18 }}>✓</span>
      {message}
    </div>
  )
}
