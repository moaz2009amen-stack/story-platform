import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl mb-6">📚</div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          ٤٠٤
        </h1>
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
          الصفحة غير موجودة
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة. ربما تم حذفها أو تغيير عنوانها.
        </p>
        <Link
          to="/"
          className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:shadow-lg transition-all"
        >
          🏠 العودة للرئيسية
        </Link>
      </motion.div>
    </div>
  )
}
