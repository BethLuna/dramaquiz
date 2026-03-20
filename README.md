
# DramaQuiz — Trivia de K-dramas y C-dramas

Aplicación web de preguntas y respuestas sobre series asiáticas (K-dramas coreanos y C-dramas chinos). Usa **Google Gemini API** para generar preguntas inteligentes, **MongoDB** como base de datos de documentos, y un **API REST** con Node.js + Express para gestionar todo el CRUD.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Generación de preguntas | Google Gemini API (gemini-1.5-flash) |
| Backend / API | Node.js + Express |
| ODM | Mongoose |
| Base de datos | MongoDB / MongoDB Atlas |
| Autenticación | JWT + bcrypt |
| Frontend | React + Vite |

---

## Estructura del repositorio

```
dramaquiz/
├── README.md
├── propuesta/
│   └── README.md           ← pantallas, modelo MongoDB, propuesta de API
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── questions.js    ← CRUD + generación con Gemini
│   │   │   ├── users.js
│   │   │   └── scores.js
│   │   ├── models/
│   │   │   ├── Question.js     ← Mongoose schema (answers embebidos)
│   │   │   ├── User.js
│   │   │   └── Score.js
│   │   ├── services/
│   │   │   └── gemini.js       ← llamada a Gemini API
│   │   └── middleware/
│   │       └── auth.js         ← verificación JWT
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Home.jsx
    │   │   ├── Quiz.jsx
    │   │   ├── Result.jsx
    │   │   └── Leaderboard.jsx
    │   └── App.jsx
    └── package.json
```

---

## Endpoints del API

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Crear cuenta |
| POST | `/api/auth/login` | Iniciar sesión → devuelve JWT |

### Usuarios
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/users` | Listar usuarios | Admin |
| GET | `/api/users/:id` | Ver perfil | |
| PUT | `/api/users/:id` | Editar usuario | Propio |
| DELETE | `/api/users/:id` | Eliminar usuario | Admin |

### Preguntas
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/questions` | Listar preguntas | |
| GET | `/api/questions/:id` | Ver una pregunta | |
| POST | `/api/questions/generate` | Generar con Gemini | Admin |
| POST | `/api/questions` | Crear manualmente | Admin |
| PUT | `/api/questions/:id` | Editar pregunta | Admin |
| DELETE | `/api/questions/:id` | Eliminar pregunta | Admin |

### Puntajes
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/scores` | Ver puntajes propios | Sí |
| GET | `/api/scores/leaderboard` | Ranking global | |
| POST | `/api/scores` | Registrar respuesta | Sí |

---

## Modelos MongoDB (Mongoose)

### Question (answers embebidos)
```js
const QuestionSchema = new Schema({
  drama_type:    { type: String, enum: ['kdrama', 'cdrama'], required: true },
  drama_title:   { type: String, required: true },
  category:      { type: String, required: true },
  question_text: { type: String, required: true },
  difficulty:    { type: String, enum: ['facil', 'medio', 'dificil'] },
  answers: [{
    answer_text: String,
    is_correct:  Boolean,
  }],
  created_at: { type: Date, default: Date.now },
});
```

### User
```js
const UserSchema = new Schema({
  username:        { type: String, required: true, unique: true },
  email:           { type: String, required: true, unique: true },
  password_hash:   { type: String, required: true },
  total_score:     { type: Number, default: 0 },
  drama_type_pref: { type: String, enum: ['kdrama', 'cdrama', 'ambos'], default: 'ambos' },
  created_at:      { type: Date, default: Date.now },
});
```

### Score
```js
const ScoreSchema = new Schema({
  user_id:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  question_id:   { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  is_correct:    { type: Boolean, required: true },
  points_earned: { type: Number, default: 0 },
  answered_at:   { type: Date, default: Date.now },
});
```

---

## Configuración rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/dramaquiz.git
cd dramaquiz/backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Iniciar el servidor
npm run dev
```

---

## Variables de entorno

```env
GEMINI_API_KEY=tu_clave_de_gemini_api
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/dramaquiz
JWT_SECRET=tu_secreto_jwt_super_seguro
PORT=3000
```

---

## Generación de preguntas con Gemini

El endpoint `POST /api/questions/generate` llama a Gemini con un prompt estructurado y guarda el resultado directamente en MongoDB.

**Ejemplo de request:**
```json
{
  "drama_title": "Ashes of Love",
  "drama_type": "cdrama",
  "category": "trama",
  "difficulty": "medio",
  "count": 5
}
```

**Prompt enviado a Gemini:**
> "Genera 5 preguntas de trivia en español sobre el cdrama 'Ashes of Love'. Devuelve SOLO un JSON con este formato exacto, sin explicaciones adicionales: [{ question_text, difficulty, answers: [{ answer_text, is_correct }] }]. Incluye 4 opciones por pregunta, solo una correcta."

Gemini responde con JSON que se valida y almacena automáticamente en la colección `questions` de MongoDB.
