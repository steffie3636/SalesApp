import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginScreen from './components/LoginScreen'
import Leaderboard from './pages/Leaderboard'
import Achievements from './pages/Achievements'
import Profile from './pages/Profile'
import GoalsDashboard from './pages/GoalsDashboard'
import Challenges from './pages/Challenges'
import ChallengeEventDetail from './pages/ChallengeEventDetail'

import PlayerManagement from './pages/admin/PlayerManagement'
import ChallengeManagement from './pages/admin/ChallengeManagement'
import BadgeManagement from './pages/admin/BadgeManagement'
import GoalsManagement from './pages/admin/GoalsManagement'

// Navigation items
const NAV_ITEMS = [
  { path: '/', label: 'Rangliste', icon: '🏆' },
  { path: '/challenges', label: 'Challenges', icon: '🎯' },
  { path: '/achievements', label: 'Auszeichnungen', icon: '🏅' },
  { path: '/goals', label: 'Jahresziele', icon: '📊' },
  { path: '/profile', label: 'Mein Profil', icon: '👤' },
]

const ADMIN_NAV_ITEMS = [
  { path: '/admin/players', label: 'Spieler', icon: '👥' },
  { path: '/admin/challenges', label: 'Challenges', icon: '🎯' },
  { path: '/admin/badges', label: 'Badges', icon: '🏅' },
  { path: '/admin/goals', label: 'Ziele', icon: '📊' },
]

function Layout() {
  const { user, profile, isAdmin, logout } = useAuth()
  const location = useLocation()

  // Page title based on current route
  const allItems = [...NAV_ITEMS, ...ADMIN_NAV_ITEMS]
  const currentItem = allItems.find(item => location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)))
  const pageTitle = currentItem?.label || 'SalesArena'

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-logo">
          <h1>SalesArena</h1>
          <span>Gamification Platform</span>
        </div>

        <nav className="nav-section">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {isAdmin && (
          <nav className="nav-section">
            <div className="nav-section-title">Administration</div>
            {ADMIN_NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </aside>

      {/* Main Content */}
      <div className="app-main">
        <header className="app-header">
          <h4>{pageTitle}</h4>
          <div className="flex items-center gap-16">
            <span className="text-sm text-muted">
              {user?.email}
              {isAdmin && (
                <span style={{
                  marginLeft: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  background: 'rgba(99, 102, 241, 0.1)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                }}>
                  Admin
                </span>
              )}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={logout}>
              Abmelden
            </button>
          </div>
        </header>

        <main className="app-content">
          <Routes>
            <Route path="/" element={<Leaderboard />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/challenges/:id" element={<ChallengeEventDetail />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/goals" element={<GoalsDashboard />} />
            <Route path="/profile" element={<Profile />} />
            {isAdmin && (
              <>
                <Route path="/admin/players" element={<PlayerManagement />} />
                <Route path="/admin/challenges" element={<ChallengeManagement />} />
                <Route path="/admin/badges" element={<BadgeManagement />} />
                <Route path="/admin/goals" element={<GoalsManagement />} />
              </>
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-body)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: 28,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-violet))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            SalesArena
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 14 }}>Wird geladen...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
