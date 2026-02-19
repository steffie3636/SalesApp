import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen() {
  const { login, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (resetMode) {
        await resetPassword(email)
        setResetSent(true)
      } else {
        await login(email, password)
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-body)',
      padding: 24,
    }}>
      <div className="card animate-fade-in-up" style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-violet))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            SalesArena
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            {resetMode ? 'Passwort zurücksetzen' : 'Anmelden'}
          </p>
        </div>

        {resetSent ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>📧</span>
            <p>Eine E-Mail zum Zurücksetzen wurde gesendet.</p>
            <button
              className="btn btn-secondary mt-16"
              onClick={() => { setResetMode(false); setResetSent(false) }}
            >
              Zurück zum Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">E-Mail</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@firma.ch"
                required
              />
            </div>

            {!resetMode && (
              <div className="form-group">
                <label className="form-label">Passwort</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--color-red)',
                fontSize: 13,
                marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ marginBottom: 12 }}
            >
              {loading ? '...' : resetMode ? 'Link senden' : 'Anmelden'}
            </button>

            <button
              type="button"
              className="btn btn-ghost w-full"
              onClick={() => { setResetMode(!resetMode); setError('') }}
            >
              {resetMode ? 'Zurück zum Login' : 'Passwort vergessen?'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
