import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { applyJob } from '../api/client'

export default function Apply() {
  const [searchParams] = useSearchParams()
    // Dosyanın en üstünde, searchParams tanımlandıktan hemen sonra
  const [form, setForm] = useState({
    job_id:       searchParams.get('job_id')       || '',
    job_title:    searchParams.get('job_title')    || '',
    name:         searchParams.get('name')         || '',
    email:        searchParams.get('email')        || '',
    phone:        searchParams.get('phone')        || '',
    cover_letter: searchParams.get('cover_letter') || '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Ad soyad zorunludur'
    if (!form.email.trim()) e.email = 'E-posta zorunludur'
    if (!form.job_id.trim()) e.job_id = 'İlan numarası zorunludur'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try {
      await applyJob(form)
      setSubmitted(true)
    } catch {
      alert('Bir hata oluştu, lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const update = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    setErrors(er => ({ ...er, [key]: undefined }))
  }

  return (
    <motion.div
      className="page-apply"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="section-container" style={{ maxWidth: '760px' }}>
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              className="success-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="success-state__icon">🎉</div>
              <h2>Başvurunuz Alındı!</h2>
              <p>En kısa sürede sizinle iletişime geçeceğiz.</p>
              <Link to="/jobs" className="btn btn--primary">İlanlara Geri Dön</Link>
            </motion.div>
          ) : (
            <motion.div key="form">
              <div className="page-header page-header--sm">
                <h1>Başvuru Formu</h1>
                {form.job_title && (
                  <p><strong>{form.job_title}</strong> pozisyonu için başvuruyorsunuz</p>
                )}
                {searchParams.get('name') && (
                  <div className="ai-notice">
                    <span>🤖</span> AI tarafından otomatik dolduruldu — bilgilerinizi kontrol edin
                  </div>
                )}
              </div>

              <div className="form-card">
                <div className="form-grid">
                  {/* İLAN NO KUTUCUĞU KALDIRILDI */}
                  <div className="form-group">
                    <label className="form-label">Ad Soyad <span className="required">*</span></label>
                    <input
                      className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                      value={form.name}
                      onChange={update('name')}
                      placeholder="Adınız ve soyadınız"
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">E-posta <span className="required">*</span></label>
                    <input
                      type="email"
                      className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                      value={form.email}
                      onChange={update('email')}
                      placeholder="mail@example.com"
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Telefon</label>
                    <input
                      className="form-input"
                      value={form.phone}
                      onChange={update('phone')}
                      placeholder="+90 5XX XXX XX XX"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1.25rem' }}>
                  <label className="form-label">Ön Yazı</label>
                  <textarea
                    className="form-input form-textarea"
                    value={form.cover_letter}
                    onChange={update('cover_letter')}
                    placeholder="Kendinizi kısaca tanıtın, bu pozisyona neden başvurduğunuzu belirtin..."
                    rows={6}
                  />
                </div>

                <div className="form-actions">
                  <Link to="/jobs" className="btn btn--ghost">İptal</Link>
                  <button
                    className="btn btn--primary"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="spinner" /> Gönderiliyor...</>
                    ) : 'Başvuruyu Gönder'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
