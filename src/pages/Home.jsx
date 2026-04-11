import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  RiBookOpenLine, RiPencilLine, RiShareLine,
  RiArrowLeftLine, RiStarLine, RiTimeLine,
  RiUser3Line, RiPlayCircleLine, RiBranchesLine,
} from 'react-icons/ri'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { storyHelpers } from '../lib/supabase'

/* ── Animation variants ─────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
})

const FEATURES = [
  {
    icon: RiBookOpenLine,
    title: 'اقرأ وتجربة فريدة',
    desc: 'كل اختيار تتخذه يقودك لمسار مختلف تمامًا. اكتشف كل النهايات الممكنة في رحلة قراءة لا مثيل لها.',
    color: '#f59e0b',
  },
  {
    icon: RiPencilLine,
    title: 'اكتب قصتك',
    desc: 'أداة بناء مشاهد سهلة ومرنة. أنشئ عوالم كاملة بمشاهد متشعبة ونهايات متعددة بدون أي خبرة تقنية.',
    color: '#ef4444',
  },
  {
    icon: RiShareLine,
    title: 'شارك مع العالم',
    desc: 'انشر قصتك وانتظر قراءها يكتشفون مساراتها. شارك نهاية بعينها مع أصدقائك برابط خاص.',
    color: '#22c55e',
  },
]

const HOW_IT_WORKS = [
  { step: '١', title: 'اختر قصة',    desc: 'تصفح مكتبتنا المتنوعة وابدأ قصتك المفضلة', icon: RiBookOpenLine },
  { step: '٢', title: 'اتخذ قرارك', desc: 'في كل مشهد يوجد اختيارات تُشكّل مسار حكايتك', icon: RiBranchesLine },
  { step: '٣', title: 'اعش النهاية', desc: 'كل قرار يقودك لنهاية مختلفة — هل ستكتشفها كلها؟', icon: RiPlayCircleLine },
]

/* ── Story Card Component ───────────────────── */
function StoryCard({ story, index }) {
  const title = story.title?.ar || story.title || 'قصة بلا عنوان'
  const desc  = story.description?.ar || story.description || ''
  const author = story.author?.full_name || story.author?.username || 'مجهول'

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/story/${story.id}`} className="card block overflow-hidden group">
        {/* Cover */}
        <div className="relative h-44 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--bg-subtle), var(--bg-surface))' }}>
          {story.cover_image ? (
            <img
              src={story.cover_image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <RiBookOpenLine style={{ fontSize: '3rem', color: 'var(--text-muted)', opacity: 0.4 }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {story.category && (
            <span className="absolute top-3 right-3 badge badge-gold text-xs">{story.category}</span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-base mb-1.5 line-clamp-1 group-hover:text-yellow-500 transition-colors"
            style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><RiUser3Line />{author}</span>
            <span className="flex items-center gap-1"><RiTimeLine />{story.reading_time || 5} دقائق</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ── Main Page ──────────────────────────────── */
export default function Home() {
  const [stories, setStories] = useState([])

  useEffect(() => {
    storyHelpers.getPublished({ limit: 3 }).then(({ data }) => {
      if (data) setStories(data)
    })
  }, [])

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <Navbar />

      {/* ── Hero ──────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: 'calc(100vh - 64px)' }}>
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }} />
          <div className="absolute bottom-0 -left-32 w-80 h-80 rounded-full opacity-8"
            style={{ background: 'radial-gradient(circle, #ef4444, transparent 70%)' }} />
          {/* Floating orbs */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 6 + 3,
                height: Math.random() * 6 + 3,
                background: i % 2 === 0 ? '#f59e0b' : '#ef4444',
                top: `${20 + i * 15}%`,
                right: `${10 + i * 18}%`,
                opacity: 0.3,
              }}
              animate={{ y: [0, -15, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.7 }}
            />
          ))}
        </div>

        <div className="page-container flex items-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="max-w-3xl w-full py-24">
            <motion.div {...fadeUp(0)}>
              <span className="badge badge-gold mb-6 inline-flex">
                <RiStarLine /> منصة القصص التفاعلية
              </span>
            </motion.div>

            <motion.h1 {...fadeUp(0.1)} className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              كل اختيار
              <br />
              <span className="text-gradient">يصنع حكاية</span>
            </motion.h1>

            <motion.p {...fadeUp(0.2)} className="text-lg md:text-xl mb-10 max-w-xl" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              اغمر نفسك في قصص تتشكل بقراراتك. اقرأ، واكتب، وشارك تجارب لا تُنسى مع قراء من حول العالم.
            </motion.p>

            <motion.div {...fadeUp(0.3)} className="flex flex-wrap gap-4">
              <Link to="/explore" className="btn-primary text-base px-8 py-3.5">
                <RiBookOpenLine />
                استكشف القصص
              </Link>
              <Link to="/create" className="btn-secondary text-base px-8 py-3.5">
                <RiPencilLine />
                ابدأ الكتابة
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div {...fadeUp(0.4)} className="flex items-center gap-8 mt-14">
              {[
                { n: '١٠٠+', label: 'قصة منشورة' },
                { n: '٥٠٠+', label: 'قارئ نشط' },
                { n: '٣+', label: 'نهايات لكل قصة' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-2xl font-black text-gradient">{stat.n}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────── */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
              لماذا قصة واختار؟
            </h2>
            <p className="text-lg max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
              تجربة قراءة لم تعرفها من قبل — أنت المؤلف والبطل في آنٍ واحد.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.55 }}
                className="card p-8 text-center group"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}>
                  <f.icon style={{ fontSize: '1.75rem', color: f.color }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Stories ───────────────────── */}
      {stories.length > 0 && (
        <section className="section">
          <div className="page-container">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-4xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>قصص مقترحة</h2>
                <p style={{ color: 'var(--text-muted)' }}>اختر بداية قصتك اليوم</p>
              </div>
              <Link to="/explore" className="btn-ghost flex items-center gap-1 text-sm" style={{ color: '#f59e0b' }}>
                عرض الكل <RiArrowLeftLine />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((s, i) => <StoryCard key={s.id} story={s} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ──────────────────────── */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
              كيف تعمل المنصة؟
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 inset-x-16 h-px" style={{ background: 'var(--border-default)' }} />

            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center relative"
              >
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10"
                  style={{ background: 'var(--bg-elevated)', border: '2px solid var(--border-default)', boxShadow: 'var(--shadow-md)' }}>
                  <step.icon style={{ fontSize: '2rem', color: '#f59e0b' }} />
                </div>
                <div className="text-3xl font-black mb-2 text-gradient">{step.step}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────── */}
      <section className="section">
        <div className="page-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl p-12 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(220,38,38,0.08))', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <div className="absolute top-4 left-4 w-32 h-32 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
            <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }} />
            <h2 className="text-4xl md:text-5xl font-black mb-4 relative" style={{ color: 'var(--text-primary)' }}>
              ابدأ حكايتك الآن
            </h2>
            <p className="text-lg mb-8 max-w-md mx-auto relative" style={{ color: 'var(--text-muted)' }}>
              انضم لآلاف القراء والكتّاب على منصة قصة واختار — مجانًا تمامًا
            </p>
            <div className="flex justify-center gap-4 relative">
              <Link to="/auth" className="btn-primary text-base px-10 py-4">
                ابدأ مجانًا
                <RiArrowLeftLine />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
