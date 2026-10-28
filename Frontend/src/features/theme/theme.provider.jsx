import { useLayoutEffect, useState } from 'react'
import { ThemeContext } from './theme.context'

const getSavedTheme = () => {
    try {
        return window.localStorage.getItem('interviewai-theme') === 'light' ? 'light' : 'dark'
    } catch (error) {
        console.error('Unable to read the saved theme preference:', error)
        return 'dark'
    }
}

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getSavedTheme)

    useLayoutEffect(() => {
        document.documentElement.dataset.theme = theme
        try {
            window.localStorage.setItem('interviewai-theme', theme)
        } catch (error) {
            console.error('Unable to save the theme preference:', error)
        }
    }, [theme])

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}
