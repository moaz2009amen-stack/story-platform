import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiSearchLine, RiGridLine, RiListCheck, RiBookOpenLine,
  RiTimeLine, RiEyeLine, RiHeartLine, RiUser3Line,
  RiFilterLine, RiArrowDownLine,
} from 'react-icons/ri'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { storyHelpers } from '../lib/supabase'

const CATEGORIES = ['جميع التصنيفات', 'مغامرة', 'رعب', 'رومانسية', 'خيال علمي', 'تاريخية', 'جريمة', 'أخرى']
const SORT_OPTIONS = [
  { value: 'created_at', label: 'الأحدث' },
  { value: 'oldest',     label: 'الأقدم' },
  { value: 'views',      label: 'الأكثر مشاهدة' },
  { value: 'likes',      label: 'الأكثر إعجابًا' },
]

/* ── Story Card Grid ────────────────────────── */
function StoryCardGrid({ story }) {
  const title  = story.title?.ar  || story.title  || 'بلا عنوان'
  const desc   = story.description?.ar || story.description || ''
  const author = story.author?.full_name || story.author?.username || 'مجهول'

  return (
    <Link to={`/story/${story.id}`} className="card block overflow-hidden group">
      <div className="relative h-44 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--bg-subtle), var(--bg-surface))' }}>
        {story.cover_image ? (
          <img src={story.cover_image} alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <RiBookOpenLine style={{ fontSize: '2.5rem', color: 'var(--text-muted)', opacity: 0.35 }} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {story.category && (
          <span className="absolute top-3 right-3 badge badge-gold text-xs">{story.category}</span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-sm mb-1.5 line-clamp-1 group-hover:text-yellow-500 transition-colors"
          style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <p className="text-xs line-clamp-2 mb-4" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><RiUser3Line />{author}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-0.5"><RiEyeLine />{story.views || 0}</span>
            <span className="flex items-center gap-0.5"><RiTimeLine />{story.reading_time || 5}د</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ── Story Card List ────────────────────────── */
function StoryCardList({ story }) {
  const title  = story.title?.ar  || story.title  || 'بلا عنوان'
  const desc   = story.description?.ar || story.description || ''
  const author = story.author?.full_name || story.author?.username || 'مجهول'

  return (
    <Link to={`/story/${story.id}`}
      className="card flex gap-5 p-4 overflow-hidden group"
      style={{ flexDirection: 'row' }}>
      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0"
        style={{ background: 'var(--bg-subtle)' }}>
        {story.cover_image ? (
          <img src={story.cover_image} alt={title}
            className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <RiBookOpenLine style={{ color: 'var(--text-muted)', opacity: 0.35 }} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-sm group-hover:text-yellow-500 transition-colors line-clamp-1"
            style={{ color: 'var(--text-primary)' }}>{title}</h3>
          {story.category && <span className="badge badge-gold text-xs shrink-0">{story.category}</span>}
        </div>
        <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><RiUser3Line />{author}</span>
          <span className="flex items-center gap-1"><RiEyeLine />{story.views || 0}</span>
          <span className="flex items-center gap-1"><RiHeartLine />{story.likes || 0}</span>
          <span className="flex items-center gap-1"><RiTimeLine />{story.reading_time || 5} دقائق</span>
        </div>
      </div>
    </Link>
  )
}

/* ── Skeleton ───────────────────────────────── */
function StorySkeleton({ view }) {
  return view === 'grid' ? (
    <div className="card-flat overflow-hidden">
      <div className="skeleton h-44" />
      <div className="p-5 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-2/3" />
      </div>
    </div>
  ) : (
    <div className="card-flat flex gap-4 p-4">
      <div className="skeleton w-24 h-24 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-3/4" />
      </div>
    </div>
  )
}

/* ── Main Page ──────────────────────────────── */
export default function Explore() {
  const [stories,  setStories]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('جميع التصنيفات')
  const [sort,     setSort]     = useState('views')
  const [view,     setView]     = useState('grid')
  const [page,     setPage]     = useState(0)
  const [hasMore,  setHasMore]  = useState(true)
  const [showSort, setShowSort] = useState(false)

  const LIMIT = 12

  const fetchStories = useCallback(async (reset = false) => {
    setLoading(true)
    const offset = reset ? 0 : page * LIMIT
    const { data } = await storyHelpers.getPublished({
      limit: LIMIT,
      offset,
      category: category !== 'جميع التصنيفات' ? category : null,
      search:   search || null,
      sort,
    })
    if (data) {
      setStories(prev => reset ? data : [...prev, ...data])
      setHasMore(data.length === LIMIT)
      if (reset) setPage(0)
    }
    setLoading(false)
  }, [category, search, sort, page])

  // Reset on filter change
  useEffect(() => {
    const t = setTimeout(() => fetchStories(true), 300)
    return () => clearTimeout(t)
  }, [category, search, sort])

  const loadMore = () => {
    setPage(p => p + 1)
  }
  useEffect(() => {
    if (page > 0) fetchStories(false)
  }, [page])

  const currentSort = SORT_OPTIONS.find(s => s.value === sort)

  return (
<div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
  <Navbar />

      {/* Header */}
      <div className="section" style={{ paddingBottom: '2rem', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="page-container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            مكتبة القصص
          </motion.h1>
          <p style={{ color: 'var(--text-muted)' }}>اكتشف عالمًا من القصص التفاعلية — كل قراءة تجربة جديدة</p>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <RiSearchLine className="absolute right-4 top-1/2 -translate-y-1/2 text-base"
              style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="ابحث عن قصة..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-base pr-10"
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(s => !s)}
              className="btn-secondary flex items-center gap-2 whitespace-nowrap"
            >
              <RiFilterLine />
              {currentSort?.label}
              <RiArrowDownLine className={`transition-transform ${showSort ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-1 z-20 py-1 rounded-xl overflow-hidden shadow-xl min-w-[140px]"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
                >
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setShowSort(false) }}
                      className="w-full text-right px-4 py-2 text-sm transition-colors hover:text-yellow-500"
                      style={{
                        background: sort === opt.value ? 'rgba(245,158,11,0.08)' : 'transparent',
                        color: sort === opt.value ? '#f59e0b' : 'var(--text-secondary)',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-default)' }}>
            {[
              { v: 'grid', icon: RiGridLine },
              { v: 'list', icon: RiListCheck },
            ].map(({ v, icon: Icon }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="w-10 h-10 flex items-center justify-center transition-colors"
                style={{
                  background: view === v ? '#f59e0b15' : 'var(--bg-elevated)',
                  color: view === v ? '#f59e0b' : 'var(--text-muted)',
                }}
              >
                <Icon />
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0"
              style={{
                background: category === cat ? '#f59e0b' : 'var(--bg-elevated)',
                color: category === cat ? '#0f0d0a' : 'var(--text-secondary)',
                border: `1px solid ${category === cat ? 'transparent' : 'var(--border-subtle)'}`,
                boxShadow: category === cat ? '0 4px 12px rgba(245,158,11,0.35)' : 'none',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stories grid/list */}
        {loading && stories.length === 0 ? (
          <div className={view === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5' : 'flex flex-col gap-4'}>
            {[...Array(8)].map((_, i) => <StorySkeleton key={i} view={view} />)}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-24">
            <RiBookOpenLine style={{ fontSize: '4rem', color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 1rem' }} />
            <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>لا توجد قصص</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>جرب بحثًا مختلفًا أو تصنيفًا آخر</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${view}-${category}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={view === 'grid'
                ? 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                : 'flex flex-col gap-4'
              }
            >
              {stories.map((story, i) =>
                view === 'grid'
                  ? <StoryCardGrid key={story.id} story={story} />
                  : <StoryCardList key={story.id} story={story} />
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Load more */}
        {hasMore && !loading && stories.length > 0 && (
          <div className="text-center mt-10">
            <button onClick={loadMore} className="btn-secondary px-10">
              تحميل المزيد
            </button>
          </div>
        )}
        {loading && stories.length > 0 && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <div className="w-4 h-4 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
              تحميل...
            </div>
          </div>
        )}
      </div>
  
     <div style={{ flex: 1 }} />

      <Footer />
    </div>
  )
}
