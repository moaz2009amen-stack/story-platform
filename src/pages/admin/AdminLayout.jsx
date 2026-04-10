import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { auth } from '../../lib/supabase'

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const currentUser = await auth.getCurrentUser()
    if (!currentUser) {
      navigate('/auth')
      return
    }
    
    // التحقق من صلاحيات الأدمن
    const { data: profile } = await auth.getUserProfile(currentUser.id)
    if (profile?.role !== 'admin') {
      navigate('/')
      return
    }
    
    setUser(currentUser)
  }

  async function handleLogout() {
    await auth.signOut()
    navigate('/')
  }

  const menuItems = [
    { path: '/moaz-admin', icon: '📊', label: 'الرئيسية' },
    { path: '/moaz-admin/stories', icon: '📚', label: 'القصص' },
    { path: '/moaz-admin/users', icon: '👥', label: 'المستخدمين' },
    { path: '/moaz-admin/analytics', icon: '📈', label: 'التحليلات' },
    { path: '/moaz-admin/settings', icon: '⚙️', label: 'الإعدادات' }
  ]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="w-64 bg-white dark:bg-gray-800 shadow-xl fixed h-full z-30"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">👑 لوحة التحكم</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
        </div>
        
        <nav className="p-4">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                location.pathname === item.path
                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
          >
            🚪 تسجيل خروج
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'mr-64' : ''} transition-all`}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              ☰
            </button>
            
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-purple-600">
                ← العودة للموقع
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
