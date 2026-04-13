import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // التحقق من وجود رمز إعادة التعيين
    const accessToken = searchParams.get('access_token')
    if (!accessToken) {
      toast.error('رابط إعادة التعيين غير صالح')
      navigate('/auth')
    }
  }, [searchParams, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين')
      return
    }
    
    if (password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      
      toast.success('تم تغيير كلمة المرور بنجاح')
      navigate('/auth')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[var(--bg-elevated)] rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
            <FiLock className="text-2xl text-gold-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">إعادة تعيين كلمة المرور</h1>
          <p className="text-[var(--text-muted)] text-sm">
            أدخل كلمة المرور الجديدة
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">كلمة المرور الجديدة</label>
            <div className="relative">
              <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-gold-500"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">تأكيد كلمة المرور</label>
            <div className="relative">
              <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-base pr-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default ResetPassword
