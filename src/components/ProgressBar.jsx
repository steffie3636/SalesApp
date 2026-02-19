import { useEffect, useState } from 'react'

export default function ProgressBar({ value = 0, max = 100, color = 'var(--color-primary)', height = 8, showLabel = false }) {
  const [width, setWidth] = useState(0)
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percent), 50)
    return () => clearTimeout(timer)
  }, [percent])

  return (
    <div>
      <div
        style={{
          width: '100%',
          height,
          borderRadius: height / 2,
          background: 'var(--bg-input)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${width}%`,
            height: '100%',
            borderRadius: height / 2,
            background: color,
            transition: 'width 0.8s ease',
          }}
        />
      </div>
      {showLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 4,
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
        }}>
          <span>{Math.round(percent)}%</span>
        </div>
      )}
    </div>
  )
}
