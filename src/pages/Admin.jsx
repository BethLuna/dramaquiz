import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ['Preguntas', 'Usuarios']

// ─── Helpers ──────────────────────────────────────────────────────────────────
const emptyQuestion = {
  drama_type: 'kdrama',
  drama_title: '',
  category: 'trama',
  question_text: '',
  difficulty: 'medio',
  answers: [
    { answer_text: '', is_correct: true },
    { answer_text: '', is_correct: false },
    { answer_text: '', is_correct: false },
    { answer_text: '', is_correct: false },
  ],
}

export default function Admin() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('Preguntas')

  // ── Questions state ──────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState([])
  const [qLoading, setQLoading] = useState(true)
  const [qForm, setQForm] = useState(emptyQuestion)
  const [editingQ, setEditingQ] = useState(null)   // null = create, id = edit
  const [showQForm, setShowQForm] = useState(false)
  const [qMsg, setQMsg] = useState('')

  // ── Generate state ───────────────────────────────────────────────────────────
  const [genForm, setGenForm] = useState({ drama_title: '', drama_type: 'kdrama', category: 'trama', difficulty: 'medio', count: 5 })
  const [genLoading, setGenLoading] = useState(false)
  const [genMsg, setGenMsg] = useState('')

  // ── Users state ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([])
  const [uLoading, setULoading] = useState(true)
  const [editingU, setEditingU] = useState(null)
  const [uForm, setUForm] = useState({ username: '', drama_type_pref: 'ambos' })
  const [uMsg, setUMsg] = useState('')

  const token = localStorage.getItem('token')
  useEffect(() => { if (!token) navigate('/login') }, [])

  // ── Load data ────────────────────────────────────────────────────────────────
  const loadQuestions = async () => {
    setQLoading(true)
    try { const { data } = await api.get('/questions'); setQuestions(data) }
    catch { setQMsg('Error al cargar preguntas') }
    finally { setQLoading(false) }
  }

  const loadUsers = async () => {
    setULoading(true)
    try { const { data } = await api.get('/users'); setUsers(data) }
    catch { setUMsg('Error al cargar usuarios') }
    finally { setULoading(false) }
  }

  useEffect(() => { loadQuestions() }, [])
  useEffect(() => { if (tab === 'Usuarios') loadUsers() }, [tab])

  // ── Question CRUD ────────────────────────────────────────────────────────────
  const openCreateQ = () => { setQForm(emptyQuestion); setEditingQ(null); setShowQForm(true); setQMsg('') }
  const openEditQ   = (q) => {
    setQForm({ drama_type: q.drama_type, drama_title: q.drama_title, category: q.category,
               question_text: q.question_text, difficulty: q.difficulty,
               answers: q.answers.map(a => ({ answer_text: a.answer_text, is_correct: a.is_correct })) })
    setEditingQ(q._id); setShowQForm(true); setQMsg('')
  }

  const saveQuestion = async () => {
    try {
      if (editingQ) {
        await api.put(`/questions/${editingQ}`, qForm)
        setQMsg('✅ Pregunta actualizada')
      } else {
        await api.post('/questions', qForm)
        setQMsg('✅ Pregunta creada')
      }
      setShowQForm(false); loadQuestions()
    } catch (e) { setQMsg('❌ ' + (e.response?.data?.message || 'Error')) }
  }

  const deleteQuestion = async (id) => {
    if (!confirm('¿Eliminar esta pregunta?')) return
    try { await api.delete(`/questions/${id}`); loadQuestions(); setQMsg('✅ Pregunta eliminada') }
    catch { setQMsg('❌ Error al eliminar') }
  }

  const setCorrect = (idx) => {
    setQForm(f => ({ ...f, answers: f.answers.map((a, i) => ({ ...a, is_correct: i === idx })) }))
  }

  const setAnswerText = (idx, text) => {
    setQForm(f => ({ ...f, answers: f.answers.map((a, i) => i === idx ? { ...a, answer_text: text } : a) }))
  }

  // ── Generate ─────────────────────────────────────────────────────────────────
  const generateQuestions = async () => {
    setGenLoading(true); setGenMsg('')
    try {
      const { data } = await api.post('/questions/generate', genForm)
      setGenMsg(`✅ ${data.message}`)
      loadQuestions()
    } catch (e) { setGenMsg('❌ ' + (e.response?.data?.error || 'Error al generar')) }
    finally { setGenLoading(false) }
  }

  // ── User CRUD ────────────────────────────────────────────────────────────────
  const openEditU = (u) => { setEditingU(u._id); setUForm({ username: u.username, drama_type_pref: u.drama_type_pref }); setUMsg('') }
  const cancelEditU = () => { setEditingU(null); setUMsg('') }

  const saveUser = async () => {
    try {
      await api.put(`/users/${editingU}`, uForm)
      setUMsg('✅ Usuario actualizado'); setEditingU(null); loadUsers()
    } catch (e) { setUMsg('❌ ' + (e.response?.data?.message || 'Error')) }
  }

  const deleteUser = async (id) => {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return
    try { await api.delete(`/users/${id}`); loadUsers(); setUMsg('✅ Usuario eliminado') }
    catch { setUMsg('❌ Error al eliminar') }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <p style={s.headerSub}>Panel de administración</p>
          <p style={s.headerTitle}>DramaQuiz Admin</p>
        </div>
        <button onClick={() => navigate('/')} style={s.backBtn}>← Volver</button>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── PREGUNTAS ── */}
      {tab === 'Preguntas' && (
        <div>
          {/* Generar con Gemini */}
          <div style={s.card}>
            <p style={s.cardTitle}>🤖 Generar con Gemini</p>
            <div style={s.row}>
              <input style={s.input} placeholder="Título del drama" value={genForm.drama_title}
                onChange={e => setGenForm(f => ({ ...f, drama_title: e.target.value }))} />
              <select style={s.select} value={genForm.drama_type}
                onChange={e => setGenForm(f => ({ ...f, drama_type: e.target.value }))}>
                <option value="kdrama">K-drama</option>
                <option value="cdrama">C-drama</option>
              </select>
            </div>
            <div style={s.row}>
              <select style={s.select} value={genForm.category}
                onChange={e => setGenForm(f => ({ ...f, category: e.target.value }))}>
                {['trama','actores','OST','historia','personajes','general'].map(c =>
                  <option key={c} value={c}>{c}</option>)}
              </select>
              <select style={s.select} value={genForm.difficulty}
                onChange={e => setGenForm(f => ({ ...f, difficulty: e.target.value }))}>
                <option value="facil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="dificil">Difícil</option>
              </select>
              <input style={{ ...s.input, width: 70 }} type="number" min={1} max={10}
                value={genForm.count} onChange={e => setGenForm(f => ({ ...f, count: +e.target.value }))} />
            </div>
            <button style={s.btnPrimary} onClick={generateQuestions} disabled={genLoading}>
              {genLoading ? 'Generando...' : 'Generar preguntas'}
            </button>
            {genMsg && <p style={s.msg}>{genMsg}</p>}
          </div>

          {/* Crear manualmente */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={s.sectionLabel}>Preguntas ({questions.length})</p>
            <button style={s.btnOutline} onClick={openCreateQ}>+ Nueva pregunta</button>
          </div>

          {qMsg && <p style={s.msg}>{qMsg}</p>}

          {/* Formulario crear/editar */}
          {showQForm && (
            <div style={s.card}>
              <p style={s.cardTitle}>{editingQ ? 'Editar pregunta' : 'Nueva pregunta'}</p>
              <div style={s.row}>
                <select style={s.select} value={qForm.drama_type}
                  onChange={e => setQForm(f => ({ ...f, drama_type: e.target.value }))}>
                  <option value="kdrama">K-drama</option>
                  <option value="cdrama">C-drama</option>
                </select>
                <input style={s.input} placeholder="Título del drama" value={qForm.drama_title}
                  onChange={e => setQForm(f => ({ ...f, drama_title: e.target.value }))} />
              </div>
              <div style={s.row}>
                <select style={s.select} value={qForm.category}
                  onChange={e => setQForm(f => ({ ...f, category: e.target.value }))}>
                  {['trama','actores','OST','historia','personajes','general'].map(c =>
                    <option key={c} value={c}>{c}</option>)}
                </select>
                <select style={s.select} value={qForm.difficulty}
                  onChange={e => setQForm(f => ({ ...f, difficulty: e.target.value }))}>
                  <option value="facil">Fácil</option>
                  <option value="medio">Medio</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>
              <textarea style={s.textarea} placeholder="Texto de la pregunta" value={qForm.question_text}
                onChange={e => setQForm(f => ({ ...f, question_text: e.target.value }))} />
              <p style={s.label}>Respuestas (marca la correcta)</p>
              {qForm.answers.map((ans, idx) => (
                <div key={idx} style={s.answerRow}>
                  <input type="radio" checked={ans.is_correct} onChange={() => setCorrect(idx)} style={{ marginRight: 8 }} />
                  <input style={{ ...s.input, flex: 1 }} placeholder={`Opción ${idx + 1}`}
                    value={ans.answer_text} onChange={e => setAnswerText(idx, e.target.value)} />
                </div>
              ))}
              <div style={s.row}>
                <button style={s.btnPrimary} onClick={saveQuestion}>
                  {editingQ ? 'Guardar cambios' : 'Crear pregunta'}
                </button>
                <button style={s.btnOutline} onClick={() => setShowQForm(false)}>Cancelar</button>
              </div>
            </div>
          )}

          {/* Lista de preguntas */}
          {qLoading ? <p style={s.msg}>Cargando...</p> : (
            questions.map(q => (
              <div key={q._id} style={s.itemCard}>
                <div style={s.itemHeader}>
                  <span style={q.drama_type === 'kdrama' ? s.tagPink : s.tagBlue}>{q.drama_type}</span>
                  <span style={s.tagGray}>{q.category}</span>
                  <span style={s.tagGray}>{q.difficulty}</span>
                </div>
                <p style={s.itemTitle}>{q.drama_title}</p>
                <p style={s.itemText}>{q.question_text}</p>
                <div style={s.itemAnswers}>
                  {q.answers.map((a, i) => (
                    <span key={i} style={a.is_correct ? s.answerCorrect : s.answerWrong}>
                      {a.is_correct ? '✓' : '✗'} {a.answer_text}
                    </span>
                  ))}
                </div>
                <div style={s.itemActions}>
                  <button style={s.btnSmallOutline} onClick={() => openEditQ(q)}>Editar</button>
                  <button style={s.btnSmallDanger} onClick={() => deleteQuestion(q._id)}>Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── USUARIOS ── */}
      {tab === 'Usuarios' && (
        <div>
          <p style={s.sectionLabel}>Usuarios ({users.length})</p>
          {uMsg && <p style={s.msg}>{uMsg}</p>}
          {uLoading ? <p style={s.msg}>Cargando...</p> : (
            users.map(u => (
              <div key={u._id} style={s.itemCard}>
                {editingU === u._id ? (
                  <div>
                    <p style={s.cardTitle}>Editar usuario</p>
                    <input style={s.input} placeholder="Username" value={uForm.username}
                      onChange={e => setUForm(f => ({ ...f, username: e.target.value }))} />
                    <select style={{ ...s.select, marginTop: 8 }} value={uForm.drama_type_pref}
                      onChange={e => setUForm(f => ({ ...f, drama_type_pref: e.target.value }))}>
                      <option value="ambos">Ambos</option>
                      <option value="kdrama">K-drama</option>
                      <option value="cdrama">C-drama</option>
                    </select>
                    <div style={{ ...s.row, marginTop: 12 }}>
                      <button style={s.btnPrimary} onClick={saveUser}>Guardar</button>
                      <button style={s.btnOutline} onClick={cancelEditU}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={s.itemHeader}>
                      <span style={s.tagBlue}>{u.drama_type_pref}</span>
                      <span style={s.tagGray}>{u.total_score} pts</span>
                    </div>
                    <p style={s.itemTitle}>{u.username}</p>
                    <p style={s.itemText}>{u.email}</p>
                    <p style={{ ...s.itemText, fontSize: 11 }}>
                      Registrado: {new Date(u.created_at).toLocaleDateString()}
                    </p>
                    <div style={s.itemActions}>
                      <button style={s.btnSmallOutline} onClick={() => openEditU(u)}>Editar</button>
                      <button style={s.btnSmallDanger} onClick={() => deleteUser(u._id)}>Eliminar</button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = {
  page:      { padding: '24px 20px 60px', maxWidth: 520, margin: '0 auto', minHeight: '100vh', background: '#fff7f9' },
  header:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  headerSub: { fontSize: 12, color: '#777b7c', marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: 800, color: '#e05070', fontStyle: 'italic' },
  backBtn:   { fontSize: 13, color: '#8a4d5b', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0' },
  tabs:      { display: 'flex', gap: 8, marginBottom: 20 },
  tab:       { flex: 1, padding: '10px 0', borderRadius: 10, border: '1.5px solid #e0e3e4', background: '#fff', fontSize: 14, fontWeight: 600, color: '#777b7c', cursor: 'pointer' },
  tabActive: { background: 'linear-gradient(135deg,#8a4d5b,#ffb1c1)', color: '#fff', border: 'none' },
  card:      { background: '#fff', borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: 14, fontWeight: 700, color: '#2f3334', marginBottom: 12 },
  sectionLabel: { fontSize: 13, fontWeight: 700, color: '#5c6060', textTransform: 'uppercase', letterSpacing: '0.05em' },
  row:       { display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  input:     { flex: 1, height: 40, padding: '0 12px', borderRadius: 8, border: 'none', background: '#f1f3f4', fontSize: 13, color: '#2f3334', minWidth: 0 },
  select:    { height: 40, padding: '0 10px', borderRadius: 8, border: 'none', background: '#f1f3f4', fontSize: 13, color: '#2f3334' },
  textarea:  { width: '100%', minHeight: 72, padding: '10px 12px', borderRadius: 8, border: 'none', background: '#f1f3f4', fontSize: 13, color: '#2f3334', resize: 'vertical', marginBottom: 8, boxSizing: 'border-box' },
  label:     { fontSize: 12, fontWeight: 600, color: '#5c6060', marginBottom: 6 },
  answerRow: { display: 'flex', alignItems: 'center', marginBottom: 6 },
  btnPrimary:  { height: 40, padding: '0 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#8a4d5b,#ffb1c1)', color: '#fff', fontSize: 13, fontWeight: 700 },
  btnOutline:  { height: 40, padding: '0 16px', borderRadius: 10, border: '1.5px solid #e0e3e4', background: '#fff', color: '#5c6060', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  msg:         { fontSize: 13, color: '#5c6060', margin: '8px 0' },
  itemCard:    { background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  itemHeader:  { display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  itemTitle:   { fontSize: 14, fontWeight: 700, color: '#2f3334', marginBottom: 4 },
  itemText:    { fontSize: 13, color: '#5c6060', marginBottom: 6 },
  itemAnswers: { display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 },
  itemActions: { display: 'flex', gap: 8 },
  tagPink:     { padding: '3px 10px', borderRadius: 20, background: '#fbeaf0', color: '#993556', fontSize: 11, fontWeight: 600 },
  tagBlue:     { padding: '3px 10px', borderRadius: 20, background: '#e6f1fb', color: '#185fa5', fontSize: 11, fontWeight: 600 },
  tagGray:     { padding: '3px 10px', borderRadius: 20, background: '#f1efea', color: '#5f5e5a', fontSize: 11, fontWeight: 600 },
  answerCorrect: { fontSize: 12, color: '#0f6e56', background: '#e1f5ee', padding: '3px 8px', borderRadius: 6 },
  answerWrong:   { fontSize: 12, color: '#5c6060', background: '#f1f3f4', padding: '3px 8px', borderRadius: 6 },
  btnSmallOutline: { height: 32, padding: '0 14px', borderRadius: 8, border: '1.5px solid #e0e3e4', background: '#fff', color: '#5c6060', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  btnSmallDanger:  { height: 32, padding: '0 14px', borderRadius: 8, border: 'none', background: '#fcebeb', color: '#a32d2d', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
}
