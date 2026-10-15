import { Router } from 'express'
import db from '../db.js'
import { requireAuth } from '../middleware/requireAuth.js'

const router = Router()
router.use(requireAuth)

const CATEGORY_ORDER = {
  MADEN: 1,
  'GRAM ALTIN': 2,
  SARRAFIYE: 3,
  DOVIZ: 4,
  PARITE: 5,
  NAKIT: 6,
}

router.get('/', (_req, res) => {
  const units = db.prepare(`
    SELECT value, label FROM units ORDER BY label COLLATE NOCASE
  `).all()
  const symbols = db.prepare(`
    SELECT code, description, category FROM symbols
  `).all()

  symbols.sort((a, b) => {
    const left = CATEGORY_ORDER[a.category] || 9
    const right = CATEGORY_ORDER[b.category] || 9
    if (left !== right) return left - right
    return String(a.code).localeCompare(b.code, 'tr')
  })

  res.json({ units, symbols })
})

export default router
