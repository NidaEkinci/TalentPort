import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getJobs } from '../api/client'
import JobCard from '../components/JobCard'

const STATS = [
  { value: '1,000+', label: 'Aktif İlan' },
  { value: '500+', label: 'Şirket' },
  { value: '10K+', label: 'Başvuru' },
]

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState([])

  useEffect(() => {
    getJobs({ limit: 3 }).then(r => setFeaturedJobs(r.data.jobs))
  }, [])

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg-grid" />
        <motion.div
          className="hero__content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="hero__badge">
            <span className="hero__badge-dot" />
            AI Destekli Kariyer Platformu
          </div>
          <h1 className="hero__title">
            Kariyerinizin<br />
            <span className="hero__title-accent">Doğru Adresi</span>
          </h1>
          <p className="hero__subtitle">
            Yapay zeka destekli eşleştirme sistemiyle CV'nize en uygun ilanları saniyeler içinde bulun.
          </p>
          <div className="hero__actions">
            <Link to="/jobs" className="btn btn--primary">
              İlanları Keşfet
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/apply" className="btn btn--ghost">Başvurularım</Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="hero__stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {STATS.map(({ value, label }) => (
            <div key={label} className="hero__stat">
              <span className="hero__stat-value">{value}</span>
              <span className="hero__stat-label">{label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Featured Jobs */}
      <section className="featured">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Öne Çıkan İlanlar</h2>
            <Link to="/jobs" className="section-link">Tümünü Gör →</Link>
          </div>
          <div className="jobs-grid">
            {featuredJobs.map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="section-container">
          <motion.div
            className="cta-banner__inner"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2>AI ile CV'nizi Analiz Ettirin</h2>
            <p>JobScout AI, CV'nizi okuyarak en uygun pozisyonları otomatik olarak bulur ve başvuruyu sizin adınıza doldurur.</p>
            <Link to="/jobs" className="btn btn--primary">Hemen Başla</Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
