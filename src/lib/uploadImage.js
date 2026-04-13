const API_URL = '/api/upload'

export const uploadImageSecure = async (file, folder = 'story-platform') => {
  try {
    // تحويل الصورة إلى Base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = (error) => reject(error)
    })

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64, folder }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    const result = await response.json()
    return result.url
  } catch (error) {
    console.error('Upload error:', error)
    throw new Error('حدث خطأ أثناء رفع الصورة')
  }
}

export const uploadAvatar = async (file) => {
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('حجم الصورة يجب أن لا يتجاوز 2 ميجابايت')
  }
  return uploadImageSecure(file, 'avatars')
}

export const uploadCoverImage = async (file) => {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('حجم صورة الغلاف يجب أن لا يتجاوز 5 ميجابايت')
  }
  return uploadImageSecure(file, 'covers')
}

export const uploadSceneImage = async (file) => {
  if (file.size > 3 * 1024 * 1024) {
    throw new Error('حجم صورة المشهد يجب أن لا يتجاوز 3 ميجابايت')
  }
  return uploadImageSecure(file, 'scenes')
}
