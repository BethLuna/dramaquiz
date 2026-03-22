import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function Register() {
  const [form, setForm]     = useState({ username: '', email: '', password: '', drama_type_pref: 'ambos' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Crear cuenta</h1>
        <p style={styles.subtitle}>Únete a DramaQuiz</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input name="username" placeholder="tu_username" value={form.username}
              onChange={handleChange} style={styles.input} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Correo electrónico</label>
            <input name="email" type="email" placeholder="tu@correo.com" value={form.email}
              onChange={handleChange} style={styles.input} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Contraseña</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password}
              onChange={handleChange} style={styles.input} required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Preferencia</label>
            <select name="drama_type_pref" value={form.drama_type_pref}
              onChange={handleChange} style={styles.input}>
              <option value="ambos">K-dramas y C-dramas</option>
              <option value="kdrama">Solo K-dramas</option>
              <option value="cdrama">Solo C-dramas</option>
            </select>
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.btnPrimary} disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
          <Link to="/login" style={styles.btnSecondary}>
            Ya tengo cuenta
          </Link>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 24, background: '#fff7f9',
  },
  card: { width: '100%', maxWidth: 400 },
  title: { fontSize: 28, fontWeight: 800, color: '#e05070', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#777b7c', textAlign: 'center', marginBottom: 32 },
  form:  { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 700, color: '#5c6060', textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: 4 },
  input: { height: 52, padding: '0 20px', borderRadius: 12, border: 'none', background: '#e0e3e4', fontSize: 15, color: '#2f3334', outline: 'none' },
  error: { color: '#ac3149', fontSize: 13, textAlign: 'center' },
  btnPrimary: {
    height: 52, borderRadius: 14, border: 'none', cursor: 'pointer',
    background: 'linear-gradient(135deg, #8a4d5b, #ffb1c1)',
    color: '#fff', fontSize: 15, fontWeight: 700, marginTop: 8,
  },
  btnSecondary: {
    height: 52, borderRadius: 14, background: '#f3f4f4', color: '#8a4d5b',
    fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center',
    justifyContent: 'center', textDecoration: 'none',
  },
}