import { motion } from 'framer-motion'
import { FiTrendingUp, FiTarget } from 'react-icons/fi'

const LevelProgress = ({ level, points, nextLevelPoints }) => {
  const currentLevelProgress = points % 1000
  const progress = (currentLevelProgress / 1000) * 100
  const pointsNeeded = nextLevelPoints - points

  // مستوى التالي
  const nextLevelRewards = {
    2: 'فتح إمكانية إضافة صور متعددة للمشهد',
    3: 'ظهور قصصك في القسم المميز',
    5: 'شارة "كاتب محترف"',
    10: 'دعوة خاصة لفعاليات الكتابة',
  }

  const reward = nextLevelRewards[level + 1]

  return (
    <div className="bg-[var(--bg-surface)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiTrendingUp className="text-2xl text-gold-500" />
          <h3 className="font-bold text-lg">التقدم للمستوى التالي</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-[var(--text-muted)]">المستوى {level} → {level + 1}</p>
          <p className="text-xs text-gold-500">{pointsNeeded} نقطة متبقية</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-gold-500 to-gold-600 rounded-full"
        />
      </div>

      {/* Next Level Reward */}
      {reward && (
        <div className="flex items-start gap-3 p-3 bg-gold-50 dark:bg-gold-900/20 rounded-lg">
          <FiTarget className="text-gold-500 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">مكافأة المستوى {level + 1}</p>
            <p className="text-xs text-[var(--text-muted)]">{reward}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LevelProgress
