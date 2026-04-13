import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useAnimation, useInView } from 'framer-motion'
import { useRef } from 'react'
import { FiBookOpen, FiEdit, FiUsers, FiTrendingUp, FiArrowLeft, FiStar, FiHeart, FiEye } from 'react-icons/fi'
import { storyHelpers } from '../lib/supabase'
import StoryCard from '../components/StoryCard'

const Landing = () => {
  const [stats, setStats] = useState({ stories: 0, authors: 0, views: 0 })
  const [latestStories, setLatestStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب أحدث القصص
        const stories = await storyHelpers.getPublished({ limit: 6, sort: 'newest' })
        setLatestStories(stories)

        // جلب الإحصائيات (يمكن تحسينها باستخدام دالة مخصصة في Supabase)
        const allStories = await storyHelpers.getPublished({ limit: 1000 })
        const uniqueAuthors = new Set(allStories.map(s => s.author_id))
        
        setStats({
          stories: allStories.length,
          authors: uniqueAuthors.size,
          views: allStories.reduce((sum, s) => sum + (s.views || 0), 0),
        })
      } catch (error) {
        console.error('Error fetching landing data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gold-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              <span className="text-gradient">قصتك على طريقتك</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-[var(--text-muted)] mb-8"
            >
              منصة تفاعلية للقصص تتيح لك القراءة والكتابة والمشاركة. 
              اكتب قصتك بطريقتك الخاصة وشاركها مع العالم.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/explore" className="btn-primary flex items-center gap-2 justify-center">
                <FiBookOpen />
                ابدأ القراءة
              </Link>
              <Link to="/auth?mode=signup" className="btn-secondary flex items-center gap-2 justify-center">
                <FiEdit />
                أنشئ حسابك
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-[var(--bg-surface)]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-500">{stats.stories.toLocaleString()}+</div>
              <div className="text-[var(--text-muted)]">قصة منشورة</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-500">{stats.authors.toLocaleString()}+</div>
              <div className="text-[var(--text-muted)]">كاتب مبدع</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gold-500">{stats.views.toLocaleString()}+</div>
              <div className="text-[var(--text-muted)]">مشاهدة</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Stories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">أحدث القصص</h2>
            <p className="text-[var(--text-muted)]">اكتشف أحدث القصص التي نشرها الكتاب</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {latestStories.map((story, index) => (
                <StoryCard key={story.id} story={story} index={index} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/explore" className="text-gold-500 hover:text-gold-600 font-semibold inline-flex items-center gap-2">
              استكشف المزيد من القصص
              <FiArrowLeft />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-[var(--bg-surface)]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">كيف تعمل المنصة؟</h2>
            <p className="text-[var(--text-muted)]">ثلاث خطوات بسيطة لتبدأ رحلتك</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: FiUsers, title: 'أنشئ حساباً', description: 'سجل مجاناً وابدأ رحلتك في عالم القصص' },
              { icon: FiEdit, title: 'اكتب قصتك', description: 'اختر بين القصص العادية أو التفاعلية' },
              { icon: FiBookOpen, title: 'انشر وشارك', description: 'انشر قصتك وشاركها مع الآلاف من القراء' },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
                  <step.icon className="text-3xl text-gold-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-[var(--text-muted)]">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gold-500 to-gold-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">ابدأ رحلتك اليوم</h2>
          <p className="text-lg mb-8 opacity-90">انضم إلى آلاف الكتاب والقراء وشارك قصتك مع العالم</p>
          <Link to="/auth?mode=signup" className="bg-white text-gold-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300 inline-block">
            أنشئ حسابك الآن مجاناً
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Landing
