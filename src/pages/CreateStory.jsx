import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function CreateStory() {
  const navigate = useNavigate()
  const [story, setStory] = useState({
    title: '',
    description: '',
    cover: ''
  })

  function handleSubmit(e) {
    e.preventDefault()
    const storyData = {
      id: Date.now().toString(),
      ...story,
      created_at: new Date().toISOString()
    }
    const existingStories = JSON.parse(localStorage.getItem('userStories') || '[]')
    localStorage.setItem('userStories', JSON.stringify([...existingStories, storyData]))
    alert('تم حفظ قصتك!')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dramatic-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dramatic-800 rounded-2xl shadow-xl p-6 md:p-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">
            ✍️ اكتب قصتك التفاعلية
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                عنوان القصة
              </label>
              <input
                type="text"
                required
                value={story.title}
                onChange={(e) => setStory({ ...story, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dramatic-600 bg-white dark:bg-dramatic-700 text-gray-800 dark:text-gray-200"
                placeholder="أدخل عنوان قصتك"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                وصف القصة
              </label>
              <textarea
                rows="3"
                value={story.description}
                onChange={(e) => setStory({ ...story, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dramatic-600 bg-white dark:bg-dramatic-700 text-gray-800 dark:text-gray-200"
                placeholder="اكتب وصفاً مختصراً لقصتك"
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button type="submit" className="btn-primary flex-1">
                💾 حفظ القصة
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary flex-1"
              >
                إلغاء
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
