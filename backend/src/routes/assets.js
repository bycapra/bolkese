import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
router.use(requireAuth)

const MANUAL_CODES = new Set(['TRY'])

function toAsset(row) {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    unit: row.unit,
    amount: row.amount,
    icon: row.icon,
    color: row.color,
    key: row.preset_key,
    price: row.price,
    ask: row.ask,
    change: 0,
  }
}

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase()
}

function pricesFor(code, price, ask) {
  if (MANUAL_CODES.has(code)) return { price: 1, ask: 1 }
  const bid = Number(price) || 0
  return { price: bid, ask: Number(ask) || bid }
}

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT * FROM assets WHERE user_id = ? ORDER BY created_at ASC
  `).all(req.user.id)
  res.json({ assets: rows.map(toAsset) })
})

router.post('/', (req, res) => {
  const name = String(req.body?.name || '').trim()
  const code = normalizeCode(req.body?.code)
  const unit = String(req.body?.unit || '').trim()
  const icon = String(req.body?.icon || 'other')
  const color = String(req.body?.color || '#7C5CC4')
  const presetKey = req.body?.key ? String(req.body.key) : null
  const amount = Math.max(0, Number(req.body?.amount) || 0)

  if (!name || !code || !unit) {
    res.status(400).json({ error: 'Kategori adı, kodu ve birimi zorunludur.' })
    return
  }

  const { price, ask } = pricesFor(code, req.body?.price, req.body?.ask)
  const now = new Date().toISOString()
  const row = {
    id: randomUUID(),
    user_id: req.user.id,
    name,
    code,
    unit,
    amount,
    icon,
    color,
    preset_key: presetKey,
    price,
    ask,
    created_at: now,
    updated_at: now,
  }

  db.prepare(`
    INSERT INTO assets (
      id, user_id, name, code, unit, amount, icon, color, preset_key, price, ask, created_at, updated_at
    ) VALUES (
      @id, @user_id, @name, @code, @unit, @amount, @icon, @color, @preset_key, @price, @ask, @created_at, @updated_at
    )
  `).run(row)

  res.status(201).json({ asset: toAsset(row) })
})

router.patch('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'Kategori bulunamadı.' })
    return
  }
  if (existing.user_id !== req.user.id) {
    res.status(403).json({ error: 'Bu kategori size ait değil.' })
    return
  }

  const amount = req.body?.amount == null
    ? existing.amount
    : Math.max(0, Number(req.body.amount) || 0)

  let price = existing.price
  let ask = existing.ask
  if (MANUAL_CODES.has(existing.code)) {
    price = 1
    ask = 1
  } else if (req.body?.price != null || req.body?.ask != null) {
    const next = pricesFor(existing.code, req.body?.price ?? existing.price, req.body?.ask ?? existing.ask)
    price = next.price
    ask = next.ask
  }

  const updatedAt = new Date().toISOString()
  db.prepare(`
    UPDATE assets
    SET amount = ?, price = ?, ask = ?, updated_at = ?
    WHERE id = ? AND user_id = ?
  `).run(amount, price, ask, updatedAt, existing.id, req.user.id)

  res.json({
    asset: toAsset({ ...existing, amount, price, ask, updated_at: updatedAt }),
  })
})

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id)
  if (!existing) {
    res.status(404).json({ error: 'Kategori bulunamadı.' })
    return
  }
  if (existing.user_id !== req.user.id) {
    res.status(403).json({ error: 'Bu kategori size ait değil.' })
    return
  }

  db.prepare('DELETE FROM assets WHERE id = ? AND user_id = ?').run(existing.id, req.user.id)
  res.json({ ok: true })
})

export default router
