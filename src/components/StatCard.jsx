import { useEffect, useState, useRef } from 'react'
import { formatNumber } from '../lib/format'

export default function StatCard({ label, value, prefix = '', suffix = '', icon, color = 'var(--color-primary)' }) {
  const [displayValue, setDisplayValue] = useState(0)
  const animRef = useRef(null)

  useEffect(() => {
    const target = Number(value) || 0
    const duration = 1000
    const startTime = performance.now()
    const startValue = displayValue

    if (animRef.current) cancelAnimationFrame(animRef.current)

    function animate(currentTime) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4)
      setDisplayValue(Math.round(startValue + (target - startValue) * eased))

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate)
      }
    }

    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [value])

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        fontSize: 80,
        opacity: 0.06,
        lineHeight: 1,
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 28,
        fontWeight: 700,
        color,
      }}>
        {prefix}{formatNumber(displayValue)}{suffix}
      </div>
    </div>
  )
}
