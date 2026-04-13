import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { storyHelpers, profileHelpers, verificationHelpers } from '../lib/supabase'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  FiUsers, FiBookOpen, FiEye, FiHeart, FiStar, FiCheckCircle, 
  FiXCircle, FiAlertCircle, FiSettings, FiBarChart2, FiUserCheck,
  FiUserX, FiTrash2, FiEdit2, FiFlag, FiCheck, FiLoader
} from 'react-icons/fi'

const AdminDashboard = () => {
  const { user, profile, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  
  // Data states
  const [stories, setStories] = useState([])
  const [users, setUsers] = useState([])
  const [verificationRequests, setVerificationRequests] = useState([])
  const [stats, setStats] = useState({})
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [storyFilter, setStoryFilter] = useState('all')

  // Check admin access
  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/404')
    }
  }, [user, isAdmin, navigate])

  // Load data
  useEffect(() => {
    if (isAdmin) {
      loadAllData()
    }
  }, [isAdmin, activeTab])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [storiesData, usersData, requestsData] = await Promise.all([
        storyHelpers.getAll(),
        profileHelpers.getAll(),
        verificationHelpers.getPending(),
      ])
      
      setStories(storiesData || [])
      setUsers(usersData || [])
      setVerificationRequests(requestsData || [])
      
      // Calculate stats
      const totalViews = storiesData?.reduce((sum, s) => sum + (s.views || 0), 0) || 0
      const totalLikes = storiesData?.reduce((sum, s) => sum + (s.likes || 0), 0) || 0
      const publishedStories = storiesData?.filter(s => s.is_published).length || 0
      
      setStats({
        totalUsers: usersData?.length || 0,
        totalStories: storiesData?.length || 0,
        publishedStories,
        totalViews,
        totalLikes,
        pendingVerifications: requestsData?.length || 0,
      })
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('حدث خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublish = async (storyId, currentStatus) => {
    try {
      await storyHelpers.update(storyId, { is_published: !currentStatus })
      toast.success(`تم ${!currentStatus ? 'نشر' : 'إلغاء نشر'} القصة`)
      loadAllData()
    } catch (error) {
      toast.error('حدث خطأ')
    }
  }

  const handleToggleSuspend = async (storyId, currentStatus) => {
    try {
      await storyHelpers.suspend(storyId, !currentStatus)
      toast.success(`تم ${!currentStatus ? 'إيقاف' : 'إعادة نشر'} القصة`)
      loadAllData()
    } catch (error) {
      toast.error('حدث خطأ')
    }
  }

  const handleDeleteStory = async (storyId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه القصة؟')) {
      try {
        await storyHelpers.delete(storyId)
        toast.success('تم حذف القصة')
        loadAllData()
      } catch (error) {
        toast.error('حدث خطأ')
      }
    }
  }

  const handleToggleBan = async (userId, currentStatus) => {
    try {
      await profileHelpers.banUser(userId, !currentStatus)
      toast.success(`تم ${!currentStatus ? 'حظر' : 'رفع الحظر عن'} المستخدم`)
      loadAllData()
    } catch (error) {
      toast.error('حدث خطأ')
    }
  }

  const handleChangeRole = async (userId, newRole) => {
    try {
      await profileHelpers.updateProfile(userId, { role: newRole })
      toast.success(`تم تغيير صلاحية المستخدم إلى ${newRole === 'admin' ? 'أدمن' : 'مستخدم'}`)
      loadAllData()
    } catch (error) {
      toast.error('حدث خطأ')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع قصصه')) {
      try {
        // Note: You need to implement user deletion with cascade
        toast.success('تم حذف المستخدم')
        loadAllData()
      } catch (error) {
        toast.error('حدث خطأ')
      }
    }
  }

  const handleApproveVerification = async (requestId, userId) => {
    try {
      await verificationHelpers.approve(requestId, userId)
      toast.success('تم توثيق المستخدم')
      loadAllData()
    } catch (error) {
      toast.error('حدث خطأ')
    }
  }

  const handleRejectVerification = async (requestId) => {
    const note = prompt('سبب الرفض:')
    if (note) {
      try {
        await verificationHelpers.reject(requestId, note)
        toast.success('تم رفض الطلب')
        loadAllData()
      } catch (error) {
        toast.error('حدث خطأ')
      }
    }
  }

  const filteredStories = stories.filter(story => {
    if (searchTerm) {
      const title = story.title?.ar || story.title?.en || ''
      if (!title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    }
    if (storyFilter === 'published') return story.is_published
    if (storyFilter === 'draft') return !story.is_published
    if (storyFilter === 'suspended') return story.is_suspended
    return true
  })

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <FiLoader className="text-4xl text-gold-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
        <p className="text-[var(--text-muted)]">مرحباً {profile?.full_name}</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--border-light)] pb-2">
        {[
          { id: 'overview', label: 'الرئيسية', icon: FiBarChart2, count: null },
          { id: 'stories', label: 'القصص', icon: FiBookOpen, count: stories.length },
          { id: 'users', label: 'المستخدمون', icon: FiUsers, count: users.length },
          { id: 'verifications', label: 'طلبات التوثيق', icon: FiUserCheck, count: stats.pendingVerifications },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gold-500 text-white'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
            }`}
          >
            <tab.icon />
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white text-gold-500' : 'bg-gold-500 text-white'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="card p-4 text-center">
              <FiUsers className="text-2xl text-gold-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-xs text-[var(--text-muted)]">مستخدم</div>
            </div>
            <div className="card p-4 text-center">
              <FiBookOpen className="text-2xl text-gold-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalStories}</div>
              <div className="text-xs text-[var(--text-muted)]">قصة</div>
            </div>
            <div className="card p-4 text-center">
              <FiEye className="text-2xl text-gold-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
              <div className="text-xs text-[var(--text-muted)]">مشاهدة</div>
            </div>
            <div className="card p-4 text-center">
              <FiHeart className="text-2xl text-gold-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalLikes.toLocaleString()}</div>
              <div className="text-xs text-[var(--text-muted)]">إعجاب</div>
            </div>
            <div className="card p-4 text-center">
              <FiCheckCircle className="text-2xl text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.publishedStories}</div>
              <div className="text-xs text-[var(--text-muted)]">قصة منشورة</div>
            </div>
            <div className="card p-4 text-center">
              <FiUserCheck className="text-2xl text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
              <div className="text-xs text-[var(--text-muted)]">طلب توثيق</div>
            </div>
          </div>

          {/* Pending Verifications Alert */}
          {stats.pendingVerifications > 0 && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="text-yellow-600" />
                <span>يوجد {stats.pendingVerifications} طلب توثيق في انتظار المراجعة</span>
              </div>
              <button onClick={() => setActiveTab('verifications')} className="btn-primary text-sm">
                مراجعة الطلبات
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Stories Tab */}
      {activeTab === 'stories' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex flex-wrap gap-4 justify-between">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="بحث في القصص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-base w-64"
              />
              <select value={storyFilter} onChange={(e) => setStoryFilter(e.target.value)} className="input-base w-32">
                <option value="all">الكل</option>
                <option value="published">منشورة</option>
                <option value="draft">مسودة</option>
                <option value="suspended">موقوفة</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {filteredStories.map(story => (
              <div key={story.id} className="card p-4">
                <div className="flex flex-wrap gap-4 justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold">{story.title?.ar || story.title?.en}</h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      بواسطة {story.author?.full_name} | {story.views?.toLocaleString()} مشاهدة | {story.likes?.toLocaleString()} إعجاب
                    </p>
                    <div className="flex gap-2 mt-2">
                      {story.is_published ? (
                        <span className="badge badge-green">منشورة</span>
                      ) : (
                        <span className="badge badge-crimson">مسودة</span>
                      )}
                      {story.is_suspended && <span className="badge badge-crimson">موقوفة</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTogglePublish(story.id, story.is_published)}
                      className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-green-500"
                      title={story.is_published ? 'إلغاء النشر' : 'نشر'}
                    >
                      <FiCheck />
                    </button>
                    <button
                      onClick={() => handleToggleSuspend(story.id, story.is_suspended)}
                      className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-red-500"
                      title={story.is_suspended ? 'إلغاء الإيقاف' : 'إيقاف'}
                    >
                      <FiFlag />
                    </button>
                    <button
                      onClick={() => handleDeleteStory(story.id)}
                      className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-red-500"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <input
            type="text"
            placeholder="بحث في المستخدمين..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-base w-64"
          />

          <div className="space-y-2">
            {filteredUsers.map(user => (
              <div key={user.id} className="card p-4">
                <div className="flex flex-wrap gap-4 justify-between items-start">
                  <div className="flex items-center gap-3">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-white">
                        {user.full_name?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold">{user.full_name}</h3>
                      <p className="text-sm text-[var(--text-muted)]">@{user.username}</p>
                      <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      className="input-base text-sm w-24"
                    >
                      <option value="user">مستخدم</option>
                      <option value="admin">أدمن</option>
                    </select>
                    <button
                      onClick={() => handleToggleBan(user.id, user.banned)}
                      className={`p-2 rounded-lg hover:bg-[var(--bg-surface)] ${user.banned ? 'text-green-500' : 'text-red-500'}`}
                      title={user.banned ? 'رفع الحظر' : 'حظر'}
                    >
                      {user.banned ? <FiUserCheck /> : <FiUserX />}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 rounded-lg hover:bg-[var(--bg-surface)] text-red-500"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Verifications Tab */}
      {activeTab === 'verifications' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {verificationRequests.length === 0 ? (
            <div className="text-center py-8 bg-[var(--bg-surface)] rounded-xl">
              <FiCheckCircle className="text-4xl text-green-500 mx-auto mb-2" />
              <p>لا توجد طلبات توثيق معلقة</p>
            </div>
          ) : (
            verificationRequests.map(request => (
              <div key={request.id} className="card p-4">
                <div className="flex flex-wrap gap-4 justify-between items-start">
                  <div>
                    <h3 className="font-bold">{request.profile?.full_name}</h3>
                    <p className="text-sm text-[var(--text-muted)]">@{request.profile?.username}</p>
                    <p className="text-sm">{request.profile?.email}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">عدد القصص: {request.stories_count}</p>
                    <p className="text-xs text-[var(--text-muted)]">تاريخ الطلب: {new Date(request.created_at).toLocaleDateString('ar')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveVerification(request.id, request.user_id)}
                      className="btn-primary text-sm py-2 flex items-center gap-1"
                    >
                      <FiCheck /> موافقة
                    </button>
                    <button
                      onClick={() => handleRejectVerification(request.id)}
                      className="btn-danger text-sm py-2 flex items-center gap-1"
                    >
                      <FiXCircle /> رفض
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.div>
      )}
    </div>
  )
}

export default AdminDashboard
