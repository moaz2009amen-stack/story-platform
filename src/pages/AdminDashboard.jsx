import { useState } from 'react'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const ADMIN_PASSWORD = 'moaz2024story'

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
    } else {
      alert('كلمة المرور غير صحيحة')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dramatic-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-dramatic-800 p-8 rounded-2xl shadow-xl max-w-md w-full"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
            🔐 لوحة التحكم
          </h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dramatic-600 bg-white dark:bg-dramatic-700 text-gray-800 dark:text-gray-200 mb-4"
              placeholder="أدخل كلمة المرور"
              autoFocus
            />
            <button type="submit" className="btn-primary w-full">
              دخول
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dramatic-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            👑 لوحة التحكم - المشرف
          </h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-red-500 hover:text-red-600"
          >
            تسجيل خروج
          </button>
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          جاري تحميل القصص...
        </p>
      </div>
    </div>
  )
}
