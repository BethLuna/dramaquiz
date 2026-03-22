import { useNavigate, useLocation } from 'react-router-dom'

const items = [
  { label: 'Inicio',  path: '/',            icon: '🏠' },
  { label: 'Quiz',    path: '/quiz',         icon: '❓' },
  { label: 'Ranking', path: '/leaderboard',  icon: '🏆' },
  { label: 'Perfil',  path: '/perfil',       icon: '👤' },
]

export default function Navbar() {
  const navigate      = useNavigate()
  const { pathname }  = useLocation()

  return (
    <nav style={styles.nav}>
      {items.map((item) => {
        const active = pathname === item.path
        return (
          <button key={item.path} onClick={() => navigate(item.path)} style={{
            ...styles.item,
            color: active ? '#8a4d5b' : '#777b7c',
          }}>
            <span style={styles.icon}>{item.icon}</span>
            <span style={{ ...styles.label, fontWeight: active ? 700 : 400 }}>
              {item.label}
            </span>
            {active && <div style={styles.dot} />}
          </button>
        )
      })}
    </nav>
  )
}

const styles = {
  nav: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: '#fff', borderTop: '1px solid #f0f0f0',
    display: 'flex', justifyContent: 'space-around',
    padding: '10px 0 16px', zIndex: 100,
  },
  item: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 3, background: 'none', border: 'none', cursor: 'pointer',
    position: 'relative', padding: '0 12px',
  },
  icon:  { fontSize: 20 },
  label: { fontSize: 11 },
  dot: {
    position: 'absolute', bottom: -6,
    width: 4, height: 4, borderRadius: '50%',
    background: '#8a4d5b',
  },
}