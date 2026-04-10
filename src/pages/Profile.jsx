import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState('ar')
  const [stats, setStats] = useState({
    totalRead: 0,
    totalCreated: 0,
    totalEndings: 0,
    favoriteStories: [],
    readingHistory: [],
    createdStories: []
  })

  useEffect(() => {
    loadUserStats()
  }, [])

  function loadUserStats() {
    const userStories = JSON.parse(localStorage.getItem('userStories') || '[]')
    const readingHistory = JSON.parse(localStorage.getItem('readingHistory') || '[]')
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    
    // القصص المنشأة
    const createdStories = userStories.filter(s => !s.isDemo)
    
    // حساب النهايات المكتشفة
    const endings = readingHistory.filter(h => h.isEnding).length
    
    setStats({
      totalRead: readingHistory.length,
      totalCreated: createdStories.length,
      totalEndings: endings,
      favoriteStories: favorites,
      readingHistory: readingHistory.slice(0, 10),
      createdStories: createdStories.slice(0, 5)
    })
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {language === 'ar' ? '👤 الملف الشخصي' : '👤 Profile'}
          </h1>
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            {language === 'ar' ? 'English' : 'عربي'}
          </button>
        </div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 md:p-8 mb-8 text-white"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {language === 'ar' ? 'قارئ مغامر' : 'Adventurous Reader'}
              </h2>
              <p className="text-white/80">
                {language === 'ar' ? 'عضو منذ 2024' : 'Member since 2024'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center"
          >
            <div className="text-4xl mb-2">📚</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalRead}</p>
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'ar' ? 'قصة مقروءة' : 'Stories Read'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center"
          >
            <div className="text-4xl mb-2">✍️</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCreated}</p>
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'ar' ? 'قصة منشأة' : 'Stories Created'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center"
          >
            <div className="text-4xl mb-2">🏁</div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalEndings}</p>
            <p className="text-gray-500 dark:text-gray-400">
              {language === 'ar' ? 'نهاية مكتشفة' : 'Endings Discovered'}
            </p>
          </motion.div>
        </div>

        {/* Created Stories */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              ✍️ {language === 'ar' ? 'قصصي' : 'My Stories'}
            </h3>
            
            {stats.createdStories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {language === 'ar' ? 'لم تنشئ أي قصة بعد' : 'No stories created yet'}
                </p>
                <button
                  onClick={() => navigate('/create')}
                  className="text-purple-600 hover:text-purple-700"
                >
                  {language === 'ar' ? '✨ أنشئ أول قصة' : '✨ Create First Story'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.createdStories.map(story => (
                  <div
                    key={story.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => navigate(`/story/${story.id}`)}
                  >
                    <img src={story.cover} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {story.title?.ar}
                      </p>
                      <p className="text-xs text-gray-500">
                        {story.isPublished ? '✅ منشور' : '📝 مسودة'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Reading History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              📖 {language === 'ar' ? 'سجل القراءة' : 'Reading History'}
            </h3>
            
            {stats.readingHistory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                {language === 'ar' ? 'لم تقرأ أي قصة بعد' : 'No reading history yet'}
              </p>
            ) : (
              <div className="space-y-2">
                {stats.readingHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>{item.storyTitle}</span>
                      {item.isEnding && <span className="text-sm">🏁</span>}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(item.timestamp)}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🏆 {language === 'ar' ? 'الإنجازات' : 'Achievements'}
          </h3>
          
          <div className="flex flex-wrap gap-4">
            {stats.totalRead >= 1 && (
              <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-sm font-medium">
                🎉 {language === 'ar' ? 'قارئ مبتدئ' : 'Beginner Reader'}
              </span>
            )}
            {stats.totalRead >= 5 && (
              <span className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full text-sm font-medium">
                📚 {language === 'ar' ? 'قارئ شغوف' : 'Bookworm'}
              </span>
            )}
            {stats.totalCreated >= 1 && (
              <span className="px-4 py-2 bg-gradient-to-r from-green-400 to-teal-400 text-white rounded-full text-sm font-medium">
                ✍️ {language === 'ar' ? 'كاتب ناشئ' : 'Aspiring Writer'}
              </span>
            )}
            {stats.totalEndings >= 3 && (
              <span className="px-4 py-2 bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-full text-sm font-medium">
                🔍 {language === 'ar' ? 'مستكشف النهايات' : 'Ending Explorer'}
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
