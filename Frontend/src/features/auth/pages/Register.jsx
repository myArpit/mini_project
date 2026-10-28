import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import toast from 'react-hot-toast'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'
import AuthVisual from '../components/AuthVisual'
import PasswordVisibilityIcon from '../components/PasswordVisibilityIcon'

const Register = () => {
    const navigate = useNavigate()
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (loading) return

        if (!username || !email || !password) {
            toast.error('Please fill in all fields')
            return
        }

        try {
            await handleRegister({ username, email, password })
            toast.success('Account created successfully! 🎉')
            navigate("/")
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Registration failed. Please try again.')
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-card">
                <AuthVisual mode="signup" />

                <section className="auth-content">
                    <div className="form-header">
                        <p className="eyebrow">A stronger way to get ready</p>
                        <h1>Create your account</h1>
                        <p className="form-description">Set up your profile to build a personalized interview plan.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="username">Username</label>
                            <input
                                value={username}
                                onChange={(e) => { setUsername(e.target.value) }}
                                type="text"
                                id="username"
                                name='username'
                                placeholder='Choose a username'
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                value={email}
                                onChange={(e) => { setEmail(e.target.value) }}
                                type="email"
                                id="email"
                                name='email'
                                placeholder='Enter your email'
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-field">
                                <input
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value) }}
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name='password'
                                    placeholder='Create a password'
                                    autoComplete="new-password"
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

                        <button type="submit" className='button primary-button' disabled={loading}>
                            {loading ? <><span className="auth-spinner" aria-hidden="true" /> Creating account...</> : 'Create account'}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account? <Link to={"/login"}>Sign in</Link>
                    </p>
                </section>
            </div>
        </main>
    )
}

export default Register