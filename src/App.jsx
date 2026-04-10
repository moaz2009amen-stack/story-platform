import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

const StoryPlayer = lazy(() => import('./pages/StoryPlayer'))
const CreateStory = lazy(() => import('./pages/CreateStory'))
const Explore = lazy(() => import('./pages/Explore'))
const Profile = lazy(() => import('./pages/Profile'))
const Auth = lazy(() => import('./pages/Auth'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="text-4xl animate-bounce mb-4">📖</div>
      <p className="text-xl text-gray-600 dark:text-gray-400">جاري التحميل...</p>
    </div>
  </div>
)

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
        {/* Navbar مش هيظهر في لوحة التحكم لأنها صفحة منفصلة */}
        <Routes>
          {/* Admin Route - منفصلة تماماً */}
          <Route path="/moaz-admin" element={<AdminDashboard />} />
          
          {/* الموقع العادي */}
          <Route path="*" element={
            <>
              <Navbar theme={theme} toggleTheme={toggleTheme} />
              <main className="flex-grow">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/story/:storyId" element={<StoryPlayer />} />
                    <Route path="/create" element={<CreateStory />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
