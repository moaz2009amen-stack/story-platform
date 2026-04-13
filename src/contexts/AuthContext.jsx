import { createContext, useContext, useEffect, useState } from 'react'
import { authHelpers, profileHelpers } from '../lib/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (userId) => {
    try {
      const profileData = await profileHelpers.getUserProfile(userId)
      setProfile(profileData)
      
      // التحقق من حظر المستخدم
      if (profileData?.banned) {
        toast.error('حسابك محظور. يرجى التواصل مع الدعم للمزيد من المعلومات')
        await authHelpers.signOut()
        setUser(null)
        setProfile(null)
      }
      
      return profileData
    } catch (error) {
      console.error('Error loading profile:', error)
      return null
    }
  }

  useEffect(() => {
    // التحقق من الجلسة الحالية
    const initAuth = async () => {
      setLoading(true)
      const session = await authHelpers.getSession()
      if (session?.user) {
        setUser(session.user)
        await loadProfile(session.user.id)
      }
      setLoading(false)
    }
    
    initAuth()

    // الاستماع لتغيرات المصادقة
    const { data: { subscription } } = authHelpers.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        await loadProfile(session.user.id)
        toast.success('مرحباً بك!')
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        toast.success('تم تسجيل الخروج بنجاح')
      } else if (event === 'USER_UPDATED' && session?.user) {
        setUser(session.user)
        await loadProfile(session.user.id)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async ({ email, password, fullName, username }) => {
    try {
      // التحقق من تفرد اسم المستخدم
      const isUnique = await profileHelpers.checkUsernameUnique(username)
      if (!isUnique) {
        throw new Error('اسم المستخدم موجود بالفعل. يرجى اختيار اسم آخر')
      }
      
      const result = await authHelpers.signUp({ email, password, fullName, username })
      
      if (result.user) {
        toast.success('تم إنشاء الحساب بنجاح! يرجى تأكيد بريدك الإلكتروني')
      }
      
      return result
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const signIn = async ({ email, password }) => {
    try {
      const result = await authHelpers.signIn({ email, password })
      
      if (result.user) {
        const profileData = await loadProfile(result.user.id)
        
        if (profileData?.banned) {
          await authHelpers.signOut()
          throw new Error('حسابك محظور')
        }
      }
      
      return result
    } catch (error) {
      toast.error(error.message === 'Invalid login credentials' 
        ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
        : error.message)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await authHelpers.signOut()
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الخروج')
    }
  }

  const resetPassword = async (email) => {
    try {
      await authHelpers.resetPassword(email)
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')
    } catch (error) {
      toast.error(error.message || 'حدث خطأ أثناء إرسال رابط إعادة التعيين')
      throw error
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAdmin: profile?.role === 'admin',
    isVerified: profile?.is_verified === true,
    refreshProfile: () => loadProfile(user?.id),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
