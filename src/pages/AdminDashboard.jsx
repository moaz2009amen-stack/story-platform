import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stories, setStories] = useState([])
  const ADMIN_PASSWORD = 'moaz2024story'

  useEffect(() => {
    if (isAuthenticated) {
      loadStories()
    }
  }, [isAuthenticated])

  function loadStories() {
    const userStories = JSON.parse(localStorage.getItem('userStories') || '[]')
    setStories(userStories)
  }

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
    } else {
      alert('كلمة المرور غير صحيحة')
    }
  }

  function deleteStory(storyId) {
    if (!confirm('هل أنت متأكد من حذف هذه القصة؟')) return
    const updated = stories.filter(s => s.id !== storyId)
    localStorage.setItem('userStories', JSON.stringify(updated))
    setStories(updated)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            🔐 لوحة التحكم
          </h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 focus:ring-2 focus:ring-purple-500"
              placeholder="أدخل كلمة المرور"
              autoFocus
            />
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              دخول
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            👑 لوحة التحكم - المشرف
          </h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-red-500 hover:text-red-600 transition-colors"
          >
            تسجيل خروج
          </button>
        </div>

        <div className="grid gap-4">
          {stories.map((story) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between"
            >
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {story.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {story.description?.substring(0, 50)}...
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(story.created_at).toLocaleDateString('ar-EG')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => deleteStory(story.id)}
                  className="px-3 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  حذف
                </button>
              </div>
            </motion.div>
          ))}
          
          {stories.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              لا توجد قصص بعد
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
