import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

export default function UsersManager() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const ADMIN_PASSWORD = 'moaz2024story'

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      loadUsers()
    }
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm])

  async function loadUsers() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  function filterUsers() {
    let filtered = [...users]
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.username?.includes(searchTerm) || 
        u.full_name?.includes(searchTerm) ||
        u.email?.includes(searchTerm)
      )
    }
    setFilteredUsers(filtered)
  }

  function handleLogin(e) {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuth', 'true')
      loadUsers()
    } else {
      alert('❌ كلمة المرور غير صحيحة')
    }
  }

  async function toggleRole(userId, currentRole) {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    loadUsers()
  }

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
            <p className="text-gray-300">منصة قصة واختار - دخول المشرف</p>
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            👥 إدارة المستخدمين
          </h1>
          <button
            onClick={() => {
              sessionStorage.removeItem('adminAuth')
              setIsAuthenticated(false)
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            🚪 تسجيل خروج
          </button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            placeholder="🔍 بحث عن مستخدم..."
          />
        </div>

        {/* Users Table */}
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
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{user.full_name || user.username}</p>
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-700'
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
      </div>
    </div>
  )
}
