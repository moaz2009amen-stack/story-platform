import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiUser, FiUserPlus, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { profileHelpers } from '../lib/supabase'
import { useDebounce } from '../hooks/useDebounce'

const Auth = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signUp, signIn, resetPassword, user } = useAuth()
  
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  
  // Form states
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  
  // Validation states
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const debouncedUsername = useDebounce(username, 500)
  
  // Errors
  const [errors, setErrors] = useState({})

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/home')
    }
  }, [user, navigate])

  // Check username availability
  useEffect(() => {
    if (debouncedUsername.length >= 3 && mode === 'signup') {
      const checkUsername = async () => {
        setCheckingUsername(true)
        try {
          const isAvailable = await profileHelpers.checkUsernameUnique(debouncedUsername)
          setUsernameAvailable(isAvailable)
          if (!isAvailable) {
            setErrors(prev => ({ ...prev, username: 'اسم المستخدم موجود بالفعل' }))
          } else {
            setErrors(prev => ({ ...prev, username: null }))
          }
        } catch (error) {
          console.error('Error checking username:', error)
        } finally {
          setCheckingUsername(false)
        }
      }
      checkUsername()
    }
  }, [debouncedUsername, mode])

  const validateForm = () => {
    const newErrors = {}
    
    if (mode === 'signup') {
      if (!fullName.trim()) newErrors.fullName = 'الاسم الكامل مطلوب'
      if (!username.trim()) newErrors.username = 'اسم المستخدم مطلوب'
      if (username.length < 3) newErrors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'
      if (usernameAvailable === false) newErrors.username = 'اسم المستخدم موجود بالفعل'
      if (!/^[a-zA-Z0-9_]+$/.test(username)) newErrors.username = 'يسمح فقط بالحروف الإنجليزية والأرقام والشرطة السفلية'
    }
    
    if (!email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'البريد الإلكتروني غير صحيح'
    
    if (!resetMode) {
      if (!password) newErrors.password = 'كلمة المرور مطلوبة'
      if (password.length < 6) newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setLoading(true)
    try {
      if (resetMode) {
        await resetPassword(resetEmail)
        setResetMode(false)
        setResetEmail('')
      } else if (mode === 'signup') {
        await signUp({ email, password, fullName, username })
        navigate('/home')
      } else {
        await signIn({ email, password })
        navigate('/home')
      }
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (resetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[var(--bg-elevated)] rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">إعادة تعيين كلمة المرور</h1>
            <p className="text-[var(--text-muted)] text-sm">
              أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <FiMail className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="input-base pr-10"
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
            </button>

            <button
              type="button"
              onClick={() => setResetMode(false)}
              className="w-full text-center text-[var(--text-muted)] hover:text-gold-500 transition-colors"
            >
              العودة إلى تسجيل الدخول
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[var(--bg-elevated)] rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Tabs */}
        <div className="flex border-b border-[var(--border-light)]">
          <button
            onClick={() => { setMode('login'); setErrors({}) }}
            className={`flex-1 py-4 text-center font-semibold transition-all duration-300 ${
              mode === 'login'
                ? 'text-gold-500 border-b-2 border-gold-500'
                : 'text-[var(--text-muted)] hover:text-gold-500'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => { setMode('signup'); setErrors({}) }}
            className={`flex-1 py-4 text-center font-semibold transition-all duration-300 ${
              mode === 'signup'
                ? 'text-gold-500 border-b-2 border-gold-500'
                : 'text-[var(--text-muted)] hover:text-gold-500'
            }`}
          >
            إنشاء حساب
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-2">الاسم الكامل</label>
                  <div className="relative">
                    <FiUser className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`input-base pr-10 ${errors.fullName ? 'border-red-500' : ''}`}
                      placeholder="أحمد محمد"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <FiAlertCircle /> {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">اسم المستخدم</label>
                  <div className="relative">
                    <FiUserPlus className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      className={`input-base pr-10 ${errors.username ? 'border-red-500' : ''}`}
                      placeholder="ahmed123"
                    />
                    {checkingUsername && (
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {usernameAvailable === true && username.length >= 3 && (
                      <FiCheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                    )}
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <FiAlertCircle /> {errors.username}
                    </p>
                  )}
                  {usernameAvailable === true && username.length >= 3 && (
                    <p className="text-green-500 text-xs mt-1">✓ اسم المستخدم متاح</p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">البريد الإلكتروني</label>
              <div className="relative">
                <FiMail className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input-base pr-10 ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="example@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle /> {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">كلمة المرور</label>
              <div className="relative">
                <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`input-base pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-gold-500"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <FiAlertCircle /> {errors.password}
                </p>
              )}
              {mode === 'signup' && (
                <p className="text-[var(--text-muted)] text-xs mt-1">يجب أن تكون 6 أحرف على الأقل</p>
              )}
            </div>

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setResetMode(true)}
                className="text-sm text-gold-500 hover:text-gold-600"
              >
                نسيت كلمة المرور؟
              </button>
            )}

            <button
              type="submit"
              disabled={loading || (mode === 'signup' && usernameAvailable === false)}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading 
                ? 'جاري المعالجة...' 
                : mode === 'signup' 
                  ? 'إنشاء حساب' 
                  : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border-light)] text-center">
            <p className="text-[var(--text-muted)] text-sm">
              {mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrors({}) }}
                className="mr-1 text-gold-500 hover:underline"
              >
                {mode === 'login' ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Auth
