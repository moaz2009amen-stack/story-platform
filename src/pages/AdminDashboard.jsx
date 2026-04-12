import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiBookOpenLine, RiUser3Line, RiEyeLine, RiHeartLine,
  RiDeleteBinLine, RiCheckLine, RiCloseLine, RiSearchLine,
  RiBarChartLine, RiSettingsLine, RiShieldLine,
  RiToggleLine, RiLockLine, RiRefreshLine,
  RiArrowUpLine, RiArrowDownLine, RiFileList3Line,
} from 'react-icons/ri'
import { storyHelpers, profileHelpers, supabase } from '../lib/supabase'

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card-flat p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon style={{ fontSize: '1.25rem', color }} />
        </div>
      </div>
      <p className="text-2xl font-black mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
  )
}

function LoginGate({ onUnlock }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    const { data } = await supabase.from('settings').select('value').eq('key', 'admin_password').single()
    const correct = data?.value?.replace(/^"|"$/g, '') || 'moaz2024story'
    if (pw === correct) {
      sessionStorage.setItem('admin_unlocked', '1')
      onUnlock()
    } else {
      setError(true)
      setTimeout(() => setError(false), 1500)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-flat p-10 w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 8px 24px rgba(245,158,11,0.35)' }}>
          <RiShieldLine style={{ fontSize: '2rem', color: '#0f0d0a' }} />
        </div>
        <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>لوحة التحكم</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>أدخل كلمة المرور للوصول</p>
        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <RiLockLine className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="password" value={pw} onChange={e => setPw(e.target.value)}
              placeholder="كلمة المرور" className="input-base pr-10 text-center" dir="ltr" autoFocus
              style={{ borderColor: error ? '#ef4444' : undefined }} />
          </div>
          <motion.button type="submit" disabled={loading}
            className="btn-primary w-full justify-center py-3"
            animate={error ? { x: [-6, 6, -6, 6, 0] } : {}}
            transition={{ duration: 0.3 }}>
            {loading ? '...' : error ? 'كلمة المرور خاطئة ✗' : 'دخول'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

function OverviewTab({ stories, users }) {
  const published = stories.filter(s => s.is_published).length
  const totalViews = stories.reduce((a, s) => a + (s.views || 0), 0)
  const totalLikes = stories.reduce((a, s) => a + (s.likes || 0), 0)
  const recent = [...stories].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={RiBookOpenLine} label="إجمالي القصص" value={stories.length} sub={`${published} منشور`} color="#f59e0b" />
        <StatCard icon={RiUser3Line} label="المستخدمون" value={users.length} sub="مسجلين" color="#22c55e" />
        <StatCard icon={RiEyeLine} label="إجمالي المشاهدات" value={totalViews.toLocaleString('ar-EG')} color="#3b82f6" />
        <StatCard icon={RiHeartLine} label="الإعجابات" value={totalLikes.toLocaleString('ar-EG')} color="#ec4899" />
      </div>
      <div className="card-flat p-6">
        <h3 className="font-bold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>أحدث القصص</h3>
        <div className="space-y-3">
          {recent.map((story, i) => {
            const title = story.title?.ar || story.title || 'بلا عنوان'
            return (
              <div key={story.id} className="flex items-center gap-4 py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(story.created_at).toLocaleDateString('ar-EG')}</p>
                </div>
                <span className={`badge text-xs ${story.is_published ? 'badge-green' : ''}`}>{story.is_published ? 'منشور' : 'مسودة'}</span>
                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><RiEyeLine />{story.views || 0}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StoriesTab({ stories, onTogglePublish, onDelete }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [deleting, setDeleting] = useState(null)

  const filtered = stories.filter(s => {
    const t = (s.title?.ar || s.title || '').toLowerCase()
    if (search && !t.includes(search.toLowerCase())) return false
    if (filter === 'published' && !s.is_published) return false
    if (filter === 'draft' && s.is_published) return false
    return true
  })

  async function confirmDelete(id) {
    setDeleting(id)
    await onDelete(id)
    setDeleting(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <RiSearchLine className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="بحث عن قصة..." value={search} onChange={e => setSearch(e.target.value)} className="input-base pr-10 text-sm" />
        </div>
        {['all', 'published', 'draft'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: filter === f ? '#f59e0b' : 'var(--bg-elevated)', color: filter === f ? '#0f0d0a' : 'var(--text-secondary)', border: `1px solid ${filter === f ? 'transparent' : 'var(--border-subtle)'}` }}>
            {f === 'all' ? 'الكل' : f === 'published' ? 'منشور' : 'مسودة'}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>لا توجد نتائج</div>
        ) : filtered.map(story => {
          const title = story.title?.ar || story.title || 'بلا عنوان'
          return (
            <motion.div key={story.id} layout className="card-flat p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--bg-subtle)' }}>
                {story.cover_image
                  ? <img src={story.cover_image} alt={title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><RiBookOpenLine style={{ color: 'var(--text-muted)', opacity: 0.3 }} /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{title}</p>
                  <span className={`badge text-xs ${story.is_published ? 'badge-green' : ''}`}>{story.is_published ? 'منشور' : 'مسودة'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-0.5"><RiEyeLine />{story.views || 0}</span>
                  <span>{new Date(story.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => onTogglePublish(story.id, !story.is_published)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                  <RiToggleLine />{story.is_published ? 'إلغاء' : 'نشر'}
                </button>
                <button onClick={() => confirmDelete(story.id)} disabled={deleting === story.id} className="btn-danger text-xs px-2.5 py-1.5">
                  {deleting === story.id ? <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" /> : <RiDeleteBinLine />}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function UsersTab({ users }) {
  const [search, setSearch] = useState('')
  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return !q || (u.full_name || '').toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-5">
      <div className="relative">
        <RiSearchLine className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input type="text" placeholder="بحث عن مستخدم..." value={search} onChange={e => setSearch(e.target.value)} className="input-base pr-10 text-sm" />
      </div>
      <div className="card-flat overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
              {['المستخدم', 'الصلاحية', 'تاريخ الانضمام'].map(h => (
                <th key={h} className="text-right px-5 py-3 font-semibold text-xs" style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-10" style={{ color: 'var(--text-muted)' }}>لا يوجد مستخدمون</td></tr>
            ) : filtered.map((user, i) => (
              <tr key={user.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0" style={{ background: 'linear-gradient(135deg,#f59e0b22,#d9770622)', color: '#f59e0b' }}>
                      {(user.full_name || user.username || '?')[0]}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user.full_name || 'بلا اسم'}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@{user.username || '—'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`badge text-xs ${user.role === 'admin' ? 'badge-gold' : ''}`}>{user.role === 'admin' ? '👑 مسؤول' : 'مستخدم'}</span>
                </td>
                <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(user.created_at).toLocaleDateString('ar-EG')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AnalyticsTab({ stories }) {
  const topViewed = [...stories].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8)
  const topLiked = [...stories].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5)
  const maxViews = topViewed[0]?.views || 1
  const catCount = stories.reduce((acc, s) => { const c = s.category || 'أخرى'; acc[c] = (acc[c] || 0) + 1; return acc }, {})
  const catEntries = Object.entries(catCount).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-6">
      <div className="card-flat p-6">
        <h3 className="font-bold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>الأكثر مشاهدة</h3>
        <div className="space-y-3">
          {topViewed.map((story, i) => {
            const title = story.title?.ar || story.title || 'بلا عنوان'
            const pct = Math.round(((story.views || 0) / maxViews) * 100)
            return (
              <div key={story.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold w-5" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                    <span className="text-sm font-semibold truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{title}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>{(story.views || 0).toLocaleString('ar-EG')}</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-subtle)' }}>
                  <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.08, duration: 0.6 }} style={{ background: 'linear-gradient(to left, #f59e0b, #d97706)' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="card-flat p-6">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>الأكثر إعجابًا</h3>
          <div className="space-y-3">
            {topLiked.map((story, i) => (
              <div key={story.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'rgba(236,72,153,0.12)', color: '#ec4899' }}>{i + 1}</span>
                <span className="flex-1 text-sm truncate" style={{ color: 'var(--text-secondary)' }}>{story.title?.ar || story.title || 'بلا عنوان'}</span>
                <span className="text-xs font-bold" style={{ color: '#ec4899' }}>♥ {story.likes || 0}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-flat p-6">
          <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>توزيع التصنيفات</h3>
          <div className="space-y-3">
            {catEntries.map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{cat}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full" style={{ background: 'var(--bg-subtle)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.round((count / stories.length) * 100)}%`, background: '#f59e0b' }} />
                  </div>
                  <span className="badge text-xs">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsTab({ onLock }) {
  const [newPw, setNewPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')

  async function savePw(e) {
    e.preventDefault()
    setPwError('')
    if (newPw.length < 6) { setPwError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return }
    if (newPw !== confirm) { setPwError('كلمتا المرور غير متطابقتين'); return }
    setSaving(true)
    await supabase.from('settings').upsert({ key: 'admin_password', value: `"${newPw}"` })
    setSaving(false)
    setPwSaved(true)
    setNewPw('')
    setConfirm('')
    setTimeout(() => setPwSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="card-flat p-6">
        <h3 className="font-bold text-lg mb-5" style={{ color: 'var(--text-primary)' }}>تغيير كلمة المرور</h3>
        <form onSubmit={savePw} className="space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>كلمة المرور الجديدة</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" className="input-base text-sm" dir="ltr" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>تأكيد كلمة المرور</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" className="input-base text-sm" dir="ltr" />
          </div>
          {pwError && <p className="text-xs" style={{ color: '#ef4444' }}>{pwError}</p>}
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? '...' : pwSaved ? <><RiCheckLine /> تم الحفظ</> : 'حفظ كلمة المرور'}
          </button>
        </form>
      </div>
      <div className="card-flat p-6">
        <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>تسجيل الخروج</h3>
        <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>الخروج من لوحة التحكم</p>
        <button onClick={onLock} className="btn-danger flex items-center gap-2"><RiCloseLine /> خروج</button>
      </div>
    </div>
  )
}

const TABS = [
  { id: 'overview', label: 'الرئيسية', icon: RiBarChartLine },
  { id: 'stories', label: 'القصص', icon: RiBookOpenLine },
  { id: 'users', label: 'المستخدمون', icon: RiUser3Line },
  { id: 'analytics', label: 'التحليلات', icon: RiFileList3Line },
  { id: 'settings', label: 'الإعدادات', icon: RiSettingsLine },
]

export default function AdminDashboard() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('admin_unlocked') === '1')
  const [activeTab, setActiveTab] = useState('overview')
  const [stories, setStories] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  function lock() {
    sessionStorage.removeItem('admin_unlocked')
    setUnlocked(false)
  }

  async function loadData() {
    setLoading(true)
    const [s, u] = await Promise.all([storyHelpers.getAll(), profileHelpers.getAll()])
    if (s.data) setStories(s.data)
    if (u.data) setUsers(u.data)
    setLoading(false)
  }

  useEffect(() => { if (unlocked) loadData() }, [unlocked])

  async function refresh() {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  async function togglePublish(id, val) {
    await storyHelpers.update(id, { is_published: val })
    setStories(prev => prev.map(s => s.id === id ? { ...s, is_published: val } : s))
  }

  async function deleteStory(id) {
    await storyHelpers.delete(id)
    setStories(prev => prev.filter(s => s.id !== id))
  }

  if (!unlocked) return <LoginGate onUnlock={() => setUnlocked(true)} />

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <div style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="page-container">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                <RiShieldLine style={{ color: '#0f0d0a', fontSize: '1rem' }} />
              </div>
              <span className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>لوحة التحكم</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={refresh} disabled={refreshing} className="btn-ghost w-9 h-9 p-0 rounded-xl" style={{ color: 'var(--text-muted)' }}>
                <RiRefreshLine className={refreshing ? 'animate-spin' : ''} />
              </button>
              <a href="/" className="btn-ghost text-xs px-3" style={{ color: 'var(--text-muted)' }}>← الموقع</a>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid lg:grid-cols-[200px,1fr] gap-8">
          <nav className="space-y-1 sticky top-20">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-right transition-all"
                style={{ background: activeTab === tab.id ? 'rgba(245,158,11,0.1)' : 'transparent', color: activeTab === tab.id ? '#f59e0b' : 'var(--text-secondary)' }}>
                <tab.icon className="text-base shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div>
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  {activeTab === 'overview' && <OverviewTab stories={stories} users={users} />}
                  {activeTab === 'stories' && <StoriesTab stories={stories} onTogglePublish={togglePublish} onDelete={deleteStory} />}
                  {activeTab === 'users' && <UsersTab users={users} />}
                  {activeTab === 'analytics' && <AnalyticsTab stories={stories} />}
                  {activeTab === 'settings' && <SettingsTab onLock={lock} />}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
