import { createContext, useContext, useEffect, type PropsWithChildren } from 'react'

type Theme = 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: PropsWithChildren) {
  // Always dark mode - no toggle
  const theme: Theme = 'dark'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
    // Clean up any old light mode preference
    localStorage.removeItem('shibuya_theme')
  }, [])

  // No-op functions - dark mode only
  const toggleTheme = () => {}
  const setTheme = () => {}

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
