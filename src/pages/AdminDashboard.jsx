import React, { useState } from 'react'

export default function AdminDashboard() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const ADMIN_PASSWORD = 'moaz2024story'

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
    } else {
      alert('كلمة المرور غير صحيحة')
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a2e' }}>
        <div style={{ backgroundColor: '#16213e', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>
            🔐 لوحة التحكم
          </h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #0f3460', backgroundColor: '#1a1a2e', color: 'white', marginBottom: '20px' }}
              placeholder="أدخل كلمة المرور"
              autoFocus
            />
            <button type="submit" style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
              دخول
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a2e', color: 'white', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px' }}>
            👑 لوحة التحكم - المشرف
          </h1>
          <button onClick={() => setIsAuthenticated(false)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
            تسجيل خروج
          </button>
        </div>
        <p style={{ textAlign: 'center', color: '#a0aec0' }}>
          جاري تحميل القصص...
        </p>
      </div>
    </div>
  )
}
