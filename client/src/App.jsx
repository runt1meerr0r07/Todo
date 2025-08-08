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
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setIsLoggedIn(true)
        } else {
          localStorage.removeItem('authToken');
          setIsLoggedIn(false);
        }
      } else {
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
      }
    } 
    catch (error) 
    {
      localStorage.removeItem('authToken');
      setIsLoggedIn(false)
      console.log('Auth check failed:', error)
    } 
    finally 
    {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    setShowRegister(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false)
  }

  const handleRegisterSuccess = () => {
    setShowRegister(false)
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <p>Loading TodoTrial...</p>
      </div>
    )
  }

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />
  }

  return (
    <div>
      {showRegister ? (
        <Register 
          onRegisterSuccess={handleRegisterSuccess} 
          onSwitchToLogin={() => setShowRegister(false)}
        />
      ) : (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onSwitchToRegister={() => setShowRegister(true)}
        />
      )}
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

export default App