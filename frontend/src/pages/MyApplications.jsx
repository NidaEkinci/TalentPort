import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getMyApplications } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function MyApplications() {
  const { user, ready } = useAuth()
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready) return
    if (!user)  { setLoading(false); return }
    getMyApplications()
      .then(r => setApps(r.data.applications))
      .finally(() => setLoading(false))
  }, [user, ready])

  // Giriş yapılmamış
  if (ready && !user) return (
    <div className="empty-state" style={{ padding: '8rem 1.5rem' }}>
      <div className="empty-state__icon">🔒</div>
      <h3>Bu sayfayı görmek için giriş yapmalısınız</h3>
      <p>Başvurularınızı takip etmek için hesabınıza giriş yapın.</p>
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
        <Link to="/login"    className="btn btn--primary">Giriş Yap</Link>
        <Link to="/register" className="btn btn--ghost">Üye Ol</Link>
      </div>
    </div>
  )

  return (
    <motion.div className="page-apply"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
    >
      <div className="section-container">
        <div className="page-header page-header--sm">
          <h1>Başvurularım</h1>
          <p>{user?.name} adına kayıtlı başvurular</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="job-card job-card--skeleton" style={{ height: '100px' }} />
            ))}
          </div>
        ) : apps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <h3>Henüz başvuru yapmadınız</h3>
            <Link to="/jobs" className="btn btn--primary" style={{ marginTop: '0.5rem' }}>
              İlanlara Göz At
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {apps.map((app, i) => (
              <motion.div key={app.id} className="detail-card"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {app.job_title || `İlan #${app.job_id}`}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {app.email} · {app.phone || 'Telefon belirtilmemiş'}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '0.775rem', color: 'var(--text-muted)',
                    background: 'var(--bg-hover)', padding: '0.3rem 0.75rem',
                    borderRadius: '100px', whiteSpace: 'nowrap'
                  }}>
                    {new Date(app.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
                {app.cover_letter && (
                  <p style={{
                    marginTop: '0.75rem', fontSize: '0.855rem',
                    color: 'var(--text-secondary)', lineHeight: 1.6,
                    borderTop: '1px solid var(--border)', paddingTop: '0.75rem',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {app.cover_letter}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}