import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newStory, setNewStory] = useState({
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
    cover_image: ''
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadStories()
  }, [])

  async function loadStories() {
    try {
      // مؤقتاً: هنستخدم localStorage لأن Supabase لسه محتاج جداول
      const localStories = JSON.parse(localStorage.getItem('stories') || '[]')
      setStories(localStories)
    } catch (err) {
      console.error('Error loading stories:', err)
    } finally {
      setLoading(false)
    }
  }

  async function uploadImage(file) {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'story_platform')
      formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME)

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      const data = await response.json()
      return data.secure_url
    } catch (err) {
      console.error('Error uploading image:', err)
      throw err
    } finally {
      setUploading(false)
    }
  }

  async function handleCreateStory(e) {
    e.preventDefault()
    
    try {
      const storyId = Date.now().toString()
      const story = {
        id: storyId,
        ...newStory,
        created_at: new Date().toISOString(),
        is_published: false,
        nodes: []
      }

      const updatedStories = [...stories, story]
      localStorage.setItem('stories', JSON.stringify(updatedStories))
      setStories(updatedStories)
      setShowCreateModal(false)
      setNewStory({
        title_ar: '',
        title_en: '',
        description_ar: '',
        description_en: '',
        cover_image: ''
      })
      
    } catch (err) {
      console.error('Error creating story:', err)
      alert('حدث خطأ أثناء إنشاء القصة')
    }
  }

  async function handleCoverUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    try {
      const imageUrl = await uploadImage(file)
      setNewStory({ ...newStory, cover_image: imageUrl })
    } catch (err) {
      alert('حدث خطأ أثناء رفع الصورة')
    }
  }

  function handleDeleteStory(storyId) {
    if (!confirm('هل أنت متأكد من حذف هذه القصة؟')) return

    const updatedStories = stories.filter(s => s.id !== storyId)
    localStorage.setItem('stories', JSON.stringify(updatedStories))
    setStories(updatedStories)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">📝</div>
          <p className="text-xl text-gray-600 dark:text-gray-400">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dramatic-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              لوحة التحكم
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              أدر قصصك التفاعلية وأنشئ مغامرات جديدة
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            ✍️ قصة جديدة
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'إجمالي القصص', value: stories.length, icon: '📚' },
            { label: 'القصص المنشورة', value: stories.filter(s => s.is_published).length, icon: '✅' },
            { label: 'المسودات', value: stories.filter(s => !s.is_published).length, icon: '📝' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-dramatic-800 rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stat.value}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stories Grid */}
        {stories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              لا توجد قصص بعد
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              ابدأ بإنشاء أول قصة تفاعلية لك
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              ✍️ أنشئ قصتك الأولى
            </button>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-dramatic-800 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="relative h-40">
                  {story.cover_image ? (
                    <img
                      src={story.cover_image}
                      alt={story.title_ar}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
                      <span className="text-4xl">📖</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      story.is_published
                        ? 'bg-green-500 text-white'
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {story.is_published ? 'منشور' : 'مسودة'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-1">
                    {story.title_ar}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                    {story.description_ar || 'بدون وصف'}
                  </p>
                  
                  <div className="flex gap-2">
                    <Link
                      to={`/story-builder/${story.id}`}
                      className="flex-1 text-center py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm"
                    >
                      ✏️ تحرير
                    </Link>
                    <button
                      onClick={() => handleDeleteStory(story.id)}
                      className="flex-1 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
                    >
                      🗑️ حذف
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Story Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-dramatic-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  إنشاء قصة جديدة
                </h2>
                
                <form onSubmit={handleCreateStory}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        العنوان (عربي)
                      </label>
                      <input
                        type="text"
                        required
                        value={newStory.title_ar}
                        onChange={(e) => setNewStory({ ...newStory, title_ar: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dramatic-600 bg-white dark:bg-dramatic-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="أدخل عنوان القصة بالعربية"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        العنوان (إنجليزي)
                      </label>
                      <input
                        type="text"
                        value={newStory.title_en}
                        onChange={(e) => setNewStory({ ...newStory, title_en: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dramatic-600 bg-white dark:bg-dramatic-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter story title in English"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        الوصف (عربي)
                      </label>
                      <textarea
                        rows="2"
                        value={newStory.description_ar}
                        onChange={(e) => setNewStory({ ...newStory, description_ar: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dramatic-600 bg-white dark:bg-dramatic-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="أدخل وصفاً مختصراً للقصة"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        الوصف (إنجليزي)
                      </label>
                      <textarea
                        rows="2"
                        value={newStory.description_en}
                        onChange={(e) => setNewStory({ ...newStory, description_en: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dramatic-600 bg-white dark:bg-dramatic-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter a brief description"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        صورة الغلاف
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dramatic-600 bg-white dark:bg-dramatic-700 text-gray-800 dark:text-gray-200"
                      />
                      {uploading && (
                        <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                          جاري رفع الصورة...
                        </p>
                      )}
                      {newStory.cover_image && (
                        <img
                          src={newStory.cover_image}
                          alt="Preview"
                          className="mt-2 h-20 w-20 object-cover rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="flex-1 btn-primary disabled:opacity-50"
                    >
                      {uploading ? 'جاري الرفع...' : 'إنشاء القصة'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 btn-secondary"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
