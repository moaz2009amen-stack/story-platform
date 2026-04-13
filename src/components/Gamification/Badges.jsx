import { motion } from 'framer-motion'
import { FiAward, FiBookOpen, FiStar, FiEye, FiHeart, FiCheckCircle } from 'react-icons/fi'

const badges = {
  first_story: { name: 'أول قصة', icon: FiBookOpen, color: 'from-green-500 to-green-600', description: 'نشرت أول قصة لك' },
  '10_stories': { name: 'عشر قصص', icon: FiAward, color: 'from-blue-500 to-blue-600', description: 'نشرت 10 قصص' },
  '1000_views': { name: 'ألف مشاهدة', icon: FiEye, color: 'from-purple-500 to-purple-600', description: 'حصلت قصصك على 1000 مشاهدة' },
  '50_likes': { name: 'خمسون إعجاباً', icon: FiHeart, color: 'from-red-500 to-red-600', description: 'حصلت قصصك على 50 إعجاب' },
  verified: { name: 'موثق', icon: FiCheckCircle, color: 'from-yellow-500 to-yellow-600', description: 'حصلت على إشارة التحقق الزرقاء' },
}

const Badges = ({ userBadges = [] }) => {
  const earnedBadges = new Set(userBadges.map(b => b.badge_type))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FiAward className="text-2xl text-gold-500" />
        <h3 className="text-xl font-bold">الشارات</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {Object.entries(badges).map(([key, badge]) => {
          const isEarned = earnedBadges.has(key)
          const Icon = badge.icon
          
          return (
            <motion.div
              key={key}
              whileHover={{ scale: 1.05 }}
              className={`relative p-3 rounded-xl text-center transition-all duration-300 ${
                isEarned
                  ? `bg-gradient-to-r ${badge.color} text-white`
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)] opacity-50'
              }`}
            >
              <Icon className="text-3xl mx-auto mb-2" />
              <p className="text-sm font-semibold">{badge.name}</p>
              <p className="text-xs mt-1 opacity-90">{badge.description}</p>
              
              {!isEarned && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🔒</span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default Badges
