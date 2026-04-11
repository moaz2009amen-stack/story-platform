import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { RiHome2Line, RiBookOpenLine, RiCompassLine } from 'react-icons/ri'
import Navbar from '../components/Navbar'

export default function NotFound() {
  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Navbar />
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          {/* Big number */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 3.5, repeat: Infinity }}
            className="text-[9rem] font-black leading-none mb-4 select-none"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706, rgba(245,158,11,0.3))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </motion.div>

          <h1 className="text-2xl font-black mb-3" style={{ color: 'var(--text-primary)' }}>
            الصفحة مفقودة
          </h1>
          <p className="text-base mb-10 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            يبدو أن هذه الصفحة اختارت مساراً آخر في القصة وأضاعت طريقها.
            <br />
            لكن لا بأس — كل النهايات الجيدة تبدأ بالعودة للبداية!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary">
              <RiHome2Line />
              العودة للرئيسية
            </Link>
            <Link to="/explore" className="btn-secondary">
              <RiCompassLine />
              استكشف القصص
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
