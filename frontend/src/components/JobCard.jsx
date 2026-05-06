import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const COMPANY_COLORS = [
  '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444',
  '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#84cc16'
]

function getColor(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return COMPANY_COLORS[Math.abs(hash) % COMPANY_COLORS.length]
}

function CompanyAvatar({ name }) {
  const color = getColor(name)
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  return (
    <div className="job-card__avatar" style={{ background: color + '18', color }}>
      {initials}
    </div>
  )
}

export default function JobCard({ job, index }) {
  const navigate = useNavigate()

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -5 }}
      onClick={() => navigate(`/jobs/${job.id}`)}
      className="job-card"
    >
      <div className="job-card__header">
        <CompanyAvatar name={job.company} />
        <div className="job-card__meta">
          <p className="job-card__company">{job.company || 'Şirket Belirtilmemiş'}</p>
          <span className="job-card__location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {job.location || 'Uzaktan'}
          </span>
        </div>
        <div className="job-card__badge">Tam Zamanlı</div>
      </div>

      <h3 className="job-card__title">{job.title}</h3>
      <p className="job-card__desc">{job.description}</p>

      <div className="job-card__footer">
        <span className="job-card__link">Detayları Gör →</span>
      </div>
    </motion.article>
  )
}
