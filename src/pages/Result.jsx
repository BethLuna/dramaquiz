import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import api from '../api'

const getLevel = (correct, total) => {
  const pct = correct / total
  if (pct === 1)   return 'Drama Master 🏆'
  if (pct >= 0.8)  return 'Drama Expert ⭐'
  if (pct >= 0.6)  return 'Drama Fan 🎬'
  return 'Drama Rookie 🌱'
}

export default function Result() {
  const { state }  = useLocation()
  const navigate   = useNavigate()
  const results    = state?.results || []
  const correct    = results.filter((r) => r.is_correct).length
  const total      = results.length
  const points     = results.reduce((sum, r) => sum + r.points, 0)
  const accuracy   = total > 0 ? Math.round((correct / total) * 100) : 0

  useEffect(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!user.id) return

  api.get(`/users/${user.id}`)
    .then(({ data }) => {
      localStorage.setItem('user', JSON.stringify({
        ...user,
        total_score: data.total_score
      }))
    })
    .catch(() => {})
  }, [])

  return (
    <div style={styles.container}>
      <p style={styles.tag}>QUIZ COMPLETADO</p>
      <h1 style={styles.title}>Resultado final</h1>

      <p style={styles.bigScore}>
        <span style={styles.correct}>{correct}</span>
        <span style={styles.slash}> / </span>
        <span style={styles.total}>{total}</span>
      </p>
      <p style={styles.points}>+{points} puntos ganados</p>

      <div style={styles.badge}>{getLevel(correct, total)}</div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <p style={styles.checkGreen}>✓</p>
          <p style={{ ...styles.statNum, color: '#0f6e56' }}>{correct}</p>
          <p style={styles.statLabel}>CORRECTAS</p>
        </div>
        <div style={styles.statCard}>
          <p style={styles.checkRed}>✗</p>
          <p style={{ ...styles.statNum, color: '#a32d2d' }}>{total - correct}</p>
          <p style={styles.statLabel}>INCORRECTAS</p>
        </div>
      </div>

      <div style={styles.accuracyCard}>
        <p style={styles.accuracyNum}>{accuracy}%</p>
        <p style={styles.statLabel}>PRECISIÓN</p>
      </div>

      <button style={styles.btnPrimary} onClick={() => navigate('/quiz')}>
        ↺ Jugar de nuevo
      </button>
      <button style={styles.btnSecondary} onClick={() => navigate('/leaderboard')}>
        Ver ranking
      </button>
      <button style={styles.btnText} onClick={() => navigate('/')}>
        Volver al inicio
      </button>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh', padding: '40px 24px 40px',
    maxWidth: 480, margin: '0 auto',
    background: '#fff7f9', display: 'flex',
    flexDirection: 'column', alignItems: 'center',
  },
  tag: { fontSize: 11, fontWeight: 700, color: '#8a4d5b', letterSpacing: '0.15em', background: '#fbeaf0', padding: '4px 14px', borderRadius: 20, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 800, color: '#2f3334', marginBottom: 24 },
  bigScore: { fontSize: 72, fontWeight: 800, lineHeight: 1, marginBottom: 8 },
  correct: { color: '#8a4d5b' },
  slash:   { color: '#e0e3e4' },
  total:   { color: '#e0e3e4' },
  points:  { fontSize: 16, color: '#8a4d5b', fontWeight: 600, marginBottom: 20 },
  badge:   { padding: '8px 20px', borderRadius: 20, background: '#eeedfe', color: '#3c3489', fontSize: 14, fontWeight: 700, marginBottom: 28 },
  statsRow: { display: 'flex', gap: 12, width: '100%', marginBottom: 12 },
  statCard: { flex: 1, background: '#f3f4f4', borderRadius: 16, padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  accuracyCard: { width: '100%', background: '#f3f4f4', borderRadius: 16, padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 32 },
  checkGreen: { fontSize: 20, color: '#0f6e56' },
  checkRed:   { fontSize: 20, color: '#a32d2d' },
  statNum:    { fontSize: 28, fontWeight: 800 },
  accuracyNum: { fontSize: 28, fontWeight: 800, color: '#2f3334' },
  statLabel:  { fontSize: 11, fontWeight: 700, color: '#777b7c', letterSpacing: '0.1em' },
  btnPrimary: {
    width: '100%', height: 56, borderRadius: 28, border: 'none', cursor: 'pointer',
    background: 'linear-gradient(135deg, #8a4d5b, #ffb1c1)',
    color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 10,
  },
  btnSecondary: {
    width: '100%', height: 52, borderRadius: 28, border: 'none', cursor: 'pointer',
    background: '#f3f4f4', color: '#8a4d5b', fontSize: 15, fontWeight: 700, marginBottom: 10,
  },
  btnText: { background: 'none', border: 'none', cursor: 'pointer', color: '#777b7c', fontSize: 13, marginTop: 4 },
}