import { motion } from 'framer-motion'
import { FiStar, FiAward, FiTrendingUp } from 'react-icons/fi'

const UserPoints = ({ points, level, totalStories, totalViews, totalLikes }) => {
  const pointsToNextLevel = level * 1000
  const currentLevelPoints = points % 1000
  const progress = (currentLevelPoints / 1000) * 100

  return (
    <div className="bg-gradient-to-r from-gold-500 to-gold-700 rounded-xl p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiAward className="text-2xl" />
          <h3 className="font-bold text-lg">نقاطي</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{points}</p>
          <p className="text-xs opacity-90">نقطة</p>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>المستوى {level}</span>
          <span>{currentLevelPoints} / {pointsToNextLevel}</span>
        </div>
        <div className="h-2 bg-white/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-white rounded-full"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/20">
        <div className="text-center">
          <p className="text-xl font-bold">{totalStories || 0}</p>
          <p className="text-xs opacity-90">قصص</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{totalViews?.toLocaleString() || 0}</p>
          <p className="text-xs opacity-90">مشاهدة</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{totalLikes?.toLocaleString() || 0}</p>
          <p className="text-xs opacity-90">إعجاب</p>
        </div>
      </div>

      {/* Points Info */}
      <div className="mt-4 text-xs opacity-80 flex items-center gap-4">
        <span className="flex items-center gap-1">
          <FiStar /> نشر قصة: +50
        </span>
        <span className="flex items-center gap-1">
          <FiTrendingUp /> كل 100 مشاهدة: +10
        </span>
      </div>
    </div>
  )
}

export default UserPoints
