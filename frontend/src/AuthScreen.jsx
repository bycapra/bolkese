import { useState } from 'react'
import { ArrowRight, WalletCards } from 'lucide-react'
import { loginAccount, registerAccount } from './api/auth'

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const isRegister = mode === 'register'

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      const payload = isRegister
        ? { name: form.name.trim(), email: form.email.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password }
      const result = isRegister ? await registerAccount(payload) : await loginAccount(payload)
      onAuth(result.user)
    } catch (err) {
      setError(err.message || 'İşlem başarısız oldu.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="brand auth-brand">
          <span className="brand-mark"><WalletCards size={22} /></span>
          <span>BolKese</span>
        </div>
        <span className="eyebrow">{isRegister ? 'Yeni hesap' : 'Hoş geldiniz'}</span>
        <h1>{isRegister ? 'Portföyünüzü oluşturun' : 'Hesabınıza giriş yapın'}</h1>
        <p className="auth-copy">
          Kategorileriniz ve miktarlarınız hesabınıza kaydedilir. Canlı fiyatlar altinapi üzerinden gelir.
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              <span>Ad soyad</span>
              <input
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                autoComplete="name"
                required
              />
            </label>
          )}
          <label>
            <span>E-posta</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              autoComplete="email"
              required
            />
          </label>
          <label>
            <span>Şifre</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={8}
              required
            />
          </label>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button type="submit" className="button button--primary" disabled={pending}>
            {pending ? 'Gönderiliyor…' : isRegister ? 'Hesap oluştur' : 'Giriş yap'}
            <ArrowRight size={17} />
          </button>
        </form>

        <button
          type="button"
          className="auth-switch"
          onClick={() => {
            setMode(isRegister ? 'login' : 'register')
            setError('')
          }}
        >
          {isRegister ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Kayıt olun'}
        </button>
      </div>
    </div>
  )
}
