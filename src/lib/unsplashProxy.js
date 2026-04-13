// ملاحظة: هذا ملف Proxy لحماية Unsplash API Key
// بدلاً من استدعاء Unsplash مباشرة من الفرونت، نمرر عبر هذا الـ Proxy
// ولكن بما أن Unsplash يتطلب استخدام المفتاح مباشرة،
// سنستخدم طريقة تقييد المفتاح بالدومين من إعدادات Unsplash نفسها

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY

/**
 * البحث عن صور في Unsplash
 * @param {string} query - كلمة البحث
 * @param {number} page - رقم الصفحة
 * @param {number} perPage - عدد النتائج لكل صفحة
 * @returns {Promise<Array>} - قائمة بالصور
 */
export const searchUnsplash = async (query, page = 1, perPage = 20) => {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('Unsplash API key is missing')
    return []
  }
  
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    })
    
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return data.results.map(photo => ({
      id: photo.id,
      url: photo.urls.regular,
      thumb: photo.urls.thumb,
      small: photo.urls.small,
      full: photo.urls.full,
      alt: photo.alt_description || photo.description || query,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      downloadUrl: photo.links.download_location,
    }))
  } catch (error) {
    console.error('Unsplash search error:', error)
    return []
  }
}

/**
 * جلب صور عشوائية حسب التصنيف
 * @param {string} category - التصنيف (story, fantasy, nature, etc.)
 * @returns {Promise<Array>} - قائمة بالصور
 */
export const getRandomUnsplashImages = async (category = 'story') => {
  const categories = {
    story: ['story book', 'fantasy', 'magical', 'adventure'],
    fantasy: ['fantasy art', 'dragon', 'castle', 'magic'],
    nature: ['nature landscape', 'forest', 'mountain', 'sunset'],
    love: ['romance', 'couple', 'love story'],
    horror: ['dark forest', 'haunted', 'mysterious'],
    sciFi: ['space', 'futuristic', 'cyberpunk'],
  }
  
  const keywords = categories[category] || categories.story
  const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]
  
  return searchUnsplash(randomKeyword, 1, 12)
}

/**
 * تحميل صورة من Unsplash (تسجيل حدث التحميل)
 */
export const trackUnsplashDownload = async (downloadUrl) => {
  if (!downloadUrl) return
  
  try {
    // هذا يساعد المصورين على الحصول على Credit
    await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    })
  } catch (error) {
    console.error('Failed to track download:', error)
  }
}
