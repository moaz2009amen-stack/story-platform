import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function StoryPlayer() {
  const { storyId } = useParams()
  const navigate = useNavigate()
  
  const [story, setStory] = useState(null)
  const [currentScene, setCurrentScene] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState('ar')

  useEffect(() => {
    loadStory()
  }, [storyId])

  function loadStory() {
    setLoading(true)
    
    // محاكاة تحميل القصة من localStorage أو API
    setTimeout(() => {
      // قصة تجريبية للعرض
      const demoStory = {
        id: storyId,
        title: { ar: 'الغابة المسحورة', en: 'The Enchanted Forest' },
        description: { ar: 'مغامرة في غابة مليئة بالأسرار', en: 'An adventure in a forest full of secrets' },
        cover: 'https://images.pexels.com/photos/1671324/pexels-photo-1671324.jpeg',
        scenes: {
          start: {
            id: 'start',
            text: {
              ar: 'أنت تقف على حافة الغابة. الأشجار كثيفة والظلام يخيم على المكان. تسمع صوت جدول ماء من بعيد. ماذا تفعل؟',
              en: 'You stand at the edge of the forest. The trees are thick and darkness looms. You hear a stream in the distance. What do you do?'
            },
            image: 'https://images.pexels.com/photos/1671324/pexels-photo-1671324.jpeg',
            choices: [
              {
                text: { ar: '🔦 أدخل الغابة بحذر', en: '🔦 Enter the forest carefully' },
                nextScene: 'dark_path'
              },
              {
                text: { ar: '💧 أتبع صوت الماء', en: '💧 Follow the sound of water' },
                nextScene: 'river'
              }
            ]
          },
          dark_path: {
            id: 'dark_path',
            text: {
              ar: 'تدخل الغابة بحذر. الأشجار تحجب ضوء القمر. فجأة تتعثر بجذر شجرة وتسقط! الظلام يحيط بك من كل جانب...',
              en: 'You enter the forest carefully. Trees block the moonlight. Suddenly you trip over a root and fall! Darkness surrounds you...'
            },
            image: 'https://images.pexels.com/photos/2739662/pexels-photo-2739662.jpeg',
            isEnding: true,
            endingType: 'bad',
            endingMessage: {
              ar: 'لقد ضللت الطريق في الظلام... حاول مرة أخرى!',
              en: 'You got lost in the darkness... Try again!'
            }
          },
          river: {
            id: 'river',
            text: {
              ar: 'تصل إلى نهر صافٍ. القمر ينعكس على سطح الماء. ترى كوخاً صغيراً على الضفة الأخرى. ماذا تريد أن تفعل؟',
              en: 'You reach a clear river. The moon reflects on the water. You see a small hut on the other side. What do you want to do?'
            },
            image: 'https://images.pexels.com/photos/1547813/pexels-photo-1547813.jpeg',
            choices: [
              {
                text: { ar: '🏊 أسبح عبر النهر', en: '🏊 Swim across the river' },
                nextScene: 'swim'
              },
              {
                text: { ar: '🌉 أبحث عن جسر', en: '🌉 Look for a bridge' },
                nextScene: 'bridge'
              }
            ]
          },
          swim: {
            id: 'swim',
            text: {
              ar: 'تقرر السباحة عبر النهر. الماء بارد لكنك تصل إلى الضفة الأخرى بأمان. تدخل الكوخ وتجد كنزاً مخفياً!',
              en: 'You decide to swim across the river. The water is cold but you reach the other side safely. You enter the hut and find a hidden treasure!'
            },
            image: 'https://images.pexels.com/photos/1339871/pexels-photo-1339871.jpeg',
            isEnding: true,
            endingType: 'good',
            endingMessage: {
              ar: '🎉 مبروك! لقد وجدت الكنز! أنت بطل حقيقي!',
              en: '🎉 Congratulations! You found the treasure! You are a true hero!'
            }
          },
          bridge: {
            id: 'bridge',
            text: {
              ar: 'تجد جسراً خشبياً قديماً. تعبره بحذر وتصل إلى الكوخ. الباب مفتوح لكن المكان يبدو مهجوراً...',
              en: 'You find an old wooden bridge. You cross it carefully and reach the hut. The door is open but the place seems abandoned...'
            },
            image: 'https://images.pexels.com/photos/2773498/pexels-photo-2773498.jpeg',
            isEnding: true,
            endingType: 'neutral',
            endingMessage: {
              ar: 'الكوخ فارغ. ربما هناك مغامرة أخرى في مكان آخر...',
              en: 'The hut is empty. Maybe another adventure awaits elsewhere...'
            }
          }
        },
        firstScene: 'start'
      }
      
      setStory(demoStory)
      setCurrentScene(demoStory.scenes[demoStory.firstScene])
      setLoading(false)
    }, 1000)
  }

  function handleChoice(choice) {
    if (!story || !currentScene) return
    
    // حفظ المشهد الحالي في التاريخ
    setHistory([...history, currentScene.id])
    
    // الانتقال للمشهد التالي
    const nextScene = story.scenes[choice.nextScene]
    setCurrentScene(nextScene)
  }

  function handleRestart() {
    if (!story) return
    setCurrentScene(story.scenes[story.firstScene])
    setHistory([])
  }

  function handleGoBack() {
    if (history.length === 0) return
    
    const previousSceneId = history[history.length - 1]
    setCurrentScene(story.scenes[previousSceneId])
    setHistory(history.slice(0, -1))
  }

  function shareStory() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: story?.title?.[language] || 'قصة تفاعلية',
        text: story?.description?.[language] || 'جرب هذه القصة التفاعلية!',
        url: url
      })
    } else {
      navigator.clipboard?.writeText(url)
      alert('تم نسخ الرابط!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">📖</div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {language === 'ar' ? 'جاري تحميل القصة...' : 'Loading story...'}
          </p>
        </div>
      </div>
    )
  }

  if (!story || !currentScene) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-2xl mb-4">😕</p>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {language === 'ar' ? 'لم يتم العثور على القصة' : 'Story not found'}
          </p>
          <button onClick={() => navigate('/')} className="btn-primary">
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    )
  }

  const sceneText = currentScene.text?.[language] || currentScene.text?.ar || ''
  const title = story.title?.[language] || story.title?.ar || ''

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            ← {language === 'ar' ? 'العودة للقصص' : 'Back to Stories'}
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              {language === 'ar' ? '🇬🇧 English' : '🇸🇦 عربي'}
            </button>
            
            <button
              onClick={shareStory}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              📤 {language === 'ar' ? 'مشاركة' : 'Share'}
            </button>
            
            {history.length > 0 && (
              <button
                onClick={handleGoBack}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                ↩️ {language === 'ar' ? 'تراجع' : 'Back'}
              </button>
            )}
            
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              🔄 {language === 'ar' ? 'من البداية' : 'Restart'}
            </button>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          {title}
        </h2>

        {/* Scene Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Scene Image */}
            {currentScene.image && (
              <div className="relative h-64 md:h-80">
                <img
                  src={currentScene.image}
                  alt="Scene"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            )}

            {/* Scene Content */}
            <div className="p-6 md:p-8">
              <p className="text-lg md:text-xl leading-relaxed text-gray-800 dark:text-gray-200 mb-8">
                {sceneText}
              </p>

              {/* Choices or Ending */}
              {!currentScene.isEnding ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {language === 'ar' ? 'اختر مسارك:' : 'Choose your path:'}
                  </p>
                  {currentScene.choices?.map((choice, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleChoice(choice)}
                      className="w-full text-right p-4 rounded-lg bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-gray-600 transition-all duration-200 font-medium text-lg"
                    >
                      {choice.text?.[language] || choice.text?.ar || choice.text}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="text-6xl mb-4">
                    {currentScene.endingType === 'good' ? '🎉' : 
                     currentScene.endingType === 'bad' ? '💀' : '📖'}
                  </div>
                  <p className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                    {language === 'ar' ? 'النهاية' : 'The End'}
                  </p>
                  {currentScene.endingMessage && (
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {currentScene.endingMessage?.[language] || currentScene.endingMessage?.ar || ''}
                    </p>
                  )}
                  <div className="flex gap-4 justify-center flex-wrap">
                    <button 
                      onClick={handleRestart} 
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
                    >
                      {language === 'ar' ? '🔄 ابدأ من جديد' : '🔄 Start Over'}
                    </button>
                    <button 
                      onClick={() => navigate('/')} 
                      className="border-2 border-purple-600 text-purple-600 dark:text-purple-400 font-bold py-3 px-6 rounded-lg hover:bg-purple-600 hover:text-white transition-all"
                    >
                      {language === 'ar' ? '📚 اختر قصة أخرى' : '📚 Choose Another Story'}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress */}
        {!currentScene.isEnding && (
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {language === 'ar' ? `المشهد ${history.length + 1}` : `Scene ${history.length + 1}`}
          </div>
        )}
      </div>
    </div>
  )
}
