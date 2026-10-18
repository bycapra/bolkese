import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
router.use(requireAuth)

const KINDS = new Set(['yatirim', 'cekim', 'genel'])
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function toNote(row) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    date: row.note_date,
    kind: row.kind,
    assetId: row.asset_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function todayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseKind(value, fallback) {
  const kind = String(value || '').trim()
  if (!kind) return fallback
  if (!KINDS.has(kind)) return null
  return kind
}

function parseDate(value, fallback) {
  const date = String(value || '').trim()
  if (!date) return fallback
  if (!DATE_RE.test(date)) return null
  const parsed = new Date(`${date}T00:00:00.000Z`)
  if (date.startsWith('0000-') || !Number.isFinite(parsed.getTime())) return null
  if (parsed.toISOString().slice(0, 10) !== date) return null
  return date
}

function ownedAssetId(userId, assetId) {
  if (assetId === undefined) return undefined
  if (assetId === null || assetId === '') return null
  const id = String(assetId).trim()
  const asset = db.prepare('SELECT id FROM assets WHERE id = ? AND user_id = ?').get(id, userId)
  return asset ? asset.id : false
}

function loadOwned(req, res) {
  const existing = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'Not bulunamadı.' })
    return null
  }
  if (existing.user_id !== req.user.id) {
    res.status(403).json({ error: 'Bu not size ait değil.' })
    return null
  }
  return existing
}

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM notes
    WHERE user_id = ?
    ORDER BY note_date DESC, created_at DESC
  `).all(req.user.id)
  res.json({ notes: rows.map(toNote) })
})

router.post('/', (req, res) => {
  const title = String(req.body?.title || '').trim()
  if (title.length < 2) {
    res.status(400).json({ error: 'Başlık en az 2 karakter olmalı.' })
    return
  }

  const kind = parseKind(req.body?.kind, 'genel')
  if (!kind) {
    res.status(400).json({ error: 'Geçersiz not türü.' })
    return
  }

  const date = parseDate(req.body?.date, todayDate())
  if (!date) {
    res.status(400).json({ error: 'Geçersiz tarih.' })
    return
  }

  const assetId = ownedAssetId(req.user.id, req.body?.assetId)
  if (assetId === false) {
    res.status(400).json({ error: 'Kategori bulunamadı.' })
    return
  }

  const now = new Date().toISOString()
  const id = randomUUID()
  const body = String(req.body?.body || '').trim()
  db.prepare(`
    INSERT INTO notes (id, user_id, title, body, note_date, kind, asset_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, title, body, date, kind, assetId ?? null, now, now)

  const row = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(id, req.user.id)
  res.status(201).json({ note: toNote(row) })
})

router.patch('/:id', (req, res) => {
  const existing = loadOwned(req, res)
  if (!existing) return

  let title = existing.title
  if (req.body?.title !== undefined) {
    title = String(req.body.title || '').trim()
    if (title.length < 2) {
      res.status(400).json({ error: 'Başlık en az 2 karakter olmalı.' })
      return
    }
  }

  let body = existing.body
  if (req.body?.body !== undefined) {
    body = String(req.body.body || '').trim()
  }

  let kind = existing.kind
  if (req.body?.kind !== undefined) {
    kind = parseKind(req.body.kind, null)
    if (!kind) {
      res.status(400).json({ error: 'Geçersiz not türü.' })
      return
    }
  }

  let date = existing.note_date
  if (req.body?.date !== undefined) {
    date = parseDate(req.body.date, null)
    if (!date) {
      res.status(400).json({ error: 'Geçersiz tarih.' })
      return
    }
  }

  let assetId = existing.asset_id
  if (req.body?.assetId !== undefined) {
    const resolved = ownedAssetId(req.user.id, req.body.assetId)
    if (resolved === false) {
      res.status(400).json({ error: 'Kategori bulunamadı.' })
      return
    }
    assetId = resolved
  }

  const updatedAt = new Date().toISOString()
  db.prepare(`
    UPDATE notes
    SET title = ?, body = ?, note_date = ?, kind = ?, asset_id = ?, updated_at = ?
    WHERE id = ? AND user_id = ?
  `).run(title, body, date, kind, assetId, updatedAt, existing.id, req.user.id)

  const row = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?').get(existing.id, req.user.id)
  res.json({ note: toNote(row) })
})

router.delete('/:id', (req, res) => {
  const existing = loadOwned(req, res)
  if (!existing) return
  db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(existing.id, req.user.id)
  res.json({ ok: true })
})

export default router
