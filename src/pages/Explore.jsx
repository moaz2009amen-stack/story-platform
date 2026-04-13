import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePublishedStories } from '../hooks/useStories'
import StoryCard from '../components/StoryCard'
import { FiSearch, FiFilter, FiX } from 'react-icons/fi'
import { useDebounce } from '../hooks/useDebounce'

const categories = ['الكل', 'مغامرة', 'خيال', 'رومانسية', 'رعب', 'خيال علمي', 'دراما', 'كوميديا', 'تاريخي']
const sortOptions = [
  { value: 'most_viewed', label: 'الأكثر مشاهدة' },
  { value: 'newest', label: 'الأحدث' },
  { value: 'oldest', label: 'الأقدم' },
  { value: 'most_liked', label: 'الأكثر إعجاباً' },
]

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'الكل')
  const [sort, setSort] = useState(searchParams.get('sort') || 'most_viewed')
  const [showFilters, setShowFilters] = useState(false)
  
  const debouncedSearch = useDebounce(search, 500)

  const { data: stories, isLoading } = usePublishedStories({
    search: debouncedSearch,
    category: category === 'الكل' ? null : category,
    sort,
    limit: 30,
  })

  // تحديث URL عند تغيير الفلاتر
  useEffect(() => {
    const params = {}
    if (search) params.search = search
    if (category !== 'الكل') params.category = category
    if (sort !== 'most_viewed') params.sort = sort
    setSearchParams(params)
  }, [search, category, sort, setSearchParams])

  const clearFilters = () => {
    setSearch('')
    setCategory('الكل')
    setSort('most_viewed')
  }

  const hasActiveFilters = search || category !== 'الكل' || sort !== 'most_viewed'

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">استكشف القصص</h1>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن قصة..."
            className="input-base pr-12"
          />
        </div>

        {/* Filter Toggle Button (Mobile) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden w-full flex items-center justify-center gap-2 py-2 bg-[var(--bg-surface)] rounded-lg mb-4"
        >
          <FiFilter />
          {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
          {hasActiveFilters && <span className="badge badge-gold">مفلتر</span>}
        </button>

        {/* Filters */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block space-y-4`}>
          {/* Categories */}
          <div>
            <label className="block text-sm font-semibold mb-2">التصنيفات</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                    category === cat
                      ? 'bg-gold-500 text-white'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-gold-100 dark:hover:bg-gold-900/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold mb-2">ترتيب حسب</label>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSort(option.value)}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                    sort === option.value
                      ? 'bg-gold-500 text-white'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-gold-100 dark:hover:bg-gold-900/30'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gold-500 hover:text-gold-600 flex items-center gap-1"
            >
              <FiX />
              إلغاء جميع الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-[var(--text-muted)]">
        {!isLoading && stories && (
          <>عرض {stories.length} قصة</>
        )}
      </div>

      {/* Stories Grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      ) : stories && stories.length > 0 ? (
        <div className="space-y-4">
          {stories.map((story, index) => (
            <StoryCard key={story.id} story={story} index={index} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-[var(--text-muted)] text-lg">لا توجد قصص تطابق بحثك</p>
          <button
            onClick={clearFilters}
            className="text-gold-500 hover:underline mt-2"
          >
            إلغاء الفلاتر
          </button>
        </div>
      )}
    </div>
  )
}

export default Explore
