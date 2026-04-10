import React, { useState } from 'react'

export default function CreateStory() {
  const [story, setStory] = useState({
    title: '',
    description: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const storyData = {
      id: Date.now().toString(),
      ...story,
      created_at: new Date().toISOString()
    }
    const existingStories = JSON.parse(localStorage.getItem('userStories') || '[]')
    localStorage.setItem('userStories', JSON.stringify([...existingStories, storyData]))
    alert('تم حفظ قصتك!')
    window.location.href = '/'  // بديل آمن لـ useNavigate
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a2e', color: 'white', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#16213e', padding: '30px', borderRadius: '20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '30px', textAlign: 'center' }}>
          ✍️ اكتب قصتك التفاعلية
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>عنوان القصة</label>
            <input
              type="text"
              required
              value={story.title}
              onChange={(e) => setStory({ ...story, title: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #0f3460', backgroundColor: '#1a1a2e', color: 'white' }}
              placeholder="أدخل عنوان قصتك"
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>وصف القصة</label>
            <textarea
              rows="4"
              value={story.description}
              onChange={(e) => setStory({ ...story, description: e.target.value })}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #0f3460', backgroundColor: '#1a1a2e', color: 'white' }}
              placeholder="اكتب وصفاً مختصراً لقصتك"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button type="submit" style={{ flex: 1, padding: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
              💾 حفظ القصة
            </button>
            <button type="button" onClick={() => window.location.href = '/'} style={{ flex: 1, padding: '15px', background: 'transparent', color: '#667eea', border: '2px solid #667eea', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
