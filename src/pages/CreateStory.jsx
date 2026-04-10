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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="أدخل عنوان قصتك"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                وصف القصة
              </label>
              <textarea
                rows="4"
                value={story.description}
                onChange={(e) => setStory({ ...story, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="اكتب وصفاً مختصراً لقصتك"
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                💾 حفظ القصة
              </button>
              <button 
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 border-2 border-purple-600 text-purple-600 dark:text-purple-400 font-bold py-3 px-6 rounded-lg hover:bg-purple-600 hover:text-white transition-all"
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
