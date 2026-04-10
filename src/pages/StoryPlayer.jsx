import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function StoryPlayer() {
  const { storyId } = useParams()
  const navigate = useNavigate()
  
  const [story, setStory] = useState(null)
  const [currentNode, setCurrentNode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    loadStory()
  }, [storyId])

  async function loadStory() {
    try {
      setLoading(true)
      
      // جلب القصة
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single()

      if (storyError) throw storyError
      setStory(storyData)

      // جلب أول مشهد
      const { data: nodesData, error: nodesError } = await supabase
        .from('nodes')
        .select('*')
        .eq('story_id', storyId)
        .eq('is_start', true)
        .single()

      if (nodesError) throw nodesError
      setCurrentNode(nodesData)
      
    } catch (err) {
      console.error('Error loading story:', err)
      setError('حدث خطأ أثناء تحميل القصة')
    } finally {
      setLoading(false)
    }
  }

  async function handleChoice(choice) {
    try {
      // حفظ المشهد الحالي في التاريخ
      setHistory([...history, currentNode.id])

      // جلب المشهد التالي
      const { data: nextNode, error } = await supabase
        .from('nodes')
        .select('*')
        .eq('id', choice.next_node_id)
        .single()

      if (error) throw error
      setCurrentNode(nextNode)
      
    } catch (err) {
      console.error('Error loading next scene:', err)
      setError('حدث خطأ أثناء تحميل المشهد التالي')
    }
  }

  async function handleRestart() {
    try {
      const { data: startNode, error } = await supabase
        .from('nodes')
        .select('*')
        .eq('story_id', storyId)
        .eq('is_start', true)
        .single()

      if (error) throw error
      setCurrentNode(startNode)
      setHistory([])
      
    } catch (err) {
      console.error('Error restarting story:', err)
    }
  }

  async function handleGoBack() {
    if (history.length === 0) return

    try {
      const previousNodeId = history[history.length - 1]
      const { data: previousNode, error } = await supabase
        .from('nodes')
        .select('*')
        .eq('id', previousNodeId)
        .single()

      if (error) throw error
      setCurrentNode(previousNode)
      setHistory(history.slice(0, -1))
      
    } catch (err) {
      console.error('Error going back:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">📖</div>
          <p className="text-xl text-gray-600 dark:text-gray-400">جاري تحميل القصة...</p>
        </div>
      </div>
    )
  }

  if (error || !story || !currentNode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-red-500 mb-4">😕</p>
          <p className="text-xl text-gray-600 dark:text-gray-400">{error || 'لم يتم العثور على القصة'}</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">
            العودة للرئيسية
          </button>
        </div>
      </div>
    )
  }

  const content = currentNode.content
  const isArabic = true // يمكن تغييرها حسب اللغة المختارة
  const nodeText = isArabic ? content?.ar : content?.en

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dramatic-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            ← العودة للقصص
          </button>
          
          <div className="flex gap-2">
            {history.length > 0 && (
              <button
                onClick={handleGoBack}
                className="px-4 py-2 bg-gray-200 dark:bg-dramatic-700 rounded-lg hover:bg-gray-300 dark:hover:bg-dramatic-600 transition-colors"
              >
                ↩️ تراجع
              </button>
            )}
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-gray-200 dark:bg-dramatic-700 rounded-lg hover:bg-gray-300 dark:hover:bg-dramatic-600 transition-colors"
            >
              🔄 من البداية
            </button>
          </div>
        </div>

        {/* Story Title */}
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
          {isArabic ? story.title?.ar : story.title?.en}
        </h2>

        {/* Scene Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-dramatic-800 rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Scene Image */}
            {currentNode.image && (
              <div className="relative h-64 md:h-96">
                <img
                  src={currentNode.image}
                  alt="Scene"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            )}

            {/* Scene Text */}
            <div className="p-6 md:p-8">
              <p className="text-lg md:text-xl leading-relaxed text-gray-800 dark:text-gray-200 mb-8">
                {nodeText}
              </p>

              {/* Choices */}
              {!currentNode.is_ending ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    اختر مسارك:
                  </p>
                  {currentNode.choices?.map((choice, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleChoice(choice)}
                      className="choice-button"
                    >
                      {isArabic ? choice.text_ar : choice.text_en}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">
                    {currentNode.ending_type === 'good' ? '🎉' : 
                     currentNode.ending_type === 'bad' ? '💀' : '📖'}
                  </div>
                  <p className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                    {isArabic ? 'النهاية' : 'The End'}
                  </p>
                  {currentNode.ending_message && (
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {isArabic ? currentNode.ending_message?.ar : currentNode.ending_message?.en}
                    </p>
                  )}
                  <div className="flex gap-4 justify-center">
                    <button onClick={handleRestart} className="btn-primary">
                      🔄 ابدأ من جديد
                    </button>
                    <button onClick={() => navigate('/')} className="btn-secondary">
                      📚 اختر قصة أخرى
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress Indicator */}
        {!currentNode.is_ending && (
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            المشهد {history.length + 1}
          </div>
        )}
      </div>
    </div>
  )
}
