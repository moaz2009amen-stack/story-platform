import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// تعريف مكون CreateStory مباشرة هنا
function CreateStory() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a2e', color: 'white', padding: '40px' }}>
      <h1>✍️ صفحة إنشاء القصة تعمل!</h1>
      <p>هذه نسخة مدمجة في App.jsx</p>
      <button onClick={() => window.location.href = '/'} style={{ padding: '10px', marginTop: '20px' }}>
        العودة للرئيسية
      </button>
    </div>
  )
}

// تعريف مكون AdminDashboard مباشرة هنا
function AdminDashboard() {
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)

  if (!loggedIn) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a2e' }}>
        <form onSubmit={(e) => { e.preventDefault(); if (password === 'moaz2024story') setLoggedIn(true); else alert('خطأ'); }}>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" />
          <button type="submit">دخول</button>
        </form>
      </div>
    )
  }
  return <div style={{ color: 'white', padding: '40px' }}><h1>👑 لوحة التحكم</h1></div>
}

// تعريف StoryPlayer بسيط
function StoryPlayer() {
  return <div style={{ color: 'white', padding: '40px' }}><h1>🎮 قارئ القصة</h1></div>
}

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme || 'dark'
  })

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar theme={theme} toggleTheme={toggleTheme} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/story/:storyId" element={<StoryPlayer />} />
            <Route path="/create" element={<CreateStory />} />
            <Route path="/moaz-admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
