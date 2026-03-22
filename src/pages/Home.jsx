import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const categories = [
  'K-drama romance', 'C-drama histórico',
  'Actores y actrices', 'OST y música', 'Tramas',
]

export default function Home() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : 'DQ'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <p style={styles.greeting}>¡Hola, {user.username || 'usuario'}!</p>
          <p style={styles.subGreeting}>¿Listo para el quiz?</p>
        </div>
        <div style={styles.avatarRow}>
          <div style={styles.avatar}>{initials}</div>
          <button onClick={handleLogout} style={styles.logoutBtn}>Salir</button>
        </div>
      </div>

      <div style={styles.scoreCard}>
        <p style={styles.scoreLabel}>Tu puntaje total</p>
        <p style={styles.scoreNum}>{user.total_score ?? 0} pts</p>
        <p style={styles.scoreSub}>Sigue jugando para subir en el ranking</p>
      </div>

      <p style={styles.sectionTitle}>Categorías</p>
      <div style={styles.chips}>
        {categories.map((cat) => (
          <span key={cat} style={
            cat.startsWith('K') || cat === 'Actores y actrices' || cat === 'Tramas'
              ? styles.chipPink
              : styles.chipBlue
          }>{cat}</span>
        ))}
      </div>

      <button style={styles.startBtn} onClick={() => navigate('/quiz')}>
        Empezar quiz aleatorio
      </button>

      <Navbar />
    </div>
  )
}

const styles = {
  container: { padding: '24px 20px 100px', maxWidth: 480, margin: '0 auto', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 14, color: '#5c6060' },
  subGreeting: { fontSize: 20, fontWeight: 700, color: '#2f3334' },
  avatarRow: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: {
    width: 42, height: 42, borderRadius: '50%',
    background: '#e6f1fb', color: '#185fa5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 14,
  },
  logoutBtn: { fontSize: 12, color: '#777b7c', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' },
  scoreCard: {
    background: 'linear-gradient(135deg, #fff0f3, #f0eaff)',
    borderRadius: 16, padding: '20px 24px', marginBottom: 24,
  },
  scoreLabel: { fontSize: 13, color: '#5c6060', marginBottom: 4 },
  scoreNum:   { fontSize: 32, fontWeight: 700, color: '#2f3334', marginBottom: 4 },
  scoreSub:   { fontSize: 12, color: '#777b7c' },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: '#5c6060', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  chipPink: { padding: '6px 14px', borderRadius: 20, background: '#fbeaf0', color: '#993556', fontSize: 13, fontWeight: 500 },
  chipBlue: { padding: '6px 14px', borderRadius: 20, background: '#e6f1fb', color: '#185fa5', fontSize: 13, fontWeight: 500 },
  startBtn: {
    width: '100%', height: 56, borderRadius: 14, border: 'none', cursor: 'pointer',
    background: 'linear-gradient(135deg, #8a4d5b, #ffb1c1)',
    color: '#fff', fontSize: 16, fontWeight: 700,
    boxShadow: '0 4px 16px rgba(138,77,91,0.3)',
  },
}