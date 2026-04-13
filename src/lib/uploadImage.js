import { supabase } from './supabase'

/**
 * رفع صورة إلى Cloudinary بطريقة آمنة عبر Supabase Edge Function
 * @param {File} file - ملف الصورة
 * @param {string} folder - المجلد الذي ستُرفع إليه الصورة
 * @returns {Promise<string>} - رابط الصورة المرفوعة
 */
export const uploadImageSecure = async (file, folder = 'story-platform') => {
  try {
    // 1. طلب توقيع آمن من الـ Edge Function
    const { data: signedData, error: signedError } = await supabase.functions.invoke('get-cloudinary-signature', {
      body: { 
        folder, 
        publicId: `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}` 
      },
    })

    if (signedError) {
      console.error('Error getting signature:', signedError)
      throw new Error('فشل في الحصول على توقيع آمن للرفع')
    }

    const { signature, timestamp, apiKey, cloudName, uploadUrl } = signedData

    // 2. رفع الصورة باستخدام التوقيع
    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp)
    formData.append('signature', signature)
    formData.append('folder', folder)

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (!response.ok || result.error) {
      throw new Error(result.error?.message || 'فشل في رفع الصورة')
    }

    return result.secure_url
  } catch (error) {
    console.error('Upload error:', error)
    throw new Error('حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.')
  }
}

/**
 * رفع صورة شخصية (Avatar) - مع تغيير الحجم تلقائياً
 */
export const uploadAvatar = async (file) => {
  // التحقق من حجم الصورة (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('حجم الصورة يجب أن لا يتجاوز 2 ميجابايت')
  }

  // التحقق من نوع الصورة
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('نوع الصورة غير مدعوم. يرجى رفع JPG, PNG, أو WEBP')
  }

  return uploadImageSecure(file, 'avatars')
}

/**
 * رفع صورة غلاف قصة
 */
export const uploadCoverImage = async (file) => {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('حجم صورة الغلاف يجب أن لا يتجاوز 5 ميجابايت')
  }
  return uploadImageSecure(file, 'covers')
}

/**
 * رفع صورة مشهد
 */
export const uploadSceneImage = async (file) => {
  if (file.size > 3 * 1024 * 1024) {
    throw new Error('حجم صورة المشهد يجب أن لا يتجاوز 3 ميجابايت')
  }
  return uploadImageSecure(file, 'scenes')
}
