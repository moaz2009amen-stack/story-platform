import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function StoryPlayer() {
  const { storyId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            ← العودة للقصص
          </button>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            القصة قيد التطوير
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            جاري تحميل القصة: {storyId}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
