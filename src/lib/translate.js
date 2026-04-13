// Rate Limiting للترجمة - منع الإساءة
let lastCallTime = 0
const MIN_TIME_BETWEEN_CALLS = 2000 // 2 ثانية بين كل طلب
const MAX_REQUESTS_PER_MINUTE = 10
let requestCount = 0
let minuteStartTime = Date.now()

/**
 * التحقق من Rate Limit
 */
const checkRateLimit = () => {
  const now = Date.now()
  
  // إعادة تعيين العداد كل دقيقة
  if (now - minuteStartTime >= 60000) {
    requestCount = 0
    minuteStartTime = now
  }
  
  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    throw new Error('لقد تجاوزت الحد المسموح من طلبات الترجمة. يرجى الانتظار قليلاً.')
  }
  
  const timeSinceLastCall = now - lastCallTime
  if (timeSinceLastCall < MIN_TIME_BETWEEN_CALLS) {
    throw new Error(`يرجى الانتظار ${Math.ceil((MIN_TIME_BETWEEN_CALLS - timeSinceLastCall) / 1000)} ثانية قبل الترجمة مرة أخرى`)
  }
  
  lastCallTime = now
  requestCount++
}

/**
 * كشف اللغة تلقائياً
 */
const detectLanguage = (text) => {
  // كشف الحروف العربية
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
  if (arabicPattern.test(text)) {
    return { from: 'ar', to: 'en' }
  }
  return { from: 'en', to: 'ar' }
}

/**
 * ترجمة نص باستخدام MyMemory API (مجاني)
 * @param {string} text - النص المراد ترجمته
 * @param {string} from - لغة المصدر (اختياري، سيتم كشفها تلقائياً)
 * @param {string} to - اللغة الهدف (اختياري)
 * @returns {Promise<string>} - النص المترجم
 */
export const translateText = async (text, from = null, to = null) => {
  if (!text || text.trim().length === 0) {
    return ''
  }
  
  // التحقق من Rate Limit
  checkRateLimit()
  
  // كشف اللغة تلقائياً إذا لم يتم تحديدها
  let sourceLang = from
  let targetLang = to
  
  if (!sourceLang || !targetLang) {
    const detected = detectLanguage(text)
    sourceLang = sourceLang || detected.from
    targetLang = targetLang || detected.to
  }
  
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // التحقق من وجود نتيجة
    if (data && data.responseData && data.responseData.translatedText) {
      let translatedText = data.responseData.translatedText
      
      // إزالة علامات HTML إذا وجدت
      translatedText = translatedText.replace(/<[^>]*>/g, '')
      
      // إصلاح بعض المشاكل الشائعة في الترجمة
      translatedText = translatedText.replace(/&#39;/g, "'")
      translatedText = translatedText.replace(/&quot;/g, '"')
      translatedText = translatedText.replace(/&amp;/g, '&')
      
      return translatedText
    }
    
    throw new Error('لم يتم الحصول على ترجمة')
  } catch (error) {
    console.error('Translation error:', error)
    
    // رسائل خطأ مفهومة للمستخدم
    if (error.message.includes('يرجى الانتظار')) {
      throw error
    }
    
    throw new Error('حدث خطأ في الترجمة. يرجى المحاولة مرة أخرى.')
  }
}

/**
 * ترجمة كائن كامل (مثل عنوان القصة أو الوصف)
 * @param {Object} obj - كائن يحتوي على {ar, en}
 * @param {string} fromLang - لغة المصدر ('ar' أو 'en')
 * @returns {Promise<Object>} - كائن مترجم
 */
export const translateObject = async (obj, fromLang) => {
  if (!obj || typeof obj !== 'object') {
    return obj
  }
  
  const toLang = fromLang === 'ar' ? 'en' : 'ar'
  const textToTranslate = obj[fromLang]
  
  if (!textToTranslate) {
    return obj
  }
  
  const translatedText = await translateText(textToTranslate, fromLang, toLang)
  
  return {
    ...obj,
    [toLang]: translatedText,
  }
}

/**
 * ترجمة متعددة النصوص دفعة واحدة (مع تأخير بين كل ترجمة)
 * @param {Array} items - مصفوفة من {text, from, to}
 * @returns {Promise<Array>} - النصوص المترجمة
 */
export const translateBatch = async (items) => {
  const results = []
  
  for (let i = 0; i < items.length; i++) {
    const { text, from, to } = items[i]
    try {
      const translated = await translateText(text, from, to)
      results.push(translated)
    } catch (error) {
      results.push(null)
    }
    
    // انتظار بين الطلبات
    if (i < items.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
  }
  
  return results
}
