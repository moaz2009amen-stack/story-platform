import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function CreateStory() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1:基本信息, 2:المشاهد, 3:معاينة
  const [language, setLanguage] = useState('ar')
  
  const [story, setStory] = useState({
    title: { ar: '', en: '' },
    description: { ar: '', en: '' },
    cover: 'https://images.pexels.com/photos/1671324/pexels-photo-1671324.jpeg'
  })

  const [scenes, setScenes] = useState([
    {
      id: 'scene_' + Date.now(),
      title: { ar: 'المشهد الأول', en: 'First Scene' },
      text: { ar: '', en: '' },
      image: '',
      isStart: true,
      isEnding: false,
      endingType: 'neutral',
      endingMessage: { ar: '', en: '' },
      choices: []
    }
  ])

  const [selectedSceneId, setSelectedSceneId] = useState(scenes[0].id)
  const [showSceneModal, setShowSceneModal] = useState(false)
  const [showChoiceModal, setShowChoiceModal] = useState(false)
  const [editingScene, setEditingScene] = useState(null)
  const [editingChoice, setEditingChoice] = useState(null)

  // دالة إضافة مشهد جديد
  function addScene() {
    const newScene = {
      id: 'scene_' + Date.now(),
      title: { ar: `مشهد ${scenes.length + 1}`, en: `Scene ${scenes.length + 1}` },
      text: { ar: '', en: '' },
      image: '',
      isStart: false,
      isEnding: false,
      endingType: 'neutral',
      endingMessage: { ar: '', en: '' },
      choices: []
    }
    setScenes([...scenes, newScene])
    setSelectedSceneId(newScene.id)
  }

  // دالة حذف مشهد
  function deleteScene(sceneId) {
    if (scenes.length <= 1) {
      alert(language === 'ar' ? 'يجب أن تحتوي القصة على مشهد واحد على الأقل' : 'Story must have at least one scene')
      return
    }
    const updated = scenes.filter(s => s.id !== sceneId)
    setScenes(updated)
    if (selectedSceneId === sceneId) {
      setSelectedSceneId(updated[0].id)
    }
  }

  // دالة تحديث مشهد
  function updateScene(sceneId, field, value) {
    setScenes(scenes.map(s => 
      s.id === sceneId ? { ...s, [field]: value } : s
    ))
  }

  // دالة تحديث نص متعدد اللغات
  function updateSceneText(sceneId, field, lang, value) {
    setScenes(scenes.map(s => 
      s.id === sceneId ? { 
        ...s, 
        [field]: { ...s[field], [lang]: value } 
      } : s
    ))
  }

  // دالة إضافة اختيار
  function addChoice(sceneId) {
    const newChoice = {
      id: 'choice_' + Date.now(),
      text: { ar: 'اختيار جديد', en: 'New Choice' },
      nextScene: scenes.find(s => s.id !== sceneId)?.id || null
    }
    setScenes(scenes.map(s => 
      s.id === sceneId ? { ...s, choices: [...s.choices, newChoice] } : s
    ))
  }

  // دالة حذف اختيار
  function deleteChoice(sceneId, choiceId) {
    setScenes(scenes.map(s => 
      s.id === sceneId ? { 
        ...s, 
        choices: s.choices.filter(c => c.id !== choiceId) 
      } : s
    ))
  }

  // دالة تحديث اختيار
  function updateChoice(sceneId, choiceId, field, value) {
    setScenes(scenes.map(s => 
      s.id === sceneId ? {
        ...s,
        choices: s.choices.map(c => 
          c.id === choiceId ? { ...c, [field]: value } : c
        )
      } : s
    ))
  }

  // دالة حفظ القصة
  function handleSave() {
    // التحقق من البيانات
    if (!story.title.ar) {
      alert('يرجى إدخال عنوان القصة بالعربية')
      return
    }

    const storyData = {
      id: Date.now().toString(),
      ...story,
      scenes: scenes.reduce((acc, scene) => {
        acc[scene.id] = scene
        return acc
      }, {}),
      firstScene: scenes.find(s => s.isStart)?.id || scenes[0].id,
      created_at: new Date().toISOString(),
      author: 'مستخدم'
    }

    // حفظ في localStorage
    const existingStories = JSON.parse(localStorage.getItem('userStories') || '[]')
    localStorage.setItem('userStories', JSON.stringify([...existingStories, storyData]))
    
    alert(language === 'ar' ? '🎉 تم حفظ القصة بنجاح!' : '🎉 Story saved successfully!')
    navigate('/')
  }

  // الحصول على المشهد المحدد
  const selectedScene = scenes.find(s => s.id === selectedSceneId)

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
                ← {language === 'ar' ? 'رجوع' : 'Back'}
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                ✍️ {language === 'ar' ? 'إنشاء قصة جديدة' : 'Create New Story'}
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                {language === 'ar' ? 'English' : 'عربي'}
              </button>
              <button
                onClick={() => setStep(1)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  step === 1 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                1️⃣ {language === 'ar' ? 'أساسي' : 'Basic'}
              </button>
              <button
                onClick={() => setStep(2)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  step === 2 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                2️⃣ {language === 'ar' ? 'مشاهد' : 'Scenes'}
              </button>
              <button
                onClick={() => setStep(3)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  step === 3 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                3️⃣ {language === 'ar' ? 'معاينة' : 'Preview'}
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
              >
                💾 {language === 'ar' ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                📖 {language === 'ar' ? 'معلومات القصة' : 'Story Information'}
              </h2>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      العنوان (عربي) *
                    </label>
                    <input
                      type="text"
                      value={story.title.ar}
                      onChange={(e) => setStory({ ...story, title: { ...story.title, ar: e.target.value } })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="أدخل عنوان القصة"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title (English)
                    </label>
                    <input
                      type="text"
                      value={story.title.en}
                      onChange={(e) => setStory({ ...story, title: { ...story.title, en: e.target.value } })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter story title"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الوصف (عربي)
                    </label>
                    <textarea
                      rows="3"
                      value={story.description.ar}
                      onChange={(e) => setStory({ ...story, description: { ...story.description, ar: e.target.value } })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="اكتب وصفاً للقصة"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (English)
                    </label>
                    <textarea
                      rows="3"
                      value={story.description.en}
                      onChange={(e) => setStory({ ...story, description: { ...story.description, en: e.target.value } })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter story description"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🖼️ {language === 'ar' ? 'صورة الغلاف' : 'Cover Image'}
                  </label>
                  <input
                    type="text"
                    value={story.cover}
                    onChange={(e) => setStory({ ...story, cover: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="رابط الصورة"
                  />
                  {story.cover && (
                    <img src={story.cover} alt="Cover" className="mt-3 h-32 object-cover rounded-lg" />
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  {language === 'ar' ? 'التالي: المشاهد' : 'Next: Scenes'} →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Scenes */}
          {step === 2 && (
            <div className="flex gap-6">
              {/* Sidebar - قائمة المشاهد */}
              <div className="w-64 shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      📋 {language === 'ar' ? 'المشاهد' : 'Scenes'}
                    </h3>
                    <button
                      onClick={addScene}
                      className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center hover:bg-purple-700"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {scenes.map((scene, index) => (
                      <button
                        key={scene.id}
                        onClick={() => setSelectedSceneId(scene.id)}
                        className={`w-full text-right p-3 rounded-lg transition-all ${
                          selectedSceneId === scene.id
                            ? 'bg-purple-100 dark:bg-purple-900/50 border-2 border-purple-500'
                            : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {index + 1}. {scene.title?.[language] || scene.title?.ar || `مشهد ${index + 1}`}
                          </span>
                          {scene.isStart && <span className="text-green-500 text-xs">🚀</span>}
                          {scene.isEnding && <span className="text-red-500 text-xs">🏁</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main - تحرير المشهد */}
              <div className="flex-1">
                {selectedScene && (
                  <motion.div
                    key={selectedScene.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
                  >
                    {/* عنوان المشهد */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={selectedScene.title?.[language] || ''}
                          onChange={(e) => updateSceneText(selectedScene.id, 'title', language, e.target.value)}
                          className="text-xl font-bold bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-purple-500 outline-none px-2 py-1 w-full"
                          placeholder={language === 'ar' ? 'عنوان المشهد' : 'Scene title'}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateScene(selectedScene.id, 'isStart', !selectedScene.isStart)}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            selectedScene.isStart
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          🚀 {language === 'ar' ? 'بداية' : 'Start'}
                        </button>
                        <button
                          onClick={() => updateScene(selectedScene.id, 'isEnding', !selectedScene.isEnding)}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            selectedScene.isEnding
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          🏁 {language === 'ar' ? 'نهاية' : 'Ending'}
                        </button>
                        {scenes.length > 1 && (
                          <button
                            onClick={() => deleteScene(selectedScene.id)}
                            className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg text-sm"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>

                    {/* نص المشهد */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'ar' ? 'نص المشهد' : 'Scene Text'}
                      </label>
                      <textarea
                        rows="4"
                        value={selectedScene.text?.[language] || ''}
                        onChange={(e) => updateSceneText(selectedScene.id, 'text', language, e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        placeholder={language === 'ar' ? 'اكتب نص المشهد هنا...' : 'Write scene text here...'}
                      />
                    </div>

                    {/* صورة المشهد */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        🖼️ {language === 'ar' ? 'صورة المشهد (اختياري)' : 'Scene Image (Optional)'}
                      </label>
                      <input
                        type="text"
                        value={selectedScene.image || ''}
                        onChange={(e) => updateScene(selectedScene.id, 'image', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="رابط الصورة"
                      />
                    </div>

                    {/* نهاية - إعدادات خاصة */}
                    {selectedScene.isEnding && (
                      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'نوع النهاية' : 'Ending Type'}
                        </label>
                        <select
                          value={selectedScene.endingType || 'neutral'}
                          onChange={(e) => updateScene(selectedScene.id, 'endingType', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
                        >
                          <option value="good">😊 {language === 'ar' ? 'جيدة' : 'Good'}</option>
                          <option value="bad">😢 {language === 'ar' ? 'سيئة' : 'Bad'}</option>
                          <option value="neutral">😐 {language === 'ar' ? 'محايدة' : 'Neutral'}</option>
                        </select>
                        
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {language === 'ar' ? 'رسالة النهاية' : 'Ending Message'}
                        </label>
                        <textarea
                          rows="2"
                          value={selectedScene.endingMessage?.[language] || ''}
                          onChange={(e) => updateSceneText(selectedScene.id, 'endingMessage', language, e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder={language === 'ar' ? 'رسالة تظهر عند النهاية...' : 'Message shown at the end...'}
                        />
                      </div>
                    )}

                    {/* الاختيارات */}
                    {!selectedScene.isEnding && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            🔀 {language === 'ar' ? 'الاختيارات' : 'Choices'}
                          </label>
                          <button
                            onClick={() => addChoice(selectedScene.id)}
                            className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm"
                          >
                            + {language === 'ar' ? 'إضافة اختيار' : 'Add Choice'}
                          </button>
                        </div>

                        <div className="space-y-3">
                          {selectedScene.choices?.map((choice) => (
                            <div key={choice.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex gap-2 mb-2">
                                <input
                                  type="text"
                                  value={choice.text?.[language] || ''}
                                  onChange={(e) => {
                                    const updated = { ...choice.text, [language]: e.target.value }
                                    updateChoice(selectedScene.id, choice.id, 'text', updated)
                                  }}
                                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                  placeholder={language === 'ar' ? 'نص الاختيار' : 'Choice text'}
                                />
                                <button
                                  onClick={() => deleteChoice(selectedScene.id, choice.id)}
                                  className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                >
                                  🗑️
                                </button>
                              </div>
                              <select
                                value={choice.nextScene || ''}
                                onChange={(e) => updateChoice(selectedScene.id, choice.id, 'nextScene', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              >
                                <option value="">{language === 'ar' ? '-- اختر المشهد التالي --' : '-- Select next scene --'}</option>
                                {scenes.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.title?.[language] || s.title?.ar || s.id}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                👁️ {language === 'ar' ? 'معاينة القصة' : 'Story Preview'}
              </h2>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <img src={story.cover} alt="Cover" className="w-full h-48 object-cover rounded-lg mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {story.title[language] || story.title.ar || (language === 'ar' ? 'بدون عنوان' : 'Untitled')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {story.description[language] || story.description.ar || ''}
                </p>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {language === 'ar' ? `عدد المشاهد: ${scenes.length}` : `Scenes: ${scenes.length}`}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    {language === 'ar' ? `مشهد البداية: ${scenes.find(s => s.isStart)?.title?.[language] || 'غير محدد'}` : `Start scene: ${scenes.find(s => s.isStart)?.title?.[language] || 'Not set'}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {language === 'ar' ? `النهايات: ${scenes.filter(s => s.isEnding).length}` : `Endings: ${scenes.filter(s => s.isEnding).length}`}
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  ← {language === 'ar' ? 'السابق' : 'Back'}
                </button>
                <button
                  onClick={handleSave}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  💾 {language === 'ar' ? 'حفظ ونشر' : 'Save & Publish'}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
