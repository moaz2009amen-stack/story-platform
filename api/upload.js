import { v2 as cloudinary } from 'cloudinary'

// تكوين Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { image, folder } = req.body

    if (!image) {
      return res.status(400).json({ error: 'No image provided' })
    }

    // رفع الصورة إلى Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: folder || 'story-platform',
      transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }]
    })

    return res.json({ success: true, url: result.secure_url })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ error: error.message })
  }
}
