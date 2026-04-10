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
  const [scenes, setScenes] = useState([
    { id: 1, text: '', choices: [] }
  ])

  function addScene() {
    setScenes([...scenes, { id: Date.now(), text: '', choices: [] }])
  }

  function updateScene(id, text) {
    setScenes(scenes.map(s => s.id === id ? { ...s, text } : s))
  }

  function addChoice(sceneId) {
    setScenes(scenes.map(s => 
      s.id === sceneId 
        ? { ...s, choices: [...s.choices, { text: '', nextScene: '' }] }
        : s
    ))
  }

  function updateChoice(sceneId, choiceIndex, field, value) {
    setScenes(scenes.map(s => {
      if (s.id === sceneId) {
        const newChoices = [...s.choices]
        newChoices[choiceIndex][field] = value
        return { ...s, choices: newChoices }
      }
      return s
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    
    // حفظ القصة في localStorage
    const storyData = {
      id: Date.now().toString(),
      ...story,
      scenes,
      created_at: new Date().toISOString()
    }
    
    const existingStories = JSON.parse(localStorage.getItem('userStories') || '[]')
    localStorage.setItem('userStories', JSON.stringify([...existingStories, storyData]))
    
    alert('تم حفظ قصتك! (محلياً على جهازك)')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dramatic-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dramatic-600 bg-white dark:bg-dramatic-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-dramatic-600 bg-white dark:bg-dramatic-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500"
                placeholder="اكتب وصفاً مختصراً لقصتك"
              />
            </div>
            
            <div className="border-t border-gray-200 dark:border-dramatic-700 pt-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                مشاهد القصة
              </h2>
              
              {scenes.map((scene, index) => (
                <div key={scene.id} className="mb-6 p-4 border border-gray-200 dark:border-dramatic-700 rounded-lg">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3">
                    المشهد {index + 1}
                  </h3>
                  
                  <textarea
                    rows="3"
                    value={scene.text}
                    onChange={(e) => updateScene(scene.id, e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dramatic-600 bg-white dark:bg-dramatic-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 mb-3"
                    placeholder="اكتب نص المشهد..."
                  />
                  
                  <div className="space-y-2 mb-3">
                    {scene.choices.map((choice, choiceIndex) => (
                      <div key={choiceIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={choice.text}
                          onChange={(e) => updateChoice(scene.id, choiceIndex, 'text', e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-dramatic-600 bg-white dark:bg-dramatic-700 text-gray-800 dark:text-gray-200"
                          placeholder="نص الاختيار"
                        />
                        <select
                          value={choice.nextScene}
                          onChange={(e) => updateChoice(scene.id, choiceIndex, 'nextScene', e.target.value)}
                          className="w-32 px-3 py-2 rounded-lg border border-gray-300 dark:border-dramatic-600 bg-white dark:bg-dramatic-700 text-gray-800 dark:text-gray-200"
                        >
                          <option value="">المشهد التالي</option>
                          {scenes.map((s, i) => (
                            <option key={s.id} value={s.id}>مشهد {i + 1}</option>
                          ))}
                          <option value="ending">نهاية</option>
                        </select>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => addChoice(scene.id)}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    + إضافة اختيار
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addScene}
                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-dramatic-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-colors"
              >
                + إضافة مشهد جديد
              </button>
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
