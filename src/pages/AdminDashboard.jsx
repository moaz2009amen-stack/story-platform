import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [stories, setStories] = useState([])
  const [filteredStories, setFilteredStories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, published, draft
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, title
  const [selectedStory, setSelectedStory] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    totalScenes: 0,
    totalEndings: 0
  })
  
  const ADMIN_PASSWORD = 'moaz2024story'

  useEffect(() => {
    if (isAuthenticated) {
      loadStories()
    }
  }, [isAuthenticated])

  useEffect(() => {
    filterAndSortStories()
  }, [stories, searchTerm, filterStatus, sortBy])

  function loadStories() {
    const userStories = JSON.parse(localStorage.getItem('userStories') || '[]')
    setStories(userStories)
    
    // حساب الإحصائيات
    const published = userStories.filter(s => s.isPublished).length
    const totalScenes = userStories.reduce((acc, s) => acc + Object.keys(s.scenes || {}).length, 0)
    const totalEndings = userStories.reduce((acc, s) => 
      acc + Object.values(s.scenes || {}).filter(scene => scene.isEnding).length, 0
    )
    
    setStats({
      total: userStories.length,
      published: published,
      drafts: userStories.length - published,
      totalScenes,
      totalEndings
    })
  }

  function filterAndSortStories() {
    let filtered = [...stories]
    
    // فلترة بالبحث
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.title?.ar?.includes(searchTerm) || 
        s.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.ar?.includes(searchTerm) ||
        s.description?.en?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // فلترة بالحالة
    if (filterStatus === 'published') {
      filtered = filtered.filter(s => s.isPublished)
    } else if (filterStatus === 'draft') {
      filtered = filtered.filter(s => !s.isPublished)
    }
    
    // ترتيب
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => (a.title?.ar || '').localeCompare(b.title?.ar || ''))
    }
    
    setFilteredStories(filtered)
  }

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuth', 'true')
    } else {
      alert('❌ كلمة المرور غير صحيحة')
    }
  }

  function handleLogout() {
    setIsAuthenticated(false)
    sessionStorage.removeItem('adminAuth')
    setPassword('')
  }

  function deleteStory(storyId) {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذه القصة؟ لا يمكن التراجع عن هذا الإجراء.')) return
    
    const updated = stories.filter(s => s.id !== storyId)
    localStorage.setItem('userStories', JSON.stringify(updated))
    setStories(updated)
    
    if (selectedStory?.id === storyId) {
      setSelectedStory(null)
      setShowPreview(false)
    }
  }

  function togglePublish(storyId) {
    const updated = stories.map(s => 
      s.id === storyId ? { ...s, isPublished: !s.isPublished } : s
    )
    localStorage.setItem('userStories', JSON.stringify(updated))
    setStories(updated)
  }

  function duplicateStory(story) {
    const newStory = {
      ...story,
      id: Date.now().toString(),
      title: {
        ar: story.title?.ar + ' (نسخة)',
        en: story.title?.en + ' (Copy)'
      },
      isPublished: false,
      created_at: new Date().toISOString()
    }
    const updated = [...stories, newStory]
    localStorage.setItem('userStories', JSON.stringify(updated))
    setStories(updated)
    alert('✅ تم نسخ القصة بنجاح!')
  }

  function exportStory(story) {
    const dataStr = JSON.stringify(story, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `${story.title?.ar || 'story'}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // صفحة تسجيل الدخول
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
            <h2 className="text-3xl font-bold text-white mb-2">
              لوحة التحكم
            </h2>
            <p className="text-gray-300">
              منصة قصة واختار - دخول المشرف
            </p>
          </div>
          
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg text-center"
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
          
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← العودة للرئيسية
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // لوحة التحكم الرئيسية
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
              >
                ← الرئيسية
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                👑 لوحة التحكم
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                أهلاً بك، معاذ
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
              >
                🚪 تسجيل خروج
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar - إحصائيات */}
          <div className="w-72 shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">
                📊 إحصائيات عامة
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">📚 إجمالي القصص</span>
                  <span className="font-bold text-2xl text-purple-600 dark:text-purple-400">{stats.total}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">✅ منشورة</span>
                  <span className="font-bold text-2xl text-green-600 dark:text-green-400">{stats.published}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">📝 مسودات</span>
                  <span className="font-bold text-2xl text-yellow-600 dark:text-yellow-400">{stats.drafts}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">🎬 المشاهد</span>
                  <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">{stats.totalScenes}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">🏁 النهايات</span>
                  <span className="font-bold text-2xl text-red-600 dark:text-red-400">{stats.totalEndings}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => window.location.href = '/create'}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  ✍️ إنشاء قصة جديدة
                </button>
              </div>
            </div>
          </div>

          {/* Main - قائمة القصص */}
          <div className="flex-1">
            {/* أدوات البحث والفلترة */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 mb-6">
              <div className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="🔍 بحث عن قصة..."
                />
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">📋 الكل</option>
                  <option value="published">✅ منشور</option>
                  <option value="draft">📝 مسودة</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="newest">🆕 الأحدث</option>
                  <option value="oldest">📅 الأقدم</option>
                  <option value="title">🔤 العنوان</option>
                </select>
              </div>
            </div>

            {/* جدول القصص */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              {filteredStories.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-xl text-gray-500 dark:text-gray-400">
                    لا توجد قصص بعد
                  </p>
                  <button
                    onClick={() => window.location.href = '/create'}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold"
                  >
                    ✍️ أنشئ أول قصة
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">القصة</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">الحالة</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">المشاهد</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">التاريخ</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredStories.map((story) => {
                      const sceneCount = Object.keys(story.scenes || {}).length
                      return (
                        <tr key={story.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {story.cover && (
                                <img src={story.cover} alt="" className="w-12 h-12 rounded-lg object-cover" />
                              )}
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {story.title?.ar || 'بدون عنوان'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                  {story.description?.ar?.substring(0, 40)}...
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => togglePublish(story.id)}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                story.isPublished
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              }`}
                            >
                              {story.isPublished ? '✅ منشور' : '📝 مسودة'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            🎬 {sceneCount} مشهد
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(story.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  setSelectedStory(story)
                                  setShowPreview(true)
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                                title="معاينة"
                              >
                                👁️
                              </button>
                              <button
                                onClick={() => duplicateStory(story)}
                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"
                                title="نسخ"
                              >
                                📋
                              </button>
                              <button
                                onClick={() => exportStory(story)}
                                className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg"
                                title="تصدير"
                              >
                                📤
                              </button>
                              <button
                                onClick={() => deleteStory(story.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                title="حذف"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal - معاينة القصة */}
      <AnimatePresence>
        {showPreview && selectedStory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-48">
                <img 
                  src={selectedStory.cover || 'https://images.pexels.com/photos/1671324/pexels-photo-1671324.jpeg'} 
                  alt="" 
                  className="w-full h-full object-cover rounded-t-2xl" 
                />
                <button
                  onClick={() => setShowPreview(false)}
                  className="absolute top-3 left-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedStory.title?.ar || 'بدون عنوان'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {selectedStory.description?.ar || 'بدون وصف'}
                </p>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{Object.keys(selectedStory.scenes || {}).length}</p>
                    <p className="text-sm text-gray-500">مشهد</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedStory.isPublished ? '✅' : '📝'}
                    </p>
                    <p className="text-sm text-gray-500">الحالة</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatDate(selectedStory.created_at)}
                    </p>
                    <p className="text-sm text-gray-500">التاريخ</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigate(`/story/${selectedStory.id}`)
                      setShowPreview(false)
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold"
                  >
                    🎮 تشغيل القصة
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
