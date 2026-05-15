import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import JobCard from '../components/JobCard'
import { getJobs, cvMatch } from '../api/client'

export default function Jobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const PER_PAGE = 12

  // CV ile eşleştirme state'leri
  const [matchedJobs, setMatchedJobs]   = useState(null) // null = mod kapalı
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchError, setMatchError]     = useState('')
  const [matchedFileName, setMatchedFileName] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    getJobs({ limit: 100 })
      .then(r => setJobs(r.data.jobs))
      .finally(() => setLoading(false))
  }, [])

  const handleCvUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMatchLoading(true)
    setMatchError('')
    try {
      const res = await cvMatch(file, { max_results: 24, semantic_pool: 60 })
      setMatchedJobs(res.data.jobs || [])
      setMatchedFileName(file.name)
      setPage(0)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setMatchError(detail || 'CV ile eşleştirme yapılamadı, lütfen tekrar deneyin.')
    } finally {
      setMatchLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const clearMatch = () => {
    setMatchedJobs(null)
    setMatchedFileName('')
    setMatchError('')
    setPage(0)
  }

  // Görüntülenecek liste — CV modu açıksa eşleşenleri, değilse normal arama sonuçlarını kullan
  const isMatchMode = matchedJobs !== null

  const baseList = isMatchMode ? matchedJobs : jobs
  const filtered = isMatchMode
    ? baseList // CV modunda arama filtresi uygulamıyoruz, sıralama korunsun
    : baseList.filter(j =>
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
            {isMatchMode
              ? `CV'nize göre ${matchedJobs.length} ilan sıralandı`
              : `${jobs.length} ilan arasından size en uygun pozisyonu bulun`}
          </motion.p>

          {/* CV ile Eşleştir kutusu */}
          {!isMatchMode && (
            <motion.div
              className="ai-fill-box"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}
            >
              <div className="ai-fill-box__text">
                <span className="ai-fill-box__icon">⚡</span>
                <div>
                  <strong>CV'nize Göre Sırala</strong>
                  <p>PDF CV'nizi yükleyin; ilanları size uygunluk skoruna göre sıralayalım.</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file" accept=".pdf"
                style={{ display: 'none' }}
                onChange={handleCvUpload}
              />
              <button
                className="btn btn--primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={matchLoading}
              >
                {matchLoading ? <><span className="spinner" /> Eşleştiriliyor...</> : '📄 CV ile Eşleştir'}
              </button>
            </motion.div>
          )}

          {/* CV modu aktifken durum şeridi */}
          {isMatchMode && (
            <motion.div
              className="ai-fill-box"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}
            >
              <div className="ai-fill-box__text">
                <span className="ai-fill-box__icon">🤖</span>
                <div>
                  <strong>CV ile sıralandı</strong>
                  <p>{matchedFileName || 'Yüklediğiniz CV'} temel alınarak en uygundan en aza doğru sıralandı.</p>
                </div>
              </div>
              <button className="btn btn--ghost" onClick={clearMatch}>Temizle</button>
            </motion.div>
          )}

          {matchError && (
            <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {matchError}
            </p>
          )}

          {/* Search — sadece normal modda */}
          {!isMatchMode && (
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
          )}
        </div>
      </div>

      {/* Results */}
      <div className="section-container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {!isMatchMode && search && (
          <p className="results-count">
            "<strong>{search}</strong>" için {filtered.length} sonuç
          </p>
        )}

        {(loading || matchLoading) ? (
          <div className="jobs-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="job-card job-card--skeleton" />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">🔍</div>
            <h3>Sonuç bulunamadı</h3>
            <p>{isMatchMode ? 'CV ile eşleşen ilan bulunamadı.' : 'Farklı anahtar kelimeler deneyin.'}</p>
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
