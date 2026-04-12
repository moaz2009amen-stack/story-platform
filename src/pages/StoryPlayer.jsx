import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiArrowRightLine, RiRefreshLine, RiShareLine,
  RiBookOpenLine, RiUser3Line, RiTimeLine,
  RiArrowGoBackLine, RiHeartLine, RiHeartFill,
  RiStarFill, RiStarLine,
} from 'react-icons/ri'
import { storyHelpers, readingHelpers, supabase } from '../lib/supabase'
import { useAuth } from '../App'

/* ── Rating Component ───────────────────────── */
function RatingBox({ storyId, user }) {
  const [rating,   setRating]   = useState(0)
  const [hover,    setHover]    = useState(0)
  const [review,   setReview]   = useState('')
  const [saved,    setSaved]    = useState(false)
  const [existing, setExisting] = useState(null)
  const [avgRating, setAvgRating] = useState(0)
  const [totalRatings, setTotalRatings] = useState(0)

  useEffect(() => {
    async function load() {
      const { data: all } = await supabase.from('ratings').select('rating').eq('story_id', storyId)
      if (all?.length) {
        setTotalRatings(all.length)
        setAvgRating((all.reduce((a, r) => a + r.rating, 0) / all.length).toFixed(1))
      }
      if (user) {
        const { data } = await supabase.from('ratings').select('*').eq('story_id', storyId).eq('user_id', user.id).single()
        if (data) { setExisting(data); setRating(data.rating); setReview(data.review || '') }
      }
    }
    load()
  }, [storyId, user])

  async function submitRating() {
    if (!user || !rating) return
    await supabase.from('ratings').upsert(
      { user_id: user.id, story_id: storyId, rating, review },
      { onConflict: 'user_id,story_id' }
    )
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="card-flat p-6 mt-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>تقييم القصة</h3>
        {totalRatings > 0 && (
          <div className="flex items-center gap-1.5">
            <RiStarFill className="text-yellow-500 text-sm" />
            <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{avgRating}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({totalRatings} تقييم)</span>
          </div>
        )}
      </div>

      {user ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="text-2xl transition-transform hover:scale-110"
              >
                {star <= (hover || rating)
                  ? <RiStarFill className="text-yellow-500" />
                  : <RiStarLine style={{ color: 'var(--text-muted)' }} />
                }
              </button>
            ))}
            {rating > 0 && (
              <span className="text-sm font-semibold mr-2" style={{ color: '#f59e0b' }}>
                {['', 'ضعيف', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'][rating]}
              </span>
            )}
          </div>
          <textarea
            value={review}
            onChange={e => setReview(e.target.value)}
            placeholder="اكتب تعليقك على القصة... (اختياري)"
            rows={3}
            className="input-base text-sm resize-none"
          />
          <button
            onClick={submitRating}
            disabled={!rating}
            className="btn-primary text-sm px-6"
            style={{ opacity: !rating ? 0.4 : 1 }}
          >
            {saved ? '✓ تم الحفظ' : existing ? 'تحديث التقييم' : 'إرسال التقييم'}
          </button>
        </div>
      ) : (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link to="/auth" className="font-bold" style={{ color: '#f59e0b' }}>سجل دخولك</Link>
          {' '}لتقييم القصة
        </p>
      )}
    </div>
  )
}

/* ── Ending screen ──────────────────────────── */
function EndingScreen({ scene, lang, onRestart, story, storyId, user }) {
  const endMsg   = scene.endMessage?.[lang] || scene.endMessage?.ar || ''
  const sceneTit = scene.title?.[lang]      || scene.title?.ar      || 'النهاية'

  const endColors = {
    good:    { icon: '🎉', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
    bad:     { icon: '😢', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
    neutral: { icon: '📖', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  }
  const e = endColors[scene.endType || 'neutral']

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      className="px-4 py-12">
      <div className="max-w-lg w-full text-center mx-auto">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }} className="text-7xl mb-6">
          {e.icon}
        </motion.div>
        <div className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4"
          style={{ background: e.bg, color: e.color, border: `1px solid ${e.color}30` }}>
          {sceneTit}
        </div>
        {endMsg && (
          <p className="text-lg mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{endMsg}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={onRestart} className="btn-primary">
            <RiRefreshLine /> ابدأ من جديد
          </button>
          <Link to="/explore" className="btn-secondary">
            <RiBookOpenLine /> قصص أخرى
          </Link>
          <button
            onClick={() => {
              navigator.share?.({ title: story?.title?.ar, url: window.location.href })
              || navigator.clipboard.writeText(window.location.href)
            }}
            className="btn-secondary"
          >
            <RiShareLine /> شارك النهاية
          </button>
        </div>
      </div>
      <div className="max-w-lg mx-auto">
        <RatingBox storyId={storyId} user={user} />
      </div>
    </motion.div>
  )
}

/* ── Main Player ────────────────────────────── */
export default function StoryPlayer() {
  const { storyId } = useParams()
  const { user }    = useAuth()

  const [story,     setStory]     = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [currentId, setCurrentId] = useState(null)
  const [history,   setHistory]   = useState([])
  const [lang,      setLang]      = useState('ar')
  const [liked,     setLiked]     = useState(false)

  const storageKey = `story_progress_${storyId}`

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await storyHelpers.getById(storyId)
      if (error || !data) { setError('لم يتم العثور على القصة'); setLoading(false); return }
      setStory(data)
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null')
      if (saved?.currentId && data.scenes?.[saved.currentId]) {
        setCurrentId(saved.currentId)
        setHistory(saved.history || [])
      } else {
        setCurrentId(data.first_scene)
      }
      storyHelpers.incrementViews(storyId).catch(() => {})
      setLoading(false)
    }
    load()
  }, [storyId])

  useEffect(() => {
    if (!currentId || !story) return
    const totalScenes = Object.keys(story.scenes || {}).length
    const progress = Math.min(100, Math.round(((history.length + 1) / totalScenes) * 100))
    localStorage.setItem(storageKey, JSON.stringify({ currentId, history, progress }))
    if (user) readingHelpers.saveProgress(user.id, storyId, currentId, progress).catch(() => {})
  }, [currentId, history])

  async function toggleLike() {
    if (!user) return
    if (liked) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('story_id', storyId)
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, story_id: storyId })
    }
    setLiked(l => !l)
  }

  useEffect(() => {
    if (!user) return
    supabase.from('favorites').select('*').eq('user_id', user.id).eq('story_id', storyId)
      .single().then(({ data }) => { if (data) setLiked(true) })
  }, [user, storyId])

  const currentScene = story?.scenes?.[currentId]

  const choose = useCallback((targetId) => {
    if (!targetId || !story?.scenes?.[targetId]) return
    setHistory(h => [...h, currentId])
    setCurrentId(targetId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentId, story])

  const undo = () => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setCurrentId(prev)
    setHistory(h => h.slice(0, -1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const restart = () => {
    setCurrentId(story.first_scene)
    setHistory([])
    localStorage.removeItem(storageKey)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalScenes = story ? Object.keys(story.scenes || {}).length : 1
  const progress    = Math.min(100, Math.round(((history.length + 1) / totalScenes) * 100))
  const title       = story?.title?.[lang] || story?.title?.ar || ''

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        <p style={{ color: 'var(--text-muted)' }}>تحميل القصة...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center">
        <p className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{error}</p>
        <Link to="/explore" className="btn-primary">العودة للمكتبة</Link>
      </div>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>

      {/* Top Bar */}
      <div className="sticky top-0 z-40" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="page-container">
          <div className="flex items-center gap-3 h-14">
            <Link to="/explore" className="btn-ghost w-9 h-9 p-0 rounded-xl shrink-0">
              <RiArrowRightLine />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{title}</p>
              {story?.reading_time && (
                <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <RiTimeLine />{story.reading_time} دقائق
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
                className="btn-ghost w-9 h-9 p-0 rounded-xl text-xs font-bold"
                style={{ color: lang === 'ar' ? '#f59e0b' : 'var(--text-muted)' }}>
                {lang === 'ar' ? 'EN' : 'ع'}
              </button>
              <button onClick={undo} disabled={history.length === 0}
                className="btn-ghost w-9 h-9 p-0 rounded-xl"
                style={{ opacity: history.length === 0 ? 0.3 : 1, color: 'var(--text-muted)' }}>
                <RiArrowGoBackLine />
              </button>
              <button onClick={restart} className="btn-ghost w-9 h-9 p-0 rounded-xl"
                style={{ color: 'var(--text-muted)' }}>
                <RiRefreshLine />
              </button>
              <button onClick={() => {
                navigator.share?.({ title, url: window.location.href })
                || navigator.clipboard.writeText(window.location.href)
              }} className="btn-ghost w-9 h-9 p-0 rounded-xl" style={{ color: 'var(--text-muted)' }}>
                <RiShareLine />
              </button>
              <button onClick={toggleLike} className="btn-ghost w-9 h-9 p-0 rounded-xl">
                {liked ? <RiHeartFill className="text-red-500" /> : <RiHeartLine style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>
          </div>
        </div>
        <div className="h-0.5 w-full" style={{ background: 'var(--bg-subtle)' }}>
          <motion.div className="h-full" style={{ background: 'linear-gradient(to left, #f59e0b, #d97706)' }}
            animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      {/* Content */}
      <div className="page-container py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {currentScene?.isEnd ? (
            <EndingScreen scene={currentScene} lang={lang} onRestart={restart} story={story} storyId={storyId} user={user} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={currentId}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>

                {currentScene?.image && (
                  <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden mb-8">
                    <img src={currentScene.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                )}

                {(currentScene?.title?.[lang] || currentScene?.title?.ar) && (
                  <h2 className="text-2xl md:text-3xl font-black mb-5"
                    style={{ color: 'var(--text-primary)', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                    {currentScene.title?.[lang] || currentScene.title?.ar}
                  </h2>
                )}

                <div className="prose-story mb-10"
                  style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
                  dangerouslySetInnerHTML={{
                    __html: (currentScene?.content?.[lang] || currentScene?.content?.ar || '').replace(/\n/g, '<br />')
                  }} />

                {currentScene?.choices?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                      <span className="w-4 h-px" style={{ background: 'var(--border-default)' }} />
                      ماذا تختار؟
                      <span className="flex-1 h-px" style={{ background: 'var(--border-default)' }} />
                    </p>
                    <div className="space-y-3">
                      {currentScene.choices.map((choice, idx) => {
                        const choiceText = choice.text?.[lang] || choice.text?.ar || `الاختيار ${idx + 1}`
                        return (
                          <motion.button key={choice.id}
                            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + idx * 0.1 }}
                            onClick={() => choose(choice.targetScene)}
                            disabled={!choice.targetScene}
                            className="w-full text-right p-4 rounded-2xl transition-all duration-300 group flex items-center gap-4"
                            style={{
                              background: 'var(--bg-elevated)',
                              border: '1.5px solid var(--border-subtle)',
                              opacity: !choice.targetScene ? 0.4 : 1,
                              cursor: !choice.targetScene ? 'not-allowed' : 'pointer',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = '#f59e0b'
                              e.currentTarget.style.boxShadow = '0 0 0 1px rgba(245,158,11,0.2), 0 8px 24px rgba(245,158,11,0.1)'
                              e.currentTarget.style.transform = 'translateX(-3px)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'var(--border-subtle)'
                              e.currentTarget.style.boxShadow = 'none'
                              e.currentTarget.style.transform = 'none'
                            }}>
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                              style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                              {idx + 1}
                            </div>
                            <span className="flex-1 text-sm font-semibold leading-relaxed"
                              style={{ color: 'var(--text-primary)', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                              {choiceText}
                            </span>
                            <RiArrowRightLine className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: '#f59e0b', transform: 'rotate(180deg)' }} />
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {!currentScene?.choices?.length && !currentScene?.isEnd && (
                  <div className="text-center py-8">
                    <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>لا توجد اختيارات لهذا المشهد</p>
                    <button onClick={restart} className="btn-secondary"><RiRefreshLine /> إعادة القصة</button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {history.length > 0 && !currentScene?.isEnd && (
            <div className="flex items-center gap-2 mt-12 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>المشهد {history.length + 1} من ~{totalScenes}</span>
              <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{progress}% مكتمل</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
