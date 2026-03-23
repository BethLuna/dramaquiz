import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import Result from './pages/Result'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="/login"       element={<Login />} />
        <Route path="/register"    element={<Register />} />
        <Route path="/"            element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/quiz"        element={<PrivateRoute><Quiz /></PrivateRoute>} />
        <Route path="/result"      element={<PrivateRoute><Result /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
        <Route path="*"            element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}