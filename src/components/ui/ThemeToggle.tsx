import { useTheme } from '../../context/ThemeContext'
import { motion } from 'motion/react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button 
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-16 items-center rounded-full bg-gray-200 p-1 transition-colors dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <motion.div
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-900"
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <span className="text-sm">🌙</span>
        ) : (
          <span className="text-sm">☀️</span>
        )}
      </motion.div>
    </button>
  )
}
