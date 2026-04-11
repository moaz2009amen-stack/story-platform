import { Suspense, lazy, createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'

// Lazy loaded pages
const Home          = lazy(() => import('./pages/Home'))
const Explore       = lazy(() => import('./pages/Explore'))
const Profile       = lazy(() => import('./pages/Profile'))
const Auth          = lazy(() => import('./pages/Auth'))
const CreateStory   = lazy(() => import('./pages/CreateStory'))
const StoryPlayer   = lazy(() => import('./pages/StoryPlayer'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const NotFound      = lazy(() => import('./pages/NotFound'))

/* ══════════════════════════════════════════
   Context: Auth
   ══════════════════════════════════════════ */
export const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

/* ══════════════════════════════════════════
   Context: Theme
   ══════════════════════════════════════════ */
export const ThemeContext = createContext(null)
export const useTheme = () => useContext(ThemeContext)

/* ══════════════════════════════════════════
   Loading Spinner
   ══════════════════════════════════════════ */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-yellow-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-yellow-400/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>تحميل...</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════
   Protected Route
   ══════════════════════════════════════════ */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/auth" replace />
  return children
}

/* ══════════════════════════════════════════
   App Root
   ══════════════════════════════════════════ */
export default function App() {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme]     = useState(() => localStorage.getItem('theme') || 'dark')

  // Theme apply
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ user, profile, loading, setProfile }}>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"            element={<Home />} />
              <Route path="/explore"     element={<Explore />} />
              <Route path="/auth"        element={<Auth />} />
              <Route path="/story/:storyId" element={<StoryPlayer />} />
              <Route path="/moaz-admin"  element={<AdminDashboard />} />
              <Route
                path="/profile"
                element={<ProtectedRoute><Profile /></ProtectedRoute>}
              />
              <Route
                path="/create"
                element={<ProtectedRoute><CreateStory /></ProtectedRoute>}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  )
}
