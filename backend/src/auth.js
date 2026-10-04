import jwt from 'jsonwebtoken'

const COOKIE_NAME = 'bolkese_token'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function secret() {
  const value = process.env.JWT_SECRET
  if (!value) throw new Error('JWT_SECRET tanımlı değil.')
  return value
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, secret(), { expiresIn: '7d' })
}

export function readToken(token) {
  return jwt.verify(token, secret())
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: WEEK_MS,
  })
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', path: '/' })
}

export { COOKIE_NAME }
