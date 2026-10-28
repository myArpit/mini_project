import React from 'react'
import { Link } from 'react-router'

const AuthVisual = ({ mode }) => {
    const isSignup = mode === 'signup'

    return (
        <aside className={`auth-illustration auth-illustration--${mode}`} aria-label='Interview preparation overview'>
            <Link className='auth-visual__brand' to='/'>
                <span className='auth-visual__logo' aria-hidden='true'>✦</span>
                <span>InterviewAI</span>
            </Link>
            <div className='auth-visual__copy'>
                <span className='auth-badge'>{isSignup ? 'A smarter next step' : 'Your career workspace'}</span>
                <h2>{isSignup ? 'Build Your Interview Edge' : 'Welcome Back to Your Next Opportunity'}</h2>
                <p>
                    {isSignup
                        ? 'Create your profile and unlock a smarter way to prepare for your next opportunity.'
                        : 'Continue building your interview strategy and take the next step toward your career goals.'}
                </p>
            </div>
            <div className='auth-visual__art' aria-hidden='true'>
                <div className='auth-visual__glow' />
                <div className='auth-visual__path'>
                    <span />
                    <span />
                    <span />
                </div>
                <div className='auth-visual__resume'>
                    <span className='auth-visual__resume-icon'>CV</span>
                    <span className='auth-visual__resume-lines'>
                        <i /><i /><i /><i />
                    </span>
                    <span className='auth-visual__resume-label'>Profile analyzed</span>
                </div>
                <div className='auth-visual__insight'>
                    <span className='auth-visual__insight-icon'>✦</span>
                    <span><strong>Interview ready</strong><small>Personalized to your goals</small></span>
                </div>
                <span className='auth-visual__node auth-visual__node--one' />
                <span className='auth-visual__node auth-visual__node--two' />
            </div>
            <p className='auth-visual__footnote'>Your experience, turned into a clearer plan.</p>
        </aside>
    )
}

export default AuthVisual
