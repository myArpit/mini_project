import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import toast from 'react-hot-toast'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import AuthVisual from '../components/AuthVisual'
import PasswordVisibilityIcon from '../components/PasswordVisibilityIcon'

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (loading) return

        if (!email || !password) {
            toast.error('Please fill in all fields')
            return
        }

        try {
            await handleLogin({ email, password })
            toast.success('Welcome back! 👋')
            navigate('/')
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Login failed. Please try again.')
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <AuthVisual mode="login" />

                <section className="auth-content">
                    <div className="form-header">
                        <p className="eyebrow">Continue where you left off</p>
                        <h1>Sign in</h1>
                        <p className="form-description">Your next opportunity is worth preparing for.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-field">
                                <input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    className="password-toggle"
                                    type="button"
                                    onClick={() => setShowPassword((visible) => !visible)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    aria-pressed={showPassword}
                                >
                                    <PasswordVisibilityIcon visible={showPassword} />
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="button primary-button" disabled={loading}>
                            {loading ? <><span className="auth-spinner" aria-hidden="true" /> Signing in...</> : 'Sign in'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        New to InterviewAI? <Link to="/register">Create an account</Link>
                    </p>
                </section>
            </div>
        </main>
    )
}

export default Login