import { useState } from 'react'
import '../design/Login.css'
import bg from '../design/bg.jpg' // Add a background image if you want
import API_BASE_URL from '../config.js'

function Login({ onLoginSuccess, onSwitchToRegister }) {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    })
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            })

            const data = await response.json()
            
            if (data.success) {
                onLoginSuccess()
            } else {
                setMessage(data.message || 'Login failed')
            }
        } catch (error) {
            setMessage('Login error: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    return (
        <div 
            className="auth-wrapper"
            style={{ backgroundImage: `url(${bg})` }}
        >
            <div className="auth-paper">
                <h3 className="auth-title">Welcome Back</h3>
                <div className="divider">
                    <span className="divider-text">Sign in to your account</span>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-stack">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                                className={message ? 'input-error' : ''}
                                autoComplete="username"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Your password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                className={message ? 'input-error' : ''}
                                autoComplete="current-password"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="text-button" 
                            onClick={onSwitchToRegister}
                        >
                            Don't have an account? <span className="highlight-link">Register now</span>
                        </button>
                    </div>
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Signing In...' : 'Login'}
                    </button>
                    {message && <div className="error-text">{message}</div>}
                </form>
            </div>
        </div>
    )
}

export default Login