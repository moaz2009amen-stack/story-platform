// Supabase Edge Function لتوليد توقيع آمن لرفع الصور إلى Cloudinary
// النشر: supabase functions deploy get-cloudinary-signature

import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts'

const CLOUDINARY_CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME')
const CLOUDINARY_API_KEY = Deno.env.get('CLOUDINARY_API_KEY')
const CLOUDINARY_API_SECRET = Deno.env.get('CLOUDINARY_API_SECRET')

Deno.serve(async (req) => {
  // التحقق من طريقة الطلب
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // التحقق من وجود المتغيرات البيئية
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return new Response(JSON.stringify({ error: 'Cloudinary configuration missing' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { folder, publicId } = await req.json()
    
    // إنشاء timestamp
    const timestamp = Math.round(Date.now() / 1000)
    
    // إنشاء parameters للتوقيع
    const params = {
      timestamp,
      folder: folder || 'story-platform',
      public_id: publicId || `upload_${timestamp}`,
    }
    
    // بناء السلسلة للتوقيع
    const signatureString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    
    // إنشاء التوقيع باستخدام HMAC-SHA256
    const signature = createHmac('sha256', CLOUDINARY_API_SECRET)
      .update(signatureString)
      .digest('hex')
    
    // إرجاع التوقيع والمعلومات اللازمة للرفع
    return new Response(
      JSON.stringify({
        signature,
        timestamp,
        apiKey: CLOUDINARY_API_KEY,
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
