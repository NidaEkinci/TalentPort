import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getJob } from '../api/client'

export default function JobDetail() {
  const { id } = useParams()
  console.log('JobDetail id:', id)  // ID'nin doğru alındığını kontrol et
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getJob(id)
      .then(r => setJob(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="section-container" style={{ padding: '6rem 1.5rem' }}>
      <div className="job-detail-skeleton" />
    </div>
  )

  if (error || !job) return (
    <div className="empty-state" style={{ padding: '8rem 1.5rem' }}>
      <div className="empty-state__icon">😕</div>
      <h3>İlan bulunamadı</h3>
      <button className="btn btn--primary" onClick={() => navigate('/jobs')}>Geri Dön</button>
    </div>
  )

  return (
    <motion.div
      className="page-detail"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="section-container">
        {/* Back */}
        <button className="back-btn" onClick={() => navigate('/jobs')}>
          ← Tüm İlanlara Dön
        </button>

        <div className="detail-layout">
          {/* Main */}
          <div className="detail-main">
            <div className="detail-card">
              <div className="detail-card__header">
                <div>
                  <h1 className="detail-title">{job.title}</h1>
                  <p className="detail-company">{job.company}</p>
                </div>
              </div>

              <div className="detail-tags">
                <span className="detail-tag">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {job.location || 'Belirtilmemiş'}
                </span>
                <span className="detail-tag">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                  </svg>
                  Tam Zamanlı
                </span>
              </div>

              <div className="detail-divider" />

              <h2 className="detail-section-title">İş Tanımı</h2>
              <div className="detail-description">
                {job.description?.split('\n').map((para, i) =>
                  para.trim() ? <p key={i}>{para}</p> : null
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="detail-sidebar">
            <div className="detail-apply-card">
              <h3>Bu Pozisyona Başvur</h3>
              <p>Başvuru formuna yönlendirileceksiniz.</p>
              <Link
                to={`/apply?job_id=${job.id}`}
                className="btn btn--primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Hemen Başvur
              </Link>
              <Link
                to={`/apply?job_id=${job.id}`}
                className="btn btn--ghost"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              >
                AI ile Otomatik Doldur
              </Link>
            </div>

            <div className="detail-info-card">
              <h4>İlan Bilgileri</h4>
              <div className="detail-info-row">
                <span>Şirket</span>
                <strong>{job.company || '—'}</strong>
              </div>
              <div className="detail-info-row">
                <span>Konum</span>
                <strong>{job.location || 'Uzaktan'}</strong>
              </div>
              <div className="detail-info-row">
                <span>İlan No</span>
                <strong>#{job.id}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
