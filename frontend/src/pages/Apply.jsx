import { useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { applyJob, parseCv } from '../api/client'

const STEPS = ['Kişisel', 'Eğitim', 'Yetkinlikler', 'Deneyim', 'Tercihler']

const SKILL_OPTIONS = [
  'Python','JavaScript','TypeScript','React','Vue','FastAPI','Node.js',
  'SQL','PostgreSQL','MongoDB','Docker','Git','Figma','Excel','Java','C#'
]

function StepIndicator({ current }) {
  return (
    <div className="step-indicator">
      {STEPS.map((label, i) => (
        <div key={i} className="step-indicator__item">
          <div className={`step-indicator__dot ${
            i < current ? 'done' : i === current ? 'active' : ''
          }`}>
            {i < current ? '✓' : i + 1}
          </div>
          <span className={`step-indicator__label ${i === current ? 'active' : ''}`}>
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <div className={`step-indicator__line ${i < current ? 'done' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

// URL'den gelen JSON parametresini güvenli oku
function parseUrlData(searchParams) {
  const raw = searchParams.get('data')
  if (!raw) return {}
  try { return JSON.parse(decodeURIComponent(raw)) }
  catch { return {} }
}

const EMPTY_FORM = {
  job_id: '', job_title: '',
  name: '', email: '', phone: '', cover_letter: '',
  graduation_status: '', university: '', department: '',
  graduation_year: '', gpa: '',
  skills: [], cert_links: [''],
  company: '', position: '', github: '', linkedin: '',
  work_model: '', military: '', driving_license: false,
}

export default function Apply() {
  const [searchParams] = useSearchParams()
  const jobId    = searchParams.get('job_id')    || ''
  const jobTitle = searchParams.get('job_title') || ''

   // URL'den gelen AI verisi (JobScoutAI yönlendirmesi)
  const urlData  = parseUrlData(searchParams)

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    job_id:    jobId,
    job_title: jobTitle,
    // URL'den gelen veri varsa ilgili alanları doldur
    ...urlData,
    // job_id ve job_title URL parametresi her zaman öncelikli
    ...(jobId    ? { job_id: jobId }       : {}),
    ...(jobTitle ? { job_title: jobTitle } : {}),
    // cert_links en az bir boş alan içermeli
    cert_links: urlData.cert_links?.length ? urlData.cert_links : [''],
  })

  const [step, setStep]         = useState(0)
  const [direction, setDirection] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [parsing, setParsing]   = useState(false)  // AI doldurma yükleniyor
  const [parseError, setParseError] = useState('')
  const [errors, setErrors]     = useState({})
  const fileInputRef            = useRef(null)

  /*
  const [form, setForm] = useState({
     // Temel
    job_id: jobId, job_title: jobTitle,
    name: '', email: '', phone: '', cover_letter: '',
    // Eğitim
    graduation_status: '', university: '', department: '',
    graduation_year: '', gpa: '',
    // Yetkinlikler
    skills: [],       // [{name, level}]
    cert_links: [''],
    // Deneyim
    company: '', position: '', github: '', linkedin: '',
    // Tercihler
    work_model: '', military: '', driving_license: false,
  })
  

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [key]: val }))
    setErrors(er => ({ ...er, [key]: undefined }))
  }

  // Yetenek ekle/kaldır
  const toggleSkill = (name) => {
    setForm(f => {
      const exists = f.skills.find(s => s.name === name)
      if (exists) return { ...f, skills: f.skills.filter(s => s.name !== name) }
      return { ...f, skills: [...f.skills, { name, level: 'Orta' }] }
    })
  }

  const setSkillLevel = (name, level) => {
    setForm(f => ({
      ...f,
      skills: f.skills.map(s => s.name === name ? { ...s, level } : s)
    }))
  }

  const addCertLink = () => setForm(f => ({ ...f, cert_links: [...f.cert_links, ''] }))
  const setCertLink = (i, val) => setForm(f => {
    const links = [...f.cert_links]
    links[i] = val
    return { ...f, cert_links: links }
  })
  const removeCertLink = (i) => setForm(f => ({
    ...f, cert_links: f.cert_links.filter((_, idx) => idx !== i)
  }))

  const validateStep = () => {
    const e = {}
    if (step === 0) {
      if (!form.name.trim())  e.name  = 'Ad soyad zorunludur'
      if (!form.email.trim()) e.email = 'E-posta zorunludur'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (!validateStep()) return
    setDirection(1)
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  const prev = () => {
    setDirection(-1)
    setStep(s => Math.max(s - 1, 0))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const payload = {
        ...form,
        cert_links: form.cert_links.filter(l => l.trim()),
      }
      await applyJob(payload)
      setSubmitted(true)
    } catch {
      alert('Bir hata oluştu, lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }
  */

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [key]: val }))
    setErrors(er => ({ ...er, [key]: undefined }))
  }

  const toggleSkill = (name) => {
    setForm(f => {
      const exists = f.skills.find(s => s.name === name)
      if (exists) return { ...f, skills: f.skills.filter(s => s.name !== name) }
      return { ...f, skills: [...f.skills, { name, level: 'Orta' }] }
    })
  }

  const setSkillLevel = (name, level) => {
    setForm(f => ({
      ...f, skills: f.skills.map(s => s.name === name ? { ...s, level } : s)
    }))
  }

  const addCertLink    = () => setForm(f => ({ ...f, cert_links: [...f.cert_links, ''] }))
  const setCertLink    = (i, val) => setForm(f => {
    const links = [...f.cert_links]; links[i] = val
    return { ...f, cert_links: links }
  })
  const removeCertLink = (i) => setForm(f => ({
    ...f, cert_links: f.cert_links.filter((_, idx) => idx !== i)
  }))

  // AI ile form doldurma
  const handleAiParse = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setParsing(true); setParseError('')
    try {
      const res  = await parseCv(file)
      console.log("AI'dan Gelen Ham Veri:", res.data);
      const data = res.data
      setForm(f => ({
        ...f,
        ...data,
        job_id:    f.job_id,    // ilanı değiştirme
        job_title: f.job_title,
        cert_links: data.cert_links?.length ? data.cert_links : [''],
      }))
    } catch {
      setParseError('CV okunamadı, lütfen tekrar deneyin.')
    } finally {
      setParsing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const validateStep = () => {
    const e = {}
    if (step === 0) {
      if (!form.name.trim())  e.name  = 'Ad soyad zorunludur'
      if (!form.email.trim()) e.email = 'E-posta zorunludur'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { if (!validateStep()) return; setDirection(1);  setStep(s => Math.min(s + 1, STEPS.length - 1)) }
  const prev = () => {                               setDirection(-1); setStep(s => Math.max(s - 1, 0)) }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await applyJob({ ...form, cert_links: form.cert_links.filter(l => l.trim()) })
      setSubmitted(true)
    } catch {
      alert('Bir hata oluştu, lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }


  if (submitted) return (
    <motion.div className="auth-page"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="success-state">
        <div className="success-state__icon">🎉</div>
        <h2>Başvurunuz Alındı!</h2>
        <p>En kısa sürede sizinle iletişime geçeceğiz.</p>
        <Link to="/jobs" className="btn btn--primary">İlanlara Geri Dön</Link>
      </div>
    </motion.div>
  )

  return (
    <motion.div className="page-apply"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
    >
      <div className="section-container" style={{ maxWidth: '760px' }}>
        {/* Başlık */}
        <div className="page-header page-header--sm">
          <h1>Başvuru Formu</h1>
          {jobTitle && <p><strong>{jobTitle}</strong> için başvuruyorsunuz</p>}

          {urlData.name && (
            <div className="ai-notice">
              <span>🤖</span> JobScoutAI tarafından otomatik dolduruldu
            </div>
          )}
        </div>

        {/* AI Doldurma Butonu — sadece JobScoutAI'dan gelmediyse göster */}
        {!urlData.name && (
          <div className="ai-fill-box">
            <div className="ai-fill-box__text">
              <span className="ai-fill-box__icon">⚡</span>
              <div>
                <strong>AI ile Formu Hızlı Doldurun</strong>
                <p>CV'nizi yükleyin, bilgileriniz otomatik aktarılsın. Her adımda düzenleyebilirsiniz.</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file" accept=".pdf"
              style={{ display: 'none' }}
              onChange={handleAiParse}
            />
            <button
              className="btn btn--primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={parsing}
            >
              {parsing ? <><span className="spinner" /> Okunuyor...</> : '📄 CV Yükle'}
            </button>
          </div>
        )}
        {parseError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>{parseError}</p>}

        <StepIndicator current={step} />

        <div className="form-card" style={{ marginTop: '1.5rem', overflow: 'hidden' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeInOut' }}
            >

              {/* ADIM 0 — KİŞİSEL */}
              {step === 0 && (
                <div>
                  <h2 className="form-section-title">Kişisel Bilgiler</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Ad Soyad <span className="required">*</span></label>
                      <input className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                        value={form.name} onChange={set('name')} placeholder="Adınız Soyadınız" />
                      {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">E-posta <span className="required">*</span></label>
                      <input type="email" className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                        value={form.email} onChange={set('email')} placeholder="mail@example.com" />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Telefon</label>
                      <input className="form-input" value={form.phone}
                        onChange={set('phone')} placeholder="+90 5XX XXX XX XX" />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '1.25rem' }}>
                    <label className="form-label">Ön Yazı</label>
                    <textarea className="form-input form-textarea" rows={5}
                      value={form.cover_letter} onChange={set('cover_letter')}
                      placeholder="Kendinizi ve bu pozisyona neden başvurduğunuzu kısaca anlatın..." />
                  </div>
                </div>
              )}

              {/* ADIM 1 — EĞİTİM */}
              {step === 1 && (
                <div>
                  <h2 className="form-section-title">Eğitim Bilgileri</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Mezuniyet Durumu</label>
                      <select className="form-input" value={form.graduation_status}
                        onChange={set('graduation_status')}>
                        <option value="">Seçiniz</option>
                        {['Öğrenci', 'Mezun', 'Yüksek Lisans', 'Doktora'].map(o =>
                          <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mezuniyet Yılı</label>
                      <input className="form-input" value={form.graduation_year}
                        onChange={set('graduation_year')} placeholder="2024" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Üniversite</label>
                      <input className="form-input" value={form.university}
                        onChange={set('university')}
                        placeholder="Isparta Uygulamalı Bilimler Üniversitesi" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bölüm</label>
                      <input className="form-input" value={form.department}
                        onChange={set('department')} placeholder="Bilgisayar Mühendisliği" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Not Ortalaması (GPA)</label>
                      <input className="form-input" value={form.gpa}
                        onChange={set('gpa')} placeholder="3.20 / 4.00" />
                    </div>
                  </div>
                </div>
              )}

              {/* ADIM 2 — YETKİNLİKLER */}
              {step === 2 && (
                <div>
                  <h2 className="form-section-title">Teknik Yetkinlikler</h2>
                  <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
                    Bildiğiniz teknolojileri seçin
                  </label>
                  <div className="skill-tags">
                    {SKILL_OPTIONS.map(skill => {
                      const selected = form.skills.find(s => s.name === skill)
                      return (
                        <button key={skill} type="button"
                          className={`skill-tag ${selected ? 'skill-tag--active' : ''}`}
                          onClick={() => toggleSkill(skill)}>
                          {skill}
                        </button>
                      )
                    })}
                  </div>

                  {form.skills.length > 0 && (
                    <div style={{ marginTop: '1.25rem' }}>
                      <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>
                        Seviye belirleyin
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {form.skills.map(skill => (
                          <div key={skill.name} className="skill-level-row">
                            <span className="skill-level-name">{skill.name}</span>
                            <div className="skill-level-btns">
                              {['Başlangıç', 'Orta', 'İleri'].map(level => (
                                <button key={level} type="button"
                                  className={`skill-level-btn ${skill.level === level ? 'active' : ''}`}
                                  onClick={() => setSkillLevel(skill.name, level)}>
                                  {level}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <label className="form-label">Sertifika Linkleri</label>
                      <button type="button" className="btn btn--ghost"
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={addCertLink}>+ Ekle</button>
                    </div>
                    {form.cert_links.map((link, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input className="form-input" value={link}
                          onChange={e => setCertLink(i, e.target.value)}
                          placeholder="https://coursera.org/verify/..." />
                        {form.cert_links.length > 1 && (
                          <button type="button" onClick={() => removeCertLink(i)}
                            style={{ background: 'none', border: 'none', color: '#ef4444',
                              cursor: 'pointer', fontSize: '1.1rem', padding: '0 0.5rem' }}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ADIM 3 — DENEYİM */}
              {step === 3 && (
                <div>
                  <h2 className="form-section-title">İş & Proje Deneyimi</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Şirket / Staj Yeri</label>
                      <input className="form-input" value={form.company}
                        onChange={set('company')} placeholder="Google, Apple..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pozisyon</label>
                      <input className="form-input" value={form.position}
                        onChange={set('position')} placeholder="Yazılım Geliştirici Stajyeri" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">GitHub / Behance</label>
                      <input className="form-input" value={form.github}
                        onChange={set('github')} placeholder="https://github.com/kullanici" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">LinkedIn</label>
                      <input className="form-input" value={form.linkedin}
                        onChange={set('linkedin')} placeholder="https://linkedin.com/in/..." />
                    </div>
                  </div>
                </div>
              )}

              {/* ADIM 4 — TERCİHLER */}
              {step === 4 && (
                <div>
                  <h2 className="form-section-title">Çalışma Tercihleri</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Çalışma Modeli</label>
                      <div className="radio-group">
                        {['Remote', 'Hibrit', 'Ofis'].map(m => (
                          <label key={m} className={`radio-option ${form.work_model === m ? 'active' : ''}`}>
                            <input type="radio" name="work_model" value={m}
                              checked={form.work_model === m} onChange={set('work_model')} />
                            {m}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Askerlik Durumu</label>
                      <select className="form-input" value={form.military} onChange={set('military')}>
                        <option value="">Seçiniz</option>
                        {['Yapıldı', 'Muaf', 'Tecilli', 'Yükümlü Değil'].map(o =>
                          <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '1.25rem' }}>
                    <label className="checkbox-option">
                      <input type="checkbox" checked={form.driving_license}
                        onChange={set('driving_license')} />
                      <span>Ehliyet sahibiyim</span>
                    </label>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="form-actions" style={{ marginTop: '2rem' }}>
            {step > 0
              ? <button className="btn btn--ghost" onClick={prev}>← Geri</button>
              : <Link to="/jobs" className="btn btn--ghost">İptal</Link>
            }
            {step < STEPS.length - 1
              ? <button className="btn btn--primary" onClick={next}>İleri →</button>
              : <button className="btn btn--primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? <><span className="spinner" /> Gönderiliyor...</> : '✓ Başvuruyu Gönder'}
                </button>
            }
          </div>
        </div>
      </div>
    </motion.div>
  )
}
