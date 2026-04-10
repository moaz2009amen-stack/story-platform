import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStories: 0,
    totalUsers: 0,
    totalReads: 0,
    publishedStories: 0
  })
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const ADMIN_PASSWORD = 'moaz2024story'

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      loadStats()
    }
  }, [])

  async function loadStats() {
    setLoading(true)
    
    // جلب الإحصائيات من Supabase
    const { data: stories } = await supabase.from('stories').select('*')
    const { data: users } = await supabase.from('profiles').select('*')
    
    setStats({
      totalStories: stories?.length || 0,
      totalUsers: users?.length || 0,
      totalReads: stories?.reduce((acc, s) => acc + (s.views || 0), 0) || 0,
      publishedStories: stories?.filter(s => s.is_published).length || 0
    })
    
    setLoading(false)
  }

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuth', 'true')
      loadStats()
    } else {
      alert('❌ كلمة المرور غير صحيحة')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl max-w-md w-full border border-white/20"
        >
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">👑</div>
            <h2 className="text-3xl font-bold text-white mb-2">لوحة التحكم</h2>
            <p className="text-gray-300">منصة قصة واختار - دخول المشرف</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg text-center"
              placeholder="🔐 أدخل كلمة المرور"
              autoFocus
            />
            <button 
              type="submit" 
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg text-lg"
            >
              دخول
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            👑 لوحة التحكم
          </h1>
          <button
            onClick={() => {
              sessionStorage.removeItem('adminAuth')
              setIsAuthenticated(false)
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            🚪 تسجيل خروج
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="text-4xl mb-2">📚</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalStories}</p>
            <p className="text-gray-500 dark:text-gray-400">إجمالي القصص</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="text-4xl mb-2">✅</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.publishedStories}</p>
            <p className="text-gray-500 dark:text-gray-400">قصص منشورة</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="text-4xl mb-2">👥</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            <p className="text-gray-500 dark:text-gray-400">المستخدمين</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="text-4xl mb-2">👁️</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalReads}</p>
            <p className="text-gray-500 dark:text-gray-400">إجمالي المشاهدات</p>
          </motion.div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/moaz-admin/stories" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center">
            <div className="text-3xl mb-2">📚</div>
            <p className="font-bold text-gray-900 dark:text-white">إدارة القصص</p>
          </Link>
          <Link to="/moaz-admin/users" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center">
            <div className="text-3xl mb-2">👥</div>
            <p className="font-bold text-gray-900 dark:text-white">إدارة المستخدمين</p>
          </Link>
          <Link to="/moaz-admin/analytics" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center">
            <div className="text-3xl mb-2">📈</div>
            <p className="font-bold text-gray-900 dark:text-white">التحليلات</p>
          </Link>
          <Link to="/moaz-admin/settings" className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow text-center">
            <div className="text-3xl mb-2">⚙️</div>
            <p className="font-bold text-gray-900 dark:text-white">الإعدادات</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
