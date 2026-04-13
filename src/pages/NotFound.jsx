import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiBookOpen } from 'react-icons/fi'

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-bold text-gold-500 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">الصفحة غير موجودة</h1>
        <p className="text-[var(--text-muted)] mb-8">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary flex items-center gap-2 justify-center">
            <FiHome />
            الرئيسية
          </Link>
          <Link to="/explore" className="btn-secondary flex items-center gap-2 justify-center">
            <FiBookOpen />
            استكشف القصص
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound
