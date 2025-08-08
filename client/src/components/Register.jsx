import { useState } from 'react'
import '../design/Login.css'
import bg from '../design/bg.jpg'
import API_BASE_URL from '../config.js'

function Register({ onRegisterSuccess, onSwitchToLogin }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        terms: false
    })
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        if (!formData.terms) {
            setMessage('You must accept the terms and conditions')
            setLoading(false)
            return
        }
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            })
            const data = await response.json()
            if (data.success) {
                setMessage('Registration successful! Switching to login...')
                setTimeout(() => {
                    onRegisterSuccess()
                }, 2000)
            } else {
                setMessage(data.message || 'Registration failed')
            }
        } catch (error) {
            setMessage('Registration error: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, type, checked, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    return (
        <div 
            className="auth-wrapper"
            style={{ backgroundImage: `url(${bg})` }}
        >
            <div className="auth-paper">
                <h3 className="auth-title">Create Account</h3>
                <div className="divider">
                    <span className="divider-text">Sign up to start taking notes</span>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-stack">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                                autoComplete="username"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                autoComplete="email"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                minLength="6"
                                autoComplete="new-password"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-checkbox-container">
                            <div className="checkbox-row">
                                <input
                                    id="terms"
                                    type="checkbox"
                                    name="terms"
                                    checked={formData.terms}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                />
                                <label htmlFor="terms">I accept terms and conditions</label>
                            </div>
                            {message === 'You must accept the terms and conditions' && (
                                <div className="error-text terms-error">{message}</div>
                            )}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="text-button" 
                            onClick={onSwitchToLogin}
                        >
                            Already have an account? <span className="highlight-link">Login now</span>
                        </button>
                    </div>
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                    {message && message !== 'You must accept the terms and conditions' && (
                        <div className={message.includes('successful') ? "message success" : "error-text"}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}

export default Register