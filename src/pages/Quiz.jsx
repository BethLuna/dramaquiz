import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Quiz() {
  const [questions, setQuestions]   = useState([])
  const [current, setCurrent]       = useState(0)
  const [selected, setSelected]     = useState(null)
  const [results, setResults]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/questions/random?count=5')
      .then(({ data }) => {
        if (data.length === 0) setError('No hay preguntas disponibles. Pide al admin que genere algunas.')
        setQuestions(data)
      })
      .catch(() => setError('Error al cargar preguntas'))
      .finally(() => setLoading(false))
  }, [])

  const handleAnswer = async (answer, idx) => {
    if (selected !== null) return
    setSelected(idx)
    try {
      await api.post('/scores', {
        question_id: questions[current]._id,
        is_correct: answer.is_correct,
      })
    } catch (e) {}
    setResults([...results, { is_correct: answer.is_correct, points: answer.is_correct ? 100 : 0 }])
  }

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      navigate('/result', { state: { results } })
    } else {
      setCurrent(current + 1)
      setSelected(null)
    }
  }

  if (loading) return <div style={styles.center}>Cargando preguntas...</div>
  if (error)   return <div style={styles.center}><p style={{color:'#ac3149'}}>{error}</p></div>
  if (questions.length === 0) return null

  const q = questions[current]
  const progress = (current / questions.length) * 100

  return (
    <div style={styles.container}>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>
      <p style={styles.progressText}>Pregunta {current + 1} de {questions.length}</p>

      <div style={styles.tags}>
        <span style={styles.tagPink}>{q.drama_type === 'kdrama' ? 'K-drama' : 'C-drama'}</span>
        <span style={styles.tagBlue}>{q.category}</span>
        <span style={styles.tagGray}>{q.difficulty}</span>
      </div>

      <p style={styles.question}>{q.question_text}</p>

      <div style={styles.answers}>
        {q.answers.map((ans, idx) => {
          let bg = '#fff'
          let border = '1.5px solid #e0e3e4'
          let color = '#2f3334'
          if (selected !== null) {
            if (ans.is_correct) { bg = '#e1f5ee'; border = '1.5px solid #0f6e56'; color = '#0f6e56' }
            else if (idx === selected && !ans.is_correct) { bg = '#fcebeb'; border = '1.5px solid #a32d2d'; color = '#a32d2d' }
          }
          return (
            <button key={idx} style={{ ...styles.optionBtn, background: bg, border, color }}
              onClick={() => handleAnswer(ans, idx)}>
              {ans.answer_text}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <div style={{
          ...styles.feedback,
          background: results[results.length - 1]?.is_correct ? '#e1f5ee' : '#fcebeb',
          color: results[results.length - 1]?.is_correct ? '#0f6e56' : '#a32d2d',
        }}>
          {results[results.length - 1]?.is_correct ? '¡Correcto! +100 puntos' : 'Incorrecto. ¡La próxima!'}
        </div>
      )}

      {selected !== null && (
        <button style={styles.nextBtn} onClick={handleNext}>
          {current + 1 >= questions.length ? 'Ver resultado' : 'Siguiente pregunta →'}
        </button>
      )}
    </div>
  )
}

const styles = {
  container: { padding: '24px 20px', maxWidth: 480, margin: '0 auto', minHeight: '100vh' },
  center: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontSize: 16, color: '#5c6060', padding: 24, textAlign: 'center' },
  progressBar: { height: 6, background: '#e0e3e4', borderRadius: 3, marginBottom: 10, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #8a4d5b, #ffb1c1)', borderRadius: 3, transition: 'width 0.3s' },
  progressText: { fontSize: 12, color: '#777b7c', marginBottom: 16, textAlign: 'right' },
  tags: { display: 'flex', gap: 8, marginBottom: 20 },
  tagPink: { padding: '4px 12px', borderRadius: 20, background: '#fbeaf0', color: '#993556', fontSize: 12, fontWeight: 600 },
  tagBlue: { padding: '4px 12px', borderRadius: 20, background: '#e6f1fb', color: '#185fa5', fontSize: 12, fontWeight: 600 },
  tagGray: { padding: '4px 12px', borderRadius: 20, background: '#f1efea', color: '#5f5e5a', fontSize: 12, fontWeight: 600 },
  question: { fontSize: 18, fontWeight: 700, color: '#2f3334', marginBottom: 24, lineHeight: 1.5 },
  answers: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 },
  optionBtn: { padding: '14px 18px', borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' },
  feedback: { padding: '12px 16px', borderRadius: 10, fontSize: 14, fontWeight: 600, marginBottom: 16 },
  nextBtn: {
    width: '100%', height: 52, borderRadius: 14, border: 'none', cursor: 'pointer',
    background: 'linear-gradient(135deg, #8a4d5b, #ffb1c1)',
    color: '#fff', fontSize: 15, fontWeight: 700,
  },
}