import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// دوال مساعدة للمستخدمين
export const auth = {
  // تسجيل مستخدم جديد
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData // name, avatar, etc
      }
    })
    return { data, error }
  },
  
  // تسجيل الدخول
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },
  
  // تسجيل الخروج
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },
  
  // الحصول على المستخدم الحالي
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },
  
  // الحصول على بيانات المستخدم من جدول profiles
  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },
  
  // تحديث بيانات المستخدم
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
    return { data, error }
  }
}

// دوال القصص
export const stories = {
  // إنشاء قصة جديدة
  create: async (storyData) => {
    const { data, error } = await supabase
      .from('stories')
      .insert(storyData)
      .select()
      .single()
    return { data, error }
  },
  
  // الحصول على كل القصص المنشورة
  getPublished: async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*, author:profiles(*)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    return { data, error }
  },
  
  // الحصول على كل القصص (للأدمن)
  getAll: async () => {
    const { data, error } = await supabase
      .from('stories')
      .select('*, author:profiles(*)')
      .order('created_at', { ascending: false })
    return { data, error }
  },
  
  // الحصول على قصص مستخدم معين
  getUserStories: async (userId) => {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },
  
  // تحديث قصة
  update: async (storyId, updates) => {
    const { data, error } = await supabase
      .from('stories')
      .update(updates)
      .eq('id', storyId)
      .select()
      .single()
    return { data, error }
  },
  
  // حذف قصة
  delete: async (storyId) => {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId)
    return { error }
  }
}
