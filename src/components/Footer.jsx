import { Link } from 'react-router-dom'
import { RiBookOpenLine, RiGithubLine, RiHeartFill } from 'react-icons/ri'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="page-container py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <RiBookOpenLine className="text-black text-sm" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>قصة واختار</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>منصة القصص التفاعلية</p>
            </div>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            <Link to="/explore" className="hover:text-yellow-500 transition-colors duration-200">المكتبة</Link>
            <Link to="/create"  className="hover:text-yellow-500 transition-colors duration-200">اكتب قصة</Link>
            <Link to="/auth"    className="hover:text-yellow-500 transition-colors duration-200">تسجيل الدخول</Link>
          </nav>

          {/* Copyright */}
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
  صُنع بـ
  <RiHeartFill className="text-red-500 text-xs" />
  بواسطة{' '}
  
    href="https://www.facebook.com/profile.php?id=61552026802548&locale=ar_AR"
    target="_blank"
    rel="noopener noreferrer"
    className="font-bold hover:text-yellow-500 transition-colors"
    style={{ color: 'var(--text-secondary)' }}
  >
    معاذ
  </a>
  · {year}
</span>
        </div>
      </div>
    </footer>
  )
}
