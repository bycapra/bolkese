import { request } from './client'

export function fetchAssets() {
  return request('/api/assets')
}

export function createAssetRecord(payload) {
  return request('/api/assets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAssetRecord(id, payload) {
  return request(`/api/assets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteAssetRecord(id) {
  return request(`/api/assets/${id}`, { method: 'DELETE' })
}
