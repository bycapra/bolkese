import { randomUUID } from 'node:crypto'

const insertSql = `
  INSERT INTO movements (
    id, user_id, asset_id, name, code, unit, direction, quantity, balance, created_at
  ) VALUES (
    @id, @user_id, @asset_id, @name, @code, @unit, @direction, @quantity, @balance, @created_at
  )
`

export function logAmountChange(db, {
  userId,
  assetId,
  name,
  code,
  unit,
  previousAmount,
  nextAmount,
  createdAt,
}) {
  const delta = nextAmount - previousAmount
  if (delta === 0) return

  db.prepare(insertSql).run({
    id: randomUUID(),
    user_id: userId,
    asset_id: assetId,
    name,
    code,
    unit,
    direction: delta > 0 ? 'in' : 'out',
    quantity: Math.abs(delta),
    balance: nextAmount,
    created_at: createdAt,
  })
}
