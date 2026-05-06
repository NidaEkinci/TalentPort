import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import JobCard from '../components/JobCard'
import { getJobs } from '../api/client'

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const PER_PAGE = 12

  useEffect(() => {
    setLoading(true)
    getJobs({ limit: 100 })
      .then(r => setJobs(r.data.jobs))
      .finally(() => setLoading(false))
  }, [])

  const filtered = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  )

  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  return (
    <motion.div
      className="page-jobs"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
    >
      {/* Page Header */}
      <div className="page-header">
        <div className="section-container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            İş İlanları
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {jobs.length} ilan arasından size en uygun pozisyonu bulun
          </motion.p>

          {/* Search */}
          <motion.div
            className="search-bar"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <svg className="search-bar__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Pozisyon, şirket veya konum ara..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              className="search-bar__input"
            />
            {search && (
              <button onClick={() => setSearch('')} className="search-bar__clear">✕</button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Results */}
      <div className="section-container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {search && (
          <p className="results-count">
            "<strong>{search}</strong>" için {filtered.length} sonuç
          </p>
        )}

        {loading ? (
          <div className="jobs-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="job-card job-card--skeleton" />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <h3>Sonuç bulunamadı</h3>
            <p>Farklı anahtar kelimeler deneyin.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {paginated.map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination__btn"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >← Önceki</button>
            <span className="pagination__info">{page + 1} / {totalPages}</span>
            <button
              className="pagination__btn"
              disabled={page === totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >Sonraki →</button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
