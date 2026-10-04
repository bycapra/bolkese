import db from '../db.js'
import { COOKIE_NAME, readToken } from '../auth.js'

export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) {
    res.status(401).json({ error: 'Oturum açmanız gerekiyor.' })
    return
  }

  try {
    const payload = readToken(token)
    const user = db.prepare(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',
    ).get(payload.sub)

    if (!user) {
      res.status(401).json({ error: 'Oturum geçersiz.' })
      return
    }

    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Oturum geçersiz.' })
  }
}
