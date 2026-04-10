import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Navbar({ theme, toggleTheme }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dramatic-900/80 backdrop-blur-md border-b border-gray-200 dark:border-dramatic-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-3xl font-bold bg-gradient-to-l from-purple-600 to-indigo-600 bg-clip-text text-transparent"
            >
              📖 قصة واختار
            </motion.h1>
          </Link>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-dramatic-700 hover:bg-gray-300 dark:hover:bg-dramatic-600 transition-colors"
              aria-label="تغيير السمة"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            
            <Link to="/create" className="btn-primary hidden md:block">
              ✍️ ابدأ الكتابة
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
