import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
router.use(requireAuth)

function toMovement(row) {
  return {
    id: row.id,
    assetId: row.asset_id,
    name: row.name,
    code: row.code,
    unit: row.unit,
    direction: row.direction,
    quantity: row.quantity,
    balance: row.balance,
    createdAt: row.created_at,
  }
}

router.get('/', (req, res) => {
  const clauses = ['user_id = ?']
  const params = [req.user.id]

  const from = String(req.query.from || '').trim()
  const to = String(req.query.to || '').trim()
  const assetId = String(req.query.assetId || '').trim()
  const direction = String(req.query.direction || '').trim()

  if (from) {
    clauses.push('created_at >= ?')
    params.push(from)
  }
  if (to) {
    clauses.push('created_at <= ?')
    params.push(to)
  }
  if (assetId) {
    clauses.push('asset_id = ?')
    params.push(assetId)
  }
  if (direction === 'in' || direction === 'out') {
    clauses.push('direction = ?')
    params.push(direction)
  }

  const rows = db.prepare(`
    SELECT * FROM movements
    WHERE ${clauses.join(' AND ')}
    ORDER BY created_at DESC
  `).all(...params)

  res.json({ movements: rows.map(toMovement) })
})

export default router
