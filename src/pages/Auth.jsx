import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiBookOpenLine, RiMailLine, RiLockLine,
  RiUser3Line, RiEyeLine, RiEyeOffLine,
  RiArrowLeftLine, RiCheckLine,
} from 'react-icons/ri'
import { authHelpers } from '../lib/supabase'
import { useTheme } from '../App'

export default function Auth() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [mode,    setMode]    = useState('signin') // 'signin' | 'signup'
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [showPw,  setShowPw]  = useState(false)

  const [form, setForm] = useState({
    email: '', password: '', fullName: '', username: '',
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'signin') {
      const { error } = await authHelpers.signIn({ email: form.email, password: form.password })
      if (error) setError(error.message || 'بيانات الدخول غير صحيحة')
      else navigate('/')
    } else {
      if (!form.fullName.trim()) { setError('الاسم الكامل مطلوب'); setLoading(false); return }
      if (form.password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); setLoading(false); return }
      const { error } = await authHelpers.signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        username: form.username || form.email.split('@')[0],
      })
      if (error) setError(error.message || 'حدث خطأ. حاول مرة أخرى.')
      else setSuccess('تم إنشاء حسابك! تحقق من بريدك الإلكتروني لتأكيد الحساب.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>

      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12"
        style={{ background: 'linear-gradient(145deg, #0f0d0a 0%, #1a1714 50%, #211e18 100%)' }}>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)' }} />
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #ef4444, transparent 70%)' }} />
        </div>

        <div className="relative text-center max-w-sm">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 20px 60px rgba(245,158,11,0.4)' }}
          >
            <RiBookOpenLine className="text-black" style={{ fontSize: '3rem' }} />
          </motion.div>

          <h1 className="text-4xl font-black mb-4 text-white">قصة واختار</h1>
          <p className="text-lg mb-8" style={{ color: '#a38f67', lineHeight: 1.8 }}>
            كل اختيار تتخذه يصنع حكاية مختلفة. انضم وابدأ رحلتك.
          </p>

          {/* Decorative story cards */}
          <div className="space-y-3">
            {['رحلة إلى المجهول 🌑', 'سر القصر القديم 🏰', 'في زمن الفراعنة ⚱️'].map((t, i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.2 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-right"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b', flexShrink: 0 }} />
                <span className="text-sm text-white font-medium">{t}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">

        {/* Top bar */}
        <div className="absolute top-6 inset-x-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 btn-ghost px-3 py-2 rounded-xl lg:hidden">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <RiBookOpenLine className="text-black text-sm" />
            </div>
            <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>قصة واختار</span>
          </Link>
          <Link to="/" className="btn-ghost hidden lg:flex items-center gap-1 text-sm"
            style={{ color: 'var(--text-muted)' }}>
            <RiArrowLeftLine />
            العودة للرئيسية
          </Link>
        </div>

        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
                  {mode === 'signin' ? 'مرحبًا بعودتك 👋' : 'انضم إلينا 🎉'}
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>
                  {mode === 'signin'
                    ? 'سجل دخولك للوصول لقصصك ومكتبتك'
                    : 'أنشئ حسابًا مجانيًا وابدأ رحلة القراءة'}
                </p>
              </div>

              {/* Success */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-3 p-4 rounded-xl mb-6"
                    style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
                  >
                    <RiCheckLine className="text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm" style={{ color: '#22c55e' }}>{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-xl mb-6 text-sm"
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                        الاسم الكامل *
                      </label>
                      <div className="relative">
                        <RiUser3Line className="absolute right-3.5 top-1/2 -translate-y-1/2"
                          style={{ color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          placeholder="محمد أحمد"
                          value={form.fullName}
                          onChange={set('fullName')}
                          required
                          className="input-base pr-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                        اسم المستخدم (اختياري)
                      </label>
                      <div className="relative">
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm"
                          style={{ color: 'var(--text-muted)' }}>@</span>
                        <input
                          type="text"
                          placeholder="username"
                          value={form.username}
                          onChange={set('username')}
                          className="input-base pr-9"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    البريد الإلكتروني *
                  </label>
                  <div className="relative">
                    <RiMailLine className="absolute right-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={set('email')}
                      required
                      className="input-base pr-10"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    كلمة المرور *
                  </label>
                  <div className="relative">
                    <RiLockLine className="absolute right-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-muted)' }} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder={mode === 'signup' ? '٦ أحرف على الأقل' : '••••••••'}
                      value={form.password}
                      onChange={set('password')}
                      required
                      className="input-base pr-10 pl-10"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(s => !s)}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {showPw ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3.5 mt-2"
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      {mode === 'signin' ? 'جاري الدخول...' : 'جاري الإنشاء...'}
                    </span>
                  ) : (
                    mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء الحساب'
                  )}
                </button>
              </form>

              {/* Toggle */}
              <div className="text-center mt-6">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {mode === 'signin' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                  {' '}
                  <button
                    onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); setSuccess('') }}
                    className="font-bold transition-colors"
                    style={{ color: '#f59e0b' }}
                  >
                    {mode === 'signin' ? 'إنشاء حساب' : 'تسجيل الدخول'}
                  </button>
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
