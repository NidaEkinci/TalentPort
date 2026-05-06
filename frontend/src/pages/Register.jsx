import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { registerUser } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate  = useNavigate()
  const { login } = useAuth()
  const [form, setForm]     = useState({ name: '', email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) { setError('Tüm alanlar zorunludur'); return }
    if (form.password.length < 6) { setError('Şifre en az 6 karakter olmalı'); return }
    setLoading(true); setError('')
    try {
      const res = await registerUser(form)
      login(res.data)
      navigate('/')
    } catch (e) {
      setError(e.response?.data?.detail || 'Kayıt başarısız')
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
        <h1 className="auth-title">Üye Ol</h1>
        <p className="auth-sub">Zaten üye misiniz? <Link to="/login">Giriş yapın</Link></p>

        {error && <div className="auth-error">{error}</div>}

        {[
          { k: 'name',     label: 'Ad Soyad', type: 'text',     ph: 'Adınız Soyadınız' },
          { k: 'email',    label: 'E-posta',  type: 'email',    ph: 'mail@example.com' },
          { k: 'password', label: 'Şifre',    type: 'password', ph: '••••••••' },
        ].map(({ k, label, type, ph }, i) => (
          <div className="form-group" key={k} style={{ marginTop: i === 0 ? 0 : '1rem' }}>
            <label className="form-label">{label}</label>
            <input className="form-input" type={type}
              value={form[k]} onChange={update(k)} placeholder={ph} />
          </div>
        ))}

        <button className="btn btn--primary"
          style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
          onClick={handleSubmit} disabled={loading}>
          {loading ? <><span className="spinner" /> Kaydediliyor...</> : 'Üye Ol'}
        </button>
      </div>
    </motion.div>
  )
}