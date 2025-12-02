import { useTheme } from '../../context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button 
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <span className={`theme-toggle-icon ${theme === 'dark' ? 'active' : ''}`}>
        🌙
      </span>
      <span className={`theme-toggle-icon ${theme === 'light' ? 'active' : ''}`}>
        ☀️
      </span>
      <span className="theme-toggle-slider" data-theme={theme} />
    </button>
  )
}
