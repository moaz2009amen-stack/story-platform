import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useStory, useCreateStory, useUpdateStory } from '../hooks/useStories'
import { uploadCoverImage, uploadSceneImage } from '../lib/uploadImage'
import { translateText, translateObject } from '../lib/translate'
import { searchUnsplash } from '../lib/unsplashProxy'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiUpload, FiImage, FiPlus, FiTrash2, FiChevronRight, FiChevronLeft, FiCheck, FiGlobe, FiX, FiSearch } from 'react-icons/fi'

const categories = ['مغامرة', 'خيال', 'رومانسية', 'رعب', 'خيال علمي', 'دراما', 'كوميديا', 'تاريخي']

const CreateStory = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: existingStory } = useStory(id)
  const createStory = useCreateStory()
  const updateStory = useUpdateStory()
  
  const [step, setStep] = useState(1)
  const [storyType, setStoryType] = useState('normal')
  const [title, setTitle] = useState({ ar: '', en: '' })
  const [description, setDescription] = useState({ ar: '', en: '' })
  const [category, setCategory] = useState('')
  const [readingTime, setReadingTime] = useState(5)
  const [coverImage, setCoverImage] = useState('')
  const [scenes, setScenes] = useState([])
  const [firstScene, setFirstScene] = useState('')
  const [isDraft, setIsDraft] = useState(true)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [translating, setTranslating] = useState(false)
  const [unsplashQuery, setUnsplashQuery] = useState('')
  const [unsplashImages, setUnsplashImages] = useState([])
  const [showUnsplash, setShowUnsplash] = useState(false)

  useEffect(() => {
    if (existingStory) {
      setStoryType(existingStory.story_type || 'normal')
      setTitle(existingStory.title || { ar: '', en: '' })
      setDescription(existingStory.description || { ar: '', en: '' })
      setCategory(existingStory.category || '')
      setReadingTime(existingStory.reading_time || 5)
      setCoverImage(existingStory.cover_image || '')
      setScenes(existingStory.scenes || [])
      setFirstScene(existingStory.first_scene || '')
    } else {
      // Add initial scene for new story
      addScene()
    }
  }, [existingStory])

  const addScene = () => {
    const newSceneId = `scene_${Date.now()}_${scenes.length}`
    setScenes([...scenes, {
      id: newSceneId,
      title: { ar: '', en: '' },
      content: { ar: '', en: '' },
      image: '',
      choices: storyType === 'interactive' ? [] : undefined,
      isEnding: false,
      endingType: 'neutral',
      endingMessage: '',
    }])
  }

  const updateScene = (index, field, value) => {
    const updated = [...scenes]
    updated[index] = { ...updated[index], [field]: value }
    setScenes(updated)
  }

  const updateSceneText = (index, field, lang, value) => {
    const updated = [...scenes]
    updated[index] = {
      ...updated[index],
      [field]: { ...updated[index][field], [lang]: value }
    }
    setScenes(updated)
  }

  const addChoice = (sceneIndex) => {
    const updated = [...scenes]
    updated[sceneIndex].choices.push({
      id: `choice_${Date.now()}_${updated[sceneIndex].choices.length}`,
      text: { ar: '', en: '' },
      nextScene: '',
    })
    setScenes(updated)
  }

  const updateChoice = (sceneIndex, choiceIndex, field, value) => {
    const updated = [...scenes]
    updated[sceneIndex].choices[choiceIndex][field] = value
    setScenes(updated)
  }

  const removeChoice = (sceneIndex, choiceIndex) => {
    const updated = [...scenes]
    updated[sceneIndex].choices.splice(choiceIndex, 1)
    setScenes(updated)
  }

  const removeScene = (index) => {
    if (scenes.length <= 1) {
      toast.error('يجب أن يكون هناك مشهد واحد على الأقل')
      return
    }
    const updated = scenes.filter((_, i) => i !== index)
    setScenes(updated)
    if (firstScene === scenes[index].id) {
      setFirstScene(updated[0]?.id || '')
    }
  }

  const handleTranslateField = async (text, from, to, setter) => {
    if (!text) return
    setTranslating(true)
    try {
      const translated = await translateText(text, from, to)
      setter(translated)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setTranslating(false)
    }
  }

  const handleTranslateTitle = () => {
    if (title.ar && !title.en) {
      handleTranslateField(title.ar, 'ar', 'en', (translated) => setTitle({ ...title, en: translated }))
    } else if (title.en && !title.ar) {
      handleTranslateField(title.en, 'en', 'ar', (translated) => setTitle({ ...title, ar: translated }))
    }
  }

  const handleTranslateDescription = () => {
    if (description.ar && !description.en) {
      handleTranslateField(description.ar, 'ar', 'en', (translated) => setDescription({ ...description, en: translated }))
    } else if (description.en && !description.ar) {
      handleTranslateField(description.en, 'en', 'ar', (translated) => setDescription({ ...description, ar: translated }))
    }
  }

  const handleUploadCover = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadCoverImage(file)
      setCoverImage(url)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleUploadSceneImage = async (index, file) => {
    setUploading(true)
    try {
      const url = await uploadSceneImage(file)
      updateScene(index, 'image', url)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  const searchUnsplashImages = async () => {
    if (!unsplashQuery) return
    setUploading(true)
    try {
      const images = await searchUnsplash(unsplashQuery)
      setUnsplashImages(images)
    } catch (error) {
      toast.error('فشل البحث عن الصور')
    } finally {
      setUploading(false)
    }
  }

  const selectUnsplashImage = (url) => {
    if (showUnsplash === 'cover') {
      setCoverImage(url)
    } else if (typeof showUnsplash === 'number') {
      updateScene(showUnsplash, 'image', url)
    }
    setShowUnsplash(false)
    setUnsplashImages([])
  }

  const validateStory = () => {
    if (!title.ar && !title.en) {
      toast.error('يرجى إضافة عنوان للقصة')
      return false
    }
    if (!category) {
      toast.error('يرجى اختيار تصنيف للقصة')
      return false
    }
    if (scenes.length === 0) {
      toast.error('يرجى إضافة مشهد واحد على الأقل')
      return false
    }
    if (!firstScene) {
      toast.error('يرجى تحديد مشهد البداية')
      return false
    }
    
    for (const scene of scenes) {
      if (!scene.title.ar && !scene.title.en) {
        toast.error('يرجى إضافة عنوان لجميع المشاهد')
        return false
      }
      if (!scene.content.ar && !scene.content.en) {
        toast.error('يرجى إضافة محتوى لجميع المشاهد')
        return false
      }
    }

    if (storyType === 'interactive') {
      for (const scene of scenes) {
        if (!scene.isEnding && scene.choices && scene.choices.length === 0) {
          toast.error(`المشهد "${scene.title.ar || scene.title.en}" يجب أن يحتوي على اختيارات أو يكون مشهد نهاية`)
          return false
        }
      }
    }

    return true
  }

  const handleSave = async (publish = false) => {
    if (!validateStory()) return

    setLoading(true)
    try {
      const storyData = {
        title,
        description,
        category,
        reading_time: readingTime,
        cover_image: coverImage,
        story_type: storyType,
        scenes,
        first_scene: firstScene,
        is_published: publish,
        is_draft: !publish,
        author_id: user.id,
      }

      if (id) {
        await updateStory.mutateAsync({ id, updates: storyData })
      } else {
        await createStory.mutateAsync(storyData)
      }
      
      navigate('/profile?tab=stories')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{id ? 'تعديل القصة' : 'إنشاء قصة جديدة'}</h1>
        <p className="text-[var(--text-muted)]">الخطوة {step} من 3</p>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all ${
                step >= i ? 'bg-gold-500' : 'bg-[var(--bg-surface)]'
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Story Type */}
            <div>
              <label className="block font-semibold mb-2">نوع القصة</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setStoryType('normal')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    storyType === 'normal'
                      ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20'
                      : 'border-[var(--border-light)]'
                  }`}
                >
                  <div className="text-2xl mb-2">📖</div>
                  <div className="font-bold">قصة عادية</div>
                  <div className="text-xs text-[var(--text-muted)]">تقرأ من البداية للنهاية</div>
                </button>
                <button
                  type="button"
                  onClick={() => setStoryType('interactive')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    storyType === 'interactive'
                      ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20'
                      : 'border-[var(--border-light)]'
                  }`}
                >
                  <div className="text-2xl mb-2">🔀</div>
                  <div className="font-bold">قصة تفاعلية</div>
                  <div className="text-xs text-[var(--text-muted)]">القراء يختارون مسار القصة</div>
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block font-semibold mb-2">العنوان</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={title.ar}
                    onChange={(e) => setTitle({ ...title, ar: e.target.value })}
                    className="input-base flex-1"
                    placeholder="العنوان بالعربية"
                  />
                  <input
                    type="text"
                    value={title.en}
                    onChange={(e) => setTitle({ ...title, en: e.target.value })}
                    className="input-base flex-1"
                    placeholder="Title in English"
                  />
                  <button
                    type="button"
                    onClick={handleTranslateTitle}
                    disabled={translating || (!title.ar && !title.en)}
                    className="px-4 bg-gold-500 text-white rounded-lg hover:bg-gold-600 disabled:opacity-50"
                  >
                    <FiGlobe />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold mb-2">الوصف</label>
              <div className="space-y-2">
                <textarea
                  value={description.ar}
                  onChange={(e) => setDescription({ ...description, ar: e.target.value })}
                  className="input-base"
                  rows="3"
                  placeholder="وصف القصة بالعربية"
                />
                <textarea
                  value={description.en}
                  onChange={(e) => setDescription({ ...description, en: e.target.value })}
                  className="input-base"
                  rows="3"
                  placeholder="Story description in English"
                />
                <button
                  type="button"
                  onClick={handleTranslateDescription}
                  disabled={translating || (!description.ar && !description.en)}
                  className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 disabled:opacity-50 flex items-center gap-2"
                >
                  <FiGlobe />
                  {translating ? 'جاري الترجمة...' : 'ترجمة'}
                </button>
              </div>
            </div>

            {/* Category & Reading Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">التصنيف</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-base">
                  <option value="">اختر تصنيفاً</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-2">وقت القراءة (دقائق)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={readingTime}
                  onChange={(e) => setReadingTime(parseInt(e.target.value))}
                  className="input-base"
                />
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block font-semibold mb-2">صورة الغلاف</label>
              <div className="flex gap-4 items-start">
                {coverImage && (
                  <img src={coverImage} alt="Cover" className="w-32 h-32 object-cover rounded-lg" />
                )}
                <div className="flex-1 space-y-2">
                  <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer">
                    <FiUpload />
                    رفع من الجهاز
                    <input type="file" accept="image/*" onChange={handleUploadCover} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => { setShowUnsplash('cover'); searchUnsplashImages() }}
                    className="btn-secondary inline-flex items-center gap-2 mr-2"
                  >
                    <FiImage />
                    اختيار من Unsplash
                  </button>
                  {uploading && <p className="text-sm text-[var(--text-muted)]">جاري الرفع...</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setStep(2)} className="btn-primary flex items-center gap-2">
                التالي
                <FiChevronLeft />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Scenes */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">المشاهد</h2>
              <button onClick={addScene} className="btn-primary text-sm py-2 flex items-center gap-2">
                <FiPlus />
                إضافة مشهد
              </button>
            </div>

            {scenes.map((scene, index) => (
              <div key={scene.id} className="card p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">المشهد {index + 1}</h3>
                  <button onClick={() => removeScene(index)} className="text-red-500 hover:text-red-600">
                    <FiTrash2 />
                  </button>
                </div>

                {/* Scene Title */}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={scene.title.ar}
                    onChange={(e) => updateSceneText(index, 'title', 'ar', e.target.value)}
                    className="input-base text-sm"
                    placeholder="عنوان المشهد (عربي)"
                  />
                  <input
                    type="text"
                    value={scene.title.en}
                    onChange={(e) => updateSceneText(index, 'title', 'en', e.target.value)}
                    className="input-base text-sm"
                    placeholder="Scene title (English)"
                  />
                </div>

                {/* Scene Content */}
                <div className="space-y-2">
                  <textarea
                    value={scene.content.ar}
                    onChange={(e) => updateSceneText(index, 'content', 'ar', e.target.value)}
                    className="input-base text-sm"
                    rows="3"
                    placeholder="محتوى المشهد (عربي)"
                  />
                  <textarea
                    value={scene.content.en}
                    onChange={(e) => updateSceneText(index, 'content', 'en', e.target.value)}
                    className="input-base text-sm"
                    rows="3"
                    placeholder="Scene content (English)"
                  />
                </div>

                {/* Scene Image */}
                <div>
                  <label className="block text-sm font-semibold mb-1">صورة المشهد</label>
                  <div className="flex gap-2">
                    {scene.image && (
                      <img src={scene.image} alt="Scene" className="w-16 h-16 object-cover rounded" />
                    )}
                    <label className="btn-secondary text-xs py-1 cursor-pointer">
                      رفع صورة
                      <input type="file" accept="image/*" onChange={(e) => handleUploadSceneImage(index, e.target.files[0])} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => { setShowUnsplash(index); setUnsplashQuery(scene.title.ar || 'story'); searchUnsplashImages() }}
                      className="btn-secondary text-xs py-1"
                    >
                      Unsplash
                    </button>
                  </div>
                </div>

                {/* Interactive Choices */}
                {storyType === 'interactive' && (
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={scene.isEnding || false}
                          onChange={(e) => updateScene(index, 'isEnding', e.target.checked)}
                        />
                        مشهد نهاية
                      </label>
                    </div>

                    {scene.isEnding ? (
                      <div className="space-y-2">
                        <select
                          value={scene.endingType || 'neutral'}
                          onChange={(e) => updateScene(index, 'endingType', e.target.value)}
                          className="input-base text-sm"
                        >
                          <option value="success">نهاية ناجحة 🎉</option>
                          <option value="failure">نهاية فاشلة 💀</option>
                          <option value="neutral">نهاية محايدة 📖</option>
                        </select>
                        <input
                          type="text"
                          value={scene.endingMessage || ''}
                          onChange={(e) => updateScene(index, 'endingMessage', e.target.value)}
                          className="input-base text-sm"
                          placeholder="رسالة النهاية (اختياري)"
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="font-semibold text-sm">الاختيارات</div>
                        {scene.choices?.map((choice, ci) => (
                          <div key={choice.id} className="flex gap-2 items-start">
                            <div className="flex-1 space-y-1">
                              <input
                                type="text"
                                value={choice.text.ar}
                                onChange={(e) => updateChoice(index, ci, 'text', { ...choice.text, ar: e.target.value })}
                                className="input-base text-sm"
                                placeholder="النص (عربي)"
                              />
                              <input
                                type="text"
                                value={choice.text.en}
                                onChange={(e) => updateChoice(index, ci, 'text', { ...choice.text, en: e.target.value })}
                                className="input-base text-sm"
                                placeholder="Text (English)"
                              />
                              <select
                                value={choice.nextScene}
                                onChange={(e) => updateChoice(index, ci, 'nextScene', e.target.value)}
                                className="input-base text-sm"
                              >
                                <option value="">اختر المشهد التالي</option>
                                {scenes.map(s => (
                                  <option key={s.id} value={s.id}>
                                    {s.title.ar || s.title.en || `المشهد ${scenes.indexOf(s) + 1}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button onClick={() => removeChoice(index, ci)} className="text-red-500 mt-2">
                              <FiTrash2 />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addChoice(index)}
                          className="text-gold-500 text-sm flex items-center gap-1 hover:underline"
                        >
                          <FiPlus /> إضافة اختيار
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* First Scene Selection */}
            <div>
              <label className="block font-semibold mb-2">مشهد البداية</label>
              <select value={firstScene} onChange={(e) => setFirstScene(e.target.value)} className="input-base">
                <option value="">اختر مشهد البداية</option>
                {scenes.map(scene => (
                  <option key={scene.id} value={scene.id}>
                    {scene.title.ar || scene.title.en || scene.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2">
                <FiChevronRight />
                السابق
              </button>
              <button onClick={() => setStep(3)} className="btn-primary flex items-center gap-2">
                التالي
                <FiChevronLeft />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Review & Publish */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="card p-6 space-y-4">
              <h2 className="text-xl font-bold">مراجعة القصة</h2>
              
              <div>
                <div className="font-semibold">العنوان</div>
                <p>{title.ar || title.en}</p>
              </div>
              
              <div>
                <div className="font-semibold">الوصف</div>
                <p>{description.ar || description.en}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold">التصنيف</div>
                  <p>{category}</p>
                </div>
                <div>
                  <div className="font-semibold">وقت القراءة</div>
                  <p>{readingTime} دقائق</p>
                </div>
              </div>
              
              <div>
                <div className="font-semibold">عدد المشاهد</div>
                <p>{scenes.length} مشهد</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleSave(true)}
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {loading ? 'جاري النشر...' : 'نشر القصة'}
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={loading}
                className="btn-secondary flex-1 disabled:opacity-50"
              >
                حفظ كمسودة
              </button>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="btn-secondary flex items-center gap-2">
                <FiChevronRight />
                السابق
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unsplash Modal */}
      {showUnsplash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowUnsplash(false)}>
          <div className="bg-[var(--bg-elevated)] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-[var(--border-light)] flex justify-between items-center">
              <h3 className="font-bold">اختر صورة من Unsplash</h3>
              <button onClick={() => setShowUnsplash(false)} className="text-[var(--text-muted)] hover:text-gold-500">
                <FiX />
              </button>
            </div>
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={unsplashQuery}
                  onChange={(e) => setUnsplashQuery(e.target.value)}
                  className="input-base flex-1"
                  placeholder="ابحث عن صورة..."
                />
                <button onClick={searchUnsplashImages} className="btn-primary">بحث</button>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {unsplashImages.map(img => (
                  <img
                    key={img.id}
                    src={img.thumb}
                    alt={img.alt}
                    className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                    onClick={() => selectUnsplashImage(img.url)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateStory
