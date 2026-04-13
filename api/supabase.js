import { createClient } from '@supabase/supabase-js'

// هذه المتغيرات آمنة لأنها تعمل على الخادم فقط
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function handler(req, res) {
  // إعدادات CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // التعامل مع طلبات OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // التحقق من طريقة الطلب
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { action, data } = req.body

    switch (action) {
      // ============ القصص ============
      case 'getPublishedStories': {
        let query = supabase
          .from('stories')
          .select(`
            *,
            author:profiles(id, username, full_name, avatar_url, is_verified)
          `)
          .eq('is_published', true)
          .eq('is_suspended', false)

        if (data?.category && data.category !== 'الكل') {
          query = query.eq('category', data.category)
        }

        if (data?.search) {
          query = query.or(`title->>ar.ilike.%${data.search}%,title->>en.ilike.%${data.search}%`)
        }

        switch (data?.sort) {
          case 'newest':
            query = query.order('created_at', { ascending: false })
            break
          case 'most_viewed':
            query = query.order('views', { ascending: false })
            break
          default:
            query = query.order('created_at', { ascending: false })
        }

        const { data: stories, error } = await query.range(data?.offset || 0, (data?.offset || 0) + (data?.limit || 10) - 1)
        if (error) throw error
        return res.json({ success: true, data: stories })
      }

      case 'getStoryById': {
        const { data: story, error } = await supabase
          .from('stories')
          .select(`
            *,
            author:profiles(id, username, full_name, avatar_url, is_verified, bio)
          `)
          .eq('id', data.id)
          .single()
        if (error) throw error
        return res.json({ success: true, data: story })
      }

      case 'createStory': {
        const { data: story, error } = await supabase
          .from('stories')
          .insert([data.story])
          .select()
          .single()
        if (error) throw error
        return res.json({ success: true, data: story })
      }

      case 'updateStory': {
        const { data: story, error } = await supabase
          .from('stories')
          .update({ ...data.updates, updated_at: new Date() })
          .eq('id', data.id)
          .select()
          .single()
        if (error) throw error
        return res.json({ success: true, data: story })
      }

      case 'deleteStory': {
        const { error } = await supabase
          .from('stories')
          .delete()
          .eq('id', data.id)
        if (error) throw error
        return res.json({ success: true })
      }

      case 'incrementViews': {
        const { error } = await supabase.rpc('increment_views', { story_id: data.storyId })
        if (error) throw error
        return res.json({ success: true })
      }

      // ============ الملفات الشخصية ============
      case 'getProfileByUsername': {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', data.username)
          .single()
        if (error) throw error
        return res.json({ success: true, data: profile })
      }

      case 'getUserProfile': {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.userId)
          .single()
        if (error) throw error
        return res.json({ success: true, data: profile })
      }

      case 'updateProfile': {
        const { data: profile, error } = await supabase
          .from('profiles')
          .update({ ...data.updates, updated_at: new Date() })
          .eq('id', data.userId)
          .select()
          .single()
        if (error) throw error
        return res.json({ success: true, data: profile })
      }

      case 'checkUsernameUnique': {
        let query = supabase.from('profiles').select('id').eq('username', data.username)
        if (data.excludeUserId) {
          query = query.neq('id', data.excludeUserId)
        }
        const { data: result, error } = await query
        if (error) throw error
        return res.json({ success: true, data: result.length === 0 })
      }

      // ============ الإعجابات ============
      case 'addFavorite': {
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: data.userId, story_id: data.storyId }])
        if (error) throw error
        await supabase.rpc('increment_likes', { story_id: data.storyId })
        return res.json({ success: true })
      }

      case 'removeFavorite': {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', data.userId)
          .eq('story_id', data.storyId)
        if (error) throw error
        await supabase.rpc('decrement_likes', { story_id: data.storyId })
        return res.json({ success: true })
      }

      case 'isFavorited': {
        const { data: result, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', data.userId)
          .eq('story_id', data.storyId)
          .maybeSingle()
        if (error) throw error
        return res.json({ success: true, data: !!result })
      }

      case 'getUserFavorites': {
        const { data: favorites, error } = await supabase
          .from('favorites')
          .select(`
            story:stories(*, author:profiles(id, username, full_name, avatar_url, is_verified))
          `)
          .eq('user_id', data.userId)
          .order('created_at', { ascending: false })
        if (error) throw error
        return res.json({ success: true, data: favorites.map(f => f.story) })
      }

      // ============ التقييمات ============
      case 'rateStory': {
        const { data: rating, error } = await supabase
          .from('ratings')
          .upsert({
            user_id: data.userId,
            story_id: data.storyId,
            rating: data.rating,
            review: data.review,
            created_at: new Date(),
          })
          .select()
          .single()
        if (error) throw error

        // إضافة إشعار لكاتب القصة
        const { data: story } = await supabase
          .from('stories')
          .select('author_id, title')
          .eq('id', data.storyId)
          .single()
        
        if (story && story.author_id !== data.userId) {
          await supabase.from('notifications').insert([{
            user_id: story.author_id,
            type: 'rating',
            title: 'تقييم جديد على قصتك',
            message: `حصلت قصتك "${story.title?.ar || story.title?.en}" على تقييم ${data.rating} نجوم`,
            link: `/story/${data.storyId}`,
          }])
        }

        return res.json({ success: true, data: rating })
      }

      case 'getAverageRating': {
        const { data: ratings, error } = await supabase
          .from('ratings')
          .select('rating')
          .eq('story_id', data.storyId)
        if (error) throw error
        const average = ratings.length === 0 ? 0 : ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        return res.json({ success: true, data: average })
      }

      case 'getUserRating': {
        const { data: rating, error } = await supabase
          .from('ratings')
          .select('rating, review')
          .eq('user_id', data.userId)
          .eq('story_id', data.storyId)
          .maybeSingle()
        if (error) throw error
        return res.json({ success: true, data: rating })
      }

      // ============ سجل القراءة ============
      case 'saveProgress': {
        const { data: progress, error } = await supabase
          .from('reading_history')
          .upsert({
            user_id: data.userId,
            story_id: data.storyId,
            current_scene: data.currentScene,
            progress: data.progress,
            last_read: new Date(),
          })
          .select()
          .single()
        if (error) throw error
        return res.json({ success: true, data: progress })
      }

      case 'getReadingHistory': {
        const { data: history, error } = await supabase
          .from('reading_history')
          .select(`
            *,
            story:stories(id, title, cover_image, story_type)
          `)
          .eq('user_id', data.userId)
          .order('last_read', { ascending: false })
        if (error) throw error
        return res.json({ success: true, data: history })
      }

      case 'getReadingProgress': {
        const { data: progress, error } = await supabase
          .from('reading_history')
          .select('*')
          .eq('user_id', data.userId)
          .eq('story_id', data.storyId)
          .maybeSingle()
        if (error) throw error
        return res.json({ success: true, data: progress })
      }

      // ============ التعليقات ============
      case 'getComments': {
        const { data: comments, error } = await supabase
          .from('comments')
          .select(`
            *,
            user:profiles(id, username, full_name, avatar_url, is_verified),
            replies:comments(
              *,
              user:profiles(id, username, full_name, avatar_url, is_verified)
            )
          `)
          .eq('story_id', data.storyId)
          .is('parent_id', null)
          .order('created_at', { ascending: false })
        if (error) throw error
        return res.json({ success: true, data: comments })
      }

      case 'addComment': {
        const { data: comment, error } = await supabase
          .from('comments')
          .insert([{
            story_id: data.storyId,
            user_id: data.userId,
            content: data.content,
            parent_id: data.parentId || null,
          }])
          .select(`
            *,
            user:profiles(id, username, full_name, avatar_url, is_verified)
          `)
          .single()
        if (error) throw error

        // إضافة إشعار لكاتب القصة
        const { data: story } = await supabase
          .from('stories')
          .select('author_id, title')
          .eq('id', data.storyId)
          .single()
        
        if (story && story.author_id !== data.userId) {
          await supabase.from('notifications').insert([{
            user_id: story.author_id,
            type: 'comment',
            title: 'تعليق جديد على قصتك',
            message: `علق ${comment.user.full_name} على "${story.title?.ar || story.title?.en}"`,
            link: `/story/${data.storyId}`,
          }])
        }

        return res.json({ success: true, data: comment })
      }

      case 'deleteComment': {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', data.commentId)
        if (error) throw error
        return res.json({ success: true })
      }

      case 'updateComment': {
        const { data: comment, error } = await supabase
          .from('comments')
          .update({ content: data.content, updated_at: new Date() })
          .eq('id', data.commentId)
          .select()
          .single()
        if (error) throw error
        return res.json({ success: true, data: comment })
      }

      // ============ الإشعارات ============
      case 'getNotifications': {
        const { data: notifications, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', data.userId)
          .order('created_at', { ascending: false })
          .range(data.offset || 0, (data.offset || 0) + (data.limit || 20) - 1)
        if (error) throw error
        return res.json({ success: true, data: notifications })
      }

      case 'markNotificationAsRead': {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', data.notificationId)
        if (error) throw error
        return res.json({ success: true })
      }

      case 'markAllNotificationsAsRead': {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', data.userId)
          .eq('is_read', false)
        if (error) throw error
        return res.json({ success: true })
      }

      case 'getUnreadCount': {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', data.userId)
          .eq('is_read', false)
        if (error) throw error
        return res.json({ success: true, data: count })
      }

      // ============ طلبات التوثيق ============
      case 'createVerificationRequest': {
        const { data: request, error } = await supabase
          .from('verification_requests')
          .insert([{ user_id: data.userId, stories_count: data.storiesCount, status: 'pending' }])
          .select()
          .single()
        if (error) throw error
        return res.json({ success: true, data: request })
      }

      case 'getMyVerificationRequest': {
        const { data: request, error } = await supabase
          .from('verification_requests')
          .select('*')
          .eq('user_id', data.userId)
          .maybeSingle()
        if (error) throw error
        return res.json({ success: true, data: request })
      }

      default:
        return res.status(400).json({ error: 'Invalid action' })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: error.message })
  }
}
