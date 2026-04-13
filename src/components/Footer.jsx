import { Link } from 'react-router-dom'
import { FiHeart, FiGithub, FiTwitter, FiInstagram, FiMail } from 'react-icons/fi'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[var(--bg-surface)] border-t border-[var(--border-light)] mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/book.svg" alt="Logo" className="w-8 h-8" />
              <span className="font-playfair text-xl font-bold text-gradient">قصتك على طريقتك</span>
            </div>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              منصة تفاعلية للقصص تتيح لك القراءة والكتابة والمشاركة. 
              اكتب قصتك بطريقتك الخاصة وشاركها مع العالم.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/explore" className="text-[var(--text-muted)] hover:text-gold-500 transition-colors">
                  استكشف القصص
                </Link>
              </li>
              <li>
                <Link to="/create-story" className="text-[var(--text-muted)] hover:text-gold-500 transition-colors">
                  اكتب قصة جديدة
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-[var(--text-muted)] hover:text-gold-500 transition-colors">
                  حسابي
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-bold text-lg mb-4">التصنيفات</h3>
            <ul className="space-y-2">
              {['مغامرة', 'خيال', 'رومانسية', 'رعب', 'خيال علمي', 'دراما'].map((cat) => (
                <li key={cat}>
                  <Link 
                    to={`/explore?category=${cat}`} 
                    className="text-[var(--text-muted)] hover:text-gold-500 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-lg mb-4">تابعنا</h3>
            <div className="flex gap-4 mb-4">
              <a href="#" className="text-[var(--text-muted)] hover:text-gold-500 transition-colors text-2xl">
                <FiTwitter />
              </a>
              <a href="#" className="text-[var(--text-muted)] hover:text-gold-500 transition-colors text-2xl">
                <FiInstagram />
              </a>
              <a href="#" className="text-[var(--text-muted)] hover:text-gold-500 transition-colors text-2xl">
                <FiGithub />
              </a>
              <a href="#" className="text-[var(--text-muted)] hover:text-gold-500 transition-colors text-2xl">
                <FiMail />
              </a>
            </div>
            <p className="text-[var(--text-muted)] text-sm">
              تواصل معنا للمساعدة أو الاقتراحات
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--border-light)] mt-8 pt-6 text-center text-[var(--text-muted)] text-sm">
          <p>جميع الحقوق محفوظة © {currentYear} قصتك على طريقتك</p>
          <p className="mt-2 flex items-center justify-center gap-1">
            صنع بـ <FiHeart className="text-red-500 animate-pulse" /> من مجتمع الكتاب
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
