import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import Navbar from '../components/Navbar'

const medals = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    api.get('/scores/leaderboard')
      .then(({ data }) => setPlayers(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const initials = (name) => (name ? name.slice(0, 2).toUpperCase() : '??')

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🏆 Ranking global</h1>
      <p style={styles.subtitle}>Los mejores fans de la temporada</p>

      {loading ? (
        <p style={styles.loading}>Cargando ranking...</p>
      ) : players.length === 0 ? (
        <p style={styles.loading}>Aún no hay jugadores en el ranking.</p>
      ) : (
        <div style={styles.list}>
          {players.map((player, idx) => {
            const isMe = player._id === user.id
            return (
              <div key={player._id} style={{
                ...styles.row,
                background: isMe ? '#fbeaf0' : idx === 0 ? 'linear-gradient(135deg, #c97b8a, #e8a0b0)' : '#f3f4f4',
                color: idx === 0 ? '#fff' : '#2f3334',
              }}>
                <span style={{ ...styles.rank, color: idx === 0 ? '#fff' : '#777b7c' }}>
                  {idx < 3 ? medals[idx] : `0${idx + 1}`}
                </span>
                <div style={{
                  ...styles.avatar,
                  background: idx === 0 ? 'rgba(255,255,255,0.3)' : isMe ? '#ffb1c1' : '#e0e3e4',
                  color: idx === 0 ? '#fff' : '#8a4d5b',
                }}>
                  {initials(player.username)}
                </div>
                <div style={styles.info}>
                  <p style={{ ...styles.name, color: idx === 0 ? '#fff' : '#2f3334' }}>
                    {player.username} {isMe && '(Tú)'}
                  </p>
                  {isMe && <span style={styles.nearBadge}>CERCA DEL PODIO</span>}
                </div>
                <span style={{ ...styles.score, color: idx === 0 ? '#fff' : '#8a4d5b' }}>
                  {player.total_score.toLocaleString()}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div style={styles.challengeBox}>
        <p style={styles.challengeText}>¿Quieres subir de puesto?</p>
        <button style={styles.challengeBtn} onClick={() => navigate('/quiz')}>
          Jugar ahora
        </button>
      </div>

      <Navbar />
    </div>
  )
}

const styles = {
  container: { padding: '24px 20px 100px', maxWidth: 480, margin: '0 auto', minHeight: '100vh' },
  title:    { fontSize: 26, fontWeight: 800, color: '#2f3334', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#777b7c', marginBottom: 24 },
  loading:  { color: '#777b7c', fontSize: 14, textAlign: 'center', marginTop: 40 },
  list:     { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, width: '100%' },
  row: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 16px', borderRadius: 16,
  },
  rank:   { fontSize: 15, fontWeight: 700, minWidth: 30, textAlign: 'center' },
  avatar: {
    width: 40, height: 40, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, flexShrink: 0,
  },
  info:      { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  name:      { fontSize: 14, fontWeight: 600 },
  nearBadge: { fontSize: 10, fontWeight: 700, color: '#8a4d5b', background: '#ffb1c1', padding: '2px 8px', borderRadius: 10, alignSelf: 'flex-start' },
  score:     { fontSize: 15, fontWeight: 700 },
  challengeBox: {
    width: '100%', border: '1.5px dashed #e0e3e4', borderRadius: 16,
    padding: '20px', textAlign: 'center', marginTop: 8,
  },
  challengeText: { fontSize: 15, fontWeight: 700, color: '#2f3334', marginBottom: 12 },
  challengeBtn: {
    padding: '12px 32px', borderRadius: 28, border: 'none', cursor: 'pointer',
    background: 'linear-gradient(135deg, #8a4d5b, #ffb1c1)',
    color: '#fff', fontSize: 15, fontWeight: 700,
  },
}