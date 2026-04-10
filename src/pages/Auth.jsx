import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/supabase'

export default function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin') // signin or signup
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  })
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('ar')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        const { data, error } = await auth.signUp(
          formData.email,
          formData.password,
          { full_name: formData.fullName }
        )
        if (error) throw error
        
        alert(language === 'ar' 
          ? '✅ تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول.' 
          : '✅ Account created! Please sign in.')
        setMode('signin')
      } else {
        const { data, error } = await auth.signIn(formData.email, formData.password)
        if (error) throw error
        
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl max-w-md w-full border border-white/20"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📖</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {language === 'ar' 
              ? (mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب جديد')
              : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </h2>
          <p className="text-gray-300">
            {language === 'ar' 
              ? 'مرحباً بك في منصة قصة واختار'
              : 'Welcome to Story & Choose Platform'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
              required
            />
          )}
          
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            required
          />
          
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'}
            minLength="6"
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50"
          >
            {loading 
              ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...')
              : (mode === 'signin' 
                  ? (language === 'ar' ? 'دخول' : 'Sign In')
                  : (language === 'ar' ? 'إنشاء حساب' : 'Sign Up'))}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError('')
            }}
            className="text-gray-300 hover:text-white transition-colors"
          >
            {mode === 'signin'
              ? (language === 'ar' ? 'ليس لديك حساب؟ سجل الآن' : "Don't have an account? Sign Up")
              : (language === 'ar' ? 'لديك حساب؟ سجل دخول' : 'Already have an account? Sign In')}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="text-gray-400 hover:text-white text-sm"
          >
            {language === 'ar' ? 'English' : 'عربي'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
