import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-l from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            قصتك
          </span>
          {' '}
          <span className="text-gray-800 dark:text-gray-200">
            اختيارك
          </span>
        </h2>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          منصة تفاعلية تتيح لك قراءة وكتابة ومشاركة القصص التفاعلية
          حيث أنت من يحدد مسار القصة ونهايتها
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/explore" className="btn-primary text-center">
            🎮 استكشف القصص
          </Link>
          <Link to="/create" className="btn-secondary text-center">
            ✍️ اكتب قصتك
          </Link>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid md:grid-cols-3 gap-8 mb-16"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="story-card p-8 text-center"
          >
            <div className="text-5xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.section>

      {/* Demo Stories Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mb-16"
      >
        <h3 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">
          📚 قصص مقترحة
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoStories.map((story) => (
            <motion.div
              key={story.id}
              whileHover={{ scale: 1.02 }}
              className="story-card cursor-pointer"
              onClick={() => navigate(`/story/${story.id}`)}
            >
              <div className="relative h-48">
                <img 
                  src={story.cover} 
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <h4 className="absolute bottom-4 right-4 left-4 text-white font-bold text-xl">
                  {story.title}
                </h4>
              </div>
              <div className="p-4">
                <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                  {story.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-dramatic-800 dark:to-dramatic-900 rounded-3xl p-8 md:p-12"
      >
        <h3 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-200">
          كيف تعمل المنصة؟
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {index + 1}
              </div>
              <h4 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">
                {step.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="text-center mt-16"
      >
        <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          جاهز لبدء مغامرتك؟
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          انضم إلى مجتمع صناع القصص التفاعلية اليوم
        </p>
        <Link to="/create" className="btn-primary inline-block">
          🚀 ابدأ الآن مجاناً
        </Link>
      </motion.section>
    </div>
  )
}

const features = [
  {
    icon: '📖',
    title: 'اقرأ وتفاعل',
    description: 'استمتع بقراءة القصص التفاعلية واختر مسارك الخاص في كل مشهد'
  },
  {
    icon: '✍️',
    title: 'اكتب قصتك',
    description: 'أنشئ قصتك التفاعلية بسهولة باستخدام محرر القصص المرئي'
  },
  {
    icon: '🌍',
    title: 'شارك مع العالم',
    description: 'انشر قصصك وشاركها مع المجتمع واحصل على تفاعلات القراء'
  }
]

const steps = [
  {
    title: 'اختر قصة',
    description: 'تصفح مكتبة القصص واختر ما يناسب ذوقك'
  },
  {
    title: 'اتخذ قراراتك',
    description: 'في كل مشهد، اختر من بين الخيارات المتاحة'
  },
  {
    title: 'اكتشف النهاية',
    description: 'كل اختيار يقودك إلى نهاية مختلفة'
  }
]

const demoStories = [
  {
    id: 'demo-1',
    title: 'الغابة المسحورة',
    description: 'مغامرة في غابة مليئة بالأسرار...',
    cover: 'https://images.pexels.com/photos/1671324/pexels-photo-1671324.jpeg'
  },
  {
    id: 'demo-2',
    title: 'القلعة المهجورة',
    description: 'استكشف قلعة قديمة واكتشف أسرارها...',
    cover: 'https://images.pexels.com/photos/2088203/pexels-photo-2088203.jpeg'
  },
  {
    id: 'demo-3',
    title: 'سر الجزيرة',
    description: 'تصل إلى جزيرة غامضة بعد غرق سفينتك...',
    cover: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg'
  }
]
