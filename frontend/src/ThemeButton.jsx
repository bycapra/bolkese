import { Moon, Sun } from 'lucide-react'

export default function ThemeButton({ theme, onToggle, className = '' }) {
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      className={`icon-button ${className}`.trim()}
      onClick={onToggle}
      aria-label={dark ? 'Aydınlık moda geç' : 'Karanlık moda geç'}
      aria-pressed={dark}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
