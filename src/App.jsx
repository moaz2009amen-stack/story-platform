import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Auth from './pages/Auth'
import ResetPassword from './pages/ResetPassword'
import AuthorProfile from './pages/AuthorProfile'
import Profile from './pages/Profile'
import CreateStory from './pages/CreateStory'
import StoryPlayer from './pages/StoryPlayer'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/author/:username" element={<AuthorProfile />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/create-story" element={<CreateStory />} />
                    <Route path="/edit-story/:id" element={<CreateStory />} />
                    <Route path="/story/:id" element={<StoryPlayer />} />
                    <Route path="/moaz-admin" element={<AdminDashboard />} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </main>
                <Footer />
                <Toaster 
                  position="top-center"
                  reverseOrder={false}
                  toastOptions={{
                    duration: 4000,
                    style: {
                      direction: 'rtl',
                      fontFamily: 'Cairo, sans-serif',
                    },
                  }}
                />
              </div>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
