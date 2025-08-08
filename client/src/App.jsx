import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import API_BASE_URL from './config.js'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check`, {
        method: 'GET',
        credentials: 'include'
      })
      const data = await response.json()
      setIsLoggedIn(data.success)
    } 
    catch (error) 
    {
      setIsLoggedIn(false)
      console.log(error)
    } 
    finally 
    {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  if (loading) return <div>Loading...</div>

  if (isLoggedIn) {
    return <Dashboard onLogout={() => setIsLoggedIn(false)} />
  }

  if (showRegister) {
    return (
      <Register 
        onRegisterSuccess={() => setShowRegister(false)}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    )
  }

  return (
    <Login 
      onLoginSuccess={() => setIsLoggedIn(true)}
      onSwitchToRegister={() => setShowRegister(true)}
    />
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

export default App