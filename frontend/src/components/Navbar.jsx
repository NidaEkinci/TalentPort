import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

   const handleLogout = () => {
    logout()
    navigate('/')
  }

  const links = [
    { to: '/', label: 'Ana Sayfa' },
    { to: '/jobs', label: 'İlanlar' },
    { to: '/my-applications', label: 'Başvurularım' },
  ]

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
    >
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__logo-mark">T</span>
          <span>TalentPort</span>
        </Link>

        <div className="navbar__links">
          {links.map(({ to, label }) => (
            <Link key={to} to={to} className={`navbar__link ${pathname === to ? 'navbar__link--active' : ''}`}>
              {label}
              {pathname === to && (
                <motion.div layoutId="nav-indicator" className="navbar__indicator" />
              )}
            </Link>
          ))}
        </div>

        <div className="navbar__auth">
          {user ? (
            <>
              <span className="navbar__user"> {user.name}</span>
              <Link to="/my-applications" className="profile-circle">
                {user.name.charAt(0).toUpperCase()}
              </Link>
              <button className="navbar__cta navbar__cta--ghost" onClick={handleLogout}>
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="navbar__cta navbar__cta--ghost">Giriş Yap</Link>
              <Link to="/register" className="navbar__cta">Üye Ol</Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
