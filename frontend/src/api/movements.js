import { request } from './client'

export function fetchMovements({ from, to, assetId, direction } = {}) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  if (assetId) params.set('assetId', assetId)
  if (direction) params.set('direction', direction)
  const query = params.toString()
  return request(`/api/movements${query ? `?${query}` : ''}`)
}
