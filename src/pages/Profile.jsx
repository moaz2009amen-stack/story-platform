import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiUser3Line, RiBookOpenLine, RiPencilLine,
  RiTrophyLine, RiTimeLine, RiEyeLine,
  RiEditLine, RiCheckLine, RiCloseLine,
  RiImageLine, RiCalendarLine, RiMailLine,
  RiPhoneLine, RiLockLine,
} from 'react-icons/ri'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../App'
import { storyHelpers, readingHelpers, profileHelpers, supabase } from '../lib/supabase'

const ACHIEVEMENTS = [
  { id: 'first_story',  icon: '✍️', title: 'أول قصة',    desc: 'نشرت قصتك الأولى',        check: (s) => s.created > 0 },
  { id: 'reader',       icon: '📖', title: 'قارئ نشط',   desc: 'قرأت 5 قصص على الأقل',    check: (s) => s.read >= 5 },
  { id: 'explorer',     icon: '🗺️', title: 'مستكشف',     desc: 'اكتشفت 10 نهايات مختلفة', check: (s) => s.endings >= 10 },
  { id: 'storyteller',  icon: '🏆', title: 'حكواتي',     desc: 'نشرت 3 قصص أو أكثر',      check: (s) => s.created >= 3 },
]

/* ── Account Settings Modal ─────────────────── */
function AccountSettings({ user, profile, onClose, onUpdate }) {
  const [tab, setTab] = useState('email')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [emailForm, setEmailForm] = useState({ newEmail: '' })
  const [phoneForm, setPhoneForm] = useState({ phone: profile?.phone || '' })

  async function updateEmail(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    const { error } = await supabase.auth.updateUser({ email: emailForm.newEmail })
    if (error) setError('حدث خطأ. تأكد من صحة الإيميل.')
    else setSuccess('تم إرسال رابط التأكيد للإيميل الجديد. تحقق من بريدك.')
    setLoading(false)
  }

  async function updatePhone(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    if (!/^[0-9+\s]{7,15}$/.test(phoneForm.phone.trim())) {
      setError('رقم الهاتف غير صحيح'); setLoading(false); return
    }
    const { error } = await supabase.from('profiles').update({ phone: phoneForm.phone }).eq('id', user.id)
    if (error) setError('حدث خطأ أثناء الحفظ.')
    else { setSuccess('تم تحديث رقم الهاتف.'); onUpdate({ phone: phoneForm.phone }) }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>إعدادات الحساب</h3>
          <button onClick={onClose} className="btn-ghost w-8 h-8 p-0 rounded-lg">
            <RiCloseLine style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          {[
            { id: 'email', label: 'تغيير الإيميل',   icon: RiMailLine },
            { id: 'phone', label: 'تغيير الهاتف',    icon: RiPhoneLine },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setError(''); setSuccess('') }}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all"
              style={{
                borderBottom: tab === t.id ? '2px solid #f59e0b' : '2px solid transparent',
                color: tab === t.id ? '#f59e0b' : 'var(--text-muted)',
              }}>
              <t.icon /> {t.label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {/* Messages */}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e' }}>
              <RiCheckLine /> {success}
            </div>
          )}
          {error && (
            <div className="p-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
              {error}
            </div>
          )}

          {/* Email Tab */}
          {tab === 'email' && (
            <form onSubmit={updateEmail} className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                  الإيميل الحالي
                </label>
                <p className="input-base text-sm py-2.5 opacity-60" dir="ltr">{user?.email}</p>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                  الإيميل الجديد *
                </label>
                <div className="relative">
                  <RiMailLine className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input type="email" required dir="ltr" placeholder="new@example.com"
                    value={emailForm.newEmail}
                    onChange={e => setEmailForm({ newEmail: e.target.value })}
                    className="input-base pr-10 text-sm" />
                </div>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                سيُرسل رابط تأكيد للإيميل الجديد — لن يتغير حتى تؤكده.
              </p>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'إرسال رابط التأكيد'}
              </button>
            </form>
          )}

          {/* Phone Tab */}
          {tab === 'phone' && (
            <form onSubmit={updatePhone} className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                  رقم الهاتف *
                </label>
                <div className="relative">
                  <RiPhoneLine className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input type="tel" required dir="ltr" placeholder="01012345678"
                    value={phoneForm.phone}
                    onChange={e => setPhoneForm({ phone: e.target.value })}
                    className="input-base pr-10 text-sm" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'حفظ رقم الهاتف'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/* ── Main Page ──────────────────────────────── */
export default function Profile() {
  const { user, profile, setProfile } = useAuth()
  const [myStories, setMyStories] = useState([])
  const [history,   setHistory]   = useState([])
  const [tab,       setTab]       = useState('stories')
  const [editing,   setEditing]   = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [editForm, setEditForm]   = useState({ full_name: '', bio: '' })

  useEffect(() => {
    if (!user) return
    storyHelpers.getByAuthor(user.id).then(({ data }) => data && setMyStories(data))
    readingHelpers.getHistory(user.id).then(({ data }) => data && setHistory(data))
  }, [user])

  useEffect(() => {
    if (profile) setEditForm({ full_name: profile.full_name || '', bio: profile.bio || '' })
  }, [profile])

  const stats = {
    created: myStories.length,
    read:    history.length,
    endings: history.reduce((acc, h) => acc + (h.progress >= 100 ? 1 : 0), 0),
  }

  async function saveProfile() {
    setSaving(true)
    const { data } = await profileHelpers.updateProfile(user.id, editForm)
    if (data) setProfile(data)
    setSaving(false)
    setEditing(false)
  }

  const TABS = [
    { id: 'stories',      label: 'قصصي',        icon: RiBookOpenLine, count: myStories.length },
    { id: 'history',      label: 'سجل القراءة',  icon: RiTimeLine,    count: history.length },
    { id: 'achievements', label: 'الإنجازات',    icon: RiTrophyLine,  count: null },
  ]

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {showSettings && (
        <AccountSettings
          user={user}
          profile={profile}
          onClose={() => setShowSettings(false)}
          onUpdate={(updates) => setProfile(p => ({ ...p, ...updates }))}
        />
      )}

      <div className="page-container py-10">
        <div className="grid lg:grid-cols-[320px,1fr] gap-8">

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Profile Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-flat p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto text-3xl font-black"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0f0d0a' }}>
                  {(profile?.full_name || profile?.username || 'م')[0]}
                </div>
              </div>

              {editing ? (
                <div className="space-y-3 text-right">
                  <input type="text" value={editForm.full_name}
                    onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="الاسم الكامل" className="input-base text-sm" />
                  <textarea value={editForm.bio}
                    onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="نبذة عنك..." rows={3} className="input-base text-sm resize-none" />
                  <div className="flex gap-2">
                    <button onClick={saveProfile} disabled={saving} className="btn-primary flex-1 justify-center py-2 text-sm">
                      {saving ? '...' : <><RiCheckLine /> حفظ</>}
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-secondary flex-1 justify-center py-2 text-sm">
                      <RiCloseLine /> إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {profile?.full_name || 'مستخدم'}
                  </h2>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>@{profile?.username || 'user'}</p>
                  {profile?.phone && (
                    <p className="text-xs flex items-center justify-center gap-1 mb-1" style={{ color: 'var(--text-muted)' }}>
                      <RiPhoneLine />{profile.phone}
                    </p>
                  )}
                  <p className="text-xs flex items-center justify-center gap-1 mb-1" style={{ color: 'var(--text-muted)' }}>
                    <RiMailLine />{user?.email}
                  </p>
                  {profile?.bio && (
                    <p className="text-sm mt-3 mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{profile.bio}</p>
                  )}
                  <p className="text-xs flex items-center justify-center gap-1 mb-4" style={{ color: 'var(--text-muted)' }}>
                    <RiCalendarLine />
                    انضم {new Date(user?.created_at).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
                  </p>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setEditing(true)} className="btn-secondary w-full justify-center text-sm py-2">
                      <RiEditLine /> تعديل الملف
                    </button>
                    <button onClick={() => setShowSettings(true)} className="btn-ghost w-full justify-center text-sm py-2">
                      <RiLockLine /> إعدادات الحساب
                    </button>
                  </div>
                </>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-flat p-5">
              <h3 className="font-bold mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>إحصائياتك</h3>
              <div className="space-y-3">
                {[
                  { icon: RiPencilLine,   label: 'قصص منشأة',     value: stats.created, color: '#f59e0b' },
                  { icon: RiBookOpenLine, label: 'قصص مقروءة',    value: stats.read,    color: '#22c55e' },
                  { icon: RiTrophyLine,   label: 'نهايات مكتشفة', value: stats.endings, color: '#a855f7' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <s.icon style={{ color: s.color }} />
                      {s.label}
                    </div>
                    <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Create */}
            <Link to="/create" className="card-flat p-5 flex items-center gap-3 hover:border-yellow-500/30 transition-colors group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                <RiPencilLine style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="font-semibold text-sm group-hover:text-yellow-500 transition-colors" style={{ color: 'var(--text-primary)' }}>اكتب قصة جديدة</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>أنشئ قصتك التفاعلية</p>
              </div>
            </Link>
          </div>

          {/* Main Content */}
          <div>
            <div className="flex gap-1 mb-8 p-1 rounded-2xl" style={{ background: 'var(--bg-surface)' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: tab === t.id ? 'var(--bg-elevated)' : 'transparent',
                    color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none',
                  }}>
                  <t.icon />
                  <span className="hidden sm:inline">{t.label}</span>
                  {t.count !== null && <span className="badge text-xs px-1.5 py-0.5">{t.count}</span>}
                </button>
              ))}
            </div>

            {/* My Stories */}
            {tab === 'stories' && (
              <div>
                {myStories.length === 0 ? (
                  <div className="text-center py-16">
                    <RiPencilLine style={{ fontSize: '3rem', color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 1rem' }} />
                    <p className="font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>لم تنشئ أي قصة بعد</p>
                    <Link to="/create" className="btn-primary mt-4 inline-flex">ابدأ الكتابة</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myStories.map((story, i) => {
                      const title = story.title?.ar || story.title || 'بلا عنوان'
                      return (
                        <motion.div key={story.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }} className="card-flat flex items-center gap-4 p-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--bg-subtle)' }}>
                            {story.cover_image
                              ? <img src={story.cover_image} alt={title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center">
                                  <RiImageLine style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                                </div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{title}</h4>
                              <span className={`badge text-xs ${story.is_published ? 'badge-green' : ''}`}>
                                {story.is_published ? 'منشور' : 'مسودة'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                              <span className="flex items-center gap-1"><RiEyeLine />{story.views || 0} مشاهدة</span>
                              <span className="flex items-center gap-1"><RiTimeLine />{story.reading_time || 5}د</span>
                            </div>
                          </div>
                          <Link to={`/story/${story.id}`} className="btn-ghost text-xs px-3 py-1.5 shrink-0">قراءة</Link>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* History */}
            {tab === 'history' && (
              <div>
                {history.length === 0 ? (
                  <div className="text-center py-16">
                    <RiBookOpenLine style={{ fontSize: '3rem', color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 1rem' }} />
                    <p className="font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>لم تقرأ أي قصة بعد</p>
                    <Link to="/explore" className="btn-primary mt-4 inline-flex">استكشف القصص</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((h, i) => {
                      const title = h.story?.title?.ar || h.story?.title || 'قصة'
                      return (
                        <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.07 }} className="card-flat flex items-center gap-4 p-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--bg-subtle)' }}>
                            {h.story?.cover_image
                              ? <img src={h.story.cover_image} alt={title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center">
                                  <RiBookOpenLine style={{ color: 'var(--text-muted)', opacity: 0.35 }} />
                                </div>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm mb-2 truncate" style={{ color: 'var(--text-primary)' }}>{title}</h4>
                            <div className="w-full rounded-full h-1.5" style={{ background: 'var(--bg-subtle)' }}>
                              <div className="h-full rounded-full transition-all"
                                style={{ width: `${h.progress || 0}%`, background: 'linear-gradient(to left, #f59e0b, #d97706)' }} />
                            </div>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{h.progress || 0}% مكتمل</p>
                          </div>
                          <Link to={`/story/${h.story_id}`} className="btn-primary text-xs px-3 py-1.5 shrink-0">استكمل</Link>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Achievements */}
            {tab === 'achievements' && (
              <div className="grid sm:grid-cols-2 gap-4">
                {ACHIEVEMENTS.map((ach, i) => {
                  const unlocked = ach.check(stats)
                  return (
                    <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }} className="card-flat p-5 flex items-center gap-4"
                      style={{ opacity: unlocked ? 1 : 0.5 }}>
                      <div className="text-3xl">{ach.icon}</div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{ach.title}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ach.desc}</p>
                      </div>
                      {unlocked && <RiTrophyLine className="text-yellow-500 text-xl mr-auto shrink-0" />}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <Footer />
    </div>
  )
}
