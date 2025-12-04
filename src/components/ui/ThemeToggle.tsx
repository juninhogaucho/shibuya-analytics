import { useTheme } from '../../context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button 
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Dark mode locked' : 'Switch theme'}
    >
      <span className={`theme-toggle-icon ${isDark ? 'active' : ''}`}>
        🌙
      </span>
      <span className={`theme-toggle-icon ${!isDark ? 'active' : ''}`}>
        ☀️
      </span>
      <span className="theme-toggle-slider" data-theme={theme} />
    </button>
  )
}
