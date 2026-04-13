import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useNotifications } from '../contexts/NotificationContext'
import { FiMenu, FiX, FiSun, FiMoon, FiUser, FiLogOut, FiHome, FiCompass, FiBookOpen, FiPlusCircle, FiBell } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const Navbar = () => {
  const { user, profile, signOut, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // إغلاق القائمة عند تغيير الصفحة
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  const navLinks = user ? [
    { to: '/home', label: 'الرئيسية', icon: FiHome },
    { to: '/explore', label: 'استكشف', icon: FiCompass },
    { to: '/create-story', label: 'اكتب قصة', icon: FiPlusCircle },
  ] : [
    { to: '/', label: 'الرئيسية', icon: FiHome },
    { to: '/explore', label: 'استكشف', icon: FiCompass },
  ]

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[var(--bg-elevated)] shadow-lg backdrop-blur-lg bg-opacity-95' 
          : 'bg-[var(--bg-surface)]'
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={user ? '/home' : '/'} className="flex items-center gap-2 group">
            <img src="/book.svg" alt="Logo" className="w-8 h-8 transition-transform group-hover:scale-110" />
            <span className="font-playfair text-xl font-bold text-gradient hidden sm:inline">
              قصتك على طريقتك
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === link.to
                    ? 'bg-gold-500 text-white'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:text-gold-500'
                }`}
              >
                <link.icon className="text-lg" />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <Link
                  to="/profile?tab=notifications"
                  className="relative p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all duration-300"
                >
                  <FiBell className="text-xl" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </Link>

                {/* User Menu - Desktop */}
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-all duration-300"
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold">
                        {profile?.full_name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-sm font-medium">{profile?.full_name}</p>
                      <p className="text-xs text-[var(--text-muted)]">@{profile?.username}</p>
                    </div>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/moaz-admin"
                      className="px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
                    >
                      لوحة التحكم
                    </Link>
                  )}

                  <button
                    onClick={signOut}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                  >
                    <FiLogOut className="text-xl" />
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all duration-300"
                >
                  {isMobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="px-4 py-2 text-gold-500 border border-gold-500 rounded-lg hover:bg-gold-500 hover:text-white transition-all duration-300"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-all duration-300"
                >
                  حساب جديد
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && user && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-[var(--border-light)]"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      location.pathname === link.to
                        ? 'bg-gold-500 text-white'
                        : 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    <link.icon className="text-lg" />
                    <span>{link.label}</span>
                  </Link>
                ))}
                
                <div className="h-px bg-[var(--border-light)] my-2" />
                
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                >
                  <FiUser className="text-lg" />
                  <span>حسابي</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/moaz-admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600"
                  >
                    <FiCompass className="text-lg" />
                    <span>لوحة التحكم</span>
                  </Link>
                )}
                
                <button
                  onClick={signOut}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FiLogOut className="text-lg" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar
