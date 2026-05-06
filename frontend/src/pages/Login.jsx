import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { loginUser } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate    = useNavigate()
  const { login }   = useAuth()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError('Tüm alanlar zorunludur'); return }
    setLoading(true); setError('')
    try {
      const res = await loginUser(form)
      login(res.data)       // { token, name, email }
      navigate('/')
    } catch (e) {
      setError(e.response?.data?.detail || 'Giriş başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div className="auth-page"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
    >
      <div className="auth-card">
        <h1 className="auth-title">Giriş Yap</h1>
        <p className="auth-sub">Hesabınız yok mu? <Link to="/register">Üye olun</Link></p>

        {error && <div className="auth-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">E-posta</label>
          <input className="form-input" type="email"
            value={form.email} onChange={update('email')} placeholder="mail@example.com" />
        </div>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label className="form-label">Şifre</label>
          <input className="form-input" type="password"
            value={form.password} onChange={update('password')} placeholder="••••••••" />
        </div>

        <button className="btn btn--primary"
          style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
          onClick={handleSubmit} disabled={loading}>
          {loading ? <><span className="spinner" /> Giriş yapılıyor...</> : 'Giriş Yap'}
        </button>
      </div>
    </motion.div>
  )
}