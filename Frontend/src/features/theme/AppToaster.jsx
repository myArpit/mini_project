import React from 'react'
import { Toaster } from 'react-hot-toast'
import { useTheme } from './useTheme'

const AppToaster = () => {
    const { theme } = useTheme()
    const isLight = theme === 'light'

    return (
        <Toaster
            position='top-right'
            toastOptions={{
                duration: 4000,
                style: {
                    background: isLight ? '#ffffff' : '#11182a',
                    color: isLight ? '#172033' : '#f5f7ff',
                    border: `1px solid ${isLight ? '#e2e7f0' : 'rgba(121, 91, 255, 0.42)'}`,
                    boxShadow: isLight ? '0 12px 28px rgba(23, 32, 51, 0.12)' : '0 12px 28px rgba(15, 23, 42, 0.32)',
                    borderRadius: '14px',
                    padding: '0.8rem 1rem',
                    fontSize: '0.95rem',
                },
                success: {
                    style: { borderColor: isLight ? '#b8e4d3' : 'rgba(34, 197, 94, 0.65)' },
                    iconTheme: {
                        primary: isLight ? '#16845b' : '#22c55e',
                        secondary: isLight ? '#ffffff' : '#f8fafc',
                    },
                },
                error: {
                    style: { borderColor: isLight ? '#f3c6ce' : 'rgba(239, 68, 68, 0.7)' },
                    iconTheme: {
                        primary: isLight ? '#d92d45' : '#ef4444',
                        secondary: isLight ? '#ffffff' : '#f8fafc',
                    },
                },
            }}
        />
    )
}

export default AppToaster
