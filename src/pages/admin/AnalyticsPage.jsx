import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    dailyViews: [],
    topStories: [],
    categories: []
  })
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const ADMIN_PASSWORD = 'moaz2024story'

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      loadAnalytics()
    }
  }, [])

  async function loadAnalytics() {
    setLoading(true)
    
    // جلب القصص
    const { data: stories } = await supabase
      .from('stories')
      .select('*')
      .order('views', { ascending: false })
      .limit(10)
    
    setStats({
      topStories: stories || [],
      categories: []
    })
    
    setLoading(false)
  }

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuth', 'true')
      loadAnalytics()
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
            📈 التحليلات والإحصائيات
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

        {/* Top Stories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            🏆 القصص الأكثر مشاهدة
          </h2>
          
          <div className="space-y-3">
            {stats.topStories.map((story, index) => (
              <div key={story.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-purple-600 w-8">
                    #{index + 1}
                  </span>
                  <img src={story.cover_image} alt="" className="w-10 h-10 rounded object-cover" />
                  <div>
                    <p className="font-medium">{story.title?.ar}</p>
                    <p className="text-xs text-gray-500">{story.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">👁️ {story.views || 0}</span>
                  <span className="text-sm">❤️ {story.likes || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90">إجمالي المشاهدات</p>
            <p className="text-4xl font-bold mt-2">
              {stats.topStories.reduce((acc, s) => acc + (s.views || 0), 0)}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90">إجمالي الإعجابات</p>
            <p className="text-4xl font-bold mt-2">
              {stats.topStories.reduce((acc, s) => acc + (s.likes || 0), 0)}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
            <p className="text-sm opacity-90">متوسط المشاهدات</p>
            <p className="text-4xl font-bold mt-2">
              {stats.topStories.length > 0 
                ? Math.round(stats.topStories.reduce((acc, s) => acc + (s.views || 0), 0) / stats.topStories.length)
                : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
