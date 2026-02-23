import { useEffect, useRef } from 'react'

const COLORS = [
  '#6366f1', '#8b5cf6', '#f97316', '#10b981',
  '#ec4899', '#f59e0b', '#0ea5e9', '#ef4444',
]

function createParticle(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: -10,
    size: Math.random() * 9 + 5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    speedX: (Math.random() - 0.5) * 5,
    speedY: Math.random() * 4 + 2,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 12,
    opacity: 1,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }
}

export default function Confetti({ active, onDone }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    particlesRef.current = []
    for (let i = 0; i < 180; i++) {
      particlesRef.current.push(createParticle(canvas))
    }
    startTimeRef.current = Date.now()

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const elapsed = Date.now() - startTimeRef.current

      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.speedX
        p.y += p.speedY
        p.rotation += p.rotationSpeed
        p.speedY += 0.12

        if (elapsed > 1800) {
          p.opacity = Math.max(0, p.opacity - 0.025)
        }

        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color

        if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6)
        }

        ctx.restore()
        return p.y < canvas.height + 60 && p.opacity > 0
      })

      if (particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        onDone?.()
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      particlesRef.current = []
    }
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        width: '100vw',
        height: '100vh',
      }}
    />
  )
}
