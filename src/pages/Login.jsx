import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.decor1} />
      <div style={styles.decor2} />
      <div style={styles.card}>
        <div style={styles.logoBox}>🎬</div>
        <h1 style={styles.title}>DramaQuiz</h1>
        <p style={styles.subtitle}>K-dramas · C-dramas</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Correo electrónico</label>
            <input name="email" type="email" placeholder="tu@correo.com"
              value={form.email} onChange={handleChange} style={styles.input} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input name="password" type="password" placeholder="••••••••"
              value={form.password} onChange={handleChange} style={styles.input} required />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.btnPrimary} disabled={loading}>
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
          <Link to="/register" style={styles.btnSecondary}>
            Crear cuenta nueva
          </Link>
          <p style={styles.forgotText}>¿Olvidaste tu contraseña?</p>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '24px', position: 'relative',
    overflow: 'hidden', background: '#fff7f9',
  },
  decor1: {
    position: 'absolute', top: '-80px', right: '-80px',
    width: '300px', height: '300px', borderRadius: '50%',
    background: 'rgba(255,177,193,0.2)', filter: 'blur(60px)',
  },
  decor2: {
    position: 'absolute', bottom: '-80px', left: '-80px',
    width: '300px', height: '300px', borderRadius: '50%',
    background: 'rgba(214,190,255,0.2)', filter: 'blur(60px)',
  },
  card: {
    width: '100%', maxWidth: '400px', zIndex: 10,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  logoBox: {
    fontSize: '40px', background: 'rgba(255,255,255,0.6)',
    padding: '16px 20px', borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)', marginBottom: '16px',
  },
  title: {
    fontSize: '32px', fontWeight: 800, color: '#e05070',
    fontStyle: 'italic', letterSpacing: '-1px', marginBottom: '4px',
  },
  subtitle: {
    fontSize: '11px', fontWeight: 700, color: '#777b7c',
    letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '40px',
  },
  form: { width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: {
    fontSize: '11px', fontWeight: 700, color: '#5c6060',
    textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '4px',
  },
  input: {
    height: '52px', padding: '0 20px', borderRadius: '12px',
    border: 'none', background: '#e0e3e4', fontSize: '15px',
    color: '#2f3334', outline: 'none',
  },
  error: { color: '#ac3149', fontSize: '13px', textAlign: 'center' },
  btnPrimary: {
    height: '52px', borderRadius: '14px', border: 'none', cursor: 'pointer',
    background: 'linear-gradient(135deg, #8a4d5b, #ffb1c1)',
    color: '#fff', fontSize: '15px', fontWeight: 700,
    boxShadow: '0 4px 16px rgba(138,77,91,0.3)', marginTop: '8px',
  },
  btnSecondary: {
    height: '52px', borderRadius: '14px', border: 'none', cursor: 'pointer',
    background: '#f3f4f4', color: '#8a4d5b', fontSize: '15px', fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none',
  },
  forgotText: {
    textAlign: 'center', fontSize: '12px',
    color: '#777b7c', cursor: 'pointer', marginTop: '8px',
  },
}