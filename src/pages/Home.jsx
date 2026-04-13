import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePublishedStories } from '../hooks/useStories'
import StoryCard from '../components/StoryCard'
import OnboardingGuide from '../components/OnboardingGuide'
import { FiPlusCircle, FiTrendingUp, FiClock } from 'react-icons/fi'
import { motion } from 'framer-motion'

const Home = () => {
  const { user, profile } = useAuth()
  const [sort, setSort] = useState('newest')
  const { data: stories, isLoading, refetch } = usePublishedStories({ sort, limit: 20 })

  useEffect(() => {
    refetch()
  }, [sort, refetch])

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Onboarding Guide for new users */}
      <OnboardingGuide />

      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gold-500 to-gold-700 rounded-2xl p-6 mb-8 text-white"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">مرحباً {profile?.full_name}! 👋</h1>
            <p className="opacity-90">اكتشف قصصاً جديدة، أو ابدأ في كتابة قصتك الخاصة</p>
          </div>
          <Link to="/create-story" className="bg-white text-gold-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300 flex items-center gap-2">
            <FiPlusCircle />
            اكتب قصة جديدة
          </Link>
        </div>
      </motion.div>

      {/* Sort Options */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">آخر القصص</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSort('newest')}
            className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              sort === 'newest'
                ? 'bg-gold-500 text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-gold-100 dark:hover:bg-gold-900/30'
            }`}
          >
            <FiClock />
            الأحدث
          </button>
          <button
            onClick={() => setSort('most_viewed')}
            className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              sort === 'most_viewed'
                ? 'bg-gold-500 text-white'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-gold-100 dark:hover:bg-gold-900/30'
            }`}
          >
            <FiTrendingUp />
            الأكثر مشاهدة
          </button>
        </div>
      </div>

      {/* Stories Feed */}
      {stories && stories.length > 0 ? (
        <div className="space-y-4">
          {stories.map((story, index) => (
            <StoryCard key={story.id} story={story} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-[var(--text-muted)]">لا توجد قصص حالياً</p>
          <Link to="/create-story" className="text-gold-500 hover:underline mt-2 inline-block">
            كن أول من يكتب قصة!
          </Link>
        </div>
      )}
    </div>
  )
}

export default Home
