import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="navbar__logo-mark" style={{fontSize:'1.1rem'}}>T</span>
          <span style={{fontWeight:700, color:'var(--text-primary)'}}>TalentPort</span>
          <p>Kariyerinizin bir sonraki adımı burada başlıyor.</p>
        </div>
        <div className="footer__links">
          <Link to="/jobs">İş İlanları</Link>
          <Link to="/apply">Başvurularım</Link>
        </div>
      </div>
      <div className="footer__bottom">
        <p>© 2025 TalentPort. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  )
}
