import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard, stories, users, analytics, settings
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  // States للبيانات
  const [stats, setStats] = useState({ totalStories: 0, totalUsers: 0, totalViews: 0, publishedStories: 0 })
  const [stories, setStories] = useState([])
  const [users, setUsers] = useState([])
  const [filteredStories, setFilteredStories] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchStory, setSearchStory] = useState('')
  const [searchUser, setSearchUser] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  // State للإعدادات
  const [settings, setSettings] = useState({
    siteName: 'قصة واختار',
    allowRegistration: true
  })
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)
  
  const ADMIN_PASSWORD = 'moaz2024story'

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      loadAllData()
    }
  }, [])

  async function loadAllData() {
    setLoading(true)
    
    // جلب القصص
    const { data: storiesData } = await supabase.from('stories').select('*').order('created_at', { ascending: false })
    setStories(storiesData || [])
    setFilteredStories(storiesData || [])
    
    // جلب المستخدمين
    const { data: usersData } = await supabase.from('profiles').select('*')
    setUsers(usersData || [])
    setFilteredUsers(usersData || [])
    
    // حساب الإحصائيات
    setStats({
      totalStories: storiesData?.length || 0,
      totalUsers: usersData?.length || 0,
      totalViews: storiesData?.reduce((acc, s) => acc + (s.views || 0), 0) || 0,
      publishedStories: storiesData?.filter(s => s.is_published).length || 0
    })
    
    setLoading(false)
  }

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuth', 'true')
      loadAllData()
    } else {
      alert('❌ كلمة المرور غير صحيحة')
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('adminAuth')
    setIsAuthenticated(false)
    setPassword('')
    setActiveTab('dashboard')
  }

  // دوال إدارة القصص
  function filterStories() {
    let filtered = [...stories]
    if (searchStory) {
      filtered = filtered.filter(s => 
        s.title?.ar?.includes(searchStory) || 
        s.title?.en?.toLowerCase().includes(searchStory.toLowerCase())
      )
    }
    if (filterStatus === 'published') {
      filtered = filtered.filter(s => s.is_published)
    } else if (filterStatus === 'draft') {
      filtered = filtered.filter(s => !s.is_published)
    }
    setFilteredStories(filtered)
  }

  async function togglePublish(storyId, currentStatus) {
    await supabase.from('stories').update({ is_published: !currentStatus }).eq('id', storyId)
    loadAllData()
  }

  async function deleteStory(storyId) {
    if (!confirm('⚠️ هل أنت متأكد من حذف هذه القصة؟')) return
    await supabase.from('stories').delete().eq('id', storyId)
    loadAllData()
  }

  // دوال إدارة المستخدمين
  function filterUsers() {
    let filtered = [...users]
    if (searchUser) {
      filtered = filtered.filter(u => 
        u.username?.includes(searchUser) || 
        u.full_name?.includes(searchUser) ||
        u.email?.includes(searchUser)
      )
    }
    setFilteredUsers(filtered)
  }

  async function toggleRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    loadAllData()
  }

  // دالة تغيير كلمة المرور
  async function handleChangePassword(e) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '❌ كلمة المرور غير متطابقة' })
      return
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '❌ كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
      return
    }
    
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: '✅ تم تغيير كلمة المرور بنجاح' })
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  // صفحة تسجيل الدخول
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl max-w-md w-full border border-white/20"
        >
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">👑</div>
            <h2 className="text-3xl font-bold text-white mb-2">لوحة التحكم</h2>
            <p className="text-gray-300">منصة قصة واختار</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg text-center"
              placeholder="🔐 أدخل كلمة المرور"
              autoFocus
            />
            <button 
              type="submit" 
              className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg text-lg"
            >
              دخول
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  // لوحة التحكم الرئيسية
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            👑 لوحة التحكم
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🚪 تسجيل خروج
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm">
          {[
            { id: 'dashboard', icon: '📊', label: 'الرئيسية' },
            { id: 'stories', icon: '📚', label: 'القصص' },
            { id: 'users', icon: '👥', label: 'المستخدمين' },
            { id: 'analytics', icon: '📈', label: 'التحليلات' },
            { id: 'settings', icon: '⚙️', label: 'الإعدادات' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalStories}</p>
                  <p className="text-gray-500 dark:text-gray-400">إجمالي القصص</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.publishedStories}</p>
                  <p className="text-gray-500 dark:text-gray-400">قصص منشورة</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                  <p className="text-gray-500 dark:text-gray-400">المستخدمين</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="text-4xl mb-2">👁️</div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</p>
                  <p className="text-gray-500 dark:text-gray-400">المشاهدات</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'stories' && (
            <motion.div
              key="stories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex gap-3 flex-wrap">
                  <input
                    type="text"
                    value={searchStory}
                    onChange={(e) => { setSearchStory(e.target.value); filterStories() }}
                    className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border"
                    placeholder="🔍 بحث عن قصة..."
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); filterStories() }}
                    className="px-4 py-2 rounded-lg border"
                  >
                    <option value="all">الكل</option>
                    <option value="published">منشور</option>
                    <option value="draft">مسودة</option>
                  </select>
                </div>
              </div>

              {/* Stories Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-right">القصة</th>
                      <th className="px-4 py-3 text-right">الحالة</th>
                      <th className="px-4 py-3 text-right">المشاهدات</th>
                      <th className="px-4 py-3 text-right">التاريخ</th>
                      <th className="px-4 py-3 text-right">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredStories.map(story => (
                      <tr key={story.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={story.cover_image} alt="" className="w-10 h-10 rounded object-cover" />
                            <div>
                              <p className="font-medium">{story.title?.ar}</p>
                              <p className="text-xs text-gray-500">{story.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => togglePublish(story.id, story.is_published)}
                            className={`px-2 py-1 rounded-full text-xs ${
                              story.is_published
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {story.is_published ? 'منشور' : 'مسودة'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm">{story.views || 0}</td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(story.created_at).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteStory(story.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            🗑️ حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => { setSearchUser(e.target.value); filterUsers() }}
                  className="w-full px-4 py-2 rounded-lg border"
                  placeholder="🔍 بحث عن مستخدم..."
                />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-right">المستخدم</th>
                      <th className="px-4 py-3 text-right">البريد</th>
                      <th className="px-4 py-3 text-right">الدور</th>
                      <th className="px-4 py-3 text-right">تاريخ التسجيل</th>
                      <th className="px-4 py-3 text-right">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white">
                              {user.full_name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-medium">{user.full_name || user.username}</p>
                              <p className="text-xs text-gray-500">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role === 'admin' ? 'مشرف' : 'مستخدم'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(user.created_at).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleRole(user.id, user.role)}
                            className="text-sm text-purple-600 hover:text-purple-700"
                          >
                            {user.role === 'admin' ? 'إلغاء صلاحية' : 'تعيين كمشرف'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
                  <p className="text-sm opacity-90">إجمالي المشاهدات</p>
                  <p className="text-4xl font-bold mt-2">{stats.totalViews}</p>
                </div>
                <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl p-6 text-white">
                  <p className="text-sm opacity-90">متوسط المشاهدات لكل قصة</p>
                  <p className="text-4xl font-bold mt-2">
                    {stats.totalStories > 0 ? Math.round(stats.totalViews / stats.totalStories) : 0}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
                  <p className="text-sm opacity-90">نسبة القصص المنشورة</p>
                  <p className="text-4xl font-bold mt-2">
                    {stats.totalStories > 0 ? Math.round((stats.publishedStories / stats.totalStories) * 100) : 0}%
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">🏆 القصص الأكثر مشاهدة</h2>
                <div className="space-y-3">
                  {stories.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10).map((story, index) => (
                    <div key={story.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-purple-600 w-8">#{index + 1}</span>
                        <img src={story.cover_image} alt="" className="w-10 h-10 rounded object-cover" />
                        <p className="font-medium">{story.title?.ar}</p>
                      </div>
                      <span>👁️ {story.views || 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              {message && (
                <div className={`p-4 rounded-lg ${
                  message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4">🔐 تغيير كلمة المرور</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border"
                    placeholder="كلمة المرور الجديدة"
                    minLength="6"
                    required
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border"
                    placeholder="تأكيد كلمة المرور"
                    minLength="6"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    🔄 تغيير كلمة المرور
                  </button>
                </form>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4">🌐 إعدادات المنصة</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">اسم المنصة</label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.allowRegistration}
                      onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                    />
                    <label>السماح بالتسجيل للمستخدمين الجدد</label>
                  </div>
                  <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    💾 حفظ الإعدادات
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
