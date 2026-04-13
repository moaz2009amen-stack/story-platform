import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// ============ دوال المصادقة ============
export const authHelpers = {
  // تسجيل مستخدم جديد (بدون رقم هاتف)
  signUp: async ({ email, password, fullName, username }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
        },
      },
    })
    if (error) throw error
    return data
  },

  // تسجيل الدخول
  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  // تسجيل الخروج
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // إعادة تعيين كلمة المرور (نسيت كلمة المرور)
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  },

  // الحصول على المستخدم الحالي
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // الحصول على الجلسة الحالية
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // الاستماع لتغيرات حالة المصادقة
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  },
}

// ============ دوال القصص ============
export const storyHelpers = {
  // جلب القصص المنشورة (مع فلترة وترتيب)
  getPublished: async ({ limit = 10, offset = 0, category, search, sort = 'newest' } = {}) => {
    let query = supabase
      .from('stories')
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url, is_verified)
      `)
      .eq('is_published', true)
      .eq('is_suspended', false)

    if (category && category !== 'الكل') {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.or(`title->>ar.ilike.%${search}%,title->>en.ilike.%${search}%`)
    }

    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'most_viewed':
        query = query.order('views', { ascending: false })
        break
      case 'most_liked':
        query = query.order('likes', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query.range(offset, offset + limit - 1)
    if (error) throw error
    return data
  },

  // جلب قصة حسب ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url, is_verified, bio)
      `)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  // جلب قصص كاتب معين
  getByAuthor: async (authorId, { onlyPublished = true } = {}) => {
    let query = supabase
      .from('stories')
      .select('*')
      .eq('author_id', authorId)

    if (onlyPublished) {
      query = query.eq('is_published', true)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // إنشاء قصة جديدة
  create: async (story) => {
    const { data, error } = await supabase
      .from('stories')
      .insert([story])
      .select()
      .single()
    if (error) throw error
    return data
  },

  // تحديث قصة
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('stories')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // حذف قصة
  delete: async (id) => {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // زيادة عدد المشاهدات
  incrementViews: async (id) => {
    const { error } = await supabase.rpc('increment_views', { story_id: id })
    if (error) throw error
  },

  // جلب كل القصص (للأدمن فقط)
  getAll: async () => {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        author:profiles(id, username, full_name, email)
      `)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // تعليق/إلغاء تعليق قصة (للأدمن)
  suspend: async (id, suspended) => {
    const { data, error } = await supabase
      .from('stories')
      .update({ is_suspended: suspended })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
}

// ============ دوال الملفات الشخصية ============
export const profileHelpers = {
  // جلب ملف شخصي حسب اسم المستخدم
  getByUsername: async (username) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
    if (error) throw error
    return data
  },

  // جلب ملف شخصي حسب ID
  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  // تحديث الملف الشخصي
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // جلب كل المستخدمين (للأدمن)
  getAll: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // حظر/رفع حظر مستخدم (للأدمن)
  banUser: async (userId, banned) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ banned })
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // توثيق مستخدم (للأدمن)
  verifyUser: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_verified: true, verified_at: new Date() })
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // التحقق من تفرد اسم المستخدم
  checkUsernameUnique: async (username, excludeUserId = null) => {
    let query = supabase.from('profiles').select('id').eq('username', username)
    if (excludeUserId) {
      query = query.neq('id', excludeUserId)
    }
    const { data, error } = await query
    if (error) throw error
    return data.length === 0
  },
}

// ============ دوال طلبات التوثيق ============
export const verificationHelpers = {
  // إنشاء طلب توثيق
  createRequest: async (userId, storiesCount) => {
    const { data, error } = await supabase
      .from('verification_requests')
      .insert([{ user_id: userId, stories_count: storiesCount, status: 'pending' }])
      .select()
      .single()
    if (error) throw error
    return data
  },

  // جلب طلبي
  getMyRequest: async (userId) => {
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // جلب الطلبات المعلقة (للأدمن)
  getPending: async () => {
    const { data, error } = await supabase
      .from('verification_requests')
      .select(`
        *,
        profile:profiles(id, username, full_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  // الموافقة على طلب (للأدمن)
  approve: async (requestId, userId) => {
    // تحديث حالة الطلب
    const { error: reqError } = await supabase
      .from('verification_requests')
      .update({ status: 'approved', updated_at: new Date() })
      .eq('id', requestId)
    if (reqError) throw reqError

    // توثيق المستخدم
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ is_verified: true, verified_at: new Date() })
      .eq('id', userId)
    if (profileError) throw profileError

    // إضافة إشعار
    await supabase.from('notifications').insert([{
      user_id: userId,
      type: 'verified',
      title: 'تم توثيق حسابك!',
      message: 'تهانينا! حصلت على إشارة التحقق الزرقاء ✓',
      link: '/profile',
    }])

    return true
  },

  // رفض طلب (للأدمن)
  reject: async (requestId, note) => {
    // جلب الطلب أولاً لمعرفة user_id
    const { data: request, error: getError } = await supabase
      .from('verification_requests')
      .select('user_id')
      .eq('id', requestId)
      .single()
    if (getError) throw getError

    // تحديث حالة الطلب مع سبب الرفض
    const { error: reqError } = await supabase
      .from('verification_requests')
      .update({ status: 'rejected', admin_note: note, updated_at: new Date() })
      .eq('id', requestId)
    if (reqError) throw reqError

    // إضافة إشعار بالرفض
    await supabase.from('notifications').insert([{
      user_id: request.user_id,
      type: 'verified',
      title: '⚠️ لم يتم قبول طلب التوثيق',
      message: `سبب الرفض: ${note}`,
      link: '/profile',
    }])

    return true
  },
}

// ============ دوال سجل القراءة ============
export const readingHelpers = {
  // حفظ التقدم
  saveProgress: async (userId, storyId, currentScene, progress) => {
    const { data, error } = await supabase
      .from('reading_history')
      .upsert({
        user_id: userId,
        story_id: storyId,
        current_scene: currentScene,
        progress,
        last_read: new Date(),
      })
      .select()
      .single()
    if (error) throw error
    return data
  },

  // جلب سجل القراءة للمستخدم
  getHistory: async (userId) => {
    const { data, error } = await supabase
      .from('reading_history')
      .select(`
        *,
        story:stories(id, title, cover_image, story_type)
      `)
      .eq('user_id', userId)
      .order('last_read', { ascending: false })
    if (error) throw error
    return data
  },

  // جلب تقدم قصة معينة
  getProgress: async (userId, storyId) => {
    const { data, error } = await supabase
      .from('reading_history')
      .select('*')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },
}

// ============ دوال الإعجابات ============
export const favoritesHelpers = {
  // إضافة إعجاب
  add: async (userId, storyId) => {
    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, story_id: storyId }])
    if (error) throw error

    // زيادة عدد الإعجابات في جدول القصص
    await supabase.rpc('increment_likes', { story_id: storyId })
  },

  // إزالة إعجاب
  remove: async (userId, storyId) => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('story_id', storyId)
    if (error) throw error

    // إنقاص عدد الإعجابات في جدول القصص
    await supabase.rpc('decrement_likes', { story_id: storyId })
  },

  // التحقق من حالة الإعجاب
  isFavorited: async (userId, storyId) => {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .maybeSingle()
    if (error) throw error
    return !!data
  },

  // جلب إعجابات المستخدم
  getUserFavorites: async (userId) => {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        story:stories(*, author:profiles(id, username, full_name, avatar_url, is_verified))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map(item => item.story)
  },
}

// ============ دوال التقييمات ============
export const ratingsHelpers = {
  // إضافة أو تحديث تقييم
  rate: async (userId, storyId, rating, review = '') => {
    const { data, error } = await supabase
      .from('ratings')
      .upsert({
        user_id: userId,
        story_id: storyId,
        rating,
        review,
        created_at: new Date(),
      })
      .select()
      .single()
    if (error) throw error

    // إضافة إشعار لكاتب القصة
    const { data: story } = await supabase
      .from('stories')
      .select('author_id, title')
      .eq('id', storyId)
      .single()
    
    if (story && story.author_id !== userId) {
      await supabase.from('notifications').insert([{
        user_id: story.author_id,
        type: 'rating',
        title: 'تقييم جديد على قصتك',
        message: `حصلت قصتك "${story.title?.ar || story.title?.en}" على تقييم ${rating} نجوم`,
        link: `/story/${storyId}`,
      }])
    }

    return data
  },

  // جلب متوسط تقييم قصة
  getAverageRating: async (storyId) => {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('story_id', storyId)
    if (error) throw error
    
    if (data.length === 0) return 0
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0)
    return sum / data.length
  },

  // جلب تقييم المستخدم لقصة معينة
  getUserRating: async (userId, storyId) => {
    const { data, error } = await supabase
      .from('ratings')
      .select('rating, review')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .maybeSingle()
    if (error) throw error
    return data
  },

  // جلب كل تقييمات قصة
  getStoryRatings: async (storyId) => {
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        *,
        user:profiles(id, username, full_name, avatar_url)
      `)
      .eq('story_id', storyId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
}

// ============ دوال التعليقات ============
export const commentsHelpers = {
  // جلب تعليقات قصة
  getByStory: async (storyId) => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles(id, username, full_name, avatar_url, is_verified),
        replies:comments(
          *,
          user:profiles(id, username, full_name, avatar_url, is_verified)
        )
      `)
      .eq('story_id', storyId)
      .is('parent_id', null)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // إضافة تعليق
  add: async (storyId, userId, content, parentId = null) => {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        story_id: storyId,
        user_id: userId,
        content,
        parent_id: parentId,
      }])
      .select(`
        *,
        user:profiles(id, username, full_name, avatar_url, is_verified)
      `)
      .single()
    if (error) throw error

    // إضافة إشعار لكاتب القصة (إذا لم يكن المعلق هو الكاتب)
    const { data: story } = await supabase
      .from('stories')
      .select('author_id, title')
      .eq('id', storyId)
      .single()
    
    if (story && story.author_id !== userId) {
      await supabase.from('notifications').insert([{
        user_id: story.author_id,
        type: 'comment',
        title: 'تعليق جديد على قصتك',
        message: `علق ${data.user.full_name} على "${story.title?.ar || story.title?.en}"`,
        link: `/story/${storyId}`,
      }])
    }

    return data
  },

  // حذف تعليق
  delete: async (commentId) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
    if (error) throw error
  },

  // تحديث تعليق
  update: async (commentId, content) => {
    const { data, error } = await supabase
      .from('comments')
      .update({ content, updated_at: new Date() })
      .eq('id', commentId)
      .select()
      .single()
    if (error) throw error
    return data
  },
}

// ============ دوال الإشعارات ============
export const notificationsHelpers = {
  // جلب إشعارات المستخدم
  getUserNotifications: async (userId, { limit = 20, offset = 0 } = {}) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) throw error
    return data
  },

  // تحديث حالة الإشعار (قرأ/غير مقروء)
  markAsRead: async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
    if (error) throw error
  },

  // تحديث كل الإشعارات كمقروءة
  markAllAsRead: async (userId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    if (error) throw error
  },

  // جلب عدد الإشعارات غير المقروءة
  getUnreadCount: async (userId) => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    if (error) throw error
    return count
  },
}

// ============ دوال النقاط والشارات ============
export const gamificationHelpers = {
  // إضافة نقاط للمستخدم
  addPoints: async (userId, points, reason) => {
    // جلب النقاط الحالية
    const { data: profile } = await supabase
      .from('profiles')
      .select('points, level')
      .eq('id', userId)
      .single()
    
    const newPoints = (profile?.points || 0) + points
    const newLevel = Math.floor(newPoints / 1000) + 1
    
    const { error } = await supabase
      .from('profiles')
      .update({ points: newPoints, level: newLevel })
      .eq('id', userId)
    if (error) throw error

    // إضافة إشعار
    await supabase.from('notifications').insert([{
      user_id: userId,
      type: 'like',
      title: `+${points} نقطة`,
      message: `حصلت على ${points} نقطة ${reason}`,
      link: '/profile',
    }])

    return { points: newPoints, level: newLevel }
  },

  // منح شارة
  awardBadge: async (userId, badgeType) => {
    const { error } = await supabase
      .from('user_badges')
      .insert([{ user_id: userId, badge_type: badgeType }])
    if (error && error.code !== '23505') throw error // 23505 = duplicate key
    
    if (!error) {
      await supabase.from('notifications').insert([{
        user_id: userId,
        type: 'like',
        title: '🎉 شارة جديدة!',
        message: `حصلت على شارة ${getBadgeName(badgeType)}`,
        link: '/profile',
      }])
    }
  },

  // جلب شارات المستخدم
  getUserBadges: async (userId) => {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data
  },
}

function getBadgeName(badgeType) {
  const names = {
    first_story: 'أول قصة',
    '10_stories': 'عشر قصص',
    '1000_views': 'ألف مشاهدة',
    '50_likes': 'خمسون إعجاباً',
    verified: 'موثق ✓',
  }
  return names[badgeType] || badgeType
}
