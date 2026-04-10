import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function Explore() {
  const navigate = useNavigate()
  const [stories, setStories] = useState([])
  const [filteredStories, setFilteredStories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [language, setLanguage] = useState('ar')
  const [viewMode, setViewMode] = useState('grid') // grid or list

  // استخراج التصنيفات من القصص
  const categories = ['all', ...new Set(stories.map(s => s.category).filter(Boolean))]

  useEffect(() => {
    loadStories()
  }, [])

  useEffect(() => {
    filterAndSortStories()
  }, [stories, searchTerm, selectedCategory, sortBy])

  function loadStories() {
    const userStories = JSON.parse(localStorage.getItem('userStories') || '[]')
    const publishedStories = userStories.filter(s => s.isPublished)
    
    // إضافة قصص تجريبية لو مفيش قصص
    if (publishedStories.length === 0) {
      const demoStories = [
        {
          id: 'demo-1',
          title: { ar: 'الغابة المسحورة', en: 'The Enchanted Forest' },
          description: { ar: 'مغامرة في غابة مليئة بالأسرار والغموض', en: 'An adventure in a mysterious forest' },
          cover: 'https://images.pexels.com/photos/1671324/pexels-photo-1671324.jpeg',
          category: 'مغامرة',
          readingTime: 5,
          rating: 4.5,
          scenesCount: 5,
          isPublished: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'demo-2',
          title: { ar: 'القلعة المهجورة', en: 'The Abandoned Castle' },
          description: { ar: 'استكشف قلعة قديمة واكتشف أسرارها', en: 'Explore an old castle and discover its secrets' },
          cover: 'https://images.pexels.com/photos/2088203/pexels-photo-2088203.jpeg',
          category: 'غموض',
          readingTime: 7,
          rating: 4.8,
          scenesCount: 6,
          isPublished: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'demo-3',
          title: { ar: 'سر الجزيرة', en: 'Island Secret' },
          description: { ar: 'تصل إلى جزيرة غامضة بعد غرق سفينتك', en: 'You arrive at a mysterious island after a shipwreck' },
          cover: 'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg',
          category: 'مغامرة',
          readingTime: 6,
          rating: 4.2,
          scenesCount: 4,
          isPublished: true,
          created_at: new Date().toISOString()
        }
      ]
      setStories(demoStories)
    } else {
      setStories(publishedStories)
    }
  }

  function filterAndSortStories() {
    let filtered = [...stories]
    
    // بحث
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.title?.ar?.includes(searchTerm) || 
        s.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.ar?.includes(searchTerm)
      )
    }
    
    // تصنيف
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory)
    }
    
    // ترتيب
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => (a.title?.ar || '').localeCompare(b.title?.ar || ''))
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else if (sortBy === 'readingTime') {
      filtered.sort((a, b) => (a.readingTime || 0) - (b.readingTime || 0))
    }
    
    setFilteredStories(filtered)
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? '📚 مكتبة القصص' : '📚 Story Library'}
            </h1>
            
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm"
              >
                {language === 'ar' ? 'English' : 'عربي'}
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
              >
                {viewMode === 'grid' ? '📋' : '🔲'}
              </button>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder={language === 'ar' ? '🔍 بحث عن قصة...' : '🔍 Search stories...'}
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">{language === 'ar' ? '📂 كل التصنيفات' : '📂 All Categories'}</option>
              {categories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="newest">{language === 'ar' ? '🆕 الأحدث' : '🆕 Newest'}</option>
              <option value="oldest">{language === 'ar' ? '📅 الأقدم' : '📅 Oldest'}</option>
              <option value="title">{language === 'ar' ? '🔤 العنوان' : '🔤 Title'}</option>
              <option value="rating">{language === 'ar' ? '⭐ الأعلى تقييماً' : '⭐ Highest Rated'}</option>
              <option value="readingTime">{language === 'ar' ? '⏱️ وقت القراءة' : '⏱️ Reading Time'}</option>
            </select>
          </div>
          
          {/* Results count */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            {language === 'ar' 
              ? `تم العثور على ${filteredStories.length} قصة` 
              : `Found ${filteredStories.length} stories`}
          </p>
        </div>

        {/* Stories Grid/List */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
              {language === 'ar' ? 'لا توجد قصص متطابقة مع البحث' : 'No stories match your search'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              className="text-purple-600 hover:text-purple-700"
            >
              {language === 'ar' ? 'مسح الفلاتر' : 'Clear filters'}
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence>
              {filteredStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer group"
                  onClick={() => navigate(`/story/${story.id}`)}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img 
                      src={story.cover || 'https://images.pexels.com/photos/1671324/pexels-photo-1671324.jpeg'} 
                      alt={story.title?.ar}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {story.category && (
                      <span className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
                        {story.category}
                      </span>
                    )}
                    {story.rating && (
                      <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
                        ⭐ {story.rating}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {story.title?.[language] || story.title?.ar || 'بدون عنوان'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                      {story.description?.[language] || story.description?.ar || 'بدون وصف'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>⏱️ {story.readingTime || 5} {language === 'ar' ? 'دقائق' : 'min'}</span>
                      <span>🎬 {story.scenesCount || 4} {language === 'ar' ? 'مشاهد' : 'scenes'}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex gap-4 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/story/${story.id}`)}
                >
                  <img 
                    src={story.cover || 'https://images.pexels.com/photos/1671324/pexels-photo-1671324.jpeg'} 
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {story.title?.[language] || story.title?.ar}
                      </h3>
                      {story.rating && (
                        <span className="text-yellow-500 text-sm">⭐ {story.rating}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {story.description?.[language] || story.description?.ar}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {story.category && <span>📂 {story.category}</span>}
                      <span>⏱️ {story.readingTime || 5} دقائق</span>
                      <span>🎬 {story.scenesCount || 4} مشاهد</span>
                      <span>📅 {formatDate(story.created_at)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
