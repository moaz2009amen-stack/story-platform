import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUpdateProfile, useMyVerificationRequest } from '../hooks/useProfile'
import { useAuthorStories } from '../hooks/useStories'
import { readingHelpers, favoritesHelpers, storyHelpers, verificationHelpers } from '../lib/supabase'
import { uploadAvatar } from '../lib/uploadImage'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiEdit2, FiBookOpen, FiClock, FiHeart, FiAward, FiCheckCircle, FiAlertCircle, FiTrash2, FiPlus } from 'react-icons/fi'
import UserPoints from '../components/Gamification/UserPoints'
import Badges from '../components/Gamification/Badges'
import LevelProgress from '../components/Gamification/LevelProgress'
import StoryCard from '../components/StoryCard'

const Profile = () => {
  const { user, profile, refreshProfile, isVerified } = useAuth()
  const navigate = useNavigate()
  const { data: myStories, refetch: refetchStories } = useAuthorStories(user?.id, false)
  const { mutate: updateProfile } = useUpdateProfile()
  const { data: verificationRequest, refetch: refetchRequest } = useMyVerificationRequest(user?.id)
  
  const [activeTab, setActiveTab] = useState('stories')
  const [readingHistory, setReadingHistory] = useState([])
  const [favorites, setFavorites] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ fullName: '', bio: '', username: '' })
  const [uploading, setUploading] = useState(false)
  const [requestingVerification, setRequestingVerification] = useState(false)

  useEffect(() => {
    if (user && profile) {
      loadReadingHistory()
      loadFavorites()
      setEditForm({
        fullName: profile.full_name || '',
        bio: profile.bio || '',
        username: profile.username || '',
      })
    }
  }, [user, profile])

  const loadReadingHistory = async () => {
    const history = await readingHelpers.getHistory(user.id)
    setReadingHistory(history)
  }

  const loadFavorites = async () => {
    const favs = await favoritesHelpers.getUserFavorites(user.id)
    setFavorites(favs)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const avatarUrl = await uploadAvatar(file)
      await updateProfile({ userId: user.id, updates: { avatar_url: avatarUrl } })
      await refreshProfile()
      toast.success('تم تحديث الصورة الشخصية')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!editForm.fullName.trim()) {
      toast.error('الاسم الكامل مطلوب')
      return
    }

    try {
      await updateProfile({ userId: user.id, updates: { full_name: editForm.fullName, bio: editForm.bio } })
      await refreshProfile()
      setIsEditing(false)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleRequestVerification = async () => {
    const publishedCount = myStories?.filter(s => s.is_published).length || 0
    if (publishedCount < 10) {
      toast.error(`يجب أن تنشر ${10 - publishedCount} قصة أخرى قبل طلب التوثيق`)
      return
    }

    setRequestingVerification(true)
    try {
      await verificationHelpers.createRequest(user.id, publishedCount)
      await refetchRequest()
      toast.success('تم إرسال طلب التوثيق بنجاح')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setRequestingVerification(false)
    }
  }

  const handleDeleteStory = async (storyId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه القصة؟')) {
      try {
        await storyHelpers.delete(storyId)
        await refetchStories()
        toast.success('تم حذف القصة')
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف القصة')
      }
    }
  }

  const publishedCount = myStories?.filter(s => s.is_published).length || 0
  const canRequestVerification = publishedCount >= 10 && !isVerified && !verificationRequest

  return (
    <div className="page-container">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 text-center"
          >
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gold-500"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gold-500 flex items-center justify-center text-white text-4xl font-bold mx-auto">
                  {profile?.full_name?.charAt(0)}
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-1 bg-gold-500 rounded-full cursor-pointer hover:bg-gold-600 transition-colors">
                <FiEdit2 className="text-white text-sm" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
              </label>
              {uploading && <p className="text-xs text-[var(--text-muted)] mt-1">جاري الرفع...</p>}
            </div>

            <h2 className="text-xl font-bold">{profile?.full_name}</h2>
            <p className="text-[var(--text-muted)] text-sm mb-2">@{profile?.username}</p>
            {isVerified && (
              <div className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-600 px-3 py-1 rounded-full text-sm mb-3">
                <FiCheckCircle />
                حساب موثق
              </div>
            )}
            {profile?.bio && <p className="text-sm mb-4">{profile.bio}</p>}

            {isEditing ? (
              <div className="space-y-3 mt-4">
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="input-base text-sm"
                  placeholder="الاسم الكامل"
                />
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="input-base text-sm"
                  rows="2"
                  placeholder="نبذة عنك"
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdateProfile} className="btn-primary flex-1 text-sm">حفظ</button>
                  <button onClick={() => setIsEditing(false)} className="btn-secondary flex-1 text-sm">إلغاء</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn-secondary w-full text-sm">
                <FiEdit2 className="inline ml-1" />
                تعديل الملف الشخصي
              </button>
            )}
          </motion.div>

          {/* Points & Badges */}
          {profile && (
            <>
              <UserPoints 
                points={profile.points || 0} 
                level={profile.level || 1}
                totalStories={publishedCount}
                totalViews={myStories?.reduce((sum, s) => sum + (s.views || 0), 0)}
                totalLikes={myStories?.reduce((sum, s) => sum + (s.likes || 0), 0)}
              />
              <LevelProgress 
                level={profile.level || 1}
                points={profile.points || 0}
                nextLevelPoints={((profile.level || 1) + 1) * 1000}
              />
              <Badges userBadges={[]} />
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex border-b border-[var(--border-light)] mb-6">
            {[
              { id: 'stories', label: 'قصصي', icon: FiBookOpen, count: myStories?.length },
              { id: 'reading', label: 'سجل القراءة', icon: FiClock, count: readingHistory.length },
              { id: 'favorites', label: 'المفضلة', icon: FiHeart, count: favorites.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-gold-500 border-b-2 border-gold-500'
                    : 'text-[var(--text-muted)] hover:text-gold-500'
                }`}
              >
                <tab.icon />
                {tab.label}
                {tab.count > 0 && <span className="badge badge-gold text-xs">{tab.count}</span>}
              </button>
            ))}
          </div>

          {/* Stories Tab */}
          {activeTab === 'stories' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">قصصي ({myStories?.length || 0})</h3>
                <Link to="/create-story" className="btn-primary text-sm py-2 flex items-center gap-1">
                  <FiPlus />
                  قصة جديدة
                </Link>
              </div>

              {myStories?.length > 0 ? (
                myStories.map(story => (
                  <div key={story.id} className="card p-4">
                    <div className="flex gap-4">
                      <img
                        src={story.cover_image || 'https://placehold.co/400x300/f5ebd3/8c7341?text=No+Cover'}
                        alt={story.title?.ar}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold">{story.title?.ar || story.title?.en}</h4>
                        <p className="text-sm text-[var(--text-muted)] line-clamp-1">
                          {story.description?.ar || story.description?.en}
                        </p>
                        <div className="flex gap-3 mt-2 text-xs text-[var(--text-muted)]">
                          <span>{story.story_type === 'interactive' ? '🔀 تفاعلية' : '📖 عادية'}</span>
                          <span>{story.views?.toLocaleString()} مشاهدة</span>
                          <span>{story.likes?.toLocaleString()} إعجاب</span>
                          {story.is_published ? (
                            <span className="text-green-500">✓ منشورة</span>
                          ) : (
                            <span className="text-yellow-500">📝 مسودة</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link to={`/edit-story/${story.id}`} className="btn-secondary text-sm py-1 px-3">
                          تعديل
                        </Link>
                        <button onClick={() => handleDeleteStory(story.id)} className="btn-danger text-sm py-1 px-3">
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-[var(--bg-surface)] rounded-xl">
                  <p className="text-[var(--text-muted)]">ليس لديك قصص بعد</p>
                  <Link to="/create-story" className="text-gold-500 hover:underline mt-2 inline-block">
                    اكتب أول قصة لك
                  </Link>
                </div>
              )}

              {/* Verification Request Section */}
              {canRequestVerification && (
                <div className="bg-gradient-to-r from-gold-500/20 to-amber-500/20 rounded-xl p-4 mt-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h4 className="font-bold flex items-center gap-2">
                        <FiAward />
                        طلب التوثيق
                      </h4>
                      <p className="text-sm text-[var(--text-muted)]">
                        لديك {publishedCount} قصة منشورة. يمكنك طلب إشارة التحقق الزرقاء
                      </p>
                    </div>
                    <button
                      onClick={handleRequestVerification}
                      disabled={requestingVerification}
                      className="btn-primary disabled:opacity-50"
                    >
                      {requestingVerification ? 'جاري الإرسال...' : 'اطلب التوثيق'}
                    </button>
                  </div>
                </div>
              )}

              {/* Verification Request Status */}
              {verificationRequest && !isVerified && (
                <div className={`rounded-xl p-4 ${
                  verificationRequest.status === 'pending'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                    : verificationRequest.status === 'rejected'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    : ''
                }`}>
                  <div className="flex items-center gap-2">
                    <FiAlertCircle />
                    <span>
                      {verificationRequest.status === 'pending' && 'طلب التوثيق قيد المراجعة'}
                      {verificationRequest.status === 'rejected' && `تم رفض الطلب: ${verificationRequest.admin_note}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reading History Tab */}
          {activeTab === 'reading' && (
            <div className="space-y-4">
              {readingHistory.length > 0 ? (
                readingHistory.map(history => (
                  <Link key={history.id} to={`/story/${history.story_id}`} className="card p-4 block hover:shadow-lg transition-all">
                    <div className="flex gap-4">
                      <img
                        src={history.story?.cover_image || 'https://placehold.co/400x300/f5ebd3/8c7341?text=No+Cover'}
                        alt={history.story?.title?.ar}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold">{history.story?.title?.ar || history.story?.title?.en}</h4>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                            <span>تقدم القراءة</span>
                            <span>{history.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                            <div className="h-full bg-gold-500 rounded-full" style={{ width: `${history.progress}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 bg-[var(--bg-surface)] rounded-xl">
                  <p className="text-[var(--text-muted)]">لم تقرأ أي قصة بعد</p>
                  <Link to="/explore" className="text-gold-500 hover:underline mt-2 inline-block">
                    ابدأ القراءة الآن
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="space-y-4">
              {favorites.length > 0 ? (
                favorites.map(story => (
                  <StoryCard key={story.id} story={story} />
                ))
              ) : (
                <div className="text-center py-8 bg-[var(--bg-surface)] rounded-xl">
                  <p className="text-[var(--text-muted)]">ليس لديك قصص مفضلة بعد</p>
                  <Link to="/explore" className="text-gold-500 hover:underline mt-2 inline-block">
                    استكشف القصص وأضفها إلى المفضلة
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
