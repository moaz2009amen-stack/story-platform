import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useStory, useFavoriteStory, useIsFavorited, useRateStory, useAverageRating } from '../hooks/useStories'
import { readingHelpers, ratingsHelpers, storyHelpers } from '../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiArrowRight, FiHeart, FiShare2, FiStar, FiRotateCcw, FiFlag, FiBookmark, FiChevronRight } from 'react-icons/fi'
import VerifiedBadge from '../components/VerifiedBadge'
import CommentSection from '../components/Comments/CommentSection'

const StoryPlayer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { data: story, isLoading, refetch } = useStory(id)
  const { mutate: toggleFavorite } = useFavoriteStory()
  const { data: isFavorited } = useIsFavorited(user?.id, id)
  const { data: avgRating } = useAverageRating(id)
  const rateStory = useRateStory()
  
  const [currentSceneId, setCurrentSceneId] = useState(null)
  const [currentScene, setCurrentScene] = useState(null)
  const [history, setHistory] = useState([])
  const [language, setLanguage] = useState('ar')
  const [showRating, setShowRating] = useState(false)
  const [userRating, setUserRating] = useState(null)
  const [ratingValue, setRatingValue] = useState(0)
  const [ratingReview, setRatingReview] = useState('')
  const [progress, setProgress] = useState(0)

  // Load saved progress
  useEffect(() => {
    if (user && id) {
      const loadProgress = async () => {
        const saved = await readingHelpers.getProgress(user.id, id)
        if (saved) {
          setCurrentSceneId(saved.current_scene)
          setProgress(saved.progress)
        } else if (story?.first_scene) {
          setCurrentSceneId(story.first_scene)
        }
      }
      loadProgress()
    } else if (story?.first_scene) {
      setCurrentSceneId(story.first_scene)
    }
  }, [user, story, id])

  // Load user rating
  useEffect(() => {
    if (user && id) {
      const loadRating = async () => {
        const rating = await ratingsHelpers.getUserRating(user.id, id)
        if (rating) {
          setUserRating(rating)
        }
      }
      loadRating()
    }
  }, [user, id])

  // Update current scene when sceneId changes
  useEffect(() => {
    if (story?.scenes && currentSceneId) {
      const scene = story.scenes.find(s => s.id === currentSceneId)
      setCurrentScene(scene)
      
      // Increment view count on first scene
      if (currentSceneId === story.first_scene && !sessionStorage.getItem(`story_${id}_viewed`)) {
        storyHelpers.incrementViews(id)
        sessionStorage.setItem(`story_${id}_viewed`, 'true')
      }
    }
  }, [story, currentSceneId, id])

  // Save progress
  const saveProgress = useCallback(async (sceneId, newProgress) => {
    if (user && id) {
      await readingHelpers.saveProgress(user.id, id, sceneId, newProgress)
    }
    // Save to localStorage for guests
    localStorage.setItem(`story_${id}_progress`, JSON.stringify({ sceneId, progress: newProgress }))
  }, [user, id])

  const handleChoice = (choice) => {
    if (!choice.nextScene) {
      toast.error('هذا الاختيار لم يتم ربطه بعد')
      return
    }
    
    setHistory([...history, currentSceneId])
    setCurrentSceneId(choice.nextScene)
    
    // Calculate progress based on scene index
    const sceneIndex = story.scenes.findIndex(s => s.id === choice.nextScene)
    const newProgress = Math.floor((sceneIndex / story.scenes.length) * 100)
    setProgress(newProgress)
    saveProgress(choice.nextScene, newProgress)
  }

  const goBack = () => {
    if (history.length > 0) {
      const previous = history[history.length - 1]
      setHistory(history.slice(0, -1))
      setCurrentSceneId(previous)
      
      const sceneIndex = story.scenes.findIndex(s => s.id === previous)
      const newProgress = Math.floor((sceneIndex / story.scenes.length) * 100)
      setProgress(newProgress)
      saveProgress(previous, newProgress)
    }
  }

  const restart = () => {
    setHistory([])
    setCurrentSceneId(story.first_scene)
    setProgress(0)
    saveProgress(story.first_scene, 0)
  }

  const handleFavorite = () => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول لإضافة القصة إلى المفضلة')
      return
    }
    toggleFavorite({ userId: user.id, storyId: id, isFavorited })
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: story.title?.[language],
        text: story.description?.[language],
        url: window.location.href,
      })
    } catch {
      navigator.clipboard.writeText(window.location.href)
      toast.success('تم نسخ الرابط')
    }
  }

  const handleRatingSubmit = async () => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول لتقييم القصة')
      return
    }
    await rateStory.mutateAsync({
      userId: user.id,
      storyId: id,
      rating: ratingValue,
      review: ratingReview,
    })
    setShowRating(false)
    setUserRating({ rating: ratingValue, review: ratingReview })
    refetch()
  }

  const getEndingEmoji = (type) => {
    switch (type) {
      case 'success': return '🎉✨🌟'
      case 'failure': return '💀😢💔'
      default: return '📖✨'
    }
  }

  if (isLoading) {
    return (
      <div className="page-container max-w-3xl">
        <div className="skeleton h-96 rounded-xl" />
      </div>
    )
  }

  if (!story) {
    return (
      <div className="page-container text-center py-12">
        <h1 className="text-2xl font-bold mb-4">القصة غير موجودة</h1>
        <Link to="/explore" className="text-gold-500 hover:underline">العودة إلى المكتبة</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-[var(--bg-elevated)] shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-[var(--bg-surface)]">
                <FiChevronRight className="text-xl" />
              </button>
              <h1 className="font-bold line-clamp-1">{story.title?.[language]}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="px-3 py-1 rounded-lg bg-[var(--bg-surface)] text-sm"
              >
                {language === 'ar' ? 'English' : 'العربية'}
              </button>
              <button onClick={goBack} disabled={history.length === 0} className="p-2 rounded-lg hover:bg-[var(--bg-surface)] disabled:opacity-50">
                <FiRotateCcw />
              </button>
              <button onClick={restart} className="p-2 rounded-lg hover:bg-[var(--bg-surface)]">
                <FiFlag />
              </button>
              <button onClick={handleFavorite} className="p-2 rounded-lg hover:bg-[var(--bg-surface)]">
                <FiHeart className={isFavorited ? 'text-red-500 fill-red-500' : ''} />
              </button>
              <button onClick={handleShare} className="p-2 rounded-lg hover:bg-[var(--bg-surface)]">
                <FiShare2 />
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-2 h-1 bg-[var(--bg-surface)] rounded-full overflow-hidden">
            <div className="h-full bg-gold-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <AnimatePresence mode="wait">
          {currentScene && (
            <motion.div
              key={currentScene.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Scene Image */}
              {currentScene.image && (
                <img src={currentScene.image} alt="" className="w-full rounded-xl shadow-lg max-h-96 object-cover" />
              )}
              
              {/* Scene Title */}
              <h2 className="text-2xl font-bold font-playfair">
                {currentScene.title?.[language]}
              </h2>
              
              {/* Scene Content */}
              <div className="prose-story text-lg leading-relaxed whitespace-pre-wrap">
                {currentScene.content?.[language]}
              </div>
              
              {/* Ending Message */}
              {currentScene.isEnding && currentScene.endingMessage && (
                <div className="text-center p-6 bg-gold-50 dark:bg-gold-900/20 rounded-xl">
                  <p className="text-xl">{getEndingEmoji(currentScene.endingType)}</p>
                  <p className="text-lg">{currentScene.endingMessage}</p>
                </div>
              )}
              
              {/* Choices */}
              {!currentScene.isEnding && currentScene.choices && currentScene.choices.length > 0 && (
                <div className="space-y-3 pt-4">
                  <p className="font-semibold">اختر مسارك:</p>
                  {currentScene.choices.map((choice, index) => (
                    <button
                      key={choice.id}
                      onClick={() => handleChoice(choice)}
                      className="w-full text-right p-4 bg-[var(--bg-surface)] hover:bg-gold-100 dark:hover:bg-gold-900/30 rounded-xl transition-all duration-300 flex items-center justify-between group"
                    >
                      <span>{choice.text?.[language]}</span>
                      <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
              
              {/* End of Story - Show Rating */}
              {currentScene.isEnding && !userRating && !showRating && (
                <div className="text-center pt-8">
                  <button onClick={() => setShowRating(true)} className="btn-primary flex items-center gap-2 mx-auto">
                    <FiStar />
                    قيم هذه القصة
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rating Modal */}
        {showRating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="bg-[var(--bg-elevated)] rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">قيم القصة</h3>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRatingValue(star)}
                    className="text-3xl focus:outline-none"
                  >
                    <FiStar className={star <= ratingValue ? 'text-yellow-500 fill-yellow-500' : 'text-[var(--text-muted)]'} />
                  </button>
                ))}
              </div>
              <textarea
                value={ratingReview}
                onChange={(e) => setRatingReview(e.target.value)}
                className="input-base mb-4"
                rows="3"
                placeholder="اكتب رأيك في القصة (اختياري)"
              />
              <div className="flex gap-3">
                <button onClick={handleRatingSubmit} className="btn-primary flex-1">إرسال</button>
                <button onClick={() => setShowRating(false)} className="btn-secondary flex-1">إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {/* Author Info */}
        <div className="mt-12 pt-8 border-t border-[var(--border-light)]">
          <Link to={`/author/${story.author?.username}`} className="flex items-center gap-3 group">
            {story.author?.avatar_url ? (
              <img src={story.author.avatar_url} alt="" className="w-12 h-12 rounded-full" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold text-lg">
                {story.author?.full_name?.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold group-hover:text-gold-500 transition-colors">
                {story.author?.full_name}
              </p>
              <div className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
                <span>@{story.author?.username}</span>
                {story.author?.is_verified && <VerifiedBadge size="small" />}
              </div>
            </div>
          </Link>
        </div>

        {/* Comments Section */}
        <div className="mt-8 pt-8 border-t border-[var(--border-light)]">
          <CommentSection storyId={id} />
        </div>
      </div>
    </div>
  )
}

export default StoryPlayer
