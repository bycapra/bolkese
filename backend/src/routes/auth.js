import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db.js'
import { clearAuthCookie, setAuthCookie, signToken } from '../auth.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name }
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

router.post('/register', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const name = String(req.body?.name || '').trim()
  const password = String(req.body?.password || '')

  if (!isEmail(email)) {
    res.status(400).json({ error: 'Geçerli bir e-posta girin.' })
    return
  }
  if (name.length < 2) {
    res.status(400).json({ error: 'Ad en az 2 karakter olmalı.' })
    return
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Şifre en az 8 karakter olmalı.' })
    return
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    res.status(409).json({ error: 'Bu e-posta ile zaten bir hesap var.' })
    return
  }

  const user = {
    id: randomUUID(),
    email,
    name,
    password_hash: bcrypt.hashSync(password, 10),
    created_at: new Date().toISOString(),
  }

  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, created_at)
    VALUES (@id, @email, @password_hash, @name, @created_at)
  `).run(user)

  setAuthCookie(res, signToken(user.id))
  res.status(201).json({ user: publicUser(user) })
})

router.post('/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'E-posta veya şifre hatalı.' })
    return
  }

  setAuthCookie(res, signToken(user.id))
  res.json({ user: publicUser(user) })
})

router.post('/logout', (_req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) })
})

export default router
