import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiEye, FiHeart, FiStar, FiBookOpen, FiGitBranch } from 'react-icons/fi'
import VerifiedBadge from './VerifiedBadge'
import { useAverageRating } from '../hooks/useStories'

const StoryCard = ({ story, index = 0 }) => {
  const { data: avgRating = 0 } = useAverageRating(story.id)

  const getCategoryColor = (category) => {
    const colors = {
      مغامرة: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      خيال: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      رومانسية: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      رعب: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'خيال علمي': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      دراما: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    }
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Cover Image */}
        <Link to={`/story/${story.id}`} className="sm:w-32 flex-shrink-0">
          <img
            src={story.cover_image || 'https://placehold.co/400x300/f5ebd3/8c7341?text=No+Cover'}
            alt={story.title?.ar || story.title?.en}
            className="w-full h-32 sm:h-28 object-cover rounded-lg"
          />
        </Link>

        {/* Content */}
        <div className="flex-1">
          <Link to={`/story/${story.id}`}>
            <h3 className="text-lg font-bold hover:text-gold-500 transition-colors line-clamp-1">
              {story.title?.ar || story.title?.en}
            </h3>
          </Link>

          <p className="text-[var(--text-muted)] text-sm mt-1 line-clamp-2">
            {story.description?.ar || story.description?.en}
          </p>

          {/* Author */}
          <Link 
            to={`/author/${story.author?.username}`}
            className="flex items-center gap-2 mt-2 group"
          >
            {story.author?.avatar_url ? (
              <img
                src={story.author.avatar_url}
                alt={story.author.full_name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center text-white text-xs font-bold">
                {story.author?.full_name?.charAt(0)}
              </div>
            )}
            <span className="text-sm text-[var(--text-muted)] group-hover:text-gold-500 transition-colors">
              {story.author?.full_name}
            </span>
            {story.author?.is_verified && <VerifiedBadge size="small" />}
          </Link>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-[var(--text-muted)]">
            <div className="flex items-center gap-1">
              <FiEye className="text-lg" />
              <span>{story.views?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiHeart className="text-lg" />
              <span>{story.likes?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiStar className="text-lg text-yellow-500" />
              <span>{avgRating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              {story.story_type === 'interactive' ? (
                <FiGitBranch className="text-lg text-purple-500" />
              ) : (
                <FiBookOpen className="text-lg text-green-500" />
              )}
              <span>{story.story_type === 'interactive' ? 'تفاعلية' : 'عادية'}</span>
            </div>
            <span className={`badge ${getCategoryColor(story.category)}`}>
              {story.category}
            </span>
            {story.reading_time && (
              <span className="text-xs">
                ⏱️ {story.reading_time} دقيقة
              </span>
            )}
          </div>
        </div>

        {/* Read Button */}
        <Link
          to={`/story/${story.id}`}
          className="self-start sm:self-center px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-all duration-300 text-sm whitespace-nowrap"
        >
          اقرأ القصة
        </Link>
      </div>
    </motion.div>
  )
}

export default StoryCard
