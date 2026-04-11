import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiBookOpenLine, RiCompassLine, RiUserLine,
  RiPencilLine, RiSunLine, RiMoonLine,
  RiMenuLine, RiCloseLine, RiLogoutBoxLine,
} from 'react-icons/ri'
import { useAuth, useTheme } from '../App'
import { supabase } from '../lib/supabase'

const NAV_LINKS = [
  { label: 'المكتبة',    href: '/explore', icon: RiCompassLine },
  { label: 'حسابي',     href: '/profile', icon: RiUserLine, auth: true },
]

export default function Navbar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { user, profile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/')
  }

  const isActive = (href) => location.pathname === href

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'shadow-lg backdrop-blur-xl border-b'
            : 'border-b border-transparent'
        }`}
        style={{
          background: scrolled
            ? 'rgba(var(--navbar-bg, 15,13,10), 0.92)'
            : 'transparent',
          borderColor: scrolled ? 'var(--border-subtle)' : 'transparent',
          '--navbar-bg': theme === 'dark' ? '15,13,10' : '253,250,244',
        }}
      >
        <div className="page-container">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 4px 12px rgba(245,158,11,0.4)' }}>
                <RiBookOpenLine className="text-black text-lg" />
              </div>
              <div className="leading-none">
                <span className="block text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  قصة واختار
                </span>
                <span className="block text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  منصة القصص التفاعلية
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.filter(l => !l.auth || user).map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive(link.href)
                      ? 'text-yellow-500 bg-yellow-500/10'
                      : 'hover:bg-white/5'
                  }`}
                  style={{ color: isActive(link.href) ? '#f59e0b' : 'var(--text-secondary)' }}
                >
                  <link.icon className="text-base" />
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="btn-ghost w-9 h-9 p-0 rounded-xl"
                title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme}
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === 'dark'
                      ? <RiSunLine className="text-yellow-400 text-lg" />
                      : <RiMoonLine className="text-indigo-500 text-lg" />
                    }
                  </motion.div>
                </AnimatePresence>
              </button>

              {user ? (
                <>
                  <Link to="/create" className="btn-primary hidden sm:inline-flex text-sm px-4 py-2">
                    <RiPencilLine />
                    اكتب قصة
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="btn-ghost hidden sm:inline-flex w-9 h-9 p-0 rounded-xl"
                    title="تسجيل الخروج"
                  >
                    <RiLogoutBoxLine style={{ color: 'var(--text-muted)' }} />
                  </button>
                  <Link to="/profile" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
                    style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0f0d0a' }}>
                      {(profile?.full_name || profile?.username || 'م')[0]}
                    </div>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {profile?.full_name?.split(' ')[0] || 'حسابي'}
                    </span>
                  </Link>
                </>
              ) : (
                <Link to="/auth" className="btn-primary text-sm px-4 py-2">
                  تسجيل الدخول
                </Link>
              )}

              {/* Mobile toggle */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="btn-ghost md:hidden w-9 h-9 p-0 rounded-xl"
              >
                {mobileOpen
                  ? <RiCloseLine style={{ color: 'var(--text-primary)', fontSize: '1.25rem' }} />
                  : <RiMenuLine style={{ color: 'var(--text-primary)', fontSize: '1.25rem' }} />
                }
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 md:hidden flex flex-col p-6 gap-6"
              style={{ background: 'var(--bg-elevated)', borderRight: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    <RiBookOpenLine className="text-black" />
                  </div>
                  <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>قصة واختار</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="btn-ghost w-8 h-8 p-0 rounded-lg">
                  <RiCloseLine style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              <hr className="divider" />

              <nav className="flex flex-col gap-1">
                {NAV_LINKS.filter(l => !l.auth || user).map(link => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive(link.href) ? 'bg-yellow-500/10 text-yellow-500' : ''
                    }`}
                    style={{ color: isActive(link.href) ? '#f59e0b' : 'var(--text-secondary)' }}
                  >
                    <link.icon className="text-lg" />
                    {link.label}
                  </Link>
                ))}
                {user && (
                  <Link to="/create"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold mt-1"
                    style={{ background: 'linear-gradient(135deg, #f59e0b22, #d9770622)', color: '#f59e0b' }}>
                    <RiPencilLine className="text-lg" />
                    اكتب قصة جديدة
                  </Link>
                )}
              </nav>

              <div className="mt-auto flex flex-col gap-3">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full"
                    style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}
                  >
                    <RiLogoutBoxLine />
                    تسجيل الخروج
                  </button>
                ) : (
                  <Link to="/auth" className="btn-primary w-full justify-center">تسجيل الدخول</Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div style={{ height: 'var(--navbar-h, 64px)' }} />
    </>
  )
}
