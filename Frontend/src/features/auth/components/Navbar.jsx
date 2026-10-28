import React from 'react'
import { Link, useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../../theme/useTheme'
import './navbar.scss'

const Navbar = () => {
    const { user, handleLogout } = useAuth()
    const { theme, setTheme } = useTheme()
    const navigate = useNavigate()

    const onLogout = async () => {
        try {
            await handleLogout()
            toast.success('Logged out successfully')
            navigate('/')
        } catch {
            toast.error('Logout failed. Please try again.')
        }
    }

    return (
        <nav className='navbar'>
            <Link to='/' className='navbar__brand'>
                <span className='navbar__logo'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                </span>
                InterviewAI
            </Link>

            <div className='navbar__actions'>
                <div className='navbar__theme' role='group' aria-label='Choose appearance'>
                    <button
                        type='button'
                        className={`navbar__theme-option ${theme === 'dark' ? 'navbar__theme-option--active' : ''}`}
                        onClick={() => setTheme('dark')}
                        aria-pressed={theme === 'dark'}
                        aria-label='Use dark theme'
                        title='Dark theme'
                    >
                        <svg aria-hidden='true' xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><path d='M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z' /></svg>
                        <span>Dark</span>
                    </button>
                    <button
                        type='button'
                        className={`navbar__theme-option ${theme === 'light' ? 'navbar__theme-option--active' : ''}`}
                        onClick={() => setTheme('light')}
                        aria-pressed={theme === 'light'}
                        aria-label='Use light theme'
                        title='Light theme'
                    >
                        <svg aria-hidden='true' xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='4' /><path d='M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42' /></svg>
                        <span>Light</span>
                    </button>
                </div>
                {user ? (
                    <>
                        <span className='navbar__user'>
                            <span className='navbar__avatar'>{(user.username || user.email || 'U')[0].toUpperCase()}</span>
                            <span className='navbar__username'>{user.username || user.email}</span>
                        </span>
                        <button onClick={onLogout} className='navbar__btn navbar__btn--logout'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to='/login' className='navbar__btn navbar__btn--ghost'>Login</Link>
                        <Link to='/register' className='navbar__btn navbar__btn--primary'>Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar
