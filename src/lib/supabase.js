import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase env variables missing. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

/* ══════════════════════════════════════════
   Auth Helpers
   ══════════════════════════════════════════ */

export const authHelpers = {
  async signUp({ email, password, fullName, username }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, username },
      },
    })
    return { data, error }
  },

  async signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },
}

/* ══════════════════════════════════════════
   Story Helpers
   ══════════════════════════════════════════ */

export const storyHelpers = {
  async getPublished({ limit = 20, offset = 0, category = null, search = null, sort = 'created_at' } = {}) {
    let query = supabase
      .from('stories')
      .select(`
        id, title, description, cover_image, category, tags,
        reading_time, views, likes, created_at, first_scene,
        author:profiles(id, username, full_name, avatar_url)
      `)
      .eq('is_published', true)

    if (category) query = query.eq('category', category)
    if (search)   query = query.or(`title->>ar.ilike.%${search}%,title->>en.ilike.%${search}%`)

    const sortMap = {
      created_at: { col: 'created_at', asc: false },
      oldest:     { col: 'created_at', asc: true },
      views:      { col: 'views', asc: false },
      likes:      { col: 'likes', asc: false },
    }
    const s = sortMap[sort] || sortMap.created_at
    query = query.order(s.col, { ascending: s.asc })

    const { data, error, count } = await query.range(offset, offset + limit - 1)
    return { data, error, count }
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url, bio)
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  async getByAuthor(authorId) {
    const { data, error } = await supabase
      .from('stories')
      .select('id, title, description, cover_image, category, is_published, views, likes, created_at, reading_time')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async create(story) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: { message: 'غير مسجل دخول' } }

    const { data, error } = await supabase
      .from('stories')
      .insert({ ...story, author_id: user.id })
      .select()
      .single()
    return { data, error }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('stories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async delete(id) {
    const { error } = await supabase.from('stories').delete().eq('id', id)
    return { error }
  },

  async incrementViews(id) {
    const { error } = await supabase.rpc('increment_views', { story_id: id })
    return { error }
  },

  async getAll() {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        id, title, description, cover_image, category, is_published,
        views, likes, created_at, reading_time,
        author:profiles(id, username, full_name)
      `)
      .order('created_at', { ascending: false })
    return { data, error }
  },
}

/* ══════════════════════════════════════════
   Profile Helpers
   ══════════════════════════════════════════ */

export const profileHelpers = {
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, role, created_at')
      .order('created_at', { ascending: false })
    return { data, error }
  },
}

/* ══════════════════════════════════════════
   Reading History Helpers
   ══════════════════════════════════════════ */

export const readingHelpers = {
  async saveProgress(userId, storyId, currentScene, progress) {
    const { data, error } = await supabase
      .from('reading_history')
      .upsert(
        { user_id: userId, story_id: storyId, current_scene: currentScene, progress, last_read: new Date().toISOString() },
        { onConflict: 'user_id,story_id' }
      )
    return { data, error }
  },

  async getHistory(userId) {
    const { data, error } = await supabase
      .from('reading_history')
      .select(`
        *,
        story:stories(id, title, cover_image, category, reading_time)
      `)
      .eq('user_id', userId)
      .order('last_read', { ascending: false })
    return { data, error }
  },
}

/* ══════════════════════════════════════════
   Cloudinary Upload Helper
   ══════════════════════════════════════════ */

export const uploadImage = async (file) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', 'story_platform')
  formData.append('folder', 'story-platform')

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return data.secure_url
}
