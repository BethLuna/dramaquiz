# Propuesta — DramaQuiz

Esta carpeta contiene la documentación inicial del proyecto: modelo de base de datos en MongoDB, propuesta de API y descripción de pantallas.

---

## Modelo de base de datos — MongoDB

Se eligió **MongoDB** (no relacional) porque el contenido de la app es flexible: un drama puede tener categorías distintas, diferentes cantidades de respuestas, y en el futuro podríamos agregar campos nuevos sin migraciones. Se usan **3 colecciones**.

### Decisión de diseño: embeber vs. referenciar

| Relación | Decisión | Razón |
|---|---|---|
| Question → Answers | **Embebido** (array dentro del documento) | Las respuestas siempre se leen junto con la pregunta. Nunca se consultan por separado. Máximo 4 opciones por pregunta (1:pocos). |
| Score → User | **Referencia** (ObjectId) | Un usuario puede tener cientos de scores. Se consultan por separado para el leaderboard. |
| Score → Question | **Referencia** (ObjectId) | Misma razón: crecimiento ilimitado de registros. |

### Colección: `questions`
Banco de preguntas generadas por Gemini o creadas manualmente.

```json
{
  "_id": "ObjectId('...')",
  "drama_type": "kdrama",
  "drama_title": "Crash Landing on You",
  "category": "trama",
  "question_text": "¿En qué país aterriza accidentalmente Yoon Se-ri?",
  "difficulty": "facil",
  "answers": [
    { "answer_text": "China", "is_correct": false },
    { "answer_text": "Corea del Norte", "is_correct": true },
    { "answer_text": "Japón", "is_correct": false },
    { "answer_text": "Rusia", "is_correct": false }
  ],
  "created_at": "2025-03-01T10:00:00Z"
}
```

### Colección: `users`
Datos de jugadores registrados.

```json
{
  "_id": "ObjectId('...')",
  "username": "sojin_kdramas",
  "email": "sojin@email.com",
  "password_hash": "$2b$10$...",
  "total_score": 12450,
  "drama_type_pref": "ambos",
  "created_at": "2025-01-15T08:30:00Z"
}
```

### Colección: `scores`
Historial de cada respuesta dada por un usuario.

```json
{
  "_id": "ObjectId('...')",
  "user_id": "ObjectId('...ref a users')",
  "question_id": "ObjectId('...ref a questions')",
  "is_correct": true,
  "points_earned": 100,
  "answered_at": "2025-03-19T14:22:00Z"
}
```

**Índices recomendados en `scores`:**
- `user_id` — para consultar el historial de un usuario
- `{ user_id: 1, answered_at: -1 }` — para estadísticas recientes

---

## Propuesta de API REST

Arquitectura REST con autenticación JWT. Todos los endpoints protegidos requieren el header `Authorization: Bearer <token>`.

### Módulos

**1. Auth (`/api/auth`)**
Registro e inicio de sesión. El login devuelve un JWT firmado con el `_id` y `username` del usuario, con expiración de 24 horas.

**2. Users (`/api/users`)**
CRUD completo. Contraseñas siempre hasheadas con bcrypt antes de guardar. El campo `password_hash` nunca se devuelve en las respuestas.

**3. Questions (`/api/questions`)**
CRUD de preguntas. El endpoint especial `POST /generate` llama a **Gemini API** con un prompt estructurado, recibe el JSON con preguntas y answers, y los guarda en MongoDB con las respuestas embebidas.

**4. Scores (`/api/scores`)**
Registra respuestas de usuarios y acumula puntos. El endpoint `GET /leaderboard` hace un `aggregate` en MongoDB agrupando por `user_id` y sumando `points_earned` para obtener el ranking global.

---

## Pantallas de la aplicación

La app tiene diseño mobile-first con 5 pantallas:

### 1. Login
Campos de correo y contraseña, botón de ingreso y acceso a registro. Al autenticarse correctamente se guarda el JWT en `localStorage` para las siguientes peticiones.

### 2. Inicio (Home)
Saludo personalizado al usuario, puntaje total acumulado y posición en el ranking. Muestra chips de categorías disponibles: K-drama romance, C-drama histórico, actores y actrices, OST y música, tramas. Botón para iniciar quiz aleatorio.

### 3. Quiz
Barra de progreso en la parte superior (ej. "Pregunta 3 de 5"). Muestra el tipo de drama, categoría y dificultad. Cuatro opciones de respuesta; al seleccionar una, se resalta en verde (correcta) o rojo (incorrecta) y aparece una explicación breve. Botón para continuar a la siguiente pregunta.

### 4. Resultado
Puntaje final de la sesión (ej. 4/5), puntos ganados, porcentaje de precisión y nivel del jugador ("Drama Rookie", "Drama Expert", etc.). Opciones para jugar de nuevo o ir al ranking.

### 5. Ranking (Leaderboard)
Lista de los mejores jugadores ordenados por `total_score`. Resalta la fila del usuario actual. Navegación inferior con cuatro secciones: Inicio, Quiz, Ranking, Perfil.

---

## Flujo de generación de preguntas

```
Admin hace POST /api/questions/generate
          ↓
Backend construye el prompt para Gemini
          ↓
Gemini API devuelve JSON con preguntas + answers
          ↓
Backend valida el JSON y lo guarda en MongoDB
(colección questions, answers embebidos)
          ↓
Preguntas disponibles para los jugadores
```
