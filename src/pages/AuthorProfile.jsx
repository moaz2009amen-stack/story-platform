import { useParams, Link } from 'react-router-dom'
import { useProfileByUsername } from '../hooks/useProfile'
import { useAuthorStories } from '../hooks/useStories'
import StoryCard from '../components/StoryCard'
import VerifiedBadge from '../components/VerifiedBadge'
import { FiCalendar, FiBookOpen, FiEye, FiHeart, FiUser, FiMail } from 'react-icons/fi'
import { motion } from 'framer-motion'

const AuthorProfile = () => {
  const { username } = useParams()
  const { data: profile, isLoading: profileLoading } = useProfileByUsername(username)
  const { data: stories, isLoading: storiesLoading } = useAuthorStories(profile?.id, true)

  if (profileLoading) {
    return (
      <div className="page-container">
        <div className="skeleton h-48 rounded-xl mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="page-container text-center py-12">
        <h1 className="text-2xl font-bold mb-4">الكاتب غير موجود</h1>
        <Link to="/explore" className="text-gold-500 hover:underline">العودة إلى المكتبة</Link>
      </div>
    )
  }

  const totalViews = stories?.reduce((sum, s) => sum + (s.views || 0), 0) || 0
  const totalLikes = stories?.reduce((sum, s) => sum + (s.likes || 0), 0) || 0

  return (
    <div className="page-container">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gold-500/20 to-amber-500/20 rounded-2xl p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Avatar */}
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gold-500 flex items-center justify-center text-white text-4xl font-bold">
              {profile.full_name?.charAt(0)}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold">{profile.full_name}</h1>
              {profile.is_verified && <VerifiedBadge size="large" />}
            </div>
            <p className="text-[var(--text-muted)] mb-2">@{profile.username}</p>
            {profile.bio && (
              <p className="text-[var(--text-primary)] max-w-2xl mx-auto md:mx-0">{profile.bio}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gold-500">{stories?.length || 0}</div>
              <div className="text-xs text-[var(--text-muted)]">قصة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gold-500">{totalViews.toLocaleString()}</div>
              <div className="text-xs text-[var(--text-muted)]">مشاهدة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gold-500">{totalLikes.toLocaleString()}</div>
              <div className="text-xs text-[var(--text-muted)]">إعجاب</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stories Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FiBookOpen />
          قصص {profile.full_name}
        </h2>

        {storiesLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}
          </div>
        ) : stories && stories.length > 0 ? (
          <div className="space-y-4">
            {stories.map((story, index) => (
              <StoryCard key={story.id} story={{ ...story, author: profile }} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-[var(--bg-surface)] rounded-xl">
            <p className="text-[var(--text-muted)]">لا توجد قصص منشورة بعد</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthorProfile
