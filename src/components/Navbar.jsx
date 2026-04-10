import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Navbar({ theme, toggleTheme }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
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
          
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/explore" className="hidden md:block text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              📚 المكتبة
            </Link>
            <Link to="/profile" className="hidden md:block text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              👤 حسابي
            </Link>
            <Link to="/create" className="hidden md:block text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              ✍️ اكتب
            </Link>
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
