import { request } from './client'

export function fetchNotes() {
  return request('/api/notes')
}

export function createNoteRecord(payload) {
  return request('/api/notes', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateNoteRecord(id, payload) {
  return request(`/api/notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteNoteRecord(id) {
  return request(`/api/notes/${id}`, { method: 'DELETE' })
}
